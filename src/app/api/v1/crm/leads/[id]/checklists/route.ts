import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/checklists
 * Cria uma nova lista de verificação / tarefas no lead
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "O título da checklist é obrigatório." },
        { status: 400 }
      );
    }

    const count = await prisma.leadChecklist.count({
      where: { leadId: id },
    });

    const checklist = await prisma.leadChecklist.create({
      data: {
        leadId: id,
        title: title.trim(),
        order: count,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      checklist,
    });
  } catch (error: any) {
    console.error("[CRM Checklists API] Erro ao criar checklist:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao criar lista de verificação." },
      { status: 500 }
    );
  }
}
