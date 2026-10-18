import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ path: string[] }>;
}

/**
 * GET /api/v1/uploads/[...path]
 * Serve arquivos enviados dinamicamente (imagens, PDFs, documentos)
 * com suporte a cache, headers adequados de MIME type e proteção contra directory traversal.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Prevenção contra Directory Traversal
    const safeSubPath = pathSegments.join("/");
    if (safeSubPath.includes("..") || safeSubPath.includes("\0")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const uploadBase = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadBase, safeSubPath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Arquivo não encontrado", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse("Não é um arquivo", { status: 400 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".pdf": "application/pdf",
      ".txt": "text/plain; charset=utf-8",
      ".csv": "text/csv; charset=utf-8",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Uploads Static Server] Erro ao servir arquivo:", error);
    return new NextResponse("Erro interno ao servir arquivo", { status: 500 });
  }
}
