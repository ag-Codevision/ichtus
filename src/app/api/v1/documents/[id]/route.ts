import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/documents/[id]
 * Exclui o registro do documento e remove o arquivo físico correspondente
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Documento não encontrado." },
        { status: 404 }
      );
    }

    // Tenta remover o arquivo físico do disco se estiver na pasta uploads
    if (document.fileUrl && document.fileUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", document.fileUrl.replace(/^\//, ""));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.warn("[Documents API] Aviso ao remover arquivo do disco:", fileErr);
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Documento excluído com sucesso!",
    });
  } catch (error: any) {
    console.error("[Documents API] Erro ao excluir documento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir documento." },
      { status: 500 }
    );
  }
}
