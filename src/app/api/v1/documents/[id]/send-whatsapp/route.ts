import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/documents/[id]/send-whatsapp
 * Dispara ou reenvia o documento em PDF diretamente para o WhatsApp do cliente
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const targetPhoneInput = body.phone;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Documento não encontrado." },
        { status: 404 }
      );
    }

    const recipientPhone =
      targetPhoneInput ||
      document.clientPhone ||
      document.customer?.whatsapp ||
      document.customer?.phone;

    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, error: "Nenhum número de WhatsApp informado para envio." },
        { status: 400 }
      );
    }

    const message =
      body.message ||
      `Olá, *${document.clientName}*! Tudo bem? 🤝\n\nSegue em anexo o seu *${document.title}* elaborado pela *Ícthus Comunicação Visual*.\n\nFicamos à disposição para qualquer dúvida ou ajuste!`;

    const fileName = document.fileUrl.split("/").pop() || "Orcamento_Icthus.pdf";

    const wppResult = await sendWhatsAppMessage({
      to: recipientPhone,
      message,
      documentUrl: document.fileUrl,
      fileName,
      mimetype: "application/pdf",
    });

    if (wppResult.success) {
      await prisma.document.update({
        where: { id },
        data: {
          sentViaWhatsapp: true,
          status: "ENVIADO_WHATSAPP",
          sentAt: new Date(),
          clientPhone: recipientPhone,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Documento enviado com sucesso via WhatsApp!",
        wppResult,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: wppResult.error || "Falha ao despachar mensagem pelo WhatsApp.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Documents API] Erro ao enviar documento pelo WhatsApp:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor ao enviar documento." },
      { status: 500 }
    );
  }
}
