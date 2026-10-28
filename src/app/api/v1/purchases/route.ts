import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PurchaseItemStatus } from "@prisma/client";

/**
 * GET /api/v1/purchases
 * Lista compras agrupadas por serviço com filtros avançados e KPIs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const statusParam = searchParams.get("status") || "ALL"; // ALL, PENDING, PURCHASED
    const customerId = searchParams.get("customerId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const dateRange = searchParams.get("dateRange") || "all"; // all, today, week, month, overdue

    // 1. Busca todos os serviços (Leads) que possuem purchaseItems
    const leadsWithPurchases = await prisma.lead.findMany({
      where: {
        ...(customerId ? { customerId } : {}),
        ...(categoryId ? { categoryId } : {}),
        purchaseItems: {
          some: {}, // Tem pelo menos um item registrado
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            email: true,
          },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        subcategory: {
          select: { id: true, name: true },
        },
        column: {
          select: { id: true, name: true, color: true },
        },
        purchaseItems: {
          orderBy: { createdAt: "desc" },
          include: {
            stockItem: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                currentQuantity: true,
                unit: true,
              },
            },
            financialTransaction: {
              select: {
                id: true,
                amount: true,
                entryDate: true,
                bankAccount: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 2. Filtra e mapeia os grupos de serviços
    let filteredGroups = leadsWithPurchases.map((lead) => {
      let items = lead.purchaseItems;

      if (statusParam !== "ALL") {
        items = items.filter((item) => item.status === statusParam);
      }

      const totalItems = lead.purchaseItems.length;
      const pendingItems = lead.purchaseItems.filter(
        (i) => i.status === PurchaseItemStatus.PENDING
      ).length;
      const purchasedItems = lead.purchaseItems.filter(
        (i) => i.status === PurchaseItemStatus.PURCHASED
      ).length;

      const progressPercent =
        totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 100;

      const totalEstimatedCost = lead.purchaseItems
        .filter((i) => i.status === PurchaseItemStatus.PENDING)
        .reduce((sum, i) => sum + Number(i.estimatedTotalCost || 0), 0);

      const totalActualCost = lead.purchaseItems
        .filter((i) => i.status === PurchaseItemStatus.PURCHASED)
        .reduce((sum, i) => sum + Number(i.actualTotalCost || 0), 0);

      return {
        leadId: lead.id,
        budgetCode: lead.budgetCode,
        title: lead.title,
        dueDate: lead.dueDate,
        priority: lead.priority,
        column: lead.column,
        customer: lead.customer,
        category: lead.category,
        subcategory: lead.subcategory,
        totalItems,
        pendingItems,
        purchasedItems,
        progressPercent,
        totalEstimatedCost,
        totalActualCost,
        items,
      };
    });

    // Filtro por data de entrega (dueDate)
    if (dateRange !== "all") {
      filteredGroups = filteredGroups.filter((g) => {
        if (!g.dueDate) return dateRange === "all";
        const due = new Date(g.dueDate);
        if (dateRange === "today") {
          return due >= startOfToday && due < new Date(startOfToday.getTime() + 86400000);
        }
        if (dateRange === "week") {
          return due >= startOfWeek;
        }
        if (dateRange === "month") {
          return due >= startOfMonth;
        }
        if (dateRange === "overdue") {
          return due < startOfToday && g.pendingItems > 0;
        }
        return true;
      });
    }

    // Filtro de busca textual (global)
    if (search) {
      filteredGroups = filteredGroups.filter((g) => {
        const matchTitle = g.title.toLowerCase().includes(search);
        const matchCode = g.budgetCode?.toLowerCase().includes(search);
        const matchClient =
          g.customer?.tradeName?.toLowerCase().includes(search) ||
          g.customer?.fullName?.toLowerCase().includes(search) ||
          g.customer?.companyName?.toLowerCase().includes(search);
        const matchItems = g.items.some((it) => it.name.toLowerCase().includes(search));

        return matchTitle || matchCode || matchClient || matchItems;
      });
    }

    // Filtra fora grupos vazios se o usuário filtrou por status específico
    if (statusParam !== "ALL") {
      filteredGroups = filteredGroups.filter((g) => g.items.length > 0);
    }

    // 3. Cálculo dos KPIs consolidados
    const allPendingItemsList = await prisma.servicePurchaseItem.findMany({
      where: { status: PurchaseItemStatus.PENDING },
      select: { estimatedTotalCost: true, leadId: true },
    });

    const uniquePendingServices = new Set(allPendingItemsList.map((i) => i.leadId)).size;
    const totalPendingItemsCount = allPendingItemsList.length;
    const totalEstimatedToSpend = allPendingItemsList.reduce(
      (sum, i) => sum + Number(i.estimatedTotalCost || 0),
      0
    );

    // Total gasto em compras no mês atual
    const purchasedThisMonth = await prisma.servicePurchaseItem.findMany({
      where: {
        status: PurchaseItemStatus.PURCHASED,
        purchasedAt: {
          gte: startOfMonth,
        },
      },
      select: { actualTotalCost: true },
    });

    const totalSpentThisMonth = purchasedThisMonth.reduce(
      (sum, i) => sum + Number(i.actualTotalCost || 0),
      0
    );

    return NextResponse.json({
      success: true,
      kpis: {
        totalPendingServices: uniquePendingServices,
        totalPendingItems: totalPendingItemsCount,
        totalEstimatedToSpend,
        totalSpentThisMonth,
      },
      groups: filteredGroups,
    });
  } catch (error: any) {
    console.error("[Purchases API] Erro ao listar compras:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar compras de materiais" },
      { status: 500 }
    );
  }
}
