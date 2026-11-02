import { NextRequest, NextResponse } from "next/server";
import {
  getPortfolioCategories,
  createPortfolioCategory,
  deletePortfolioCategoryByNameOrId,
} from "@/lib/cms-service";

function verifyAdmin(request: NextRequest): boolean {
  const adminCookie = request.cookies.get("glessios_admin_session")?.value;
  if (!adminCookie) return false;
  try {
    const parsed = JSON.parse(adminCookie);
    return parsed.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * GET /api/v1/admin/cms/portfolio/categories
 * Retorna a lista de categorias de portfólio.
 */
export async function GET() {
  try {
    const categories = await getPortfolioCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("[API CMS Categories GET] Erro:", error);
    return NextResponse.json({ success: false, error: "Erro ao listar categorias." }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/cms/portfolio/categories
 * Adiciona uma nova categoria de portfólio.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ success: false, error: "Nome de categoria inválido." }, { status: 400 });
    }

    const created = await createPortfolioCategory(body.name);
    return NextResponse.json({ success: true, category: created });
  } catch (error: any) {
    console.error("[API CMS Categories POST] Erro:", error);
    return NextResponse.json({ success: false, error: error.message || "Erro ao criar categoria." }, { status: 400 });
  }
}

/**
 * DELETE /api/v1/admin/cms/portfolio/categories
 * Remove uma categoria de portfólio.
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || searchParams.get("name");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID ou nome da categoria obrigatório." }, { status: 400 });
    }

    await deletePortfolioCategoryByNameOrId(id);
    return NextResponse.json({ success: true, message: "Categoria removida com sucesso." });
  } catch (error) {
    console.error("[API CMS Categories DELETE] Erro:", error);
    return NextResponse.json({ success: false, error: "Erro ao excluir categoria." }, { status: 500 });
  }
}
