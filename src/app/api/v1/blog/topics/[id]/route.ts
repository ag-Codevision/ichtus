import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TopicStatus, PriorityLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/v1/blog/topics/[id]
 * Atualiza status, prioridade ou dados de uma pauta
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.status && Object.values(TopicStatus).includes(body.status)) {
      data.status = body.status;
    }
    if (body.priority && Object.values(PriorityLevel).includes(body.priority)) {
      data.priority = body.priority;
    }
    if (body.title && typeof body.title === "string") {
      data.title = body.title.trim();
    }
    if (body.category !== undefined) {
      data.category = body.category;
    }

    const updated = await prisma.blogTopic.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("[API Blog Topic PATCH] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar pauta." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/blog/topics/[id]
 * Remove uma pauta do mini-cérebro
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.blogTopic.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Pauta removida com sucesso.",
    });
  } catch (error: any) {
    console.error("[API Blog Topic DELETE] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir pauta." },
      { status: 500 }
    );
  }
}
