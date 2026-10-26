import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/resources/[id]
 * Atualiza o nome de um recurso
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome do recurso é obrigatório." },
        { status: 400 }
      );
    }

    const resource = await prisma.serviceResource.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      resource,
    });
  } catch (error: any) {
    console.error("[CRM Resources PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar recurso." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/resources/[id]
 * Exclui um recurso
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.serviceResource.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Recurso excluído com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Resources DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir recurso." },
      { status: 500 }
    );
  }
}
