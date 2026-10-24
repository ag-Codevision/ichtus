import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { generateBudgetPDF } from "@/lib/documents/budget-pdf-generator";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/crm/leads/[id]/budget-document
 * Retorna o documento de orçamento oficial em PDF vinculado ao lead.
 * Se o documento ou o arquivo físico ainda não existir, ele é gerado e registrado dinamicamente.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        helper: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    let document = await prisma.document.findFirst({
      where: { leadId: id, category: "ORCAMENTO" },
      orderBy: { createdAt: "desc" },
    });

    let fileExists = false;
    if (document?.fileUrl) {
      const physicalPath = path.join(process.cwd(), "public", document.fileUrl.replace(/^\//, ""));
      fileExists = fs.existsSync(physicalPath);
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
        document = await prisma.document.update({
          where: { id: document.id },
          data: {
            code: budgetCode,
            fileUrl: pdfResult.fileUrl,
            fileSize: pdfResult.fileSize,
            status: "GERADO",
          },
        });
      } else {
        document = await prisma.document.create({
          data: {
            code: budgetCode,
            title: `Orçamento [${budgetCode}] — ${lead.title}`,
            category: "ORCAMENTO",
            fileUrl: pdfResult.fileUrl,
            fileSize: pdfResult.fileSize,
            customerId: lead.customerId || null,
            leadId: lead.id,
            clientName: lead.customer?.tradeName || lead.contactName,
            clientPhone: lead.contactPhone,
            clientEmail: lead.contactEmail,
            totalAmount: lead.estimatedValue ? Number(lead.estimatedValue) : null,
            status: "GERADO",
            sentViaWhatsapp: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error("[CRM] Erro ao buscar/gerar documento de orçamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar orçamento em PDF." },
      { status: 500 }
    );
  }
}
