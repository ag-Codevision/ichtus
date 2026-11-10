import { NextRequest, NextResponse } from "next/server";
import { runAutonomousBlogCycle } from "@/lib/blog-ai/orchestrator";

export const dynamic = "force-dynamic";

/**
 * Helper comum para processar requisições de geração autônoma (POST ou GET)
 */
async function handleGenerate(request: NextRequest, isGetMethod = false) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get("key");
    const cronSecret = process.env.CRON_SECRET || "c593749da9104553bbd4a708c03062c8d0710350ca4fac707f4e0ad9e653d4dc";

    // Valida se a chamada veio autenticada como Cron (Header Bearer ou query ?key=)
    const isCronAuthorized =
      (authHeader && authHeader === `Bearer ${cronSecret}`) ||
      (queryKey && queryKey === cronSecret);

    let topicId: string | undefined;
    let forcePublish: boolean | undefined;
    let ignoreSchedule: boolean | undefined;

    if (!isGetMethod) {
      const body = await request.json().catch(() => ({}));
      topicId = body.topicId;
      forcePublish = typeof body.forcePublish === "boolean" ? body.forcePublish : undefined;
      ignoreSchedule = typeof body.ignoreSchedule === "boolean" ? body.ignoreSchedule : undefined;
    } else {
      topicId = searchParams.get("topicId") || undefined;
      const fpParam = searchParams.get("forcePublish");
      forcePublish = fpParam !== null ? fpParam === "true" : undefined;
      const isParam = searchParams.get("ignoreSchedule");
      ignoreSchedule = isParam !== null ? isParam === "true" : undefined;
    }

    // Se for chamada de Cron externa (cron-job.org / vps crontab), respeita a cadência por padrão.
    // Se for chamada direta do painel admin (sem header de cron e sem query key de cron), roda imediatamente.
    const shouldIgnoreSchedule = typeof ignoreSchedule === "boolean"
      ? ignoreSchedule
      : Boolean(topicId || !isCronAuthorized);

    console.log(
      `[API Blog Agent Generate] Disparo recebido (${isGetMethod ? "GET" : "POST"}). CronAutorizado: ${Boolean(
        isCronAuthorized
      )} | IgnoraCadência: ${shouldIgnoreSchedule}`
    );

    const result = await runAutonomousBlogCycle({
      forcedTopicId: topicId,
      forcePublish,
      ignoreSchedule: shouldIgnoreSchedule,
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

/**
 * POST /api/v1/blog/agent/generate
 * Dispara um ciclo via POST (Painel Admin ou Webhook)
 */
export async function POST(request: NextRequest) {
  return handleGenerate(request, false);
}

/**
 * GET /api/v1/blog/agent/generate
 * Suporta monitoramento e acionamento via cron-job.org (método GET com ?key=...)
 */
export async function GET(request: NextRequest) {
  return handleGenerate(request, true);
}
