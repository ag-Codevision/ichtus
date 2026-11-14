import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TopicStatus, PriorityLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/blog/topics
 * Lista todas as pautas cadastradas no mini-cérebro
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TopicStatus | null;
    const category = searchParams.get("category");

    const where: any = {};
    if (status && Object.values(TopicStatus).includes(status)) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const topics = await prisma.blogTopic.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    // Contadores gerais para cards do painel
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.blogTopic.count(),
      prisma.blogTopic.count({ where: { status: TopicStatus.PENDING } }),
      prisma.blogTopic.count({ where: { status: TopicStatus.IN_PROGRESS } }),
      prisma.blogTopic.count({ where: { status: TopicStatus.COMPLETED } }),
    ]);

    return NextResponse.json({
      success: true,
      data: topics,
      stats: { total, pending, inProgress, completed },
    });
  } catch (error: any) {
    console.error("[API Blog Topics GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar tópicos do mini-cérebro." },
      { status: 500 }
    );
  }
}

function buildTopicCreateData(item: any) {
  const cleanCategory =
    typeof item.category === "string" && item.category.trim() ? item.category.trim() : null;
  const keywords = Array.isArray(item.keywords)
    ? item.keywords
    : typeof item.keywords === "string"
    ? item.keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return {
    title: item.title.trim(),
    category: cleanCategory,
    keywords,
    targetAudience: item.targetAudience || "Empresários, Lojistas e Arquitetos",
    tone: item.tone || "Técnico Especialista e Conversão",
    priority: (item.priority as PriorityLevel) || PriorityLevel.MEDIUM,
    status: TopicStatus.PENDING,
  };
}

/**
 * POST /api/v1/blog/topics
 * Cria uma nova pauta ou lote de pautas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Inserção em lote (ex: lista de linhas de texto coladas pelo admin)
    if (Array.isArray(body.topics)) {
      const createdList = [];
      for (const item of body.topics) {
        if (!item.title || typeof item.title !== "string" || !item.title.trim()) continue;
        const topic = await prisma.blogTopic.create({
          data: buildTopicCreateData(item),
        });
        createdList.push(topic);
      }

      return NextResponse.json({
        success: true,
        message: `${createdList.length} pautas adicionadas ao mini-cérebro!`,
        data: createdList,
      });
    }

    // Inserção unitária
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "O título da pauta é obrigatório." },
        { status: 400 }
      );
    }

    const topic = await prisma.blogTopic.create({
      data: buildTopicCreateData(body),
    });

    return NextResponse.json({
      success: true,
      message: "Pauta adicionada com sucesso ao mini-cérebro!",
      data: topic,
    });
  } catch (error: any) {
    console.error("[API Blog Topics POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cadastrar pauta." },
      { status: 500 }
    );
  }
}
