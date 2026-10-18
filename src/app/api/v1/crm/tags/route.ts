import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/crm/tags
 * Lista todas as etiquetas/categorias disponíveis para o Kanban
 */
export async function GET() {
  try {
    const tags = await prisma.kanbanTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error: any) {
    console.error("[CRM Tags API] Erro ao listar tags:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar etiquetas." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/tags
 * Cria uma nova etiqueta/categoria com nome e cor
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da etiqueta é obrigatório." },
        { status: 400 }
      );
    }

    const tag = await prisma.kanbanTag.create({
      data: {
        name: name.trim(),
        color: color || "#FF650F",
      },
    });

    return NextResponse.json({
      success: true,
      tag,
    });
  } catch (error: any) {
    console.error("[CRM Tags API] Erro ao criar tag:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao criar etiqueta." },
      { status: 500 }
    );
  }
}
