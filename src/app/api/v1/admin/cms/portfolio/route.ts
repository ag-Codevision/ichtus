import { NextRequest, NextResponse } from "next/server";
import { getAllCMSProjects, createCMSProject } from "@/lib/cms-service";

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
 * GET /api/v1/admin/cms/portfolio
 * Retorna todos os projetos do portfólio para o CMS.
 */
export async function GET() {
  try {
    const projects = await getAllCMSProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("[API CMS Portfolio GET] Erro:", error);
    return NextResponse.json({ success: false, error: "Falha ao listar projetos." }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/cms/portfolio
 * Cria um novo projeto de portfólio no banco de dados.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const created = await createCMSProject(body);
    return NextResponse.json({ success: true, project: created });
  } catch (error: any) {
    console.error("[API CMS Portfolio POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao criar projeto." },
      { status: 400 }
    );
  }
}
