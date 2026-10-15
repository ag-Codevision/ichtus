import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OSStage, PriorityLevel } from "@prisma/client";

/**
 * GET /api/v1/production/orders
 * Retorna as Ordens de Serviço agrupadas ou filtradas por estágio fabril
 */
export async function GET(req: NextRequest) {
  try {
    const stageParam = req.nextUrl.searchParams.get("stage") as OSStage | null;
    const priorityParam = req.nextUrl.searchParams.get("priority") as PriorityLevel | null;
    const search = req.nextUrl.searchParams.get("search");

    const where: any = {};
    if (stageParam) where.currentStage = stageParam;
    if (priorityParam) where.priority = priorityParam;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { customer: { tradeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const serviceOrders = await prisma.serviceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        items: true,
        artworkProofs: {
          orderBy: { version: "desc" },
          take: 1,
        },
        invoices: {
          select: { id: true, code: true, amount: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      serviceOrders,
    });
  } catch (error: any) {
    console.error("[Production API] Erro ao listar OSs:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar ordens de serviço", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/production/orders
 * Criação manual de Ordem de Serviço pela equipe interna
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      customerId,
      priority = PriorityLevel.MEDIUM,
      deadline,
      installationDate,
      totalAmount,
      items = [],
    } = body;

    if (!title || !customerId || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Título, cliente e valor total são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Usuário administrador não encontrado." },
        { status: 500 }
      );
    }

    const currentYear = new Date().getFullYear();
    const osCount = await prisma.serviceOrder.count();
    const osCode = `OS-${currentYear}-${String(osCount + 1).padStart(4, "0")}`;

    const numericTotal = Number(totalAmount);

    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        code: osCode,
        title,
        description: description || null,
        customerId,
        createdById: admin.id,
        currentStage: OSStage.BRIEFING_ARTWORK,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        installationDate: installationDate ? new Date(installationDate) : null,
        totalAmount: numericTotal,
        discount: 0.0,
        netAmount: numericTotal,
        items: {
          create: items.map((it: any) => ({
            description: it.description || "Serviço de Comunicação Visual",
            unit: it.unit || "un",
            quantity: Number(it.quantity) || 1,
            widthMeters: it.widthMeters ? Number(it.widthMeters) : null,
            heightMeters: it.heightMeters ? Number(it.heightMeters) : null,
            unitPrice: Number(it.unitPrice) || numericTotal,
            totalPrice: Number(it.totalPrice) || numericTotal,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Ordem de Serviço ${osCode} criada com sucesso!`,
        serviceOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Production API] Erro ao criar OS:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao criar ordem de serviço", details: error?.message },
      { status: 500 }
    );
  }
}
