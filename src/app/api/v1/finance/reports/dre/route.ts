import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinancialTransactionType, MovementType, InvoiceStatus } from "@prisma/client";

// GET: Demonstrativo do Resultado do Exercício (DRE Sintético e Analítico)
export async function GET() {
  try {
    // 1. Receitas de Vendas (Faturas Liquidadas + Receitas Avulsas)
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: InvoiceStatus.PAID },
    });
    const invoiceRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    const manualRevenues = await prisma.financialTransaction.findMany({
      where: {
        type: FinancialTransactionType.INCOME,
        invoiceId: null, // Evita dupla contagem de faturas que já geraram transação
      },
    });
    const extraRevenue = manualRevenues.reduce((acc, r) => acc + Number(r.amount), 0);
    const grossRevenue = invoiceRevenue + extraRevenue;

    // 2. Custos dos Insumos Fabris Consumidos (CMV - Custo da Mercadoria Vendida)
    const consumptions = await prisma.stockMovement.findMany({
      where: { type: MovementType.OUTGOING_PRODUCTION_OS },
      include: {
        stockItem: { select: { name: true, category: true } },
      },
    });
    const directMaterialCost = consumptions.reduce((acc, m) => acc + Number(m.totalCost), 0);

    // Agrupamento de custos de insumos por categoria
    const materialCostByCategory: Record<string, number> = {};
    for (const item of consumptions) {
      const cat = item.stockItem?.category || "Outros";
      materialCostByCategory[cat] = (materialCostByCategory[cat] || 0) + Number(item.totalCost);
    }

    // 3. Margem de Contribuição Bruta
    const grossMargin = grossRevenue - directMaterialCost;
    const grossMarginPercentage = grossRevenue > 0 ? (grossMargin / grossRevenue) * 100 : 0;

    // 4. Despesas Operacionais (Administrativas, Energia, Manutenção, Marketing)
    const expenses = await prisma.financialTransaction.findMany({
      where: { type: FinancialTransactionType.EXPENSE },
    });
    const totalOperatingExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

    const expensesByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + Number(exp.amount);
    }

    // 5. Resultado Líquido Operacional
    const netOperatingResult = grossMargin - totalOperatingExpenses;
    const netMarginPercentage = grossRevenue > 0 ? (netOperatingResult / grossRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      dre: {
        grossRevenue,
        revenueBreakdown: {
          invoices: invoiceRevenue,
          other: extraRevenue,
        },
        directMaterialCost,
        materialCostByCategory,
        grossMargin,
        grossMarginPercentage,
        totalOperatingExpenses,
        expensesByCategory,
        netOperatingResult,
        netMarginPercentage,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar DRE:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao apurar demonstrativo DRE" },
      { status: 500 }
    );
  }
}
