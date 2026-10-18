import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/leads/checklists/[id]
 * Renomeia a checklist
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    const checklist = await prisma.leadChecklist.update({
      where: { id },
      data: {
        title: title?.trim(),
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      checklist,
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao atualizar checklist:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar checklist." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/leads/checklists/[id]
 * Exclui a checklist e seus itens associados
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.leadChecklist.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Checklist removida com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao excluir checklist:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover checklist." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/leads/checklists/[id]
 * Adiciona um novo item na checklist
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "O título do item é obrigatório." },
        { status: 400 }
      );
    }

    const count = await prisma.leadChecklistItem.count({
      where: { checklistId: id },
    });

    const item = await prisma.leadChecklistItem.create({
      data: {
        checklistId: id,
        title: title.trim(),
        order: count,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao adicionar item:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao adicionar item à checklist." },
      { status: 500 }
    );
  }
}
