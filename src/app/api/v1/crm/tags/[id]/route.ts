import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/tags/[id]
 * Edita nome ou cor de uma etiqueta existente
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (color !== undefined) data.color = color;

    const tag = await prisma.kanbanTag.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      tag,
    });
  } catch (error: any) {
    console.error("[CRM Tags API] Erro ao atualizar tag:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar etiqueta." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/tags/[id]
 * Remove uma etiqueta e suas associações
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.kanbanTag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Etiqueta removida com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Tags API] Erro ao excluir tag:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover etiqueta." },
      { status: 500 }
    );
  }
}
