import { NextRequest, NextResponse } from "next/server";
import { saveSiteSectionContent } from "@/lib/cms-service";

/**
 * Verifica se a requisição tem sessão de administrador válida.
 */
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
 * PUT /api/v1/admin/cms/content
 * Salva ou atualiza uma ou mais seções de conteúdo do site.
 */
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado. Faça login como administrador." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Caso 1: Atualização de uma única seção ({ section: "hero", data: { ... } })
    if (body.section && body.data) {
      const updated = await saveSiteSectionContent(body.section, body.data, "admin");
      return NextResponse.json({
        success: true,
        section: body.section,
        data: updated,
      });
    }

    // Caso 2: Atualização de múltiplas seções ({ sections: { hero: ..., solutions: ... } })
    if (body.sections && typeof body.sections === "object") {
      const results: Record<string, any> = {};
      for (const [sectionName, sectionData] of Object.entries(body.sections)) {
        if (sectionData && typeof sectionData === "object") {
          results[sectionName] = await saveSiteSectionContent(sectionName, sectionData as any, "admin");
        }
      }
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    return NextResponse.json(
      { success: false, error: "Formato de payload inválido. Esperado 'section' e 'data' ou 'sections'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API Admin CMS Content] Erro ao salvar conteúdo:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao salvar dados no CMS." },
      { status: 500 }
    );
  }
}
