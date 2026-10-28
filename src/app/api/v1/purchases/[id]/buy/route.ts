import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FinancialTransactionType, PaymentMethod, PurchaseItemStatus } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/purchases/[id]/buy
 * Registra a baixa de compra do insumo, registrando o carimbo de data/hora,
 * valor real pago, fornecedor e gerando automaticamente a despesa no módulo financeiro.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      actualUnitCost,
      actualTotalCost,
      supplierName,
      paymentMethod,
      purchasedAt,
      purchasedBy,
      bankAccount = "Caixa Geral",
      notes,
    } = body;

    const purchaseItem = await prisma.servicePurchaseItem.findUnique({
      where: { id },
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

    if (!purchaseItem) {
      return NextResponse.json(
        { success: false, error: "Item de compra não encontrado." },
        { status: 404 }
      );
    }

    const qty = Number(purchaseItem.quantity) || 1;
    const finalActualUnitCost =
      actualUnitCost !== undefined && actualUnitCost !== null
        ? Number(actualUnitCost)
        : Number(purchaseItem.estimatedUnitCost) || 0;

    const finalActualTotalCost =
      actualTotalCost !== undefined && actualTotalCost !== null
        ? Number(actualTotalCost)
        : finalActualUnitCost * qty;

    const purchaseDate = purchasedAt ? new Date(purchasedAt) : new Date();
    const effectivePurchaseDate = isNaN(purchaseDate.getTime()) ? new Date() : purchaseDate;

    // Converte o paymentMethod para o enum do Prisma de forma segura
    let safePaymentMethod: PaymentMethod | null = null;
    if (paymentMethod && Object.values(PaymentMethod).includes(paymentMethod)) {
      safePaymentMethod = paymentMethod as PaymentMethod;
    }

    const leadInfo = purchaseItem.lead;
    const serviceTitle = leadInfo?.title || "Serviço";
    const budgetCodeStr = leadInfo?.budgetCode ? ` [${leadInfo.budgetCode}]` : "";

    // 1. Cria a transação de despesa no módulo financeiro
    const transaction = await prisma.financialTransaction.create({
      data: {
        type: FinancialTransactionType.EXPENSE,
        category: "Compras / Matéria-Prima",
        description: `Compra: ${qty} ${purchaseItem.unit} de "${purchaseItem.name}" para o serviço ${serviceTitle}${budgetCodeStr}${supplierName ? ` (Fornecedor: ${supplierName})` : ""}`,
        amount: finalActualTotalCost,
        entryDate: effectivePurchaseDate,
        bankAccount: bankAccount || "Caixa Geral",
        customerId: leadInfo?.customerId || null,
      },
    });

    // 2. Atualiza o status do item de compra para PURCHASED e vincula à transação
    const updatedPurchaseItem = await prisma.servicePurchaseItem.update({
      where: { id },
      data: {
        status: PurchaseItemStatus.PURCHASED,
        actualUnitCost: finalActualUnitCost,
        actualTotalCost: finalActualTotalCost,
        supplierName: supplierName?.trim() || null,
        paymentMethod: safePaymentMethod,
        purchasedAt: effectivePurchaseDate,
        purchasedBy: purchasedBy?.trim() || "Equipe",
        notes: notes?.trim() || purchaseItem.notes || null,
        financialTransactionId: transaction.id,
      },
      include: {
        financialTransaction: true,
      },
    });

    // 3. Registra na timeline/atividades do Lead que o insumo foi comprado
    if (leadInfo?.id) {
      await prisma.leadActivity.create({
        data: {
          leadId: leadInfo.id,
          type: "FIELD_UPDATE",
          content: `Insumo comprado: ${qty} ${purchaseItem.unit} de "${purchaseItem.name}" por R$ ${finalActualTotalCost.toFixed(2)} em ${effectivePurchaseDate.toLocaleString("pt-BR")}`,
          userName: purchasedBy || "Equipe Compras",
        },
      }).catch((e) => console.warn("Aviso ao registrar atividade de compra no lead:", e));
    }

    return NextResponse.json({
      success: true,
      message: "Baixa de compra efetuada com sucesso e despesa registrada no financeiro!",
      purchaseItem: updatedPurchaseItem,
      transaction,
    });
  } catch (error: any) {
    console.error("[Purchases API] Erro ao dar baixa em item de compra:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao dar baixa na compra.", details: error?.message },
      { status: 500 }
    );
  }
}
