import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ArtworkStatus, OSStage } from "@prisma/client";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/portal/artworks/[id]/decision
 * Decisão do cliente sobre a prova de arte (Aprovar ou Solicitar Ajustes)
 * Conforme especificado em SDD.md (seção 4.3) e SPEC.md (RF-04.3)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: proofId } = await params;
    const body = await req.json();
    const { decision, notes } = body;

    if (!decision || !["APPROVED", "REVISION_REQUESTED"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "Decisão inválida. Escolha APPROVED ou REVISION_REQUESTED." },
        { status: 400 }
      );
    }

    const proof = await prisma.artworkProof.findUnique({
      where: { id: proofId },
      include: {
        serviceOrder: {
          include: { customer: { include: { user: true } } },
        },
      },
    });

    if (!proof) {
      return NextResponse.json(
        { success: false, error: "Prova de arte não encontrada." },
        { status: 404 }
      );
    }

    const isApproved = decision === "APPROVED";

    // 1. Atualiza a prova de arte
    const updatedProof = await prisma.artworkProof.update({
      where: { id: proofId },
      data: {
        status: isApproved ? ArtworkStatus.APPROVED : ArtworkStatus.REVISION_REQUESTED,
        customerNotes: notes || null,
        reviewedAt: new Date(),
      },
    });

    // 2. Transição automática de status da Ordem de Serviço
    const nextOSStage = isApproved ? OSStage.CNC_ROUTER_CUTTING : OSStage.BRIEFING_ARTWORK;

    await prisma.serviceOrder.update({
      where: { id: proof.serviceOrderId },
      data: { currentStage: nextOSStage },
    });

    // 3. Notificação via WhatsApp ao cliente (WACLI)
    if (proof.serviceOrder.customer?.user?.phone) {
      const clientName = proof.serviceOrder.customer.user.name;
      const phone = proof.serviceOrder.customer.user.phone;
      const osCode = proof.serviceOrder.code;

      let msg = "";
      if (isApproved) {
        msg = `✅ *Prova de Arte Aprovada — Glessios*\nOlá, *${clientName}*!\n\nConfirmamos a aprovação da arte da ordem *${osCode}*! Seu projeto avançou imediatamente para a esteira fabril de *Corte Router CNC e Usinagem de Precisão*.\n\nVocê pode acompanhar todo o progresso no seu Portal: https://glessios.com.br/portal`;
      } else {
        msg = `✏️ *Solicitação de Ajuste Registrada — Glessios*\nOlá, *${clientName}*!\n\nRecebemos suas observações para a ordem *${osCode}*. Nosso designer já está aplicando as correções solicitadas e em breve enviaremos a nova versão v${proof.version + 1} para sua conferência!`;
      }

      try {
        await sendWhatsAppMessage({
          to: phone,
          message: msg,
        });
      } catch (wppErr) {
        console.warn("[Decision API] Falha no disparo de WhatsApp:", wppErr);
      }
    }

    return NextResponse.json({
      success: true,
      decision,
      newOSStage: nextOSStage,
      message: isApproved
        ? "Prova de arte aprovada com sucesso! O pedido avançou para a etapa de corte e usinagem CNC."
        : "Solicitação de alteração enviada ao designer responsável.",
      proof: updatedProof,
    });
  } catch (error: any) {
    console.error("[Decision API] Erro ao registrar decisão:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar decisão da arte", details: error?.message },
      { status: 500 }
    );
  }
}
