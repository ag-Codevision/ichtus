"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  History,
  X,
  Boxes,
  MapPin,
  TrendingUp,
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
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [newItemForm, setNewItemForm] = useState({
    sku: "",
    name: "",
    category: "Chapas",
    unit: "M2",
    currentQuantity: "",
    minQuantity: "",
    averageUnitCost: "",
    supplier: "",
    supplierId: "",
    location: "",
  });
  const [submittingItem, setSubmittingItem] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/v1/crm/contacts/search?type=SUPPLIER");
      const data = await res.json();
      if (data.success) {
        setSuppliersList(data.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar fornecedores do CRM:", err);
    }
  };

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
    fetchSuppliers();
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
          supplierId: "",
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
      {/* Cabeçalho da Página - M3 Expressive Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Almoxarifado & Insumos Fabris
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Controle de Estoque & Matéria-Prima
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Gerencie chapas de ACM, acrílicos, lonas, módulos LED, fontes e ferragens para a linha de produção.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={openHistory}
            className="border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-xs gap-1.5 h-10 px-4 rounded-full font-semibold transition-all"
          >
            <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            Histórico
          </Button>
          <Button
            onClick={() => setNewItemModalOpen(true)}
            className="bg-orange-gradient hover:opacity-95 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Insumo
          </Button>
        </div>
      </div>

      {/* 4 Cards de Métricas - M3 Expressive KPI Grid com Entrada Escalonada */}
      <M3StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Valor Imobilizado
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {formatCurrency(kpis.totalInventoryValue)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Custo médio em galpão
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center text-glessios-orange shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total de SKUs Ativos
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {kpis.totalSkus} itens
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                {categories.length || 5} categorias fabris
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Alerta de Reposição
              </span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {kpis.totalLowStock} insumos
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Saldo no limite mínimo
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Nível Crítico Fabril
              </span>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {kpis.totalCritical} insumos
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Abaixo de 50% de segurança
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>
      </M3StaggerContainer>

      {/* Filtros e Busca - M3 Filter Container */}
      <div className="bg-white dark:bg-[#18191E] p-4 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categorias em Pílulas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-glessios-orange text-white shadow-sm"
                : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-glessios-orange text-white shadow-sm"
                  : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Busca e Toggle de Estoque Baixo */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white select-none whitespace-nowrap font-medium">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-glessios-orange focus:ring-glessios-orange"
            />
            Apenas Estoque Baixo
          </label>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por SKU, insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-full pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-glessios-orange focus:outline-none transition-all"
            />
          </form>
        </div>
      </div>

      {/* Tabela de Insumos com Transição M3 Expressive */}
      <M3TabPanel activeKey={selectedCategory}>
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-1">
        {loading ? (
          <div className="py-24 text-center text-zinc-500 dark:text-zinc-400 text-xs flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
            Carregando dados do almoxarifado...
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Nenhum insumo encontrado</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Tente ajustar os filtros ou cadastre um novo material para a fábrica.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">SKU / Insumo</th>
                  <th className="py-3.5 px-5">Categoria</th>
                  <th className="py-3.5 px-5">Localização / Fornecedor</th>
                  <th className="py-3.5 px-5 w-52">Nível de Saldo Físico</th>
                  <th className="py-3.5 px-5 text-right">Custo Médio</th>
                  <th className="py-3.5 px-5 text-right">Valor em Estoque</th>
                  <th className="py-3.5 px-5 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {items.map((item) => {
                  const ratio = item.minQuantity > 0 ? (item.currentQuantity / item.minQuantity) * 100 : 100;
                  const barColor =
                    item.currentQuantity <= item.minQuantity * 0.5
                      ? "bg-red-500"
                      : item.currentQuantity <= item.minQuantity
                      ? "bg-amber-500"
                      : "bg-emerald-500";

                  return (
                    <tr key={item.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      {/* SKU e Nome */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] text-glessios-orange font-bold">
                            {item.sku}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white text-sm mt-0.5">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-4 px-5">
                        <Badge variant="outline" className="border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 text-[10px]">
                          {item.category}
                        </Badge>
                      </td>

                      {/* Localização e Fornecedor */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-0.5">
                          {item.location && (
                            <span className="flex items-center gap-1 text-[11px] text-zinc-800 dark:text-zinc-200 font-medium">
                              <MapPin className="w-3 h-3 text-glessios-orange" />
                              {item.location}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {item.supplier || "Fornecedor não informado"}
                          </span>
                        </div>
                      </td>

                      {/* Barra de Progresso e Saldo */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-zinc-900 dark:text-white">
                              {item.currentQuantity} <span className="text-zinc-500 dark:text-zinc-400 font-normal">{item.unit}</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              Mín: {item.minQuantity} {item.unit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all`}
                              style={{ width: `${Math.min(100, Math.max(8, ratio))}%` }}
                            />
                          </div>
                          {item.isLowStock && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Reposição recomendada
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Custo Unitário Médio */}
                      <td className="py-4 px-5 text-right font-mono font-medium text-zinc-600 dark:text-zinc-300">
                        {formatCurrency(item.averageUnitCost)}
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">por {item.unit}</span>
                      </td>

                      {/* Valor Total em Estoque */}
                      <td className="py-4 px-5 text-right font-mono font-black text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(item.totalInventoryValue)}
                      </td>

                      {/* Ações Rápidas */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openMovementFor(item, "PURCHASE_ENTRY")}
                            title="Registrar Entrada de Compra"
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Entrada
                          </button>
                          <button
                            onClick={() => openMovementFor(item, "PRODUCTION_CONSUMPTION")}
                            title="Registrar Baixa Fabril (Consumo OS)"
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1"
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
    </M3TabPanel>

      {/* Modal de Movimentação Rápida - M3 Expressive Dialog */}
      {movementModalOpen && selectedItemForMovement && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setMovementModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMovementModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider">
                {selectedItemForMovement.sku}
              </span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                Movimentação de Estoque
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {selectedItemForMovement.name} (Saldo atual: {selectedItemForMovement.currentQuantity} {selectedItemForMovement.unit})
              </p>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMovementType("PURCHASE_ENTRY")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      movementType === "PURCHASE_ENTRY"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Entrada de Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("PRODUCTION_CONSUMPTION")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      movementType === "PRODUCTION_CONSUMPTION"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Baixa de Produção
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Quantidade ({selectedItemForMovement.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 10"
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Custo médio atual"
                    value={movementCost}
                    onChange={(e) => setMovementCost(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Observações / NF / Motivo
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: NF 14298 Fornecedor Alucomex ou OS-2026-0001"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMovementModalOpen(false)}
                  className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingMovement}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold rounded-xl"
                >
                  {submittingMovement ? "Salvando..." : "Confirmar Lançamento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo Insumo - M3 Expressive Dialog */}
      {newItemModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNewItemModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNewItemModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <Plus className="w-4 h-4" />
                </div>
                Cadastrar Novo Insumo Fabril
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Adicione chapas, lonas, tintas, acrílicos ou módulos elétricos ao almoxarifado.
              </p>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ACM-AZUL-3MM"
                    value={newItemForm.sku}
                    onChange={(e) => setNewItemForm({ ...newItemForm, sku: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none uppercase transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Categoria *
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                  >
                    <option value="Chapas" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Chapas (ACM, Inox, Galvanizado)</option>
                    <option value="Lonas" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Lonas & Banner</option>
                    <option value="Adesivos" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Adesivos & Vinil</option>
                    <option value="Acrílicos" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Acrílicos Cast</option>
                    <option value="LEDs" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Módulos & Fitas LED</option>
                    <option value="Fontes" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Fontes Chaveadas Blindadas</option>
                    <option value="Ferragens" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Serralheria & Perfis</option>
                    <option value="Tintas" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Tintas & Solventes UV</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Nome Completo do Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chapa ACM 3mm Azul Royal 1.22x5.00m"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Unidade *
                  </label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                  >
                    <option value="M2" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Metro Quadrado (m²)</option>
                    <option value="UNIT" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Unidade (un)</option>
                    <option value="SHEET" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Chapa Inteira</option>
                    <option value="ROLL" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Bobina / Rolo</option>
                    <option value="LINEAR_METER" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Metro Linear (m)</option>
                    <option value="KG" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Quilo (kg)</option>
                    <option value="LITERS" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Litros (L)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newItemForm.currentQuantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, currentQuantity: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={newItemForm.minQuantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, minQuantity: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemForm.averageUnitCost}
                    onChange={(e) => setNewItemForm({ ...newItemForm, averageUnitCost: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Fornecedor (CRM)
                  </label>
                  <select
                    value={newItemForm.supplierId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = suppliersList.find((s) => s.id === selectedId);
                      setNewItemForm({
                        ...newItemForm,
                        supplierId: selectedId,
                        supplier: found ? found.displayName : newItemForm.supplier,
                      });
                    }}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                  >
                    <option value="" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">
                      -- Selecionar Fornecedor do CRM --
                    </option>
                    {suppliersList.map((sup) => (
                      <option
                        key={sup.id}
                        value={sup.id}
                        className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white"
                      >
                        {sup.displayName} ({sup.city ? `${sup.city}/${sup.state}` : "CRM"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Localização Galpão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Galpão A - Prat. 04"
                    value={newItemForm.location}
                    onChange={(e) => setNewItemForm({ ...newItemForm, location: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewItemModalOpen(false)}
                  className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingItem}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold rounded-xl"
                >
                  {submittingItem ? "Cadastrando..." : "Cadastrar Insumo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Movimentações - M3 Expressive Dialog */}
      {historyModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setHistoryModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <History className="w-4 h-4" />
                </div>
                Histórico de Entradas e Saídas Fabris
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Rastreabilidade de compras e insumos consumidos na esteira de produção.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
              {loadingHistory ? (
                <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 text-xs flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-2" />
                  Carregando trilha de movimentações...
                </div>
              ) : movementsHistory.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                  Nenhuma movimentação registrada até o momento.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-bold sticky top-0">
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Insumo</th>
                      <th className="py-3 px-4 text-right">Qtd</th>
                      <th className="py-3 px-4 text-right">Custo Total</th>
                      <th className="py-3 px-4">Referência / OS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {movementsHistory.map((mov) => (
                      <tr key={mov.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                          {new Date(mov.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {mov.type === "INCOMING_PURCHASE" || mov.type === "PURCHASE_ENTRY" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <ArrowUpRight className="w-3 h-3" /> Entrada
                            </span>
                          ) : mov.type === "OUTGOING_PRODUCTION_OS" || mov.type === "PRODUCTION_CONSUMPTION" ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <ArrowDownRight className="w-3 h-3" /> Baixa Fabril
                            </span>
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px]">Ajuste</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 dark:text-white">{mov.stockItem.name}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {mov.quantity} {mov.stockItem.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-600 dark:text-zinc-300">
                          {formatCurrency(mov.totalCost)}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
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

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setHistoryModalOpen(false)}
                className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs rounded-xl"
              >
                Fechar Histórico
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) de Novo Insumo no Mobile — Alinhado perfeitamente com o Menu Hamburger */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setNewItemModalOpen(true)}
          aria-label="Cadastrar Novo Insumo"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
