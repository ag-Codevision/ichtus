import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";
import { generatePixCopyPaste, generateSimpleQrSvg } from "@/lib/finance/pix";

// GET: Listar faturas com filtros e KPIs financeiros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status as InvoiceStatus;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { customer: { tradeName: { contains: search, mode: "insensitive" } } },
        { customer: { companyName: { contains: search, mode: "insensitive" } } },
        { customer: { user: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            documentNumber: true,
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        serviceOrder: {
          select: {
            id: true,
            code: true,
            title: true,
            currentStage: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const allInvoices = await prisma.invoice.findMany();
    const now = new Date();

    const totalInvoiced = allInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaid = allInvoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPending = allInvoices
      .filter((inv) => inv.status === InvoiceStatus.PENDING)
      .reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalOverdue = allInvoices
      .filter((inv) => inv.status === InvoiceStatus.PENDING && new Date(inv.dueDate) < now)
      .reduce((acc, inv) => acc + Number(inv.amount), 0);

    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      amount: Number(inv.amount),
      isOverdue: inv.status === InvoiceStatus.PENDING && new Date(inv.dueDate) < now,
    }));

    return NextResponse.json({
      success: true,
      data: formattedInvoices,
      kpis: {
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
      },
    });
  } catch (error) {
    console.error("Erro ao listar faturas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar faturas" },
      { status: 500 }
    );
  }
}

// POST: Criar nova fatura e gerar cobrança PIX integrada
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceOrderId,
      customerId,
      amount,
      dueDate,
      notes,
      paymentMethod = PaymentMethod.PIX,
    } = body;

    if (!amount || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Valor e data de vencimento são obrigatórios" },
        { status: 400 }
      );
    }

    // Se tiver serviceOrderId mas não tiver customerId, busca da OS
    let finalCustomerId = customerId;
    let finalServiceOrderId = serviceOrderId;

    if (serviceOrderId) {
      const os = await prisma.serviceOrder.findUnique({
        where: { id: serviceOrderId },
        select: { customerId: true },
      });
      if (os) {
        finalCustomerId = os.customerId;
      }
    } else {
      // Se não informou OS, vincula à primeira OS existente ou busca cliente
      const anyOs = await prisma.serviceOrder.findFirst();
      if (!anyOs) {
        return NextResponse.json(
          { success: false, error: "Nenhuma Ordem de Serviço encontrada para vincular à fatura" },
          { status: 400 }
        );
      }
      finalServiceOrderId = anyOs.id;
      finalCustomerId = finalCustomerId || anyOs.customerId;
    }

    // Gera código sequencial da fatura: FAT-2026-XXXX
    const count = await prisma.invoice.count();
    const code = `FAT-2026-${(count + 1).toString().padStart(4, "0")}`;

    // Gera o código PIX Copia e Cola e QR Code SVG
    const pixKey = process.env.PIX_KEY || "financeiro@glessios.com.br";
    const pixCopyPaste = generatePixCopyPaste({
      pixKey,
      merchantName: "GLESSIOS COMUNICACAO",
      merchantCity: "CASCAVEL",
      amount: Number(amount),
      txId: code.replace(/[^a-zA-Z0-9]/g, ""),
      description: `Fatura ${code} - Glessios`,
    });

    const qrSvg = generateSimpleQrSvg(pixCopyPaste, 280);
    const pixQrCodeBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`;

    const invoice = await prisma.invoice.create({
      data: {
        code,
        serviceOrderId: finalServiceOrderId,
        customerId: finalCustomerId,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        status: InvoiceStatus.PENDING,
        paymentMethod: paymentMethod as PaymentMethod,
        pixCopyPasteCode: pixCopyPaste,
        pixQrCodeBase64,
        notes: notes || null,
      },
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

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        amount: Number(invoice.amount),
      },
      message: "Fatura emitida com sucesso com cobrança PIX gerada",
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao emitir fatura:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao emitir fatura" },
      { status: 500 }
    );
  }
}
