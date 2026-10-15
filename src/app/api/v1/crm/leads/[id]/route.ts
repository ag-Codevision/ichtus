import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/leads/[id]
 * Atualiza campos do lead (ex: movimentação entre colunas no drag-and-drop)
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
      estimatedValue,
      priority,
      notes,
      assignedToId,
    } = body;

    const dataToUpdate: any = {};

    if (columnId !== undefined) dataToUpdate.columnId = columnId;
    if (orderInColumn !== undefined) dataToUpdate.orderInColumn = Number(orderInColumn);
    if (title !== undefined) dataToUpdate.title = title;
    if (contactName !== undefined) dataToUpdate.contactName = contactName;
    if (contactPhone !== undefined) dataToUpdate.contactPhone = contactPhone;
    if (contactEmail !== undefined) dataToUpdate.contactEmail = contactEmail;
    if (estimatedValue !== undefined)
      dataToUpdate.estimatedValue = estimatedValue !== null ? Number(estimatedValue) : null;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (assignedToId !== undefined) dataToUpdate.assignedToId = assignedToId;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: dataToUpdate,
      include: {
        column: { select: { id: true, name: true, color: true } },
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
      message: "Lead removido com sucesso",
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao excluir lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover lead", details: error?.message },
      { status: 500 }
    );
  }
}
