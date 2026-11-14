import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ensureDefaultBlogCategories,
  listBlogCategoriesWithCounts,
  normalizeBlogCategoryColor,
  normalizeBlogCategoryName,
} from "@/lib/blog-categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/blog/categories
 * Lista todas as categorias do Mini-Cérebro com contagem de pautas vinculadas.
 */
export async function GET() {
  try {
    const categories = await listBlogCategoriesWithCounts();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error("[API Blog Categories GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar categorias do mini-cérebro." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/blog/categories
 * Cria uma nova categoria do Mini-Cérebro.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawName = typeof body.name === "string" ? normalizeBlogCategoryName(body.name) : "";

    if (rawName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Informe um nome de categoria com pelo menos 2 caracteres." },
        { status: 400 }
      );
    }

    if (rawName.length > 80) {
      return NextResponse.json(
        { success: false, error: "O nome da categoria deve ter no máximo 80 caracteres." },
        { status: 400 }
      );
    }

    await ensureDefaultBlogCategories();

    const duplicate = await prisma.blogCategory.findFirst({
      where: {
        name: { equals: rawName, mode: "insensitive" },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `A categoria "${duplicate.name}" já existe.` },
        { status: 409 }
      );
    }

    const color = normalizeBlogCategoryColor(body.color);
    const maxOrder = await prisma.blogCategory.aggregate({
      _max: { order: true },
    });

    const created = await prisma.blogCategory.create({
      data: {
        name: rawName,
        color,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    const topicsCount = await prisma.blogTopic.count({
      where: {
        category: { equals: created.name, mode: "insensitive" },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Categoria criada com sucesso!",
        data: { ...created, topicsCount },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API Blog Categories POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cadastrar categoria." },
      { status: 500 }
    );
  }
}
