import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/crm/leads/[id]/activities
 * Retorna o feed cronológico unificado de atividades automáticas e comentários do cartão
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [activities, comments] = await Promise.all([
      prisma.leadActivity.findMany({
        where: { leadId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leadComment.findMany({
        where: { leadId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Unifica e tipa os itens da linha do tempo
    const timeline = [
      ...activities.map((act) => ({
        id: act.id,
        itemType: "ACTIVITY" as const,
        type: act.type,
        content: act.content,
        userName: act.userName || "Sistema",
        createdAt: act.createdAt,
      })),
      ...comments.map((com) => ({
        id: com.id,
        itemType: "COMMENT" as const,
        type: "USER_COMMENT",
        content: com.content,
        userName: com.authorName || "Equipe Icthus",
        authorAvatar: com.authorAvatar,
        createdAt: com.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      timeline,
      activitiesCount: activities.length,
      commentsCount: comments.length,
    });
  } catch (error: any) {
    console.error("[CRM Activities API] Erro ao buscar atividades:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar atividades do serviço." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/leads/[id]/activities
 * Registra um evento de atividade no cartão
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type = "GENERAL", content, userName = "Sistema" } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Conteúdo da atividade é obrigatório." },
        { status: 400 }
      );
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        type,
        content: content.trim(),
        userName,
      },
    });

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("[CRM Activities API] Erro ao registrar atividade:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar atividade." },
      { status: 500 }
    );
  }
}
