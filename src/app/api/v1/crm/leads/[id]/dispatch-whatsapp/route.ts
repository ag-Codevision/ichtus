import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/dispatch-whatsapp
 * Disparo de Orçamento ou Contrato diretamente para o WhatsApp do cliente
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type = "budget", customMessage } = body; // "budget" | "contract"

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        helper: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Trabalho não encontrado." },
        { status: 404 }
      );
    }

    const recipientPhone =
      lead.contactPhone ||
      lead.customer?.whatsapp ||
      lead.customer?.phone;

    if (!recipientPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum telefone de WhatsApp cadastrado para este contato.",
        },
        { status: 400 }
      );
    }

    // Normalização do número para envio
    const cleanPhone = recipientPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const budgetId = lead.budgetCode ? `[${lead.budgetCode}]` : "";
    const clientName = lead.contactName || lead.customer?.tradeName || "Cliente";

    let message = "";
    let documentUrl = "";

    if (type === "contract") {
      documentUrl = `${baseUrl}/admin/crm/trabalhos/${lead.id}/contrato`;
      message =
        customMessage?.trim() ||
        `Olá, *${clientName}*! Tudo bem? 📋\n\nSegue o link do seu *Contrato de Prestação de Serviços* referente ao projeto *${lead.title}* ${budgetId}:\n\n✍️ *Acesse e confira o contrato:* ${documentUrl}\n\nFicamos à disposição para qualquer ajuste e para formalizarmos o início da produção!\n\n*Glessios Comunicação Visual*`;
    } else {
      documentUrl = `${baseUrl}/admin/crm/trabalhos/${lead.id}/proposta`;
      message =
        customMessage?.trim() ||
        `Olá, *${clientName}*! Tudo bem? 🤝\n\nElaboramos a sua *Proposta Comercial / Orçamento* referente ao projeto *${lead.title}* ${budgetId}:\n\n📄 *Visualize a proposta completa:* ${documentUrl}\n\nQualquer dúvida ou alteração nos detalhes técnicos, estamos 100% à disposição!\n\n*Glessios Comunicação Visual*`;
    }

    const waMeUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;

    let wacliSuccess = false;
    try {
      await sendWhatsAppMessage({
        to: formattedPhone,
        message,
      });
      wacliSuccess = true;
    } catch (err: any) {
      console.warn(
        "[WhatsApp Dispatch] Falha no envio via WACLI (usando wa.me fallback):",
        err?.message
      );
    }

    return NextResponse.json({
      success: true,
      wacliSuccess,
      waMeUrl,
      recipientPhone: formattedPhone,
      message,
      documentUrl,
    });
  } catch (error: any) {
    console.error("[WhatsApp Dispatch] Erro no endpoint de disparo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao processar disparo de mensagem via WhatsApp.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
