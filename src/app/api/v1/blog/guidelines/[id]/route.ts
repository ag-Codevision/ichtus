import { NextRequest, NextResponse } from "next/server";
import {
  GuidelineNotFoundError,
  GuidelineValidationError,
  deleteBlogGuideline,
  updateBlogGuideline,
} from "@/lib/blog-ai/guidelines";

export const dynamic = "force-dynamic";

const VALID_SCOPES = new Set(["GLOBAL", "TOPIC"]);
const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/blog/guidelines/[id]
 * Atualiza título, escopo, categoria, gatilhos, instruções, prioridade ou status ativo.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Dados da requisição inválidos. Envie um JSON válido." },
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

    const hasUpdates =
      body.title !== undefined ||
      body.scope !== undefined ||
      body.category !== undefined ||
      body.triggerKeywords !== undefined ||
      body.instructions !== undefined ||
      body.priority !== undefined ||
      body.isActive !== undefined;

    if (!hasUpdates) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo válido informado para atualização." },
        { status: 400 }
      );
    }

    const updated = await updateBlogGuideline(id, {
      title: body.title,
      scope: body.scope,
      category: body.category,
      triggerKeywords: body.triggerKeywords,
      instructions: body.instructions,
      priority: body.priority,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      message: "Diretriz atualizada com sucesso!",
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof GuidelineNotFoundError) {
      return NextResponse.json(
        { success: false, error: "Diretriz não encontrada." },
        { status: 404 }
      );
    }
    if (error instanceof GuidelineValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[API Blog Guideline PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar diretriz." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/blog/guidelines/[id]
 * Remove uma diretriz do Cérebro de Diretrizes.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteBlogGuideline(id);

    return NextResponse.json({
      success: true,
      message: "Diretriz removida com sucesso.",
    });
  } catch (error: any) {
    if (error instanceof GuidelineNotFoundError) {
      return NextResponse.json(
        { success: false, error: "Diretriz não encontrada." },
        { status: 404 }
      );
    }
    if (error instanceof GuidelineValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[API Blog Guideline DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir diretriz." },
      { status: 500 }
    );
  }
}
