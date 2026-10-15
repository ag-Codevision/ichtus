import { prisma } from "../src/lib/prisma";
import { generatePixCopyPaste, generateSimpleQrSvg } from "../src/lib/finance/pix";
import { InvoiceStatus, PaymentMethod, FinancialTransactionType, MovementType } from "@prisma/client";

async function main() {
  const os = await prisma.serviceOrder.findFirst({
    include: { customer: true },
  });
  if (!os) {
    console.log("Nenhuma OS encontrada.");
    return;
  }

  const user = await prisma.user.findFirst();

  // Fatura 1: Pendente com PIX
  const pixCopyPaste = generatePixCopyPaste({
    pixKey: "48.291.802/0001-44",
    merchantName: "GLESSIOS COMUNICACAO",
    merchantCity: "CASCAVEL",
    amount: 6250.0,
    txId: "FAT20260001",
    description: "Entrada 50% OS-2026-0001 Tech Tower",
  });
  const qrSvg = generateSimpleQrSvg(pixCopyPaste, 280);
  const pixQrCodeBase64 = "data:image/svg+xml;utf8," + encodeURIComponent(qrSvg);

  await prisma.invoice.upsert({
    where: { code: "FAT-2026-0001" },
    update: {
      pixCopyPasteCode: pixCopyPaste,
      pixQrCodeBase64,
    },
    create: {
      code: "FAT-2026-0001",
      serviceOrderId: os.id,
      customerId: os.customerId,
      amount: 6250.0,
      dueDate: new Date(Date.now() + 5 * 86400000),
      status: InvoiceStatus.PENDING,
      paymentMethod: PaymentMethod.PIX,
      pixCopyPasteCode: pixCopyPaste,
      pixQrCodeBase64,
      notes: "Entrada de 50% referente ao início da usinagem CNC.",
    },
  });

  // Fatura 2: Liquidada
  const inv2 = await prisma.invoice.upsert({
    where: { code: "FAT-2026-0002" },
    update: {},
    create: {
      code: "FAT-2026-0002",
      serviceOrderId: os.id,
      customerId: os.customerId,
      amount: 3500.0,
      dueDate: new Date(Date.now() - 2 * 86400000),
      paidDate: new Date(Date.now() - 2 * 86400000),
      status: InvoiceStatus.PAID,
      paymentMethod: PaymentMethod.PIX,
      notes: "Sinal de entrada recebido e confirmado via PIX.",
    },
  });

  // Lançamento de receita da fatura 2
  const existingTx = await prisma.financialTransaction.findFirst({
    where: { invoiceId: inv2.id },
  });
  if (!existingTx) {
    await prisma.financialTransaction.create({
      data: {
        invoiceId: inv2.id,
        type: FinancialTransactionType.INCOME,
        category: "Vendas e Serviços",
        description: `Recebimento Sinal de Entrada - ${os.code}`,
        amount: 3500.0,
        entryDate: new Date(Date.now() - 2 * 86400000),
        bankAccount: "Conta Corrente Banco do Brasil",
      },
    });
  }

  // Despesas operacionais
  const txCount = await prisma.financialTransaction.count({
    where: { type: FinancialTransactionType.EXPENSE },
  });
  if (txCount === 0) {
    await prisma.financialTransaction.createMany({
      data: [
        {
          type: FinancialTransactionType.EXPENSE,
          category: "Fornecedores de Insumos",
          description: "Compra de 10 Chapas ACM 3mm Prata Brilho - Alucomex",
          amount: 1150.0,
          entryDate: new Date(Date.now() - 4 * 86400000),
          bankAccount: "Conta Corrente Banco do Brasil",
        },
        {
          type: FinancialTransactionType.EXPENSE,
          category: "Energia & Utilidades",
          description: "Energia Elétrica Fabril (Copel) - Mês 09/2026",
          amount: 840.0,
          entryDate: new Date(Date.now() - 6 * 86400000),
          bankAccount: "Conta Corrente Banco do Brasil",
        },
        {
          type: FinancialTransactionType.EXPENSE,
          category: "Manutenção de Máquinas",
          description: "Afiação e Troca de Fresas Router CNC 6mm Metal Duro",
          amount: 380.0,
          entryDate: new Date(Date.now() - 8 * 86400000),
          bankAccount: "Conta Corrente Banco do Brasil",
        },
      ],
    });
  }

  // Consumo fabril para o DRE
  const movCount = await prisma.stockMovement.count({
    where: { type: MovementType.OUTGOING_PRODUCTION_OS },
  });
  if (movCount === 0) {
    const acmItem = await prisma.stockItem.findFirst({
      where: { sku: "ACM-PRATA-3MM" },
    });
    if (acmItem && user) {
      await prisma.stockMovement.create({
        data: {
          stockItemId: acmItem.id,
          serviceOrderId: os.id,
          userId: user.id,
          type: MovementType.OUTGOING_PRODUCTION_OS,
          quantity: 12.0,
          unitCost: Number(acmItem.averageUnitCost),
          totalCost: 12.0 * Number(acmItem.averageUnitCost),
          notes: "Consumo de 12m² de ACM para usinagem da fachada Tech Tower",
        },
      });

      await prisma.stockItem.update({
        where: { id: acmItem.id },
        data: {
          currentQuantity: Number(acmItem.currentQuantity) - 12.0,
        },
      });
    }
  }

  console.log("✅ Seed financeiro e estoque consolidado com sucesso!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
