import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/categories/subcategories/[id]
 * Atualiza o nome da subcategoria
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da subcategoria é obrigatório." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.serviceSubcategory.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      subcategory,
    });
  } catch (error: any) {
    console.error("[CRM Subcategory PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar subcategoria." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/categories/subcategories/[id]
 * Exclui a subcategoria
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Desvincula leads que utilizavam esta subcategoria
    await prisma.lead.updateMany({
      where: { subcategoryId: id },
      data: { subcategoryId: null },
    });

    await prisma.serviceSubcategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Subcategoria excluída com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Subcategory DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir subcategoria." },
      { status: 500 }
    );
  }
}
