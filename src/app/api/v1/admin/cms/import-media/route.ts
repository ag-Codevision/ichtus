import { NextRequest, NextResponse } from "next/server";
import { importMediaFromUrl, verifyAdminRequest } from "@/lib/cms-media-server";

/**
 * POST /api/v1/admin/cms/import-media
 * Baixa uma imagem ou vídeo a partir de um link externo (ex: Instagram, CDN, etc.)
 * e salva localmente em /uploads/cms para evitar expiração de link e bloqueios CORS/CORP.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const expectedType =
      body?.expectedType === "image" || body?.expectedType === "video"
        ? body.expectedType
        : "any";

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Informe uma URL válida para importação." },
        { status: 400 }
      );
    }

    const result = await importMediaFromUrl(url, expectedType);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API CMS Import Media] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Não foi possível importar a mídia deste link. Verifique se o endereço está público e direto.",
      },
      { status: 422 }
    );
  }
}
