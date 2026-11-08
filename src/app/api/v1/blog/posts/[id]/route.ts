import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/v1/blog/posts/[id]
 * Alterna status do post (ex: de DRAFT para PUBLISHED ou ARCHIVED)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.status && Object.values(PostStatus).includes(body.status)) {
      data.status = body.status;
      if (body.status === PostStatus.PUBLISHED) {
        data.publishedAt = new Date();
      }
    }
    if (body.title) data.title = body.title;
    if (body.excerpt) data.excerpt = body.excerpt;

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
