import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Detecta o provedor com base na URL
 */
function detectLinkProvider(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) return "GOOGLE_DRIVE";
  if (lower.includes("onedrive") || lower.includes("sharepoint.com") || lower.includes("1drv.ms")) return "ONEDRIVE";
  if (lower.includes("dropbox.com")) return "DROPBOX";
  if (lower.includes("figma.com")) return "FIGMA";
  return "LINK";
}

/**
 * POST /api/v1/crm/leads/[id]/attachments
 * Realiza upload de arquivos (individuais ou em lote via drag-and-drop) ou registra links externos para o lead (Google Drive, OneDrive, Dropbox, etc.)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    // 1. Se for link externo (JSON)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { fileName, fileUrl, fileType, userName } = body;

      if (!fileUrl) {
        return NextResponse.json(
          { success: false, error: "A URL do link é obrigatória." },
          { status: 400 }
        );
      }

      const finalFileType = fileType || detectLinkProvider(fileUrl);
      const safeTitle = fileName || fileUrl;

      const attachment = await prisma.leadAttachment.create({
        data: {
          leadId: id,
          fileName: safeTitle,
          fileUrl,
          fileType: finalFileType,
          isExternalLink: true,
          isCover: false,
        },
      });

      // Registra atividade no feed
      const providerLabels: Record<string, string> = {
        GOOGLE_DRIVE: "Google Drive",
        ONEDRIVE: "Microsoft OneDrive",
        DROPBOX: "Dropbox",
        FIGMA: "Figma",
        LINK: "Link Externo",
      };
      const label = providerLabels[finalFileType] || "Link";

      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "ATTACHMENT",
          content: `Anexou um link do ${label}: "${safeTitle}"`,
          userName: userName || "Equipe",
        },
      }).catch((e) => console.warn("Aviso ao registrar atividade de anexo:", e));

      return NextResponse.json({
        success: true,
        attachment,
        attachments: [attachment],
      });
    }

    // 2. Se for upload de arquivo(s) multipart/form-data
    const formData = await req.formData();
    const rawFiles = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToProcess: File[] = [];
    if (rawFiles && rawFiles.length > 0) {
      filesToProcess.push(...rawFiles.filter((f) => f && typeof f.arrayBuffer === "function"));
    } else if (singleFile && typeof singleFile.arrayBuffer === "function") {
      filesToProcess.push(singleFile);
    }

    const isCover = formData.get("isCover") === "true";
    const userName = (formData.get("userName") as string) || "Equipe";

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // Garante que o diretório public/uploads/leads exista
    const uploadDir = path.join(process.cwd(), "public", "uploads", "leads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const createdAttachments: any[] = [];

    for (const file of filesToProcess) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Nome único seguro
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/leads/${safeName}`;
      const mimeType = file.type || "application/octet-stream";
      const fileCategory = mimeType.startsWith("image/")
        ? "IMAGE"
        : mimeType.includes("pdf")
        ? "PDF"
        : "DOCUMENT";

      // Se marcado como capa (apenas o primeiro se for lote)
      const isThisCover: boolean = Boolean(isCover) && createdAttachments.length === 0;
      if (isThisCover) {
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
          isCover: isThisCover,
          isExternalLink: false,
        },
      });

      createdAttachments.push(attachment);

      // Registra atividade no feed
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "ATTACHMENT",
          content: `Carregou o arquivo "${file.name}"`,
          userName,
        },
      }).catch((e) => console.warn("Aviso ao registrar atividade de anexo:", e));
    }

    return NextResponse.json({
      success: true,
      attachment: createdAttachments[0],
      attachments: createdAttachments,
    });
  } catch (error: any) {
    console.error("[CRM Attachment API] Erro ao anexar arquivo:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar anexo." },
      { status: 500 }
    );
  }
}
