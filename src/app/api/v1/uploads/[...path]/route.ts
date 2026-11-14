import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

interface Params {
  params: Promise<{ path: string[] }>;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
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

/**
 * Converte ReadStream do Node.js para Web ReadableStream com encerramento seguro.
 */
function streamFileRange(filePath: string, start?: number, end?: number): ReadableStream<Uint8Array> {
  const nodeStream =
    start !== undefined && end !== undefined
      ? fs.createReadStream(filePath, { start, end })
      : fs.createReadStream(filePath);

  return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
}

/**
 * GET /api/v1/uploads/[...path]
 * Serve arquivos enviados dinamicamente (imagens, vídeos com HTTP Range, PDFs e documentos)
 * com suporte a streaming, cabeçalhos adequados de MIME type e proteção contra directory traversal.
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

    const uploadBase = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadBase, safeSubPath);

    if (!filePath.startsWith(uploadBase + path.sep) && filePath !== uploadBase) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Arquivo não encontrado", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse("Não é um arquivo", { status: 400 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileSize = stat.size;
    const rangeHeader = req.headers.get("range");

    // Suporte a HTTP Range (essencial para reprodução e seek de vídeos MP4/WebM/MOV em todos os navegadores)
    if (rangeHeader && fileSize > 0) {
      const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (!match[1] && match[2]) {
        const suffixLen = parseInt(match[2], 10);
        start = Math.max(0, fileSize - suffixLen);
        end = fileSize - 1;
      }

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      end = Math.min(end, fileSize - 1);
      const chunkSize = end - start + 1;

      return new NextResponse(streamFileRange(filePath, start, end), {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": chunkSize.toString(),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse(streamFileRange(filePath), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Uploads Static Server] Erro ao servir arquivo:", error);
    return new NextResponse("Erro interno ao servir arquivo", { status: 500 });
  }
}
