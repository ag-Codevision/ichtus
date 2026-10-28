"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Boxes,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Receipt,
  Building2,
  CreditCard,
  X,
  RefreshCw,
  PackageCheck,
  CheckCheck,
} from "lucide-react";

interface PurchaseItem {
  id: string;
  leadId: string;
  stockItemId: string | null;
  name: string;
  unit: string;
  quantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  actualUnitCost: number | null;
  actualTotalCost: number | null;
  status: "PENDING" | "PURCHASED" | "CANCELLED";
  purchasedAt: string | null;
  purchasedBy: string | null;
  supplierName: string | null;
  paymentMethod: string | null;
  notes: string | null;
  financialTransactionId: string | null;
  createdAt: string;
  stockItem?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    currentQuantity: number;
  } | null;
}

interface ServiceGroup {
  leadId: string;
  budgetCode: string | null;
  title: string;
  dueDate: string | null;
  priority: string;
  column: { id: string; name: string; color: string | null };
  customer: {
    id: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  } | null;
  category: { id: string; name: string; color: string | null } | null;
  subcategory: { id: string; name: string } | null;
  totalItems: number;
  pendingItems: number;
  purchasedItems: number;
  progressPercent: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  items: PurchaseItem[];
}

interface KPIs {
  totalPendingServices: number;
  totalPendingItems: number;
  totalEstimatedToSpend: number;
  totalSpentThisMonth: number;
}

export default function ComprasAdminPage() {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalPendingServices: 0,
    totalPendingItems: 0,
    totalEstimatedToSpend: 0,
    totalSpentThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros avançados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PURCHASED">("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Modal de Baixa de Compra Individual
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: PurchaseItem;
    serviceTitle: string;
    budgetCode: string | null;
  } | null>(null);
  const [actualUnitCost, setActualUnitCost] = useState("");
  const [actualTotalCost, setActualTotalCost] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [bankAccount, setBankAccount] = useState("Caixa Geral");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [purchasedBy, setPurchasedBy] = useState("Equipe Compras");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [submittingBuy, setSubmittingBuy] = useState(false);

  // Modal de Baixa em Lote por Serviço
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedServiceForBatch, setSelectedServiceForBatch] = useState<ServiceGroup | null>(null);
  const [submittingBatch, setSubmittingBatch] = useState(false);

  const fetchPurchases = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (dateRangeFilter !== "all") params.append("dateRange", dateRangeFilter);

      const res = await fetch(`/api/v1/purchases?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups || []);
        setKpis(data.kpis || {
          totalPendingServices: 0,
          totalPendingItems: 0,
          totalEstimatedToSpend: 0,
          totalSpentThisMonth: 0,
        });

        // Expandir por padrão grupos que possuem itens pendentes
        const initialExpanded: Record<string, boolean> = {};
        (data.groups || []).forEach((g: ServiceGroup) => {
          initialExpanded[g.leadId] = g.pendingItems > 0 || (initialExpanded[g.leadId] ?? true);
        });
        setExpandedGroups((prev) => ({ ...initialExpanded, ...prev }));
      }
    } catch (err) {
      console.error("Erro ao carregar compras:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [statusFilter, dateRangeFilter]);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchases();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleGroupExpand = (leadId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  const openBuyModal = (item: PurchaseItem, group: ServiceGroup) => {
    setSelectedItem({
      item,
      serviceTitle: group.title,
      budgetCode: group.budgetCode,
    });
    const estUnit = Number(item.estimatedUnitCost) || 0;
    const estTotal = Number(item.estimatedTotalCost) || estUnit * Number(item.quantity);
    setActualUnitCost(estUnit > 0 ? estUnit.toString() : "");
    setActualTotalCost(estTotal > 0 ? estTotal.toString() : "");
    setSupplierName(item.supplierName || item.stockItem?.category || "");
    setPaymentMethod(item.paymentMethod || "PIX");
    setBankAccount("Caixa Geral");
    // Formata datetime local
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setPurchasedAt(localISOTime);
    setPurchasedBy("Equipe Compras");
    setPurchaseNotes(item.notes || "");
    setBuyModalOpen(true);
  };

  const handleUnitCostChange = (val: string) => {
    setActualUnitCost(val);
    const num = parseFloat(val);
    if (!isNaN(num) && selectedItem) {
      const total = num * Number(selectedItem.item.quantity);
      setActualTotalCost(total.toFixed(2));
    }
  };

  const handleConfirmBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmittingBuy(true);
      const res = await fetch(`/api/v1/purchases/${selectedItem.item.id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualUnitCost: parseFloat(actualUnitCost) || 0,
          actualTotalCost: parseFloat(actualTotalCost) || 0,
          supplierName: supplierName.trim(),
          paymentMethod,
          bankAccount,
          purchasedAt: purchasedAt ? new Date(purchasedAt).toISOString() : new Date().toISOString(),
          purchasedBy,
          notes: purchaseNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBuyModalOpen(false);
        fetchPurchases();
      } else {
        alert(data.error || "Erro ao dar baixa na compra.");
      }
    } catch (err: any) {
      console.error("Erro ao registrar baixa:", err);
      alert("Falha de conexão ao registrar baixa.");
    } finally {
      setSubmittingBuy(false);
    }
  };

  const openBatchBuyModal = (group: ServiceGroup) => {
    setSelectedServiceForBatch(group);
    setSupplierName("");
    setPaymentMethod("PIX");
    setBankAccount("Caixa Geral");
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setPurchasedAt(localISOTime);
    setPurchasedBy("Equipe Compras");
    setBatchModalOpen(true);
  };

  const handleConfirmBatchBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForBatch) return;

    const pendingItemIds = selectedServiceForBatch.items
      .filter((i) => i.status === "PENDING")
      .map((i) => i.id);

    if (pendingItemIds.length === 0) {
      alert("Não há itens pendentes para este serviço.");
      setBatchModalOpen(false);
      return;
    }

    try {
      setSubmittingBatch(true);
      const res = await fetch("/api/v1/purchases/batch-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: pendingItemIds,
          supplierName: supplierName.trim(),
          paymentMethod,
          bankAccount,
          purchasedAt: purchasedAt ? new Date(purchasedAt).toISOString() : new Date().toISOString(),
          purchasedBy,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBatchModalOpen(false);
        fetchPurchases();
      } else {
        alert(data.error || "Erro ao dar baixa em lote.");
      }
    } catch (err) {
      console.error("Erro na baixa em lote:", err);
      alert("Falha de conexão ao registrar baixa em lote.");
    } finally {
      setSubmittingBatch(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho da Página - Padrão M3 Expressive Card Adaptável */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-2xl bg-[#FF650F]/10 text-[#FF650F] border border-[#FF650F]/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-[#FF650F]/10 px-3 py-1 rounded-full border border-[#FF650F]/20">
              Integrado ao Estoque & Financeiro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Compras & Suprimentos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Acompanhe insumos deficitários gerados automaticamente pelos cartões de serviço. Dê baixa no mundo real para registrar despesas no fluxo financeiro.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPurchases}
            disabled={refreshing}
            className="border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs gap-1.5 h-10 px-4 rounded-full font-semibold transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin text-[#FF650F]" : "text-zinc-500 dark:text-zinc-400"}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* 4 Cards de Métricas - M3 Expressive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Serviços Pendentes */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between h-full group hover:border-amber-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Serviços Pendentes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
              {kpis.totalPendingServices}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
              com materiais a comprar
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Insumos a Comprar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between h-full group hover:border-cyan-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Insumos a Comprar
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
              {kpis.totalPendingItems}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
              itens físicos faltantes
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Previsão Total a Gastar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between h-full group hover:border-[#FF650F]/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Previsão a Gastar
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#FF650F] mt-1">
              {formatCurrency(kpis.totalEstimatedToSpend)}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
              custo previsto dos pendentes
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FF650F]/10 text-[#FF650F] flex items-center justify-center shrink-0 border border-[#FF650F]/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Total Gasto no Mês */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between h-full group hover:border-emerald-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Gasto no Mês
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(kpis.totalSpentThisMonth)}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
              lançado no DRE/Caixa
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros Avançados */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Busca Textual Global */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por serviço, código de orçamento [3000...], cliente ou material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF650F] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros em Abas / Seletores */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status da Compra */}
            <div className="flex items-center bg-zinc-100 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl p-1 text-xs">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                  statusFilter === "ALL"
                    ? "bg-[#FF650F] text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                  statusFilter === "PENDING"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter("PURCHASED")}
                className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                  statusFilter === "PURCHASED"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Comprados
              </button>
            </div>

            {/* Prazo de Entrega */}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF650F] transition-all"
            >
              <option value="all">Todo o Período</option>
              <option value="today">Entrega Hoje</option>
              <option value="week">Entrega Esta Semana</option>
              <option value="month">Entrega Este Mês</option>
              <option value="overdue">⚠️ Prazo Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Serviços com Compras Agrupadas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 dark:text-zinc-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#FF650F]" />
          <p className="text-sm">Carregando compras e suprimentos dos serviços...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm text-center space-y-4 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-[#FF650F]/10 border border-[#FF650F]/20 text-[#FF650F] flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Nenhuma compra encontrada</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {searchTerm || statusFilter !== "ALL" || dateRangeFilter !== "all"
              ? "Nenhum resultado corresponde aos filtros selecionados. Tente ajustar a busca."
              : "Quando você adicionar materiais e insumos que faltam no estoque em um card de serviço (CRM/Kanban), eles aparecerão organizados aqui automaticamente."}
          </p>
          {(searchTerm || statusFilter !== "ALL" || dateRangeFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setDateRangeFilter("all");
              }}
              className="border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isExpanded = expandedGroups[group.leadId] ?? true;
            const clientDisplayName =
              group.customer?.tradeName ||
              group.customer?.fullName ||
              group.customer?.companyName ||
              "Cliente não identificado";

            return (
              <div
                key={group.leadId}
                className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Header do Card de Serviço */}
                <div
                  onClick={() => toggleGroupExpand(group.leadId)}
                  className="p-4 sm:p-5 cursor-pointer bg-zinc-50/50 dark:bg-white/[0.02] hover:bg-zinc-100/60 dark:hover:bg-white/[0.04] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/5"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors mt-0.5 sm:mt-0"
                      aria-label="Expandir ou recolher"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#FF650F]" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {group.budgetCode && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FF650F]/15 text-[#FF650F] border border-[#FF650F]/30">
                            [{group.budgetCode}]
                          </span>
                        )}
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white hover:text-[#FF650F] transition-colors">
                          {group.title}
                        </h3>
                        {group.category && (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-semibold"
                            style={{
                              borderColor: group.category.color || "#FF650F",
                              color: group.category.color || "#FF650F",
                            }}
                          >
                            {group.category.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          {clientDisplayName}
                        </span>

                        {group.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            Prazo: {new Date(group.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          Etapa:{" "}
                          <span className="text-zinc-900 dark:text-zinc-200 font-bold">
                            {group.column?.name || "Kanban"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Barra de Progresso + Custos + Ação */}
                  <div
                    className="flex flex-wrap items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Barra de Progresso */}
                    <div className="min-w-[160px] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Progresso ({group.purchasedItems}/{group.totalItems})
                        </span>
                        <span
                          className={`font-bold ${
                            group.progressPercent === 100
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-[#FF650F]"
                          }`}
                        >
                          {group.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-black/50 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            group.progressPercent === 100
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-amber-500 to-[#FF650F]"
                          }`}
                          style={{ width: `${group.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Custos */}
                    <div className="text-right text-xs space-y-0.5">
                      {group.pendingItems > 0 && (
                        <div className="text-amber-600 dark:text-amber-400 font-bold">
                          A comprar: {formatCurrency(group.totalEstimatedCost)}
                        </div>
                      )}
                      {group.totalActualCost > 0 && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Gasto real: {formatCurrency(group.totalActualCost)}
                        </div>
                      )}
                    </div>

                    {/* Botão Baixa em Lote */}
                    {group.pendingItems > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openBatchBuyModal(group)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 rounded-full shadow-sm font-semibold"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1" />
                        Comprar Todos ({group.pendingItems})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabela de Insumos */}
                {isExpanded && (
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/[0.06] dark:border-white/5 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Material / Insumo</th>
                          <th className="py-2.5 px-3">Quantidade</th>
                          <th className="py-2.5 px-3">Est. Unitário</th>
                          <th className="py-2.5 px-3">Previsão Total</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Detalhes da Compra / Financeiro</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                        {group.items.map((item) => {
                          const isPending = item.status === "PENDING";
                          const isPurchased = item.status === "PURCHASED";

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors ${
                                isPurchased ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02]" : ""
                              }`}
                            >
                              {/* Nome */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-zinc-900 dark:text-white">{item.name}</div>
                                {item.stockItem ? (
                                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">Estoque:</span> SKU:{" "}
                                    {item.stockItem.sku} | Saldo:{" "}
                                    {Number(item.stockItem.currentQuantity)} {item.unit}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-zinc-500 mt-0.5">
                                    Insumo avulso para este projeto
                                  </div>
                                )}
                              </td>

                              {/* Quantidade */}
                              <td className="py-3 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">
                                {Number(item.quantity)} {item.unit}
                              </td>

                              {/* Estimado Unitário */}
                              <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                                {formatCurrency(Number(item.estimatedUnitCost) || 0)}
                              </td>

                              {/* Previsão Total */}
                              <td className="py-3 px-3 font-semibold text-zinc-800 dark:text-zinc-300">
                                {formatCurrency(Number(item.estimatedTotalCost) || 0)}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3">
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                    <Clock className="w-3 h-3" /> A Comprar
                                  </span>
                                )}
                                {isPurchased && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> Comprado
                                  </span>
                                )}
                              </td>

                              {/* Detalhes Financeiros */}
                              <td className="py-3 px-3">
                                {isPurchased ? (
                                  <div className="space-y-0.5 text-[11px]">
                                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                                      Pago: {formatCurrency(Number(item.actualTotalCost) || 0)}{" "}
                                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                                        ({formatCurrency(Number(item.actualUnitCost) || 0)}/
                                        {item.unit})
                                      </span>
                                    </div>
                                    <div className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-zinc-400" />
                                      {item.purchasedAt
                                        ? new Date(item.purchasedAt).toLocaleString("pt-BR")
                                        : "Data não registrada"}
                                    </div>
                                    {item.supplierName && (
                                      <div className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-zinc-400" />
                                        Fornecedor: {item.supplierName}
                                      </div>
                                    )}
                                    {item.paymentMethod && (
                                      <div className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                        <CreditCard className="w-3 h-3 text-zinc-400" />
                                        Forma: {item.paymentMethod}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 dark:text-zinc-500 text-[11px] italic">
                                    Aguardando compra no mundo real
                                  </span>
                                )}
                              </td>

                              {/* Ação */}
                              <td className="py-3 px-3 text-right">
                                {isPending ? (
                                  <Button
                                    size="sm"
                                    onClick={() => openBuyModal(item, group)}
                                    className="bg-[#FF650F] hover:bg-[#e05509] text-white text-xs h-7 px-3 rounded-full font-semibold shadow-xs"
                                  >
                                    Dar Baixa
                                  </Button>
                                ) : (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Baixado
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Baixa de Compra Individual */}
      {buyModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            {/* Header Modal */}
            <div className="p-5 border-b border-black/[0.06] dark:border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-[#FF650F]/10 text-[#FF650F]">
                    <ShoppingCart className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Dar Baixa na Compra</h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Serviço: <span className="text-zinc-900 dark:text-white font-semibold">{selectedItem.serviceTitle}</span>
                  {selectedItem.budgetCode && ` [${selectedItem.budgetCode}]`}
                </p>
              </div>
              <button
                onClick={() => setBuyModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBuy} className="p-5 space-y-4 text-xs">
              {/* Item em destaque */}
              <div className="p-3.5 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-white">{selectedItem.item.name}</div>
                  <div className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Quantidade a comprar:{" "}
                    <span className="text-zinc-900 dark:text-white font-bold">
                      {Number(selectedItem.item.quantity)} {selectedItem.item.unit}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-semibold">
                  Pendente
                </Badge>
              </div>

              {/* Valores Pagos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Valor Unitário Real (R$)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualUnitCost}
                    onChange={(e) => handleUnitCostChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Valor Total Pago (R$)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualTotalCost}
                    onChange={(e) => setActualTotalCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-[#FF650F] font-black focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Fornecedor e Forma de Pagamento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Fornecedor / Loja</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Ex: Alumínios Paraná, Tintas Silva..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Forma de Pagamento*</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="BANK_TRANSFER">Transferência (TED/DOC)</option>
                    <option value="CASH">Dinheiro em Espécie</option>
                  </select>
                </div>
              </div>

              {/* Data/Horário e Conta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Data e Horário da Compra*</label>
                  <input
                    type="datetime-local"
                    required
                    value={purchasedAt}
                    onChange={(e) => setPurchasedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Conta / Caixa de Origem</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Ex: Caixa Geral, Conta Itaú..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Responsável e Observações */}
              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Quem realizou a compra?</label>
                <input
                  type="text"
                  value={purchasedBy}
                  onChange={(e) => setPurchasedBy(e.target.value)}
                  placeholder="Nome do responsável pela compra"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Alerta de Integração Financeira */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                <Receipt className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Ao confirmar, uma despesa será <strong>automaticamente criada no módulo Financeiro (DRE/Caixa)</strong> com o valor real gasto, data, horário e descrição vinculada a este serviço.
                </p>
              </div>

              {/* Footer Modal */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBuyModalOpen(false)}
                  disabled={submittingBuy}
                  className="border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingBuy}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-sm"
                >
                  {submittingBuy ? "Registrando e Lançando..." : "Confirmar Compra & Lançar no Financeiro"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Baixa em Lote por Serviço */}
      {batchModalOpen && selectedServiceForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="p-5 border-b border-black/[0.06] dark:border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCheck className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Comprar Todos os Insumos</h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Baixa em lote de {selectedServiceForBatch.pendingItems} insumos para:{" "}
                  <span className="text-zinc-900 dark:text-white font-semibold">{selectedServiceForBatch.title}</span>
                </p>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBatchBuy} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl space-y-2">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold">Itens a serem baixados nesta operação:</span>
                <ul className="space-y-1">
                  {selectedServiceForBatch.items
                    .filter((i) => i.status === "PENDING")
                    .map((item) => (
                      <li key={item.id} className="text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                        <span>• {item.name} ({Number(item.quantity)} {item.unit})</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {formatCurrency(Number(item.estimatedTotalCost) || 0)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Fornecedor / Loja</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Ex: Fornecedor Central"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="BANK_TRANSFER">Transferência</option>
                    <option value="CASH">Dinheiro em Espécie</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Data e Horário</label>
                  <input
                    type="datetime-local"
                    value={purchasedAt}
                    onChange={(e) => setPurchasedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold">Conta / Caixa</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                <Receipt className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Cada item gerará uma transação de despesa discriminada no financeiro vinculada a este serviço.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBatchModalOpen(false)}
                  disabled={submittingBatch}
                  className="border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingBatch}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-sm"
                >
                  {submittingBatch ? "Baixando Itens..." : "Confirmar Baixa de Todos"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
