import { NextResponse } from "next/server";
import { getAllSiteContent } from "@/lib/cms-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/cms/content
 * Retorna todos os dados dinâmicos do CMS para o site público.
 */
export async function GET() {
  try {
    const data = await getAllSiteContent();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[API CMS Content] Erro ao carregar conteúdo:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao carregar conteúdo do site." },
      { status: 500 }
    );
  }
}
