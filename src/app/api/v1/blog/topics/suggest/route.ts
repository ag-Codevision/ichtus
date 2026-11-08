import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { suggestTopicsWithAI } from "@/lib/blog-ai/nvidia-nim";
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

    const suggestions = await suggestTopicsWithAI(count);

    if (autoSave && suggestions.length > 0) {
      const created = [];
      for (const item of suggestions) {
        if (!item.title) continue;
        const topic = await prisma.blogTopic.create({
          data: {
            title: item.title,
            category: item.category || "Fachadas e Comunicação Visual",
            keywords: item.keywords || [],
            targetAudience: item.targetAudience || "Empresários, Lojistas e Arquitetos",
            tone: item.tone || "Técnico Especialista e Conversão",
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
      suggestions,
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
