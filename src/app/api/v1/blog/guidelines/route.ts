import { NextRequest, NextResponse } from "next/server";
import {
  BlogGuidelineItem,
  GuidelineValidationError,
  createBlogGuideline,
  listBlogGuidelines,
} from "@/lib/blog-ai/guidelines";

export const dynamic = "force-dynamic";

const VALID_SCOPES = new Set(["GLOBAL", "TOPIC"]);
const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/**
 * Normaliza texto para busca rápida insensível a acentos e maiúsculas.
 */
function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * GET /api/v1/blog/guidelines
 * Lista todas as diretrizes do Cérebro de Diretrizes com estatísticas agregadas.
 */
export async function GET(request: NextRequest) {
  try {
    const allGuidelines = await listBlogGuidelines();

    const stats = {
      total: allGuidelines.length,
      active: allGuidelines.filter((item) => item.isActive).length,
      global: allGuidelines.filter((item) => item.scope === "GLOBAL").length,
      topic: allGuidelines.filter((item) => item.scope === "TOPIC").length,
    };

    const { searchParams } = new URL(request.url);
    const scopeFilter = searchParams.get("scope")?.trim().toUpperCase();
    const isActiveParam = searchParams.get("isActive");
    const searchParam = searchParams.get("search");

    let filtered: BlogGuidelineItem[] = allGuidelines;

    if (scopeFilter && VALID_SCOPES.has(scopeFilter)) {
      filtered = filtered.filter((item) => item.scope === scopeFilter);
    }

    if (isActiveParam === "true" || isActiveParam === "false") {
      const expectedActive = isActiveParam === "true";
      filtered = filtered.filter((item) => item.isActive === expectedActive);
    }

    if (searchParam && searchParam.trim()) {
      const query = normalizeSearch(searchParam);
      filtered = filtered.filter((item) => {
        const haystack = normalizeSearch(
          [item.title, item.instructions, item.category || "", ...item.triggerKeywords].join(" ")
        );
        return haystack.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
    });
  } catch (error: any) {
    console.error("[API Blog Guidelines GET] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível carregar as diretrizes do blog no momento.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/blog/guidelines
 * Cria uma nova diretriz editorial ou técnica (Global ou por Tema).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Dados da requisição inválidos. Envie um JSON válido." },
        { status: 400 }
      );
    }

    if (typeof body.title !== "string" || body.title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "O título da diretriz é obrigatório (mínimo de 2 caracteres)." },
        { status: 400 }
      );
    }

    if (typeof body.instructions !== "string" || body.instructions.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "As instruções da diretriz são obrigatórias (mínimo de 5 caracteres).",
        },
        { status: 400 }
      );
    }

    if (body.scope !== undefined && body.scope !== null) {
      const scopeUpper = String(body.scope).trim().toUpperCase();
      if (!VALID_SCOPES.has(scopeUpper)) {
        return NextResponse.json(
          { success: false, error: "Escopo inválido. Utilize GLOBAL ou TOPIC." },
          { status: 400 }
        );
      }
    }

    if (body.priority !== undefined && body.priority !== null) {
      const priorityUpper = String(body.priority).trim().toUpperCase();
      if (!VALID_PRIORITIES.has(priorityUpper)) {
        return NextResponse.json(
          { success: false, error: "Prioridade inválida. Utilize LOW, MEDIUM, HIGH ou URGENT." },
          { status: 400 }
        );
      }
    }

    const created = await createBlogGuideline({
      title: body.title,
      scope: body.scope,
      category: body.category ?? null,
      triggerKeywords: body.triggerKeywords,
      instructions: body.instructions,
      priority: body.priority,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Diretriz cadastrada com sucesso no Cérebro de Diretrizes!",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof GuidelineValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[API Blog Guidelines POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cadastrar diretriz editorial." },
      { status: 500 }
    );
  }
}
