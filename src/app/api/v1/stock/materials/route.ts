import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StockUnit } from "@prisma/client";

// GET: Listagem de insumos de comunicação visual com estatísticas e filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const whereClause: any = {};

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.stockItem.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { movements: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Filtra se for apenas estoque baixo em memória ou banco
    let filteredItems = items.map((item) => {
      const currentQty = Number(item.currentQuantity);
      const minQty = Number(item.minQuantity);
      const avgCost = Number(item.averageUnitCost);
      const totalValue = currentQty * avgCost;
      const isLowStock = currentQty <= minQty;
      const isCritical = currentQty <= minQty * 0.5;

      return {
        ...item,
        currentQuantity: currentQty,
        minQuantity: minQty,
        averageUnitCost: avgCost,
        totalInventoryValue: totalValue,
        isLowStock,
        isCritical,
      };
    });

    if (lowStockOnly) {
      filteredItems = filteredItems.filter((item) => item.isLowStock);
    }

    // Calcula KPIs consolidados de estoque
    const allItems = await prisma.stockItem.findMany();
    const totalInventoryValue = allItems.reduce(
      (acc, item) => acc + Number(item.currentQuantity) * Number(item.averageUnitCost),
      0
    );
    const totalLowStock = allItems.filter(
      (item) => Number(item.currentQuantity) <= Number(item.minQuantity)
    ).length;
    const totalCritical = allItems.filter(
      (item) => Number(item.currentQuantity) <= Number(item.minQuantity) * 0.5
    ).length;

    // Categorias distintas cadastradas
    const categories = Array.from(new Set(allItems.map((item) => item.category))).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: filteredItems,
      kpis: {
        totalSkus: allItems.length,
        totalInventoryValue,
        totalLowStock,
        totalCritical,
      },
      categories,
    });
  } catch (error) {
    console.error("Erro ao listar insumos de estoque:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar insumos de estoque" },
      { status: 500 }
    );
  }
}

// POST: Cadastro de novo insumo de estoque
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      category,
      unit,
      currentQuantity,
      minQuantity,
      averageUnitCost,
      supplier,
      location,
    } = body;

    if (!sku || !name || !category || !unit) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios ausentes (SKU, Nome, Categoria, Unidade)" },
        { status: 400 }
      );
    }

    // Verifica duplicidade de SKU
    const existingSku = await prisma.stockItem.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existingSku) {
      return NextResponse.json(
        { success: false, error: "Já existe um insumo cadastrado com este SKU" },
        { status: 409 }
      );
    }

    const newItem = await prisma.stockItem.create({
      data: {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim(),
        unit: unit as StockUnit,
        currentQuantity: Number(currentQuantity) || 0,
        minQuantity: Number(minQuantity) || 0,
        averageUnitCost: Number(averageUnitCost) || 0,
        supplier: supplier?.trim() || null,
        location: location?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: "Insumo cadastrado com sucesso",
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar insumo:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao cadastrar insumo" },
      { status: 500 }
    );
  }
}
