import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinancialTransactionType } from "@prisma/client";

// GET: Extrato financeiro de transações com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const whereClause: any = {};

    if (type && type !== "ALL") {
      whereClause.type = type as FinancialTransactionType;
    }

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const transactions = await prisma.financialTransaction.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            fullName: true,
            type: true,
          },
        },
        invoice: {
          select: {
            code: true,
            customer: { select: { tradeName: true, user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { entryDate: "desc" },
      take: limit,
    });

    const allTx = await prisma.financialTransaction.findMany();
    const totalRevenue = allTx
      .filter((t) => t.type === FinancialTransactionType.INCOME)
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = allTx
      .filter((t) => t.type === FinancialTransactionType.EXPENSE)
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const netBalance = totalRevenue - totalExpense;

    const formatted = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      kpis: {
        totalRevenue,
        totalExpense,
        netBalance,
      },
    });
  } catch (error) {
    console.error("Erro ao listar transações financeiras:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar extrato financeiro" },
      { status: 500 }
    );
  }
}

// POST: Lançamento avulso de despesa ou receita
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      category,
      description,
      amount,
      entryDate,
      customerId,
      bankAccount = "Conta Corrente Principal",
      receiptUrl,
    } = body;

    if (!type || !category || !description || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Tipo, categoria, descrição e valor positivo são obrigatórios" },
        { status: 400 }
      );
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        type: type as FinancialTransactionType,
        category: category.trim(),
        description: description.trim(),
        amount: Number(amount),
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        customerId: customerId || null,
        bankAccount: bankAccount.trim(),
        receiptUrl: receiptUrl?.trim() || null,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
      },
      message: "Lançamento financeiro registrado com sucesso",
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar lançamento financeiro:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar lançamento financeiro" },
      { status: 500 }
    );
  }
}
