"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Layers,
  History,
  X,
  CheckCircle2,
  Boxes,
  MapPin,
  TrendingUp,
  Sparkles,
  FileText,
} from "lucide-react";

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minQuantity: number;
  averageUnitCost: number;
  totalInventoryValue: number;
  supplier: string | null;
  location: string | null;
  isLowStock: boolean;
  isCritical: boolean;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes: string | null;
  createdAt: string;
  stockItem: { name: string; sku: string; unit: string; category: string };
  user: { name: string };
  serviceOrder?: { code: string; title: string } | null;
}

export default function EstoqueAdminPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [kpis, setKpis] = useState({
    totalSkus: 0,
    totalInventoryValue: 0,
    totalLowStock: 0,
    totalCritical: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de modais
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<StockItem | null>(null);
  const [movementType, setMovementType] = useState<"PURCHASE_ENTRY" | "PRODUCTION_CONSUMPTION" | "MANUAL_ADJUSTMENT">("PURCHASE_ENTRY");
  const [movementQty, setMovementQty] = useState("");
  const [movementCost, setMovementCost] = useState("");
  const [movementNotes, setMovementNotes] = useState("");
  const [submittingMovement, setSubmittingMovement] = useState(false);

  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [movementsHistory, setMovementsHistory] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Formulário de novo insumo
  const [newItemForm, setNewItemForm] = useState({
    sku: "",
    name: "",
    category: "Chapas",
    unit: "M2",
    currentQuantity: "",
    minQuantity: "",
    averageUnitCost: "",
    supplier: "",
    location: "",
  });
  const [submittingItem, setSubmittingItem] = useState(false);

  // Carrega insumos do backend
  const fetchStock = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      if (lowStockOnly) params.append("lowStock", "true");

      const res = await fetch(`/api/v1/stock/materials?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setKpis(data.kpis);
        if (data.categories?.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar estoque:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedCategory, lowStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock();
  };

  // Abre modal de movimentação rápida para um insumo
  const openMovementFor = (item: StockItem, type: "PURCHASE_ENTRY" | "PRODUCTION_CONSUMPTION") => {
    setSelectedItemForMovement(item);
    setMovementType(type);
    setMovementQty("");
    setMovementCost(item.averageUnitCost.toString());
    setMovementNotes("");
    setMovementModalOpen(true);
  };

  // Submete lançamento de movimentação
  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement || !movementQty || Number(movementQty) <= 0) return;

    try {
      setSubmittingMovement(true);
      const res = await fetch("/api/v1/stock/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockItemId: selectedItemForMovement.id,
          type: movementType,
          quantity: Number(movementQty),
          unitCost: movementCost ? Number(movementCost) : undefined,
          notes: movementNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMovementModalOpen(false);
        fetchStock();
      } else {
        alert(data.error || "Erro ao registrar movimentação");
      }
    } catch (err) {
      console.error("Erro ao salvar movimentação:", err);
    } finally {
      setSubmittingMovement(false);
    }
  };

  // Submete cadastro de novo insumo
  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.sku || !newItemForm.name) return;

    try {
      setSubmittingItem(true);
      const res = await fetch("/api/v1/stock/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemForm),
      });

      const data = await res.json();
      if (data.success) {
        setNewItemModalOpen(false);
        setNewItemForm({
          sku: "",
          name: "",
          category: "Chapas",
          unit: "M2",
          currentQuantity: "",
          minQuantity: "",
          averageUnitCost: "",
          supplier: "",
          location: "",
        });
        fetchStock();
      } else {
        alert(data.error || "Erro ao cadastrar insumo");
      }
    } catch (err) {
      console.error("Erro ao cadastrar insumo:", err);
    } finally {
      setSubmittingItem(false);
    }
  };

  // Abre histórico de movimentações
  const openHistory = async () => {
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/v1/stock/movements?limit=40");
      const data = await res.json();
      if (data.success) {
        setMovementsHistory(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/10 px-2.5 py-0.5 rounded-full border border-glessios-border-orange">
                Almoxarifado & Insumos Fabris
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Controle de Estoque & Matéria-Prima
            </h1>
            <p className="text-sm text-glessios-text-body mt-1">
              Gerencie chapas de ACM, acrílicos, lonas, módulos LED, fontes e ferragens para a linha de produção.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={openHistory}
              className="border-glessios-border-dark bg-glessios-graphite hover:bg-white/[0.05] text-white text-xs gap-1.5 h-10 px-4 rounded-xl"
            >
              <History className="w-4 h-4 text-glessios-text-body" />
              Histórico de Movimentações
            </Button>
            <Button
              onClick={() => setNewItemModalOpen(true)}
              className="bg-orange-gradient hover:opacity-95 text-white font-semibold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-orange-glow"
            >
              <Plus className="w-4 h-4" />
              Novo Insumo
            </Button>
          </div>
        </div>

        {/* 4 Cards de Métricas de Topo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Valor Total Imobilizado
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {formatCurrency(kpis.totalInventoryValue)}
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Custo médio contábil do galpão
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-glessios-orange">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Total de SKUs Ativos
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {kpis.totalSkus} itens
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Distribuídos em {categories.length || 5} categorias fabris
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-blue-400">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Alerta de Reposição
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {kpis.totalLowStock} insumos
              </div>
              <span className="text-[11px] text-amber-500/80 mt-0.5 block">
                Saldo igual ou inferior ao estoque mínimo
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Nível Crítico Fabril
              </span>
              <div className="text-2xl font-black text-red-400 mt-1">
                {kpis.totalCritical} insumos
              </div>
              <span className="text-[11px] text-red-500/80 mt-0.5 block">
                Abaixo de 50% do estoque de segurança
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-glessios-graphite p-4 rounded-2xl border border-glessios-border-dark mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categorias em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === "ALL"
                  ? "bg-glessios-orange text-white"
                  : "bg-glessios-charcoal text-glessios-text-body hover:text-white"
              }`}
            >
              Todas as Categorias
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-glessios-orange text-white"
                    : "bg-glessios-charcoal text-glessios-text-body hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Busca e Toggle de Estoque Baixo */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-glessios-text-body hover:text-white select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-glessios-border-dark bg-glessios-charcoal text-glessios-orange focus:ring-glessios-orange focus:ring-offset-0"
              />
              Apenas Estoque Baixo
            </label>

            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-glessios-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por SKU, insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-glessios-text-muted focus:border-glessios-orange focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* Tabela de Insumos */}
        <div className="bg-glessios-graphite rounded-2xl border border-glessios-border-dark overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-glessios-text-muted text-sm">
              Carregando dados do almoxarifado...
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-12 h-12 text-glessios-text-muted mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-white">Nenhum insumo encontrado</h3>
              <p className="text-xs text-glessios-text-body mt-1">
                Tente ajustar os filtros ou cadastre um novo material para a fábrica.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glessios-border-dark bg-white/[0.02] text-glessios-text-body uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">SKU / Insumo</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Localização / Fornecedor</th>
                    <th className="py-3 px-4 w-52">Nível de Saldo Físico</th>
                    <th className="py-3 px-4 text-right">Custo Médio</th>
                    <th className="py-3 px-4 text-right">Valor em Estoque</th>
                    <th className="py-3 px-4 text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glessios-border-dark">
                  {items.map((item) => {
                    const ratio = item.minQuantity > 0 ? (item.currentQuantity / item.minQuantity) * 100 : 100;
                    const barColor =
                      item.currentQuantity <= item.minQuantity * 0.5
                        ? "bg-red-500"
                        : item.currentQuantity <= item.minQuantity
                        ? "bg-amber-500"
                        : "bg-emerald-500";

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* SKU e Nome */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] text-glessios-orange font-bold">
                              {item.sku}
                            </span>
                            <span className="font-bold text-white text-sm mt-0.5">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-glessios-text-body text-[10px]">
                            {item.category}
                          </Badge>
                        </td>

                        {/* Localização e Fornecedor */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            {item.location && (
                              <span className="flex items-center gap-1 text-[11px] text-glessios-ivory font-medium">
                                <MapPin className="w-3 h-3 text-glessios-orange" />
                                {item.location}
                              </span>
                            )}
                            <span className="text-[10px] text-glessios-text-muted">
                              {item.supplier || "Fornecedor não informado"}
                            </span>
                          </div>
                        </td>

                        {/* Barra de Progresso e Saldo */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-white">
                                {item.currentQuantity} <span className="text-glessios-text-muted font-normal">{item.unit}</span>
                              </span>
                              <span className="text-[10px] text-glessios-text-muted">
                                Mín: {item.minQuantity} {item.unit}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-glessios-charcoal rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barColor} rounded-full transition-all`}
                                style={{ width: `${Math.min(100, Math.max(8, ratio))}%` }}
                              />
                            </div>
                            {item.isLowStock && (
                              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Reposição urgente recomendada
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Custo Unitário Médio */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-glessios-text-body">
                          {formatCurrency(item.averageUnitCost)}
                          <span className="text-[10px] text-glessios-text-muted block">por {item.unit}</span>
                        </td>

                        {/* Valor Total em Estoque */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(item.totalInventoryValue)}
                        </td>

                        {/* Ações Rápidas */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openMovementFor(item, "PURCHASE_ENTRY")}
                              title="Registrar Entrada de Compra"
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Entrada
                            </button>
                            <button
                              onClick={() => openMovementFor(item, "PRODUCTION_CONSUMPTION")}
                              title="Registrar Baixa Fabril (Consumo OS)"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              Baixa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal de Movimentação Rápida */}
      {movementModalOpen && selectedItemForMovement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setMovementModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-glessios-orange font-bold">
                {selectedItemForMovement.sku}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Lançar Movimentação de Estoque
            </h3>
            <p className="text-xs text-glessios-text-body mb-5">
              {selectedItemForMovement.name} (Saldo atual: {selectedItemForMovement.currentQuantity} {selectedItemForMovement.unit})
            </p>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              {/* Tipo de Movimentação */}
              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1.5">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType("PURCHASE_ENTRY")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      movementType === "PURCHASE_ENTRY"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-glessios-charcoal border-glessios-border-dark text-glessios-text-body hover:text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Entrada de Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("PRODUCTION_CONSUMPTION")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      movementType === "PRODUCTION_CONSUMPTION"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-glessios-charcoal border-glessios-border-dark text-glessios-text-body hover:text-white"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Baixa de Produção
                  </button>
                </div>
              </div>

              {/* Quantidade e Custo Unitário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Quantidade ({selectedItemForMovement.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 10"
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-sm text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Custo médio atual"
                    value={movementCost}
                    onChange={(e) => setMovementCost(e.target.value)}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-sm text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* Observações / NF / Motivo */}
              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Observações / NF / Motivo
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: NF 14298 Fornecedor Alucomex ou OS-2026-0001"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMovementModalOpen(false)}
                  className="border-glessios-border-dark text-glessios-text-body hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingMovement}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold"
                >
                  {submittingMovement ? "Salvando..." : "Confirmar Lançamento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo Insumo */}
      {newItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setNewItemModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Cadastrar Novo Insumo Fabril
            </h3>
            <p className="text-xs text-glessios-text-body mb-5">
              Adicione chapas, lonas, tintas, acrílicos ou módulos elétricos ao catálogo de estoque.
            </p>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ACM-AZUL-3MM"
                    value={newItemForm.sku}
                    onChange={(e) => setNewItemForm({ ...newItemForm, sku: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-glessios-orange focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  >
                    <option value="Chapas">Chapas (ACM, Inox, Galvanizado)</option>
                    <option value="Lonas">Lonas & Banner</option>
                    <option value="Adesivos">Adesivos & Vinil</option>
                    <option value="Acrílicos">Acrílicos Cast</option>
                    <option value="LEDs">Módulos & Fitas LED</option>
                    <option value="Fontes">Fontes Chaveadas Blindadas</option>
                    <option value="Ferragens">Serralheria & Perfis</option>
                    <option value="Tintas">Tintas & Solventes UV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Nome Completo do Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chapa ACM 3mm Azul Royal 1.22x5.00m"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Unidade *
                  </label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  >
                    <option value="M2">Metro Quadrado (m²)</option>
                    <option value="UNIT">Unidade (un)</option>
                    <option value="SHEET">Chapa Inteira</option>
                    <option value="ROLL">Bobina / Rolo</option>
                    <option value="LINEAR_METER">Metro Linear (m)</option>
                    <option value="KG">Quilo (kg)</option>
                    <option value="LITERS">Litros (L)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newItemForm.currentQuantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, currentQuantity: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={newItemForm.minQuantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, minQuantity: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemForm.averageUnitCost}
                    onChange={(e) => setNewItemForm({ ...newItemForm, averageUnitCost: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Fornecedor Principal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alucomex"
                    value={newItemForm.supplier}
                    onChange={(e) => setNewItemForm({ ...newItemForm, supplier: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Localização no Galpão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Galpão A - Prat. 04"
                    value={newItemForm.location}
                    onChange={(e) => setNewItemForm({ ...newItemForm, location: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewItemModalOpen(false)}
                  className="border-glessios-border-dark text-glessios-text-body hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingItem}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold"
                >
                  {submittingItem ? "Cadastrando..." : "Cadastrar Insumo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Movimentações */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <History className="w-5 h-5 text-glessios-orange" />
              Histórico Recente de Entradas e Saídas Fabris
            </h3>
            <p className="text-xs text-glessios-text-body mb-4">
              Rastreabilidade de compras e insumos consumidos na esteira de produção.
            </p>

            <div className="flex-1 overflow-y-auto border border-glessios-border-dark rounded-xl">
              {loadingHistory ? (
                <div className="py-12 text-center text-glessios-text-muted text-xs">
                  Carregando trilha de movimentações...
                </div>
              ) : movementsHistory.length === 0 ? (
                <div className="py-12 text-center text-glessios-text-muted text-xs">
                  Nenhuma movimentação registrada até o momento.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-glessios-text-body uppercase text-[10px] font-bold sticky top-0">
                    <tr className="border-b border-glessios-border-dark">
                      <th className="py-2.5 px-3">Data / Hora</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Insumo</th>
                      <th className="py-2.5 px-3 text-right">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Custo Total</th>
                      <th className="py-2.5 px-3">Referência / OS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glessios-border-dark">
                    {movementsHistory.map((mov) => (
                      <tr key={mov.id} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-glessios-text-muted font-mono text-[11px]">
                          {new Date(mov.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 px-3">
                          {mov.type === "INCOMING_PURCHASE" || mov.type === "PURCHASE_ENTRY" ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <ArrowUpRight className="w-3 h-3" /> Entrada
                            </span>
                          ) : mov.type === "OUTGOING_PRODUCTION_OS" || mov.type === "PRODUCTION_CONSUMPTION" ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <ArrowDownRight className="w-3 h-3" /> Baixa Fabril
                            </span>
                          ) : (
                            <span className="text-blue-400 font-bold text-[11px]">Ajuste</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-white">{mov.stockItem.name}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          {mov.quantity} {mov.stockItem.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-glessios-text-body">
                          {formatCurrency(mov.totalCost)}
                        </td>
                        <td className="py-2 px-3 text-glessios-text-muted text-[11px]">
                          {mov.serviceOrder ? (
                            <span className="text-glessios-orange font-mono font-semibold">
                              {mov.serviceOrder.code}
                            </span>
                          ) : mov.notes ? (
                            mov.notes
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setHistoryModalOpen(false)}
                className="border-glessios-border-dark text-white text-xs"
              >
                Fechar Histórico
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
