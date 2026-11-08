import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateBlogAgentConfig } from "@/lib/blog-ai/orchestrator";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/blog/agent/config
 * Retorna as configurações vigentes do agente autônomo
 */
export async function GET() {
  try {
    const config = await getOrCreateBlogAgentConfig();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error("[API Blog Agent Config GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar configurações do agente." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/blog/agent/config
 * Atualiza regras de agendamento e comportamento do agente
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = await getOrCreateBlogAgentConfig();

    const data: any = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.postsPerDay === "number") data.postsPerDay = Math.max(1, Math.min(10, body.postsPerDay));
    if (Array.isArray(body.allowedDays)) data.allowedDays = body.allowedDays;
    if (Array.isArray(body.preferredHours)) data.preferredHours = body.preferredHours;
    if (typeof body.autoPublish === "boolean") data.autoPublish = body.autoPublish;
    if (typeof body.imageProvider === "string") data.imageProvider = body.imageProvider;
    if (typeof body.defaultAuthor === "string") data.defaultAuthor = body.defaultAuthor;

    const updated = await prisma.blogAgentConfig.update({
      where: { id: config.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Configurações do robô autônomo salvas com sucesso!",
      data: updated,
    });
  } catch (error: any) {
    console.error("[API Blog Agent Config PUT] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao salvar configurações do agente." },
      { status: 500 }
    );
  }
}
