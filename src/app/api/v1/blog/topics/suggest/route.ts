import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { suggestTopicsWithAI } from "@/lib/blog-ai/nvidia-nim";
import { listBlogCategoriesWithCounts } from "@/lib/blog-categories";
import { TopicStatus, PriorityLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/blog/topics/suggest
 * Sugere temas de alta relevância com IA e opcionalmente já salva no banco
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const count = typeof body.count === "number" && body.count > 0 ? Math.min(body.count, 15) : 10;
    const autoSave = body.autoSave !== false; // Padrão: true (já persiste no banco)

    const dbCategories = await listBlogCategoriesWithCounts();
    const categoryNames = dbCategories.map((c) => c.name);
    const categoryByLower = new Map(categoryNames.map((name) => [name.toLowerCase(), name]));

    const suggestions = await suggestTopicsWithAI(count, categoryNames);

    const resolveCategory = (raw?: string | null): string | null => {
      if (categoryNames.length === 0) {
        return raw?.trim() || null;
      }
      if (raw && typeof raw === "string") {
        const matched = categoryByLower.get(raw.trim().toLowerCase());
        if (matched) return matched;
      }
      return categoryNames[0];
    };

    const normalizedSuggestions = suggestions.map((item) => ({
      ...item,
      category: resolveCategory(item.category),
    }));

    if (autoSave && normalizedSuggestions.length > 0) {
      const created = [];
      for (const item of normalizedSuggestions) {
        if (!item.title) continue;
        const topic = await prisma.blogTopic.create({
          data: {
            title: item.title,
            category: item.category,
            keywords: item.keywords || [],
            targetAudience: item.targetAudience || "Empresários, Lojistas e Arquitetos",
            tone: item.tone || "Técnico, Educativo e Didático",
            priority: PriorityLevel.MEDIUM,
            status: TopicStatus.PENDING,
          },
        });
        created.push(topic);
      }

      return NextResponse.json({
        success: true,
        message: `${created.length} novas pautas foram geradas pela IA e adicionadas ao mini-cérebro!`,
        data: created,
      });
    }

    return NextResponse.json({
      success: true,
      suggestions: normalizedSuggestions,
    });
  } catch (error: any) {
    console.error("[API Blog Topics Suggest POST] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao gerar sugestões de pautas com IA.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
