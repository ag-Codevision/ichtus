import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  normalizeBlogCategoryColor,
  normalizeBlogCategoryName,
} from "@/lib/blog-categories";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/blog/categories/[id]
 * Atualiza nome, cor ou ordem de uma categoria e sincroniza pautas vinculadas.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    const updateData: { name?: string; color?: string; order?: number } = {};

    if (body.name !== undefined) {
      const cleanName = typeof body.name === "string" ? normalizeBlogCategoryName(body.name) : "";
      if (cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: "O nome da categoria deve ter pelo menos 2 caracteres." },
          { status: 400 }
        );
      }
      if (cleanName.length > 80) {
        return NextResponse.json(
          { success: false, error: "O nome da categoria deve ter no máximo 80 caracteres." },
          { status: 400 }
        );
      }

      const duplicate = await prisma.blogCategory.findFirst({
        where: {
          id: { not: id },
          name: { equals: cleanName, mode: "insensitive" },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Já existe outra categoria chamada "${duplicate.name}".` },
          { status: 409 }
        );
      }

      updateData.name = cleanName;
    }

    if (body.color !== undefined) {
      updateData.color = normalizeBlogCategoryColor(body.color);
    }

    if (typeof body.order === "number" && Number.isFinite(body.order)) {
      updateData.order = Math.max(0, Math.floor(body.order));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo válido informado para atualização." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.blogCategory.update({
        where: { id },
        data: updateData,
      });

      if (updateData.name && updateData.name !== existing.name) {
        await tx.blogTopic.updateMany({
          where: {
            category: { equals: existing.name, mode: "insensitive" },
          },
          data: {
            category: updateData.name,
          },
        });
      }

      const topicsCount = await tx.blogTopic.count({
        where: {
          category: { equals: updated.name, mode: "insensitive" },
        },
      });

      return { ...updated, topicsCount };
    });

    return NextResponse.json({
      success: true,
      message: "Categoria atualizada com sucesso!",
      data: result,
      previousName: existing.name,
    });
  } catch (error: any) {
    console.error("[API Blog Category PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar categoria." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/blog/categories/[id]
 * Remove uma categoria e desvincula as pautas associadas (passam para Geral / null).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.blogTopic.updateMany({
        where: {
          category: { equals: existing.name, mode: "insensitive" },
        },
        data: {
          category: null,
        },
      });

      await tx.blogCategory.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Categoria "${existing.name}" excluída com sucesso.`,
      deletedName: existing.name,
    });
  } catch (error: any) {
    console.error("[API Blog Category DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir categoria." },
      { status: 500 }
    );
  }
}
