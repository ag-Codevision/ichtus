import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/production/columns/[id]
 * Edita nome e cor de uma coluna da esteira de produção
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    const column = await prisma.productionColumn.findUnique({
      where: { id },
    });

    if (!column) {
      return NextResponse.json(
        { success: false, error: "Etapa não encontrada." },
        { status: 404 }
      );
    }

    const updated = await prisma.productionColumn.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        color: color !== undefined ? color.trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      column: updated,
      message: "Etapa atualizada com sucesso!",
    });
  } catch (error: any) {
    console.error("[Production Columns API] Erro ao editar coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar etapa fabril." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/production/columns/[id]
 * Exclui uma coluna da produção e realoca as ordens para a primeira coluna
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const column = await prisma.productionColumn.findUnique({
      where: { id },
    });

    if (!column) {
      return NextResponse.json(
        { success: false, error: "Etapa não encontrada." },
        { status: 404 }
      );
    }

    const fallbackColumn = await prisma.productionColumn.findFirst({
      where: { id: { not: id } },
      orderBy: { order: "asc" },
    });

    if (fallbackColumn) {
      await prisma.serviceOrder.updateMany({
        where: { productionColumnId: id },
        data: { productionColumnId: fallbackColumn.id },
      });
    }

    await prisma.productionColumn.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Etapa excluída com sucesso da linha de produção!",
    });
  } catch (error: any) {
    console.error("[Production Columns API] Erro ao excluir coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir etapa da esteira." },
      { status: 500 }
    );
  }
}
