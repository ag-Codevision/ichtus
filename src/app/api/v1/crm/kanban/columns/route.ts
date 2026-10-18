import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/crm/kanban/columns
 * Listagem das colunas do Kanban ordenadas
 */
export async function GET() {
  try {
    const columns = await prisma.kanbanColumn.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ success: true, columns });
  } catch (error: any) {
    console.error("[Kanban API] Erro ao listar colunas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao listar colunas do funil" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/kanban/columns
 * Adiciona uma nova coluna / etapa ao funil comercial
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color = "#FF650F" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da coluna é obrigatório." },
        { status: 400 }
      );
    }

    const lastCol = await prisma.kanbanColumn.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastCol ? lastCol.order + 1 : 0;

    const newColumn = await prisma.kanbanColumn.create({
      data: {
        name: name.trim(),
        color: color.trim() || "#FF650F",
        order: nextOrder,
        isSystem: false,
      },
      include: {
        leads: true,
      },
    });

    return NextResponse.json({
      success: true,
      column: newColumn,
      message: "Nova coluna adicionada ao funil com sucesso!",
    });
  } catch (error: any) {
    console.error("[Kanban API] Erro ao criar coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao adicionar coluna ao funil." },
      { status: 500 }
    );
  }
}
