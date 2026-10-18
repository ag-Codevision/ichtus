import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * PUT /api/v1/crm/kanban/columns/reorder
 * Reordena as colunas do funil Kanban
 * Body: { columns: Array<{ id: string, order: number }> }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { columns } = body;

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array de colunas inválido para reordenação." },
        { status: 400 }
      );
    }

    // Executa em transação atômica
    await prisma.$transaction(
      columns.map((item: { id: string; order: number }) =>
        prisma.kanbanColumn.update({
          where: { id: item.id },
          data: { order: Number(item.order) },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Ordem das colunas atualizada com sucesso no funil!",
    });
  } catch (error: any) {
    console.error("[Kanban API] Erro ao reordenar colunas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao salvar reordenação das colunas." },
      { status: 500 }
    );
  }
}
