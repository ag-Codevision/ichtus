import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_PRODUCTION_STAGES = [
  { name: "Briefing & Criação", color: "#8B5CF6", stageKey: "BRIEFING_ARTWORK" },
  { name: "Aprovação de Layout", color: "#F59E0B", stageKey: "ARTWORK_APPROVAL" },
  { name: "Corte Router & Laser", color: "#FF650F", stageKey: "CNC_ROUTER_CUTTING" },
  { name: "Impressão UV & Vinil", color: "#3B82F6", stageKey: "DIGITAL_PRINTING" },
  { name: "Serralheria & LED", color: "#EC4899", stageKey: "ASSEMBLY_STRUCTURE" },
  { name: "Controle de Qualidade", color: "#14B8A6", stageKey: "QUALITY_CONTROL" },
  { name: "Pronto p/ Instalação", color: "#06B6D4", stageKey: "READY_FOR_INSTALLATION" },
  { name: "Instalado & Concluído", color: "#10B981", stageKey: "INSTALLED_COMPLETED" },
];

/**
 * GET /api/v1/production/columns
 * Lista colunas da esteira de produção. Se ainda não houver nenhuma, cria as padrão.
 */
export async function GET() {
  try {
    let columns = await prisma.productionColumn.findMany({
      orderBy: { order: "asc" },
    });

    if (columns.length === 0) {
      // Seed inicial automática das 8 fases
      for (let i = 0; i < DEFAULT_PRODUCTION_STAGES.length; i++) {
        const item = DEFAULT_PRODUCTION_STAGES[i];
        await prisma.productionColumn.create({
          data: {
            name: item.name,
            color: item.color,
            stageKey: item.stageKey,
            order: i,
            isSystem: false,
          },
        });
      }
      columns = await prisma.productionColumn.findMany({
        orderBy: { order: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      columns,
    });
  } catch (error: any) {
    console.error("[Production Columns API] Erro ao listar colunas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar etapas da produção." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/production/columns
 * Cria nova etapa / coluna na esteira de produção
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color = "#FF650F" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "O nome da etapa é obrigatório." },
        { status: 400 }
      );
    }

    const lastCol = await prisma.productionColumn.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastCol ? lastCol.order + 1 : 0;

    const column = await prisma.productionColumn.create({
      data: {
        name: name.trim(),
        color: color.trim() || "#FF650F",
        order: nextOrder,
        isSystem: false,
      },
    });

    return NextResponse.json({
      success: true,
      column,
      message: "Nova etapa adicionada à esteira fabril!",
    });
  } catch (error: any) {
    console.error("[Production Columns API] Erro ao criar coluna:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao adicionar etapa fabril." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/production/columns
 * Reordenação das colunas da produção
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { columnIds } = body;

    if (!Array.isArray(columnIds)) {
      return NextResponse.json(
        { success: false, error: "columnIds deve ser um array." },
        { status: 400 }
      );
    }

    await Promise.all(
      columnIds.map((id, index) =>
        prisma.productionColumn.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Ordem das etapas fabris salva com sucesso!",
    });
  } catch (error: any) {
    console.error("[Production Columns API] Erro ao reordenar colunas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao salvar ordem das etapas." },
      { status: 500 }
    );
  }
}
