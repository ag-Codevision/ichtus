import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function verifyAdmin(request: NextRequest): boolean {
  const adminCookie = request.cookies.get("glessios_admin_session")?.value;
  if (!adminCookie) return false;
  try {
    const parsed = JSON.parse(adminCookie);
    return parsed.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * POST /api/v1/admin/cms/upload
 * Processa upload de imagens e vídeos para o CMS com segurança.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validação de extensão permitida (com fallback pelo MIME type caso o nome venha sem extensão)
    const mimeExtensionMap: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/webp": ".webp",
      "image/avif": ".avif",
      "image/svg+xml": ".svg",
      "image/gif": ".gif",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "video/quicktime": ".mov",
      "video/x-msvideo": ".avi",
      "video/x-m4v": ".m4v",
    };

    const originalName = file.name || "media";
    const ext = (path.extname(originalName).toLowerCase() || mimeExtensionMap[file.type] || "").toLowerCase();
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".m4v"];
    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".svg",
      ".gif",
      ...videoExtensions,
    ];

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensão de arquivo '${ext}' não permitida. Use imagens (.png, .jpg, .webp, .avif, .svg) ou vídeos (.mp4, .webm, .mov, .m4v).`,
        },
        { status: 400 }
      );
    }

    // Criação do diretório de destino se não existir
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cms");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nome único seguro
    const fileHash = crypto.randomBytes(8).toString("hex");
    const sanitizedBase = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);
    const fileName = `${Date.now()}-${sanitizedBase}-${fileHash}${ext}`;
    const targetFilePath = path.join(uploadDir, fileName);

    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = `/uploads/cms/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: buffer.length,
      mimeType: file.type,
      mediaType: videoExtensions.includes(ext) ? "video" : "image",
    });
  } catch (error) {
    console.error("[API CMS Upload] Erro ao processar upload:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar o upload do arquivo." },
      { status: 500 }
    );
  }
}
