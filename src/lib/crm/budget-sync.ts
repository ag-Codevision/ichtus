import prisma from "@/lib/prisma";
import { generateBudgetPDF, BudgetPDFData, BudgetPDFResult } from "@/lib/documents/budget-pdf-generator";
import { generateNextBudgetCode } from "@/lib/crm/budget-code";

export interface SyncBudgetResult {
  success: boolean;
  budgetCode: string;
  documentId?: string;
  pdfResult?: BudgetPDFResult;
  error?: string;
}

/**
 * Sincroniza dinamicamente o documento oficial de Orçamento em PDF para um Lead/Serviço:
 * 1. Busca os dados mais recentes do serviço no banco (contato, cliente, categoria, subcategoria, insumos, voltagem, frete, etc.).
 * 2. Assegura que o serviço possua um código sequencial de orçamento único (budgetCode).
 * 3. Gera ou regera o PDF com todos os dados técnicos e financeiros atualizados.
 * 4. Faz o upsert na tabela Document (categoria "ORCAMENTO").
 * 5. Atualiza o anexo do cartão (LeadAttachment) com o novo PDF para download direto.
 */
export async function syncLeadBudgetDocument(leadId: string): Promise<SyncBudgetResult> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        helper: true,
        category: true,
        subcategory: true,
      },
    });

    if (!lead) {
      return { success: false, budgetCode: "", error: "Serviço não encontrado." };
    }

    // Garante que o lead tenha um budgetCode
    let budgetCode = lead.budgetCode;
    if (!budgetCode) {
      budgetCode = await generateNextBudgetCode();
      await prisma.lead.update({
        where: { id: leadId },
        data: { budgetCode },
      });
    }

    // Processa materiais/insumos se houver
    let parsedMaterials: any[] = [];
    if (Array.isArray(lead.materials)) {
      parsedMaterials = lead.materials;
    } else if (typeof lead.materials === "string") {
      try {
        parsedMaterials = JSON.parse(lead.materials);
      } catch (e) {
        parsedMaterials = [];
      }
    }

    const clientTradeName =
      lead.customer?.tradeName ||
      lead.customer?.companyName ||
      lead.customer?.fullName ||
      lead.contactName;

    const clientAddress = lead.customer?.city
      ? `${lead.customer.city} - ${lead.customer.state || "PR"}`
      : null;

    // Gera o PDF oficial da Ícthus
    const pdfData: BudgetPDFData = {
      budgetCode,
      title: lead.title,
      contactName: lead.contactName,
      contactPhone: lead.contactPhone,
      contactEmail: lead.contactEmail,
      clientTradeName,
      clientAddress,
      estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
      priority: lead.priority,
      dueDate: lead.dueDate,
      notes: lead.notes,
      voltage: lead.voltage,
      tools: Array.isArray(lead.tools) ? lead.tools : [],
      materials: parsedMaterials,
      paintDetails: lead.paintDetails,
      freightDetails: lead.freightDetails,
      helperName: lead.helper?.fullName || lead.helper?.tradeName,
      categoryName: lead.category?.name,
      subcategoryName: lead.subcategory?.name,
      createdAt: lead.createdAt,
    };

    const pdfResult = await generateBudgetPDF(pdfData);

    // Upsert na tabela Document
    const existingDoc = await prisma.document.findFirst({
      where: { leadId, category: "ORCAMENTO" },
    });

    let documentRecord;
    const docTitle = `Orçamento [${budgetCode}] — ${lead.title}`;

    if (existingDoc) {
      documentRecord = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          code: budgetCode,
          title: docTitle,
          fileUrl: pdfResult.fileUrl,
          fileSize: pdfResult.fileSize,
          clientName: clientTradeName || "Cliente",
          clientPhone: lead.contactPhone,
          clientEmail: lead.contactEmail,
          totalAmount: lead.estimatedValue ? Number(lead.estimatedValue) : null,
          status: existingDoc.status === "ENVIADO_WHATSAPP" ? "ENVIADO_WHATSAPP" : "GERADO",
          metadata: {
            voltage: lead.voltage,
            tools: lead.tools,
            materials: parsedMaterials,
            paintDetails: lead.paintDetails,
            freightDetails: lead.freightDetails,
            category: lead.category?.name,
            subcategory: lead.subcategory?.name,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      documentRecord = await prisma.document.create({
        data: {
          code: budgetCode,
          title: docTitle,
          category: "ORCAMENTO",
          fileUrl: pdfResult.fileUrl,
          fileSize: pdfResult.fileSize,
          customerId: lead.customerId || null,
          leadId: lead.id,
          clientName: clientTradeName || "Cliente",
          clientPhone: lead.contactPhone,
          clientEmail: lead.contactEmail,
          totalAmount: lead.estimatedValue ? Number(lead.estimatedValue) : null,
          status: "GERADO",
          sentViaWhatsapp: false,
          metadata: {
            voltage: lead.voltage,
            tools: lead.tools,
            materials: parsedMaterials,
            paintDetails: lead.paintDetails,
            freightDetails: lead.freightDetails,
            category: lead.category?.name,
            subcategory: lead.subcategory?.name,
          },
        },
      });
    }

    // Sincroniza o PDF em LeadAttachment (para download no card)
    const existingAttachment = await prisma.leadAttachment.findFirst({
      where: {
        leadId,
        fileName: pdfResult.fileName,
      },
    });

    if (!existingAttachment) {
      await prisma.leadAttachment.create({
        data: {
          leadId,
          fileName: pdfResult.fileName,
          fileUrl: pdfResult.fileUrl,
          fileType: "PDF",
          fileSize: pdfResult.fileSize,
          isExternalLink: false,
          isCover: false,
        },
      }).catch((e) => console.warn("[budget-sync] Aviso ao criar LeadAttachment:", e));
    } else {
      await prisma.leadAttachment.update({
        where: { id: existingAttachment.id },
        data: {
          fileUrl: pdfResult.fileUrl,
          fileSize: pdfResult.fileSize,
        },
      }).catch((e) => console.warn("[budget-sync] Aviso ao atualizar LeadAttachment:", e));
    }

    return {
      success: true,
      budgetCode,
      documentId: documentRecord.id,
      pdfResult,
    };
  } catch (error: any) {
    console.error("[budget-sync] Erro ao sincronizar documento de orçamento:", error);
    return {
      success: false,
      budgetCode: "",
      error: error?.message || "Erro desconhecido ao gerar orçamento.",
    };
  }
}
