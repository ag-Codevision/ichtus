import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/leads/checklists/items/[id]
 * Altera status de conclusão (checkbox) ou edita o texto do item
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isCompleted, title, dueDate } = body;

    const data: any = {};
    if (isCompleted !== undefined) data.isCompleted = Boolean(isCompleted);
    if (title !== undefined) data.title = title.trim();
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const item = await prisma.leadChecklistItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao atualizar item:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar item da checklist." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/leads/checklists/items/[id]
 * Remove um item da checklist
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.leadChecklistItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Item removido com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao excluir item:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover item." },
      { status: 500 }
    );
  }
}
