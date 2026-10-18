import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/tags
 * Vincula ou desvincula uma etiqueta ao lead (Toggle)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tagId } = body;

    if (!tagId) {
      return NextResponse.json(
        { success: false, error: "ID da etiqueta é obrigatório." },
        { status: 400 }
      );
    }

    // Verifica se já está vinculada
    const existing = await prisma.leadTagAssignment.findUnique({
      where: {
        leadId_tagId: {
          leadId: id,
          tagId,
        },
      },
    });

    if (existing) {
      // Desvincula
      await prisma.leadTagAssignment.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        action: "REMOVED",
      });
    } else {
      // Vincula
      await prisma.leadTagAssignment.create({
        data: {
          leadId: id,
          tagId,
        },
      });
      return NextResponse.json({
        success: true,
        action: "ADDED",
      });
    }
  } catch (error: any) {
    console.error("[CRM Lead Tags API] Erro ao alternar tag no lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao vincular etiqueta ao lead." },
      { status: 500 }
    );
  }
}
