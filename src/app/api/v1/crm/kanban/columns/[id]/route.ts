import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/kanban/columns/[id]
 * Edita nome ou cor de uma coluna do funil Kanban
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    const existing = await prisma.kanbanColumn.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Coluna não localizada." },
        { status: 404 }
      );
    }

    const updated = await prisma.kanbanColumn.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        color: color !== undefined ? color.trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      column: updated,
      message: "Coluna atualizada com sucesso!",
    });
  } catch (error: any) {
    console.error("[Kanban API] Erro ao editar coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar coluna." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/kanban/columns/[id]
 * Exclui uma coluna do funil Kanban.
 * Caso haja leads vinculados, reatribui com segurança para a primeira coluna restante.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const column = await prisma.kanbanColumn.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!column) {
      return NextResponse.json(
        { success: false, error: "Coluna não encontrada." },
        { status: 404 }
      );
    }

    // Busca outra coluna para onde mover os leads caso existam
    if (column._count.leads > 0) {
      const fallbackColumn = await prisma.kanbanColumn.findFirst({
        where: { id: { not: id } },
        orderBy: { order: "asc" },
      });

      if (fallbackColumn) {
        // Move os leads para a coluna de destino
        await prisma.lead.updateMany({
          where: { columnId: id },
          data: { columnId: fallbackColumn.id },
        });
      }
    }

    // Deleta a coluna
    await prisma.kanbanColumn.delete({
      where: { id },
    });

    // Reorganiza a ordem numérica das colunas restantes
    const remainingColumns = await prisma.kanbanColumn.findMany({
      orderBy: { order: "asc" },
    });

    await prisma.$transaction(
      remainingColumns.map((col, index) =>
        prisma.kanbanColumn.update({
          where: { id: col.id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Coluna removida com sucesso do funil!",
    });
  } catch (error: any) {
    console.error("[Kanban API] Erro ao excluir coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover coluna do funil." },
      { status: 500 }
    );
  }
}
