import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

// GET: Histórico de movimentações de estoque com paginação e detalhes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stockItemId = searchParams.get("stockItemId");
    const serviceOrderId = searchParams.get("serviceOrderId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const whereClause: any = {};
    if (stockItemId) whereClause.stockItemId = stockItemId;
    if (serviceOrderId) whereClause.serviceOrderId = serviceOrderId;

    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        stockItem: {
          select: { id: true, name: true, sku: true, unit: true, category: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        serviceOrder: {
          select: { id: true, code: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formatted = movements.map((m) => ({
      ...m,
      quantity: Number(m.quantity),
      unitCost: Number(m.unitCost),
      totalCost: Number(m.totalCost),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Erro ao listar movimentações de estoque:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar histórico de movimentações" },
      { status: 500 }
    );
  }
}

// POST: Registrar movimentação de estoque com atualização atômica de saldo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      stockItemId,
      serviceOrderId,
      type,
      quantity,
      unitCost,
      notes,
    } = body;

    if (!stockItemId || !type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Insumo, tipo de movimentação e quantidade válida são obrigatórios" },
        { status: 400 }
      );
    }

    const item = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Insumo de estoque não encontrado" },
        { status: 404 }
      );
    }

    // Busca usuário padrão (Admin) para vincular ao log
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário do sistema não identificado" },
        { status: 500 }
      );
    }

    const qty = Number(quantity);
    const cost = unitCost !== undefined ? Number(unitCost) : Number(item.averageUnitCost);
    const totalCost = qty * cost;

    // Transação Prisma para consistência atômica
    const result = await prisma.$transaction(async (tx) => {
      let newQuantity = Number(item.currentQuantity);
      let newAvgCost = Number(item.averageUnitCost);

      const isEntry = type === MovementType.INCOMING_PURCHASE || type === "PURCHASE_ENTRY";
      const isExit = type === MovementType.OUTGOING_PRODUCTION_OS || type === "PRODUCTION_CONSUMPTION" || type === MovementType.OUTGOING_LOSS_DEFECT;

      let movementTypeEnum: MovementType = MovementType.MANUAL_ADJUSTMENT;
      if (type === MovementType.INCOMING_PURCHASE || type === "PURCHASE_ENTRY") {
        movementTypeEnum = MovementType.INCOMING_PURCHASE;
      } else if (type === MovementType.OUTGOING_PRODUCTION_OS || type === "PRODUCTION_CONSUMPTION") {
        movementTypeEnum = MovementType.OUTGOING_PRODUCTION_OS;
      } else if (type === MovementType.OUTGOING_LOSS_DEFECT) {
        movementTypeEnum = MovementType.OUTGOING_LOSS_DEFECT;
      }

      if (isEntry) {
        // Entrada aumenta o saldo físico
        const previousValue = newQuantity * newAvgCost;
        const entryValue = qty * cost;
        newQuantity += qty;
        // Recalcula Custo Médio Ponderado Móvel (CMPM)
        if (newQuantity > 0) {
          newAvgCost = (previousValue + entryValue) / newQuantity;
        }
      } else if (isExit) {
        // Saída para fabricação reduz o saldo
        newQuantity = Math.max(0, newQuantity - qty);
      } else {
        // Ajuste manual de inventário
        if (body.isAbsoluteBalance) {
          newQuantity = qty;
        } else {
          newQuantity += qty;
        }
      }

      // 1. Registra a movimentação
      const movement = await tx.stockMovement.create({
        data: {
          stockItemId,
          serviceOrderId: serviceOrderId || null,
          userId: user.id,
          type: movementTypeEnum,
          quantity: qty,
          unitCost: cost,
          totalCost: totalCost,
          notes: notes || null,
        },
      });

      // 2. Atualiza o saldo do insumo
      const updatedItem = await tx.stockItem.update({
        where: { id: stockItemId },
        data: {
          currentQuantity: newQuantity,
          averageUnitCost: newAvgCost,
        },
      });

      return { movement, updatedItem };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Movimentação registrada com sucesso",
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar movimentação de estoque" },
      { status: 500 }
    );
  }
}
