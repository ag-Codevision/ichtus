import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadSource, PriorityLevel } from "@prisma/client";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";
import { generateNextBudgetCode } from "@/lib/crm/budget-code";
import { generateBudgetPDF } from "@/lib/documents/budget-pdf-generator";

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
            helper: {
              select: {
                id: true,
                tradeName: true,
                companyName: true,
                fullName: true,
                phone: true,
                whatsapp: true,
              },
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
            category: {
              select: { id: true, name: true, color: true },
            },
            subcategory: {
              select: { id: true, name: true },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            checklists: {
              orderBy: { order: "asc" },
              include: {
                items: {
                  orderBy: { order: "asc" },
                },
              },
            },
            attachments: true,
            _count: {
              select: {
                comments: true,
                attachments: true,
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
 * Criação de um novo serviço/lead + Geração automática de Orçamento em PDF + Envio via WhatsApp opcional
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      budgetCode,
      categoryId,
      subcategoryId,
      helperId,
      voltage,
      tools = [],
      materials = [],
      paintDetails,
      freightDetails,
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
      dueDate,
      sendWhatsApp = false,
      initialChecklist,
      initialAttachments = [],
      userName,
    } = body;

    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { success: false, error: "Nome e telefone de contato são obrigatórios." },
        { status: 400 }
      );
    }

    // Se columnId não for especificado, busca a primeira coluna ("Novo Lead" / primeiro campo)
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

    const finalBudgetCode = budgetCode?.trim() || (await generateNextBudgetCode());

    // Calcula a ordem no final da coluna
    const leadsInCol = await prisma.lead.count({
      where: { columnId: targetColumnId },
    });

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const safeDueDate = parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate : null;

    const lead = await prisma.lead.create({
      data: {
        budgetCode: finalBudgetCode,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        helperId: helperId || null,
        voltage: voltage || null,
        tools: Array.isArray(tools) ? tools : [],
        materials: Array.isArray(materials) ? materials : [],
        paintDetails: paintDetails?.trim() || null,
        freightDetails: freightDetails?.trim() || null,
        title: title || `Orçamento [${finalBudgetCode}] — ${contactName}`,
        contactName,
        contactPhone,
        contactEmail: contactEmail || null,
        customerId: customerId || null,
        source,
        estimatedValue: estimatedValue ? Number(estimatedValue) : null,
        priority,
        notes: notes || null,
        dueDate: safeDueDate,
        columnId: targetColumnId,
        orderInColumn: leadsInCol,
      },
      include: {
        customer: true,
        helper: true,
        category: true,
        subcategory: true,
      },
    });
    // Registra atividade inicial de criação no histórico do cartão
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "CREATED",
        content: `Serviço criado no funil comercial com ID de Orçamento [${finalBudgetCode}]`,
        userName: userName || "Equipe Icthus",
      },
    }).catch((e) => console.warn("Aviso ao registrar atividade inicial:", e));

    // Se houver checklist inicial configurada
    if (initialChecklist && initialChecklist.title) {
      try {
        const createdChecklist = await prisma.leadChecklist.create({
          data: {
            leadId: lead.id,
            title: initialChecklist.title,
            order: 0,
          },
        });
        if (Array.isArray(initialChecklist.items) && initialChecklist.items.length > 0) {
          await prisma.leadChecklistItem.createMany({
            data: initialChecklist.items.map((itemTitle: string, idx: number) => ({
              checklistId: createdChecklist.id,
              title: itemTitle.trim(),
              order: idx,
              isCompleted: false,
            })),
          });
        }
      } catch (chkErr) {
        console.warn("Aviso ao criar checklist inicial:", chkErr);
      }
    }

    // Se houver anexos/links iniciais (Google Drive, OneDrive, etc.)
    if (Array.isArray(initialAttachments) && initialAttachments.length > 0) {
      try {
        for (const att of initialAttachments) {
          if (att.fileUrl) {
            await prisma.leadAttachment.create({
              data: {
                leadId: lead.id,
                fileName: att.fileName || att.fileUrl,
                fileUrl: att.fileUrl,
                fileType: att.fileType || "LINK",
                isExternalLink: true,
                isCover: false,
              },
            });
          }
        }
      } catch (attErr) {
        console.warn("Aviso ao criar anexos iniciais:", attErr);
      }
    }


    // 1. Gera automaticamente o Orçamento em PDF profissional da Ícthus
    let pdfResult = null;
    let createdDocument = null;
    try {
      pdfResult = await generateBudgetPDF({
        budgetCode: finalBudgetCode,
        title: lead.title,
        contactName: lead.contactName,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail,
        clientTradeName: lead.customer?.tradeName || lead.customer?.companyName || lead.customer?.fullName,
        clientAddress: lead.customer?.city ? `${lead.customer.city} - ${lead.customer.state || "PR"}` : null,
        estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
        priority: lead.priority,
        dueDate: safeDueDate,
        notes: lead.notes,
        voltage: lead.voltage,
        tools: lead.tools,
        paintDetails: lead.paintDetails,
        freightDetails: lead.freightDetails,
        helperName: lead.helper?.fullName || lead.helper?.tradeName,
        createdAt: lead.createdAt,
      });

      // 2. Registra o documento na tabela de Documentos com categoria "ORCAMENTO"
      createdDocument = await prisma.document.create({
        data: {
          code: finalBudgetCode,
          title: `Orçamento [${finalBudgetCode}] — ${lead.title}`,
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
          metadata: {
            voltage: lead.voltage,
            tools: lead.tools,
            paintDetails: lead.paintDetails,
            freightDetails: lead.freightDetails,
          },
        },
      });

      // Registra também como anexo no Lead para consulta rápida no card
      await prisma.leadAttachment.create({
        data: {
          leadId: lead.id,
          fileName: pdfResult.fileName,
          fileUrl: pdfResult.fileUrl,
          fileType: "PDF",
          fileSize: pdfResult.fileSize,
        },
      }).catch((e) => console.warn("Aviso ao vincular anexo ao lead:", e));
    } catch (pdfErr) {
      console.error("[CRM] Falha ao gerar documento de orçamento em PDF:", pdfErr);
    }

    // 3. Se o switch de envio via WhatsApp estiver ligado:
    let whatsappSent = false;
    if (sendWhatsApp && pdfResult) {
      try {
        const greetingMsg = `Olá, *${contactName}*! Tudo bem? 🤝\n\nAqui é da equipe técnica da *Ícthus Comunicação Visual*.\n\nElaboramos o seu *Orçamento Oficial [${finalBudgetCode}]* com todas as especificações do seu projeto: *${lead.title}*.\n\nSegue em anexo o documento detalhado em PDF para sua conferência e aprovação. Qualquer dúvida, estamos à inteira disposição!`;
        
        const wppRes = await sendWhatsAppMessage({
          to: contactPhone,
          message: greetingMsg,
          documentUrl: pdfResult.fileUrl,
          fileName: pdfResult.fileName,
          mimetype: "application/pdf",
        });

        if (wppRes.success) {
          whatsappSent = true;
          if (createdDocument) {
            await prisma.document.update({
              where: { id: createdDocument.id },
              data: {
                sentViaWhatsapp: true,
                status: "ENVIADO_WHATSAPP",
                sentAt: new Date(),
              },
            });
          }
        }
      } catch (wppErr) {
        console.warn("[CRM] Aviso ao disparar WhatsApp automático:", wppErr);
      }
    }

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

    return NextResponse.json(
      {
        success: true,
        message: "Serviço cadastrado com sucesso no funil comercial!",
        lead,
        document: createdDocument,
        pdfUrl: pdfResult?.fileUrl || null,
        whatsappSent,
        appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[CRM API] Erro ao criar serviço/lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar novo serviço", details: error?.message },
      { status: 500 }
    );
  }
}
