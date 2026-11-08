import { NextRequest, NextResponse } from "next/server";
import { runAutonomousBlogCycle } from "@/lib/blog-ai/orchestrator";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/blog/agent/generate
 * Dispara um ciclo de geração e publicação com IA
 * Aceita chamada manual autenticada pelo painel ou cron com Bearer token CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Se houver CRON_SECRET configurado e vier de chamada cron externa, valida o token
    const isCronRequest = authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`;

    const body = await request.json().catch(() => ({}));
    const { topicId, forcePublish } = body;

    console.log(`[API Blog Agent Generate] Iniciando ciclo autônomo (Cron: ${Boolean(isCronRequest)})...`);

    const result = await runAutonomousBlogCycle({
      forcedTopicId: topicId,
      forcePublish: typeof forcePublish === "boolean" ? forcePublish : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Falha na geração do artigo.",
          details: result.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        post: result.post,
        topic: result.topic,
      },
    });
  } catch (error: any) {
    console.error("[API Blog Agent Generate] Exceção:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro inesperado ao gerar artigo com o agente de blog.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
