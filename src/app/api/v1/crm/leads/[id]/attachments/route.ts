import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/attachments
 * Realiza upload de arquivos ou registra links externos para o lead
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    // 1. Se for link externo (JSON)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { fileName, fileUrl } = body;

      if (!fileUrl) {
        return NextResponse.json(
          { success: false, error: "A URL do link é obrigatória." },
          { status: 400 }
        );
      }

      const attachment = await prisma.leadAttachment.create({
        data: {
          leadId: id,
          fileName: fileName || fileUrl,
          fileUrl,
          fileType: "LINK",
          isExternalLink: true,
          isCover: false,
        },
      });

      return NextResponse.json({
        success: true,
        attachment,
      });
    }

    // 2. Se for upload de arquivo multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isCover = formData.get("isCover") === "true";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Garante que o diretório public/uploads/leads exista
    const uploadDir = path.join(process.cwd(), "public", "uploads", "leads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nome único seguro
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/leads/${safeName}`;
    const mimeType = file.type || "application/octet-stream";
    const fileCategory = mimeType.startsWith("image/")
      ? "IMAGE"
      : mimeType.includes("pdf")
      ? "PDF"
      : "DOCUMENT";

    // Se marcado como capa, desmarca as outras
    if (isCover) {
      await prisma.leadAttachment.updateMany({
        where: { leadId: id },
        data: { isCover: false },
      });
      await prisma.lead.update({
        where: { id },
        data: { coverImage: fileUrl },
      });
    }

    const attachment = await prisma.leadAttachment.create({
      data: {
        leadId: id,
        fileName: file.name,
        fileUrl,
        fileType: fileCategory,
        fileSize: file.size,
        isCover,
        isExternalLink: false,
      },
    });

    return NextResponse.json({
      success: true,
      attachment,
    });
  } catch (error: any) {
    console.error("[CRM Attachments API] Erro ao anexar arquivo:", error);
    return NextResponse.json(
      { success: false, error: error?.message ? `Falha ao processar anexo: ${error.message}` : "Falha ao enviar anexo." },
      { status: 500 }
    );
  }
}
