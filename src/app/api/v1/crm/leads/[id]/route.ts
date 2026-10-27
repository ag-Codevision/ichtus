import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBudgetPDF } from "@/lib/documents/budget-pdf-generator";
import { syncLeadBudgetDocument } from "@/lib/crm/budget-sync";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/crm/leads/[id]
 * Retorna os detalhes completos do Lead ("Verso do Cartão" estilo Trello)
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        column: {
          select: { id: true, name: true, color: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        subcategory: {
          select: { id: true, name: true },
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
            personType: true,
            documentNumber: true,
            whatsapp: true,
            phone: true,
            email: true,
            city: true,
            state: true,
          },
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
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao buscar detalhes da oportunidade:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar serviço." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/crm/leads/[id]
 * Atualiza campos do lead (título, notas/descrição, valor, prioridade, prazos, cliente, capa, etc.)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      budgetCode,
      categoryId,
      subcategoryId,
      helperId,
      voltage,
      tools,
      materials,
      paintDetails,
      freightDetails,
      proposalContent,
      contractContent,
      columnId,
      orderInColumn,
      title,
      contactName,
      contactPhone,
      contactEmail,
      customerId,
      estimatedValue,
      priority,
      source,
      notes,
      dueDate,
      isCompleted,
      coverImage,
      assignedToId,
    } = body;

    const dataToUpdate: any = {};

    if (budgetCode !== undefined) dataToUpdate.budgetCode = budgetCode?.trim() || null;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId || null;
    if (subcategoryId !== undefined) dataToUpdate.subcategoryId = subcategoryId || null;
    if (helperId !== undefined) dataToUpdate.helperId = helperId || null;
    if (voltage !== undefined) dataToUpdate.voltage = voltage || null;
    if (tools !== undefined) dataToUpdate.tools = Array.isArray(tools) ? tools : [];
    if (materials !== undefined) dataToUpdate.materials = Array.isArray(materials) ? materials : [];
    if (paintDetails !== undefined) dataToUpdate.paintDetails = paintDetails?.trim() || null;
    if (freightDetails !== undefined) dataToUpdate.freightDetails = freightDetails?.trim() || null;
    if (proposalContent !== undefined) dataToUpdate.proposalContent = proposalContent;
    if (contractContent !== undefined) dataToUpdate.contractContent = contractContent;
    if (columnId !== undefined) dataToUpdate.columnId = columnId;
    if (orderInColumn !== undefined) dataToUpdate.orderInColumn = Number(orderInColumn);
    if (title !== undefined) dataToUpdate.title = title?.trim() || "Serviço sem título";
    if (contactName !== undefined) dataToUpdate.contactName = contactName?.trim() || "";
    if (contactPhone !== undefined) dataToUpdate.contactPhone = contactPhone?.trim() || "";
    if (contactEmail !== undefined) dataToUpdate.contactEmail = contactEmail?.trim() || null;
    if (customerId !== undefined) dataToUpdate.customerId = customerId || null;
    if (estimatedValue !== undefined) {
      dataToUpdate.estimatedValue =
        estimatedValue !== null && estimatedValue !== "" ? Number(estimatedValue) : null;
    }
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (source !== undefined) dataToUpdate.source = source;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (dueDate !== undefined) {
      if (!dueDate) {
        dataToUpdate.dueDate = null;
      } else {
        const d = new Date(dueDate);
        dataToUpdate.dueDate = isNaN(d.getTime()) ? null : d;
      }
    }
    if (isCompleted !== undefined) dataToUpdate.isCompleted = Boolean(isCompleted);
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
    if (assignedToId !== undefined) dataToUpdate.assignedToId = assignedToId;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: dataToUpdate,
      include: {
        column: { select: { id: true, name: true, color: true } },
        customer: true,
        helper: true,
        category: true,
        subcategory: true,
        tags: { include: { tag: true } },
        checklists: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
        attachments: true,
        comments: { orderBy: { createdAt: "asc" } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    // Sincroniza dinamicamente o documento oficial de orçamento e regera o PDF em tempo real
    try {
      await syncLeadBudgetDocument(id);
    } catch (docErr) {
      console.warn("[CRM] Aviso ao regerar/sincronizar documento de orçamento:", docErr);
    }

    // Registra atividade de movimentação de coluna
    if (columnId !== undefined) {
      try {
        const destCol = await prisma.kanbanColumn.findUnique({
          where: { id: columnId },
          select: { name: true },
        });
        if (destCol) {
          await prisma.leadActivity.create({
            data: {
              leadId: id,
              type: "STAGE_CHANGE",
              content: `Moveu este cartão para "${destCol.name}"`,
              userName: body.userName || "Equipe",
            },
          });
        }
      } catch (err) {
        console.warn("[CRM] Aviso ao registrar atividade de movimentação:", err);
      }
    }

    // Gatilho automático para Linha de Produção ao arrastar para coluna "Produção"
    if (columnId !== undefined) {
      try {
        const targetCol = await prisma.kanbanColumn.findUnique({
          where: { id: columnId },
        });

        const isProductionCol =
          targetCol &&
          (targetCol.name.trim().toLowerCase().includes("produção") ||
            targetCol.name.trim().toLowerCase().includes("producao"));

        if (isProductionCol) {
          const existingSO = await prisma.serviceOrder.findFirst({
            where: { leadId: id },
          });

          if (!existingSO) {
            const adminUser = await prisma.user.findFirst({
              where: { role: "ADMIN" },
            });

            // Garante que o cliente exista
            let effectiveCustomerId = updatedLead.customerId;
            if (!effectiveCustomerId) {
              const newCustomer = await prisma.customer.create({
                data: {
                  tradeName: updatedLead.contactName || updatedLead.title,
                  fullName: updatedLead.contactName,
                  phone: updatedLead.contactPhone,
                  whatsapp: updatedLead.contactPhone,
                  email: updatedLead.contactEmail || null,
                  type: "CUSTOMER",
                  status: "ACTIVE",
                },
              });
              effectiveCustomerId = newCustomer.id;
              await prisma.lead.update({
                where: { id },
                data: { customerId: effectiveCustomerId },
              });
            }

            const currentYear = new Date().getFullYear();
            const osCount = await prisma.serviceOrder.count();
            const osCode = `OS-${currentYear}-${String(osCount + 1).padStart(4, "0")}`;
            const val = updatedLead.estimatedValue ? Number(updatedLead.estimatedValue) : 0;

            const toolsList =
              Array.isArray(updatedLead.tools) && updatedLead.tools.length > 0
                ? `\n\n🔧 Ferramentas & Recursos: ${updatedLead.tools.join(", ")}`
                : "";
            const voltStr = updatedLead.voltage ? `\n⚡ Voltagem: ${updatedLead.voltage}` : "";
            const paintStr = updatedLead.paintDetails ? `\n🎨 Tinta: ${updatedLead.paintDetails}` : "";
            const freightStr = updatedLead.freightDetails ? `\n🚚 Frete: ${updatedLead.freightDetails}` : "";

            await prisma.serviceOrder.create({
              data: {
                code: osCode,
                customerId: effectiveCustomerId,
                leadId: id,
                createdById: adminUser ? adminUser.id : updatedLead.customer?.userId || id,
                title: updatedLead.title,
                description: `${updatedLead.notes || "Trabalho encaminhado via CRM."}${voltStr}${paintStr}${freightStr}${toolsList}`,
                currentStage: "BRIEFING_ARTWORK",
                priority: updatedLead.priority,
                deadline: updatedLead.dueDate,
                totalAmount: val,
                discount: 0,
                netAmount: val,
                notes: `ID Orçamento: ${updatedLead.budgetCode || "N/A"}${updatedLead.helper ? ` | Ajudante Auxiliar: ${updatedLead.helper.fullName || updatedLead.helper.tradeName}` : ""}`,
                items: {
                  create: [
                    {
                      description: updatedLead.title,
                      unit: "serviço",
                      quantity: 1,
                      unitPrice: val,
                      totalPrice: val,
                    },
                  ],
                },
              },
            });
            console.log(`🏭 Ordem de Serviço ${osCode} criada automaticamente para o Trabalho ${id}`);
          }
        } else {
          // Ao remover da coluna Em Produção, remove automaticamente da Linha de Produção
          await prisma.serviceOrder.deleteMany({
            where: { leadId: id },
          });
          console.log(`🏭 Ordem de Serviço vinculada ao Lead ${id} removida da Linha de Produção.`);
        }
      } catch (triggerErr) {
        console.warn("[CRM] Aviso ao disparar criação automática na Linha de Produção:", triggerErr);
      }
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao atualizar lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar dados do serviço", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/leads/[id]
 * Remove um serviço/lead do sistema com limpeza segura de todas as dependências
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Executa toda a limpeza e exclusão dentro de uma transação para integridade
    await prisma.$transaction(async (tx) => {
      // 1. Identificar ordens de serviço vinculadas
      const serviceOrders = await tx.serviceOrder.findMany({
        where: { leadId: id },
        select: { id: true },
      });
      const soIds = serviceOrders.map((so) => so.id);

      if (soIds.length > 0) {
        // 1.1 Faturas vinculadas às ordens de serviço
        const invoices = await tx.invoice.findMany({
          where: { serviceOrderId: { in: soIds } },
          select: { id: true },
        });
        const invoiceIds = invoices.map((inv) => inv.id);

        if (invoiceIds.length > 0) {
          // Remover transações financeiras vinculadas a essas faturas
          await tx.financialTransaction.deleteMany({
            where: { invoiceId: { in: invoiceIds } },
          });

          // Remover as faturas
          await tx.invoice.deleteMany({
            where: { id: { in: invoiceIds } },
          });
        }

        // 1.2 Agendamentos vinculados às ordens de serviço
        await tx.appointment.deleteMany({
          where: { serviceOrderId: { in: soIds } },
        });

        // 1.3 Desvincular movimentações de estoque para preservar integridade contábil
        await tx.stockMovement.updateMany({
          where: { serviceOrderId: { in: soIds } },
          data: { serviceOrderId: null },
        });

        // 1.4 Remover documentos vinculados à ordem de serviço
        await tx.document.deleteMany({
          where: { serviceOrderId: { in: soIds } },
        });

        // 1.5 Remover aprovações de arte (ArtworkProof)
        await tx.artworkProof.deleteMany({
          where: { serviceOrderId: { in: soIds } },
        });

        // 1.6 Remover itens da ordem de serviço
        await tx.serviceOrderItem.deleteMany({
          where: { serviceOrderId: { in: soIds } },
        });

        // 1.7 Remover as ordens de serviço
        await tx.serviceOrder.deleteMany({
          where: { id: { in: soIds } },
        });
      }

      // 2. Remove documentos vinculados diretamente ao Lead
      await tx.document.deleteMany({
        where: { leadId: id },
      });

      // 3. Remove etiquetas vinculadas
      await tx.leadTagAssignment.deleteMany({
        where: { leadId: id },
      });

      // 4. Remove checklists e seus itens
      const checklists = await tx.leadChecklist.findMany({
        where: { leadId: id },
        select: { id: true },
      });
      if (checklists.length > 0) {
        await tx.leadChecklistItem.deleteMany({
          where: { checklistId: { in: checklists.map((c) => c.id) } },
        });
        await tx.leadChecklist.deleteMany({
          where: { leadId: id },
        });
      }

      // 5. Remove anexos, comentários e atividades
      await tx.leadAttachment.deleteMany({
        where: { leadId: id },
      });

      await tx.leadComment.deleteMany({
        where: { leadId: id },
      });

      await tx.leadActivity.deleteMany({
        where: { leadId: id },
      });

      // 6. Remove o lead com segurança
      await tx.lead.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Serviço excluído com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao excluir serviço:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir serviço.", details: error?.message },
      { status: 500 }
    );
  }
}
