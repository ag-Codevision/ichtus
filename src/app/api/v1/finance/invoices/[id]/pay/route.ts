import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentMethod, FinancialTransactionType } from "@prisma/client";
import { wacli } from "@/lib/whatsapp/wacli";
import { formatCurrency } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH: Dar baixa manual ou liquidar recebimento PIX na fatura
export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { paymentMethod = PaymentMethod.PIX, bankAccount = "Conta Corrente Principal", notes } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            tradeName: true,
            user: { select: { name: true, phone: true } },
          },
        },
        serviceOrder: {
          select: { code: true, title: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Fatura não encontrada" },
        { status: 404 }
      );
    }

    if (invoice.status === InvoiceStatus.PAID) {
      return NextResponse.json(
        { success: false, error: "Esta fatura já está liquidada" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Executa em transação: atualiza fatura e registra lançamento no extrato financeiro
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualiza a fatura
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PAID,
          paidDate: now,
          paymentMethod: paymentMethod as PaymentMethod,
          notes: notes ? `${invoice.notes || ""}\n${notes}`.trim() : invoice.notes,
        },
      });

      // 2. Registra a transação de receita
      const transaction = await tx.financialTransaction.create({
        data: {
          invoiceId: invoice.id,
          type: FinancialTransactionType.INCOME,
          category: "Vendas e Serviços",
          description: `Recebimento Fatura ${invoice.code} - ${invoice.customer.tradeName || invoice.customer.user?.name || "Cliente"}`,
          amount: invoice.amount,
          entryDate: now,
          bankAccount,
        },
      });

      return { updatedInvoice, transaction };
    });

    // Dispara recibo de pagamento via WhatsApp (WACLI) se houver telefone
    const clientPhone = invoice.customer.user?.phone;
    if (clientPhone) {
      const valorFormatado = formatCurrency(Number(invoice.amount));
      const clientName = invoice.customer.user?.name || invoice.customer.tradeName || "Cliente";
      const message = `✅ *Comprovante de Pagamento — Glessios*\n\nOlá, *${clientName}*!\nConfirmamos o recebimento de *${valorFormatado}* referente à Fatura *${invoice.code}* (${invoice.serviceOrder.title}).\n\nSua Ordem de Serviço continua avançando a todo vapor em nossa fábrica!\nObrigado pela confiança.`;
      
      // Envia assincronamente sem bloquear a resposta da API
      wacli.sendMessage({ to: clientPhone, message }).catch((err) => {
        console.error("Falha ao enviar recibo WACLI:", err);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result.updatedInvoice,
        amount: Number(result.updatedInvoice.amount),
      },
      message: "Fatura baixada com sucesso e transação registrada",
    });
  } catch (error) {
    console.error("Erro ao liquidar fatura:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao liquidar fatura" },
      { status: 500 }
    );
  }
}
