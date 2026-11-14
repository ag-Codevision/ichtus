import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/v1/blog/posts/[id]
 * Atualiza conteúdo, metadados SEO, imagem e status do artigo
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Artigo não encontrado." },
        { status: 404 }
      );
    }

    const data: any = {};
    if (body.status && Object.values(PostStatus).includes(body.status)) {
      data.status = body.status;
      if (body.status === PostStatus.PUBLISHED && existing.status === PostStatus.DRAFT) {
        data.publishedAt = new Date();
      }
    }
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim();
    if (typeof body.contentMarkdown === "string") data.contentMarkdown = body.contentMarkdown;
    if (typeof body.coverImageUrl === "string" && body.coverImageUrl.trim()) {
      data.coverImageUrl = body.coverImageUrl.trim();
    }
    if (typeof body.imageAlt === "string") data.imageAlt = body.imageAlt.trim();
    if (body.imagePhotographer !== undefined) {
      data.imagePhotographer =
        typeof body.imagePhotographer === "string"
          ? body.imagePhotographer.trim() || null
          : null;
    }
    if (Array.isArray(body.tags)) {
      data.tags = body.tags
        .filter((t: any) => typeof t === "string")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    if (typeof body.metaTitle === "string") data.metaTitle = body.metaTitle.trim();
    if (typeof body.metaDescription === "string") data.metaDescription = body.metaDescription.trim();
    if (typeof body.readingTimeMin === "number" && body.readingTimeMin > 0) {
      data.readingTimeMin = Math.floor(body.readingTimeMin);
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Artigo atualizado com sucesso!",
      data: updated,
    });
  } catch (error: any) {
    console.error("[API Blog Post PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar artigo." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/blog/posts/[id]
 * Remove um post do blog
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Artigo excluído com sucesso.",
    });
  } catch (error: any) {
    console.error("[API Blog Post DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir artigo." },
      { status: 500 }
    );
  }
}
