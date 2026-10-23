import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Oportunidade não encontrada." },
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
      { success: false, error: "Falha ao consultar oportunidade." },
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
      helperId,
      voltage,
      tools,
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
    if (helperId !== undefined) dataToUpdate.helperId = helperId || null;
    if (voltage !== undefined) dataToUpdate.voltage = voltage || null;
    if (tools !== undefined) dataToUpdate.tools = Array.isArray(tools) ? tools : [];
    if (paintDetails !== undefined) dataToUpdate.paintDetails = paintDetails?.trim() || null;
    if (freightDetails !== undefined) dataToUpdate.freightDetails = freightDetails?.trim() || null;
    if (proposalContent !== undefined) dataToUpdate.proposalContent = proposalContent;
    if (contractContent !== undefined) dataToUpdate.contractContent = contractContent;
    if (columnId !== undefined) dataToUpdate.columnId = columnId;
    if (orderInColumn !== undefined) dataToUpdate.orderInColumn = Number(orderInColumn);
    if (title !== undefined) dataToUpdate.title = title;
    if (contactName !== undefined) dataToUpdate.contactName = contactName;
    if (contactPhone !== undefined) dataToUpdate.contactPhone = contactPhone;
    if (contactEmail !== undefined) dataToUpdate.contactEmail = contactEmail;
    if (customerId !== undefined) dataToUpdate.customerId = customerId || null;
    if (estimatedValue !== undefined)
      dataToUpdate.estimatedValue = estimatedValue !== null ? Number(estimatedValue) : null;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (source !== undefined) dataToUpdate.source = source;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (dueDate !== undefined)
      dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
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
        tags: { include: { tag: true } },
        checklists: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
        attachments: true,
        comments: { orderBy: { createdAt: "asc" } },
      },
    });

    
    // Gatilho automático para Linha de Produção ao arrastar para coluna "Produção"
    if (columnId !== undefined) {
      try {
        const targetCol = await prisma.kanbanColumn.findUnique({
          where: { id: columnId },
        });

        const isProductionCol = targetCol && (
          targetCol.name.trim().toLowerCase().includes("produção") ||
          targetCol.name.trim().toLowerCase().includes("producao")
        );

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

            const toolsList = Array.isArray(updatedLead.tools) && updatedLead.tools.length > 0
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
          // Regra solicitada: Ao remover o card da coluna Em Produção no Funil Kanban,
          // o card deixa de existir automaticamente na Linha de Produção.
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
      { success: false, error: "Falha ao atualizar dados do lead", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/leads/[id]
 * Remove um lead do sistema
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Oportunidade removida com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao excluir lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir oportunidade." },
      { status: 500 }
    );
  }
}
