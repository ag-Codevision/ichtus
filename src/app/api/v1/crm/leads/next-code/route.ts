import { NextResponse } from "next/server";
import { generateNextBudgetCode } from "@/lib/crm/budget-code";

/**
 * GET /api/v1/crm/leads/next-code
 * Retorna a prévia do próximo ID de orçamento sequencial inteligente
 */
export async function GET() {
  try {
    const nextCode = await generateNextBudgetCode();
    return NextResponse.json({
      success: true,
      budgetCode: nextCode,
      formatted: `[${nextCode}]`,
    });
  } catch (error: any) {
    console.error("[CRM API] Erro ao gerar próximo código de orçamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao gerar código de orçamento" },
      { status: 500 }
    );
  }
}
