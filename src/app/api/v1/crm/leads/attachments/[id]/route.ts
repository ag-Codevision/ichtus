import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/crm/leads/attachments/[id]
 * Alterna se o anexo é a capa do cartão estilo Trello
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isCover } = body;

    const target = await prisma.leadAttachment.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Anexo não localizado." },
        { status: 404 }
      );
    }

    if (isCover) {
      // Desmarca outras capas do mesmo lead
      await prisma.leadAttachment.updateMany({
        where: { leadId: target.leadId },
        data: { isCover: false },
      });
      // Atualiza o lead
      await prisma.lead.update({
        where: { id: target.leadId },
        data: { coverImage: target.fileUrl },
      });
    } else {
      // Se estava como capa e foi desmarcado
      await prisma.lead.update({
        where: { id: target.leadId },
        data: { coverImage: null },
      });
    }

    const updated = await prisma.leadAttachment.update({
      where: { id },
      data: { isCover: Boolean(isCover) },
    });

    return NextResponse.json({
      success: true,
      attachment: updated,
    });
  } catch (error: any) {
    console.error("[CRM Attachments API] Erro ao atualizar capa do anexo:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao definir capa do cartão." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/leads/attachments/[id]
 * Remove o anexo do banco e do disco local
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const target = await prisma.leadAttachment.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Anexo não localizado." },
        { status: 404 }
      );
    }

    // Se era a capa do cartão, remove do lead
    if (target.isCover) {
      await prisma.lead.update({
        where: { id: target.leadId },
        data: { coverImage: null },
      });
    }

    // Se for arquivo local em /uploads/leads, remove do disco
    if (!target.isExternalLink && target.fileUrl.startsWith("/uploads/leads/")) {
      const fileName = target.fileUrl.replace("/uploads/leads/", "");
      const fullPath = path.join(process.cwd(), "public", "uploads", "leads", fileName);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await prisma.leadAttachment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Anexo removido com sucesso.",
    });
  } catch (error: any) {
    console.error("[CRM Attachments API] Erro ao excluir anexo:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir anexo." },
      { status: 500 }
    );
  }
}
