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
        tags: { include: { tag: true } },
        checklists: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
        attachments: true,
        comments: { orderBy: { createdAt: "asc" } },
      },
    });

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
