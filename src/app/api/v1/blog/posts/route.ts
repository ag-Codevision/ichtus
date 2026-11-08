import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/blog/posts
 * Lista artigos cadastrados no banco para o painel admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PostStatus | null;
    const search = searchParams.get("search");

    const where: any = {};
    if (status && Object.values(PostStatus).includes(status)) {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });

    const [total, published, drafts, archived] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: PostStatus.PUBLISHED } }),
      prisma.blogPost.count({ where: { status: PostStatus.DRAFT } }),
      prisma.blogPost.count({ where: { status: PostStatus.ARCHIVED } }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      stats: { total, published, drafts, archived },
    });
  } catch (error: any) {
    console.error("[API Blog Posts GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar artigos do blog." },
      { status: 500 }
    );
  }
}
