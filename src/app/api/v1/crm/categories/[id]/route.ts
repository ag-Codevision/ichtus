import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/categories/[id]
 * Atualiza nome ou cor de uma categoria
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    const data: any = {};
    if (name && typeof name === "string") data.name = name.trim();
    if (color && typeof color === "string") data.color = color;

    const category = await prisma.serviceCategory.update({
      where: { id },
      data,
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error: any) {
    console.error("[CRM Categories PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar categoria." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/categories/[id]
 * Exclui a categoria e suas subcategorias
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Desvincula leads da categoria antes de excluir para evitar inconsistência
    await prisma.lead.updateMany({
      where: { categoryId: id },
      data: { categoryId: null, subcategoryId: null },
    });

    // Exclui a categoria (onDelete: Cascade remove as subcategorias)
    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Categoria excluída com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Categories DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir categoria." },
      { status: 500 }
    );
  }
}
