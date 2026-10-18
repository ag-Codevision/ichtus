import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadSource, PriorityLevel } from "@prisma/client";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp/wacli";

/**
 * GET /api/v1/crm/leads
 * Retorna as colunas do Kanban e todos os leads ordenados
 */
export async function GET(req: NextRequest) {
  try {
    const columns = await prisma.kanbanColumn.findMany({
      orderBy: { order: "asc" },
      include: {
        leads: {
          orderBy: { orderInColumn: "asc" },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            customer: {
              select: {
                id: true,
                tradeName: true,
                companyName: true,
                fullName: true,
                type: true,
                whatsapp: true,
                email: true,
                city: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      columns,
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao listar leads:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar funil comercial" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/leads
 * Criação de um novo lead (via formulário do site ou cadastro manual pelo admin)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      contactName,
      contactPhone,
      contactEmail,
      customerId,
      source = LeadSource.WEBSITE_FORM,
      estimatedValue,
      priority = PriorityLevel.MEDIUM,
      notes,
      columnId,
      scheduledVisitDate,
    } = body;

    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { success: false, error: "Nome e telefone de contato são obrigatórios." },
        { status: 400 }
      );
    }

    // Se columnId não for especificado, busca a primeira coluna ("Novo Lead")
    let targetColumnId = columnId;
    if (!targetColumnId) {
      const firstCol = await prisma.kanbanColumn.findFirst({
        orderBy: { order: "asc" },
      });
      if (!firstCol) {
        return NextResponse.json(
          { success: false, error: "Nenhuma coluna do Kanban encontrada." },
          { status: 500 }
        );
      }
      targetColumnId = firstCol.id;
    }

    // Calcula a ordem no final da coluna
    const leadsInCol = await prisma.lead.count({
      where: { columnId: targetColumnId },
    });

    const lead = await prisma.lead.create({
      data: {
        title: title || `Orçamento — ${contactName}`,
        contactName,
        contactPhone,
        contactEmail: contactEmail || null,
        customerId: customerId || null,
        source,
        estimatedValue: estimatedValue ? Number(estimatedValue) : null,
        priority,
        notes: notes || null,
        columnId: targetColumnId,
        orderInColumn: leadsInCol,
      },
      include: {
        customer: true,
      },
    });

    // Se o lead solicitou agendamento de visita técnica na criação:
    let appointment = null;
    if (scheduledVisitDate) {
      appointment = await prisma.appointment.create({
        data: {
          title: `Visita Técnica — ${contactName}`,
          type: "TECHNICAL_VISIT_MEASUREMENT",
          status: "SCHEDULED",
          scheduledAt: new Date(scheduledVisitDate),
          notes: notes ? `Origem: Formulário do Site.\n${notes}` : "Visita técnica de medição no local.",
        },
      });
    }

    // Notificação imediata via WACLI (WhatsApp)
    try {
      const msg = `Olá, *${contactName}*! 👋\n\nRecebemos sua solicitação de orçamento na *Glessios Comunicação Visual*. Nossa equipe técnica de engenharia de fachadas já está analisando suas informações e entrará em contato em breve.\n\nQualquer dúvida adicional, estamos à disposição por este canal!`;
      await sendWhatsAppMessage({
        to: contactPhone,
        message: msg,
      });
    } catch (wppErr) {
      console.warn("[CRM] Falha silenciosa no envio de WhatsApp de boas-vindas:", wppErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead cadastrado com sucesso no funil comercial!",
        lead,
        appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[CRM API] Erro ao criar lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar novo lead", details: error?.message },
      { status: 500 }
    );
  }
}
