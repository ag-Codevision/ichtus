import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/categories/[id]/subcategories
 * Cria uma nova subcategoria vinculada à categoria
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: categoryId } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da subcategoria é obrigatório." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.serviceSubcategory.create({
      data: {
        name: name.trim(),
        categoryId,
      },
    });

    return NextResponse.json({
      success: true,
      subcategory,
    });
  } catch (error: any) {
    console.error("[CRM Subcategories POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar subcategoria." },
      { status: 500 }
    );
  }
}
