import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FinancialTransactionType, PaymentMethod, PurchaseItemStatus } from "@prisma/client";

/**
 * POST /api/v1/purchases/batch-buy
 * Registra a baixa em lote de múltiplos itens de compra
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      itemIds = [],
      supplierName,
      paymentMethod,
      purchasedAt,
      purchasedBy = "Equipe Compras",
      bankAccount = "Caixa Geral",
    } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum item selecionado para baixa." },
        { status: 400 }
      );
    }

    const items = await prisma.servicePurchaseItem.findMany({
      where: {
        id: { in: itemIds },
        status: PurchaseItemStatus.PENDING,
      },
      include: {
        lead: {
          select: {
            id: true,
            title: true,
            budgetCode: true,
            customerId: true,
          },
        },
      },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum item pendente encontrado para os IDs informados." },
        { status: 400 }
      );
    }

    const purchaseDate = purchasedAt ? new Date(purchasedAt) : new Date();
    const effectivePurchaseDate = isNaN(purchaseDate.getTime()) ? new Date() : purchaseDate;

    let safePaymentMethod: PaymentMethod | null = null;
    if (paymentMethod && Object.values(PaymentMethod).includes(paymentMethod)) {
      safePaymentMethod = paymentMethod as PaymentMethod;
    }

    const updatedItems = [];

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const unitCost = Number(item.estimatedUnitCost) || 0;
      const totalCost = Number(item.estimatedTotalCost) || unitCost * qty;

      const leadInfo = item.lead;
      const serviceTitle = leadInfo?.title || "Serviço";
      const budgetCodeStr = leadInfo?.budgetCode ? ` [${leadInfo.budgetCode}]` : "";

      // 1. Cria transação financeira individual
      const transaction = await prisma.financialTransaction.create({
        data: {
          type: FinancialTransactionType.EXPENSE,
          category: "Compras / Matéria-Prima",
          description: `Compra: ${qty} ${item.unit} de "${item.name}" para o serviço ${serviceTitle}${budgetCodeStr}${supplierName ? ` (Fornecedor: ${supplierName})` : ""}`,
          amount: totalCost,
          entryDate: effectivePurchaseDate,
          bankAccount: bankAccount || "Caixa Geral",
          customerId: leadInfo?.customerId || null,
        },
      });

      // 2. Atualiza item
      const updated = await prisma.servicePurchaseItem.update({
        where: { id: item.id },
        data: {
          status: PurchaseItemStatus.PURCHASED,
          actualUnitCost: unitCost,
          actualTotalCost: totalCost,
          supplierName: supplierName?.trim() || null,
          paymentMethod: safePaymentMethod,
          purchasedAt: effectivePurchaseDate,
          purchasedBy: purchasedBy?.trim() || "Equipe Compras",
          financialTransactionId: transaction.id,
        },
      });

      updatedItems.push(updated);
    }

    return NextResponse.json({
      success: true,
      message: `${updatedItems.length} itens baixados e lançados no financeiro com sucesso!`,
      count: updatedItems.length,
    });
  } catch (error: any) {
    console.error("[Purchases API] Erro ao dar baixa em lote:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao dar baixa em lote.", details: error?.message },
      { status: 500 }
    );
  }
}
