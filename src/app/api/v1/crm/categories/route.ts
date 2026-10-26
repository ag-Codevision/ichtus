import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/crm/categories
 * Retorna todas as categorias e suas subcategorias cadastradas
 */
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { leads: true },
            },
          },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error("[CRM Categories GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar categorias." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/categories
 * Cria uma nova categoria de serviço
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da categoria é obrigatório." },
        { status: 400 }
      );
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name: name.trim(),
        color: color || "#FF650F",
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error: any) {
    console.error("[CRM Categories POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar categoria." },
      { status: 500 }
    );
  }
}
