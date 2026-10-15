import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ArtworkStatus, OSStage } from "@prisma/client";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/production/orders/[id]/proofs
 * Cadastra uma nova versão de prova de arte e dispara link de aprovação ao cliente via WACLI
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: serviceOrderId } = await params;
    const body = await req.json();
    const { title, fileUrl, previewUrl } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "A URL da arte renderizada é obrigatória." },
        { status: 400 }
      );
    }

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        customer: { include: { user: true } },
        artworkProofs: { orderBy: { version: "desc" }, take: 1 },
      },
    });

    if (!serviceOrder) {
      return NextResponse.json(
        { success: false, error: "Ordem de serviço não encontrada." },
        { status: 404 }
      );
    }

    // Calcula a próxima versão
    const nextVersion = (serviceOrder.artworkProofs[0]?.version || 0) + 1;
    const proofTitle = title || `Prova de Arte v${nextVersion} — Fachada Comercial`;

    // 1. Cria o registro de ArtworkProof
    const proof = await prisma.artworkProof.create({
      data: {
        serviceOrderId,
        version: nextVersion,
        title: proofTitle,
        fileUrl,
        previewUrl: previewUrl || fileUrl,
        status: ArtworkStatus.PENDING_CUSTOMER_REVIEW,
      },
    });

    // 2. Atualiza a OS para o estágio de aprovação de arte
    await prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: { currentStage: OSStage.ARTWORK_APPROVAL },
    });

    // 3. Dispara notificação no WhatsApp do cliente via WACLI com link direto
    if (serviceOrder.customer?.user?.phone) {
      const clientName = serviceOrder.customer.user.name;
      const phone = serviceOrder.customer.user.phone;
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3005";
      const approvalUrl = `${baseUrl}/portal/provas/${proof.id}`;

      try {
        const msg = WhatsAppTemplates.artworkProofReady(clientName, serviceOrder.code, approvalUrl);
        await sendWhatsAppMessage({
          to: phone,
          message: msg,
          mediaUrl: fileUrl,
        });
      } catch (wppErr) {
        console.warn("[Proofs API] Falha no envio de WhatsApp da prova de arte:", wppErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Prova de arte versão ${nextVersion} enviada com sucesso ao cliente!`,
        proof,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Proofs API] Erro ao cadastrar prova de arte:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao enviar prova de arte", details: error?.message },
      { status: 500 }
    );
  }
}
