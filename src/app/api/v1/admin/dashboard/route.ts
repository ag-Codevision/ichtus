import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, OSStage } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      leads,
      kanbanColumns,
      serviceOrders,
      productionColumns,
      invoices,
      stockItems,
      appointments,
      customersCount,
    ] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          column: { select: { id: true, name: true, color: true, order: true } },
          customer: { select: { id: true, tradeName: true, companyName: true, fullName: true, phone: true } },
          tags: { include: { tag: true } },
        },
      }),

      prisma.kanbanColumn.findMany({
        orderBy: { order: "asc" },
      }),

      prisma.serviceOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, tradeName: true, companyName: true, fullName: true } },
          productionColumn: { select: { id: true, name: true, color: true, order: true } },
          items: true,
        },
      }),

      prisma.productionColumn.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: { select: { serviceOrders: true } },
        },
      }),

      prisma.invoice.findMany({
        orderBy: { dueDate: "asc" },
        include: {
          customer: { select: { tradeName: true, companyName: true } },
          serviceOrder: { select: { code: true, title: true } },
        },
      }),

      prisma.stockItem.findMany({
        orderBy: { name: "asc" },
      }),

      prisma.appointment.findMany({
        orderBy: { scheduledAt: "asc" },
        take: 6,
        include: {
          customer: { select: { tradeName: true, companyName: true, fullName: true } },
        },
      }),

      prisma.customer.count(),
    ]);

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    const now = new Date();

    for (const inv of invoices) {
      const val = Number(inv.amount) || 0;
      totalInvoiced += val;
      if (inv.status === InvoiceStatus.PAID) {
        totalPaid += val;
      } else if (inv.status === InvoiceStatus.PENDING) {
        if (new Date(inv.dueDate) < now) {
          totalOverdue += val;
        } else {
          totalPending += val;
        }
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        totalOverdue += val;
      }
    }

    let totalPipelineValue = 0;
    let leadsWithValCount = 0;
    const leadsByColumnMap: Record<string, { id: string; name: string; color: string; order: number; count: number; totalValue: number }> = {};

    kanbanColumns.forEach((col) => {
      leadsByColumnMap[col.id] = {
        id: col.id,
        name: col.name,
        color: col.color || "#FF650F",
        order: col.order,
        count: 0,
        totalValue: 0,
      };
    });

    let completedOrApprovedCount = 0;

    for (const lead of leads) {
      const val = Number(lead.estimatedValue) || 0;
      totalPipelineValue += val;
      if (val > 0) leadsWithValCount++;

      const colId = lead.columnId;
      if (leadsByColumnMap[colId]) {
        leadsByColumnMap[colId].count += 1;
        leadsByColumnMap[colId].totalValue += val;
      }

      const colNameLower = lead.column?.name?.toLowerCase() || "";
      if (
        colNameLower.includes("aprov") ||
        colNameLower.includes("conclu") ||
        colNameLower.includes("produ") ||
        lead.isCompleted
      ) {
        completedOrApprovedCount++;
      }
    }

    const conversionRate = leads.length > 0 ? (completedOrApprovedCount / leads.length) * 100 : 0;
    const avgTicket = leadsWithValCount > 0 ? totalPipelineValue / leadsWithValCount : 0;
    const leadsByColumn = Object.values(leadsByColumnMap).sort((a, b) => a.order - b.order);

    const stageProgressWeights: Record<OSStage, number> = {
      [OSStage.BRIEFING_ARTWORK]: 15,
      [OSStage.ARTWORK_APPROVAL]: 30,
      [OSStage.CNC_ROUTER_CUTTING]: 50,
      [OSStage.DIGITAL_PRINTING]: 65,
      [OSStage.ASSEMBLY_STRUCTURE]: 80,
      [OSStage.QUALITY_CONTROL]: 90,
      [OSStage.READY_FOR_INSTALLATION]: 95,
      [OSStage.INSTALLED_COMPLETED]: 100,
      [OSStage.CANCELLED]: 0,
    };

    const stageLabels: Record<OSStage, string> = {
      [OSStage.BRIEFING_ARTWORK]: "Briefing & Layout",
      [OSStage.ARTWORK_APPROVAL]: "Aprovação do Cliente",
      [OSStage.CNC_ROUTER_CUTTING]: "Corte Router CNC",
      [OSStage.DIGITAL_PRINTING]: "Impressão UV & Vinil",
      [OSStage.ASSEMBLY_STRUCTURE]: "Serralheria & LED",
      [OSStage.QUALITY_CONTROL]: "Controle de Qualidade",
      [OSStage.READY_FOR_INSTALLATION]: "Pronto p/ Instalação",
      [OSStage.INSTALLED_COMPLETED]: "Instalado & Entregue",
      [OSStage.CANCELLED]: "Cancelado",
    };

    const ordersByStage: Record<string, number> = {};
    Object.values(OSStage).forEach((stg) => {
      ordersByStage[stg] = 0;
    });

    let activeServiceOrdersCount = 0;
    let totalServiceOrdersValue = 0;

    const formattedServiceOrders = serviceOrders.map((os) => {
      const val = Number(os.netAmount || os.totalAmount) || 0;
      totalServiceOrdersValue += val;

      const isCompleted =
        os.currentStage === OSStage.INSTALLED_COMPLETED || os.currentStage === OSStage.CANCELLED;
      if (!isCompleted) {
        activeServiceOrdersCount++;
      }

      ordersByStage[os.currentStage] = (ordersByStage[os.currentStage] || 0) + 1;

      return {
        id: os.id,
        code: os.code,
        title: os.title,
        customerName:
          os.customer?.tradeName ||
          os.customer?.companyName ||
          os.customer?.fullName ||
          "Cliente Geral",
        currentStage: os.currentStage,
        stageLabel: stageLabels[os.currentStage] || os.currentStage,
        progressPercent: stageProgressWeights[os.currentStage] || 20,
        priority: os.priority,
        totalAmount: val,
        deadline: os.deadline,
        installationDate: os.installationDate,
        createdAt: os.createdAt,
        itemsCount: os.items.length,
      };
    });

    let totalStockValue = 0;
    let criticalStockCount = 0;
    const stockByCategoryMap: Record<
      string,
      { category: string; count: number; totalQuantity: number; totalValue: number }
    > = {};

    const criticalItems: Array<{
      id: string;
      name: string;
      sku: string;
      category: string;
      currentQuantity: number;
      minQuantity: number;
      unit: string;
    }> = [];

    stockItems.forEach((item) => {
      const qty = Number(item.currentQuantity) || 0;
      const min = Number(item.minQuantity) || 0;
      const unitCost = Number(item.averageUnitCost) || 0;
      const itemValue = qty * unitCost;

      totalStockValue += itemValue;

      const cat = item.category || "Geral";
      if (!stockByCategoryMap[cat]) {
        stockByCategoryMap[cat] = {
          category: cat,
          count: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      stockByCategoryMap[cat].count += 1;
      stockByCategoryMap[cat].totalQuantity += qty;
      stockByCategoryMap[cat].totalValue += itemValue;

      if (qty <= min) {
        criticalStockCount++;
        criticalItems.push({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          currentQuantity: qty,
          minQuantity: min,
          unit: item.unit,
        });
      }
    });

    const stockCategories = Object.values(stockByCategoryMap).sort(
      (a, b) => b.totalValue - a.totalValue
    );

    const alerts: Array<{
      id: string;
      type: "warning" | "info" | "success" | "danger";
      title: string;
      description: string;
      link?: string;
    }> = [];

    if (totalOverdue > 0) {
      alerts.push({
        id: "alert-overdue-invoices",
        type: "danger",
        title: "Faturas Vencidas",
        description: `Existem R$ ${totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em faturas vencidas aguardando cobrança.`,
        link: "/admin/financeiro",
      });
    }

    if (criticalStockCount > 0) {
      alerts.push({
        id: "alert-critical-stock",
        type: "warning",
        title: "Reposição de Insumos",
        description: `${criticalStockCount} item(ns) estão no limite ou abaixo da cota mínima de segurança.`,
        link: "/admin/estoque",
      });
    }

    if (leads.length > 0) {
      const openLeadsWithoutValue = leads.filter((l) => !l.estimatedValue && !l.isCompleted).length;
      if (openLeadsWithoutValue > 0) {
        alerts.push({
          id: "alert-leads-no-val",
          type: "info",
          title: "Orçamentos Pendentes",
          description: `${openLeadsWithoutValue} oportunidade(s) no funil aguardando valor estimado.`,
          link: "/admin/kanban",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        finance: {
          totalInvoiced,
          totalPaid,
          totalPending,
          totalOverdue,
          paidRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
        },
        crm: {
          totalLeads: leads.length,
          totalPipelineValue,
          avgTicket,
          conversionRate,
          leadsByColumn,
        },
        production: {
          totalServiceOrders: serviceOrders.length,
          activeServiceOrdersCount,
          totalServiceOrdersValue,
          ordersByStage,
          productionColumns: productionColumns.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            order: c.order,
            count: c._count.serviceOrders,
          })),
        },
        stock: {
          totalItems: stockItems.length,
          totalStockValue,
          criticalStockCount,
          stockCategories,
          criticalItems,
        },
        base: {
          customersCount,
        },
      },
      data: {
        recentLeads: leads.slice(0, 6).map((l) => ({
          id: l.id,
          title: l.title,
          estimatedValue: Number(l.estimatedValue) || 0,
          contactName: l.contactName,
          contactPhone: l.contactPhone,
          columnName: l.column?.name || "Sem Coluna",
          columnColor: l.column?.color || "#FF650F",
          source: l.source,
          priority: l.priority,
          createdAt: l.createdAt,
          dueDate: l.dueDate,
        })),
        recentServiceOrders: formattedServiceOrders.slice(0, 6),
        upcomingAppointments: appointments.map((a) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          status: a.status,
          scheduledAt: a.scheduledAt,
          customerName:
            a.customer?.tradeName || a.customer?.companyName || a.customer?.fullName || "Cliente",
          locationAddress: a.locationAddress,
          assignedTeam: a.assignedTeam,
        })),
        alerts,
      },
    });
  } catch (error) {
    console.error("Erro ao agregar dados do dashboard admin:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar métricas do dashboard." },
      { status: 500 }
    );
  }
}
