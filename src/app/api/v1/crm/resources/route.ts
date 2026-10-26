import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INITIAL_RESOURCES = [
  "Escada",
  "Andaime",
  "Fita Dupla Face",
  "Extensão",
  "Laser",
  "Furadeira / Parafusadeira",
  "Soprador Térmico",
  "MDF",
  "Metal",
  "Acrílico",
  "Vidro",
  "Película poliéster",
  "Adesivo Vinil",
  "Chaves Especiais",
  "Cinta Lacre",
  "Manta Magnética",
  "Material de Limpeza",
  "Parafusos/Buchas",
  "Espaçadores",
  "Iluminação",
  "Estrutura",
  "LED",
  "ACM",
  "Cola",
];

/**
 * GET /api/v1/crm/resources
 * Lista todos os recursos necessários cadastrados (com auto-seed inicial se vazio)
 */
export async function GET() {
  try {
    let resources = await prisma.serviceResource.findMany({
      orderBy: { name: "asc" },
    });

    // Se estiver vazio, realiza o seed com os itens padrão solicitados
    if (resources.length === 0) {
      await prisma.serviceResource.createMany({
        data: INITIAL_RESOURCES.map((name) => ({
          name,
          category: "GERAL",
        })),
        skipDuplicates: true,
      });

      resources = await prisma.serviceResource.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error: any) {
    console.error("[CRM Resources GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao listar recursos." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/resources
 * Cria um novo recurso necessário
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category = "GERAL" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome do recurso é obrigatório." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Verifica se já existe
    const existing = await prisma.serviceResource.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        resource: existing,
        message: "Recurso já existente.",
      });
    }

    const resource = await prisma.serviceResource.create({
      data: {
        name: trimmedName,
        category,
      },
    });

    return NextResponse.json({
      success: true,
      resource,
    });
  } catch (error: any) {
    console.error("[CRM Resources POST] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cadastrar recurso." },
      { status: 500 }
    );
  }
}
