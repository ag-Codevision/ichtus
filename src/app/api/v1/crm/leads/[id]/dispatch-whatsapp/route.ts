import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";
import { generateBudgetPDF } from "@/lib/documents/budget-pdf-generator";
import { syncLeadBudgetDocument } from "@/lib/crm/budget-sync";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/dispatch-whatsapp
 * Disparo direto de Orçamento em PDF ou Contrato para o WhatsApp do cliente via WACLI (sem abrir WhatsApp Web)
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

    // Prioridade de telefone: se há cliente cadastrado com whatsapp, prioriza; senão usa o telefone do contato
    const recipientPhone =
      lead.customer?.whatsapp ||
      lead.contactPhone ||
      lead.customer?.phone;

    if (!recipientPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum telefone de WhatsApp cadastrado para este contato ou cliente.",
        },
        { status: 400 }
      );
    }

    // Normalização estrita do número para padrão E.164 com DDI 55
    const cleanPhone = recipientPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const budgetId = lead.budgetCode ? `[${lead.budgetCode}]` : "";
    const clientName = lead.contactName || lead.customer?.tradeName || lead.customer?.fullName || "Cliente";

    let message = "";
    let documentUrl = "";
    let budgetPdfPath: string | null = null;
    const budgetPdfFileName = `Orcamento_${(lead.budgetCode || lead.title || "Icthus").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    if (type === "contract") {
      documentUrl = `${baseUrl}/admin/crm/trabalhos/${lead.id}/contrato`;
      message =
        customMessage?.trim() ||
        `Olá, *${clientName}*! Tudo bem? 📋\n\nSegue o link do seu *Contrato de Prestação de Serviços* referente ao projeto *${lead.title}* ${budgetId}:\n\n✍️ *Acesse e confira o contrato:* ${documentUrl}\n\nFicamos à disposição para qualquer ajuste e para formalizarmos o início da produção!\n\n*Glessios Comunicação Visual*`;
    } else {
      documentUrl = `${baseUrl}/admin/crm/trabalhos/${lead.id}/proposta`;
      message =
        customMessage?.trim() ||
        `Olá, *${clientName}*! Tudo bem? 🤝\n\nSegue em anexo a sua *Proposta Comercial / Orçamento* referente ao projeto *${lead.title}* ${budgetId}.\n\n📄 *Visualize também online com aprovação digital:* ${documentUrl}\n\nQualquer dúvida ou alteração nos detalhes técnicos, estamos 100% à disposição!\n\n*Glessios Comunicação Visual*`;

      // 1. Localiza ou Gera o arquivo físico do Orçamento em PDF para anexo direto via WACLI
      try {
        let document = await prisma.document.findFirst({
          where: { leadId: id, category: "ORCAMENTO" },
          orderBy: { createdAt: "desc" },
        });

        let fileExists = false;
        if (document?.fileUrl) {
          const physicalPath = path.join(process.cwd(), "public", document.fileUrl.replace(/^\//, ""));
          fileExists = fs.existsSync(physicalPath);
          if (fileExists) {
            budgetPdfPath = physicalPath;
          }
        }

        if (!document || !fileExists) {
          const budgetCode = lead.budgetCode || `3000 ${new Date().toISOString().slice(2, 10).replace(/-/g, " ")}`;

          const pdfResult = await generateBudgetPDF({
            budgetCode,
            title: lead.title,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            clientTradeName:
              lead.customer?.tradeName || lead.customer?.companyName || lead.customer?.fullName,
            clientAddress: lead.customer?.city
              ? `${lead.customer.city} - ${lead.customer.state || "PR"}`
              : null,
            estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
            priority: lead.priority,
            dueDate: lead.dueDate,
            notes: lead.notes,
            voltage: lead.voltage,
            tools: lead.tools,
            paintDetails: lead.paintDetails,
            freightDetails: lead.freightDetails,
            helperName: lead.helper?.fullName || lead.helper?.tradeName,
            createdAt: lead.createdAt,
          });

          if (document) {
            await prisma.document.update({
              where: { id: document.id },
              data: {
                code: budgetCode,
                fileUrl: pdfResult.fileUrl,
                fileSize: pdfResult.fileSize,
                status: "GERADO",
              },
            });
          } else {
            await prisma.document.create({
              data: {
                leadId: id,
                title: `Orçamento [${budgetCode}] — ${lead.title}`,
                category: "ORCAMENTO",
                code: budgetCode,
                fileUrl: pdfResult.fileUrl,
                fileSize: pdfResult.fileSize,
                customerId: lead.customerId || null,
                clientName: lead.customer?.tradeName || lead.customer?.fullName || lead.contactName || "Cliente",
                clientPhone: lead.contactPhone,
                clientEmail: lead.contactEmail,
                totalAmount: lead.estimatedValue ? Number(lead.estimatedValue) : null,
                status: "GERADO",
                sentViaWhatsapp: false,
              },
            });
          }

          budgetPdfPath = path.join(process.cwd(), "public", pdfResult.fileUrl.replace(/^\//, ""));
        }
      } catch (pdfErr) {
        console.warn("[WhatsApp Dispatch] Aviso ao preparar PDF do orçamento:", pdfErr);
      }
    }

    let wacliSuccess = false;
    let wacliResult: any = null;
    let wacliError: string | null = null;

    // 2. Disparo direto pelo robô WACLI com o documento PDF anexado
    try {
      let docBase64 = undefined;
      if (budgetPdfPath && fs.existsSync(budgetPdfPath)) {
        try {
          docBase64 = fs.readFileSync(budgetPdfPath).toString("base64");
        } catch (bErr) {
          console.warn("[WhatsApp Dispatch] Aviso ao ler base64 do PDF:", bErr);
        }
      }

      wacliResult = await sendWhatsAppMessage({
        to: formattedPhone,
        message,
        documentUrl: budgetPdfPath || undefined,
        documentBase64: docBase64,
        fileName: budgetPdfFileName,
        mimetype: "application/pdf",
      });
      wacliSuccess = Boolean(wacliResult?.success);
      if (!wacliSuccess) {
        wacliError = wacliResult?.error || "Serviço de WhatsApp não concluiu o envio.";
      }
    } catch (err: any) {
      console.warn("[WhatsApp Dispatch] Falha no envio via WACLI:", err?.message);
      wacliError = err?.message || "Falha de conexão com o microserviço do WhatsApp.";
    }

    // 3. Atualiza status no banco de dados APENAS quando o robô WACLI entregar com sucesso
    if (type !== "contract" && wacliSuccess) {
      try {
        await prisma.lead.update({
          where: { id },
          data: {
            budgetSentViaWhatsApp: true,
            budgetSentAt: new Date(),
          },
        });
        await prisma.leadActivity.create({
          data: {
            leadId: id,
            type: "DISPATCH_WHATSAPP",
            content: `Orçamento em PDF enviado com sucesso diretamente via WhatsApp (WACLI) para ${formattedPhone}`,
          },
        });
      } catch (dbErr) {
        console.warn("[WhatsApp Dispatch] Falha ao gravar status no banco:", dbErr);
      }
    }

    return NextResponse.json({
      success: wacliSuccess,
      budgetSentViaWhatsApp: wacliSuccess,
      budgetSentAt: wacliSuccess ? new Date().toISOString() : null,
      wacliSuccess,
      wacliError,
      isSelf: wacliResult?.isSelf || false,
      resolvedJid: wacliResult?.resolvedJid,
      clientName,
      recipientPhone: formattedPhone,
      message,
      documentUrl,
      pdfAttached: Boolean(budgetPdfPath && fs.existsSync(budgetPdfPath)),
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
