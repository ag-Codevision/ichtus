import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/comments
 * Registra um novo comentário ou anotação no verso do cartão
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, authorName } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "O conteúdo do comentário é obrigatório." },
        { status: 400 }
      );
    }

    const comment = await prisma.leadComment.create({
      data: {
        leadId: id,
        content: content.trim(),
        authorName: authorName || "Administrador Icthus",
      },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error: any) {
    console.error("[CRM Comments API] Erro ao adicionar comentário:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar comentário." },
      { status: 500 }
    );
  }
}
