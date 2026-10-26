"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  Calendar,
  Layers,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Factory,
  Briefcase,
  Zap,
  RefreshCw,
  Phone,
  UserCheck,
  Plus,
} from "lucide-react";

import { SegmentedButton } from "@/components/ui/segmented-button";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";
import { formatCurrency, formatDate } from "@/lib/utils";

import { SalesFunnelChart } from "@/components/admin/dashboard/SalesFunnelChart";
import { StockDonutChart } from "@/components/admin/dashboard/StockDonutChart";
import { FactoryPipelineChart } from "@/components/admin/dashboard/FactoryPipelineChart";
import { FinancialFlowChart } from "@/components/admin/dashboard/FinancialFlowChart";

interface DashboardData {
  kpis: {
    finance: {
      totalInvoiced: number;
      totalPaid: number;
      totalPending: number;
      totalOverdue: number;
      paidRate: number;
    };
    crm: {
      totalLeads: number;
      totalPipelineValue: number;
      avgTicket: number;
      conversionRate: number;
      leadsByColumn: Array<{
        id: string;
        name: string;
        color: string;
        order: number;
        count: number;
        totalValue: number;
      }>;
    };
    production: {
      totalServiceOrders: number;
      activeServiceOrdersCount: number;
      totalServiceOrdersValue: number;
      ordersByStage: Record<string, number>;
      productionColumns: Array<{
        id: string;
        name: string;
        color: string;
        order: number;
        count: number;
      }>;
    };
    stock: {
      totalItems: number;
      totalStockValue: number;
      criticalStockCount: number;
      stockCategories: Array<{
        category: string;
        count: number;
        totalQuantity: number;
        totalValue: number;
      }>;
      criticalItems: Array<{
        id: string;
        name: string;
        sku: string;
        category: string;
        currentQuantity: number;
        minQuantity: number;
        unit: string;
      }>;
    };
    base: {
      customersCount: number;
    };
  };
  data: {
    recentLeads: Array<{
      id: string;
      title: string;
      estimatedValue: number;
      contactName: string;
      contactPhone: string;
      columnName: string;
      columnColor: string;
      source: string;
      priority: string;
      createdAt: string;
      dueDate: string | null;
    }>;
    recentServiceOrders: Array<{
      id: string;
      code: string;
      title: string;
      customerName: string;
      currentStage: string;
      stageLabel: string;
      progressPercent: number;
      priority: string;
      totalAmount: number;
      deadline: string | null;
      installationDate: string | null;
      createdAt: string;
      itemsCount: number;
    }>;
    upcomingAppointments: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      scheduledAt: string;
      customerName: string;
      locationAddress: string | null;
      assignedTeam: string | null;
    }>;
    alerts: Array<{
      id: string;
      type: "warning" | "info" | "success" | "danger";
      title: string;
      description: string;
      link?: string;
    }>;
  };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "business" | "factory" | "stock">("all");
  const [activityTab, setActivityTab] = useState<"leads" | "orders" | "agenda">("leads");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/v1/admin/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setDashboard(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Falha ao carregar dashboard admin:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = dashboard?.kpis;
  const data = dashboard?.data;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Central de Comando
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Gestão operacional, vendas e linha fabril CNC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            title="Atualizar dados agora"
            className="p-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 transition-colors border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-glessios-orange" : ""}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <SegmentedButton<"all" | "business" | "factory" | "stock">
            value={activeTab}
            onChange={setActiveTab}
            layoutId="admin-dashboard-tabs"
            options={[
              { value: "all", label: "Geral" },
              { value: "business", label: "Comercial" },
              { value: "factory", label: "Fábrica" },
              { value: "stock", label: "Estoque" },
            ]}
          />
        </div>
      </div>

      {data?.alerts && data.alerts.length > 0 && (
        <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold truncate">{data.alerts[0].description}</span>
          </div>
          {data.alerts[0].link && (
            <Link
              href={data.alerts[0].link}
              className="font-bold underline hover:opacity-80 shrink-0 ml-2"
            >
              Resolver
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Faturamento
            </span>
            <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-glessios-orange flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono block">
              {loading ? "..." : formatCurrency(kpis?.finance.totalInvoiced || 0)}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              {formatCurrency(kpis?.finance.totalPending || 0)} a receber
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Funil Comercial
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Kanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white block">
              {loading ? "..." : `${kpis?.crm.totalLeads || 0} Leads`}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              Pipeline {formatCurrency(kpis?.crm.totalPipelineValue || 0)}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Linha Fabril
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white block">
              {loading ? "..." : `${kpis?.production.activeServiceOrdersCount || 0} Ativas`}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
              Router CNC & UV operando
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Estoque Ativo
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono block">
              {loading ? "..." : formatCurrency(kpis?.stock.totalStockValue || 0)}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              {kpis?.stock.totalItems || 0} insumos em almoxarifado
            </span>
          </div>
        </div>
      </div>

      <M3TabPanel activeKey={activeTab}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {(activeTab === "all" || activeTab === "business") && (
            <SalesFunnelChart
              columns={kpis?.crm.leadsByColumn || []}
              totalLeads={kpis?.crm.totalLeads || 0}
              totalPipelineValue={kpis?.crm.totalPipelineValue || 0}
              conversionRate={kpis?.crm.conversionRate || 0}
            />
          )}

          {(activeTab === "all" || activeTab === "business") && (
            <FinancialFlowChart
              totalInvoiced={kpis?.finance.totalInvoiced || 0}
              totalPaid={kpis?.finance.totalPaid || 0}
              totalPending={kpis?.finance.totalPending || 0}
              totalOverdue={kpis?.finance.totalOverdue || 0}
              pipelineValue={kpis?.crm.totalPipelineValue || 0}
              stockValue={kpis?.stock.totalStockValue || 0}
            />
          )}

          {(activeTab === "all" || activeTab === "factory") && (
            <FactoryPipelineChart
              productionColumns={kpis?.production.productionColumns || []}
              totalActiveOS={kpis?.production.activeServiceOrdersCount || 0}
              ordersByStage={kpis?.production.ordersByStage || {}}
            />
          )}

          {(activeTab === "all" || activeTab === "stock") && (
            <StockDonutChart
              categories={kpis?.stock.stockCategories || []}
              totalStockValue={kpis?.stock.totalStockValue || 0}
              totalItems={kpis?.stock.totalItems || 0}
              criticalStockCount={kpis?.stock.criticalStockCount || 0}
            />
          )}
        </div>
      </M3TabPanel>

      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              Visão Rápida de Atividades
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActivityTab("leads")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activityTab === "leads"
                  ? "bg-white dark:bg-[#25262D] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Leads do Funil ({data?.recentLeads?.length || 0})
            </button>
            <button
              onClick={() => setActivityTab("orders")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activityTab === "orders"
                  ? "bg-white dark:bg-[#25262D] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Ordens em Fábrica ({data?.recentServiceOrders?.length || 0})
            </button>
            <button
              onClick={() => setActivityTab("agenda")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activityTab === "agenda"
                  ? "bg-white dark:bg-[#25262D] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Agenda ({data?.upcomingAppointments?.length || 0})
            </button>
          </div>
        </div>

        <div>
          {activityTab === "leads" && (
            <div className="space-y-2">
              {data?.recentLeads && data.recentLeads.length > 0 ? (
                data.recentLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-2xl bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {lead.title}
                          </h4>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                            style={{
                              backgroundColor: `${lead.columnColor}15`,
                              color: lead.columnColor,
                              borderColor: `${lead.columnColor}30`,
                            }}
                          >
                            {lead.columnName}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                          {lead.contactName} {lead.contactPhone ? `• ${lead.contactPhone}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white font-mono block">
                        {lead.estimatedValue > 0 ? formatCurrency(lead.estimatedValue) : "Sob cotação"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400">
                  Nenhum lead no funil atualmente.
                </div>
              )}

              <div className="pt-2 text-right">
                <Link
                  href="/admin/kanban"
                  className="text-xs font-bold text-glessios-orange hover:underline inline-flex items-center gap-1"
                >
                  Abrir Kanban Completo
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activityTab === "orders" && (
            <div className="space-y-2">
              {data?.recentServiceOrders && data.recentServiceOrders.length > 0 ? (
                data.recentServiceOrders.slice(0, 4).map((os) => (
                  <div
                    key={os.id}
                    className="p-3 rounded-2xl bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {os.code}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {os.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                        {os.customerName} • {os.stageLabel}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white font-mono block">
                        {formatCurrency(os.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {os.progressPercent}% avanço
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400">
                  Nenhuma ordem de serviço ativa no momento.
                </div>
              )}

              <div className="pt-2 text-right">
                <Link
                  href="/admin/producao"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  Abrir Linha de Produção
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activityTab === "agenda" && (
            <div className="space-y-2">
              {data?.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-2xl bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {apt.title}
                      </h4>
                      <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                        {apt.customerName} {apt.locationAddress ? `• ${apt.locationAddress}` : ""}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block font-mono">
                        {formatDate(apt.scheduledAt)}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400">
                  Nenhum agendamento futuro no calendário.
                </div>
              )}

              <div className="pt-2 text-right">
                <Link
                  href="/admin/agendamentos"
                  className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  Ver Calendário Completo
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
