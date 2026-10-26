"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  Cpu,
  FileCheck,
  Wrench,
  Truck,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  MessageCircle,
  Package,
  DollarSign,
  FileText,
  Kanban,
  LayoutGrid,
Plus,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import Link from "next/link";

interface ServiceOrder {
  id: string;
  code: string;
  title: string;
  currentStage: string;
  productionColumnId?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  totalAmount: number;
  deadline: string | null;
  createdAt: string;
  customer: {
    id?: string;
    tradeName: string | null;
    companyName: string | null;
    fullName?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
    user: { name: string; phone: string | null; email: string };
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    totalPrice: number;
  }>;
  artworkProofs: Array<{
    id: string;
    version: number;
    title: string;
    fileUrl: string;
    status: "PENDING_CUSTOMER_REVIEW" | "APPROVED" | "REVISION_REQUESTED";
  }>;
}

interface ProductionCol {
  id: string;
  name: string;
  order: number;
  color: string | null;
  stageKey?: string | null;
}

const DEFAULT_STAGES: ProductionCol[] = [
  { id: "BRIEFING_ARTWORK", name: "Briefing & Criação", order: 0, color: "#8B5CF6", stageKey: "BRIEFING_ARTWORK" },
  { id: "ARTWORK_APPROVAL", name: "Aprovação de Layout", order: 1, color: "#F59E0B", stageKey: "ARTWORK_APPROVAL" },
  { id: "CNC_ROUTER_CUTTING", name: "Corte Router & Laser", order: 2, color: "#FF650F", stageKey: "CNC_ROUTER_CUTTING" },
  { id: "DIGITAL_PRINTING", name: "Impressão UV & Vinil", order: 3, color: "#3B82F6", stageKey: "DIGITAL_PRINTING" },
  { id: "ASSEMBLY_STRUCTURE", name: "Serralheria & LED", order: 4, color: "#EC4899", stageKey: "ASSEMBLY_STRUCTURE" },
  { id: "QUALITY_CONTROL", name: "Controle de Qualidade", order: 5, color: "#14B8A6", stageKey: "QUALITY_CONTROL" },
  { id: "READY_FOR_INSTALLATION", name: "Pronto p/ Instalação", order: 6, color: "#06B6D4", stageKey: "READY_FOR_INSTALLATION" },
  { id: "INSTALLED_COMPLETED", name: "Instalado & Concluído", order: 7, color: "#10B981", stageKey: "INSTALLED_COMPLETED" },
];

export default function ProducaoPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [columns, setColumns] = useState<ProductionCol[]>(DEFAULT_STAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"KANBAN" | "GRID">("KANBAN");

  // Drag and Drop State
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Mouse Drag-to-Scroll (Mãozinha fluida)
  const kanbanViewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartXRef = useRef(0);
  const panScrollLeftRef = useRef(0);
  const isDraggingCardRef = useRef(false);

  // CRUD de Colunas da Produção
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ProductionCol | null>(null);
  const [columnForm, setColumnForm] = useState({ name: "", color: "#FF650F" });
  const [isSavingColumn, setIsSavingColumn] = useState(false);

  // Modal para upload de prova de arte
  const [uploadModalOrder, setUploadModalOrder] = useState<ServiceOrder | null>(null);
  const [proofForm, setProofForm] = useState({
    title: "",
    fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
  });
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const fetchOrdersAndColumns = async () => {
    try {
      const [ordersRes, colsRes] = await Promise.all([
        fetch("/api/v1/production/orders"),
        fetch("/api/v1/production/columns"),
      ]);

      const ordersData = await ordersRes.json();
      if (ordersData.success && ordersData.serviceOrders) {
        setOrders(ordersData.serviceOrders);
      }

      const colsData = await colsRes.json();
      if (colsData.success && colsData.columns && colsData.columns.length > 0) {
        setColumns(colsData.columns);
      }
    } catch (e) {
      console.error("Erro ao listar produção:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndColumns();
  }, []);

  // Handlers de Mouse Drag-to-Scroll (Mãozinha)
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[draggable="true"]') ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }
    setIsPanning(true);
    panStartXRef.current = e.pageX - (kanbanViewportRef.current?.offsetLeft || 0);
    panScrollLeftRef.current = kanbanViewportRef.current?.scrollLeft || 0;
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !kanbanViewportRef.current || isDraggingCardRef.current) return;
    e.preventDefault();
    const x = e.pageX - (kanbanViewportRef.current.offsetLeft || 0);
    const walk = (x - panStartXRef.current) * 1.5;
    kanbanViewportRef.current.scrollLeft = panScrollLeftRef.current - walk;
  };

  const handleViewportMouseUp = () => {
    setIsPanning(false);
  };

  const handleViewportMouseLeave = () => {
    setIsPanning(false);
  };

  const handleScrollLeft = () => {
    kanbanViewportRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    kanbanViewportRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  };

  // Mudar estágio da OS
  const handleUpdateStage = async (orderId: string, targetCol: ProductionCol) => {
    const stageId = targetCol.stageKey || targetCol.id;

    // Atualização otimista
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, currentStage: stageId, productionColumnId: targetCol.id }
          : o
      )
    );

    try {
      const res = await fetch(`/api/v1/production/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStage: stageId, productionColumnId: targetCol.id }),
      });
      if (!res.ok) {
        fetchOrdersAndColumns();
      }
    } catch (err) {
      console.error("Falha ao atualizar estágio da OS:", err);
      fetchOrdersAndColumns();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    isDraggingCardRef.current = true;
    e.dataTransfer.setData("text/plain", orderId);
    setDraggedOrderId(orderId);
  };

  const handleDragEnd = () => {
    isDraggingCardRef.current = false;
    setDraggedOrderId(null);
    setDragOverStageId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverStageId !== colId) {
      setDragOverStageId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, col: ProductionCol) => {
    e.preventDefault();
    isDraggingCardRef.current = false;
    const orderId = e.dataTransfer.getData("text/plain") || draggedOrderId;
    setDragOverStageId(null);
    setDraggedOrderId(null);

    if (orderId) {
      handleUpdateStage(orderId, col);
    }
  };

  // CRUD de Colunas da Produção
  const handleOpenAddColumn = () => {
    setEditingColumn(null);
    setColumnForm({ name: "", color: "#FF650F" });
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumn = (col: ProductionCol) => {
    setEditingColumn(col);
    setColumnForm({ name: col.name, color: col.color || "#FF650F" });
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnForm.name.trim()) return;
    setIsSavingColumn(true);
    try {
      if (editingColumn) {
        const res = await fetch(`/api/v1/production/columns/${editingColumn.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(columnForm),
        });
        const data = await res.json();
        if (data.success) {
          setIsColumnModalOpen(false);
          fetchOrdersAndColumns();
        } else {
          alert(data.error || "Erro ao editar coluna.");
        }
      } else {
        const res = await fetch("/api/v1/production/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(columnForm),
        });
        const data = await res.json();
        if (data.success) {
          setIsColumnModalOpen(false);
          fetchOrdersAndColumns();
        } else {
          alert(data.error || "Erro ao criar coluna.");
        }
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsSavingColumn(false);
    }
  };

  const handleDeleteColumn = async (col: ProductionCol) => {
    if (columns.length <= 1) {
      alert("A esteira fabril deve ter pelo menos uma etapa.");
      return;
    }
    if (!confirm(`Deseja realmente excluir a etapa "${col.name}"? As ordens serão transferidas para o primeiro campo.`)) return;

    try {
      const res = await fetch(`/api/v1/production/columns/${col.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchOrdersAndColumns();
      } else {
        alert(data.error || "Erro ao excluir etapa.");
      }
    } catch {
      alert("Erro ao excluir etapa.");
    }
  };

  const handleMoveColumn = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newCols = [...columns];
    const [moved] = newCols.splice(index, 1);
    newCols.splice(targetIndex, 0, moved);

    setColumns(newCols);

    try {
      await fetch("/api/v1/production/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnIds: newCols.map((c) => c.id) }),
      });
    } catch {
      fetchOrdersAndColumns();
    }
  };

  // Upload de Prova de Arte
  const handleSendProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalOrder) return;
    setIsSubmittingProof(true);
    try {
      const res = await fetch(`/api/v1/production/orders/${uploadModalOrder.id}/proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proofForm.title || `Prova de Fachada — ${uploadModalOrder.code}`,
          fileUrl: proofForm.fileUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Prova de arte enviada com sucesso!");
        setUploadModalOrder(null);
        fetchOrdersAndColumns();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erro ao enviar prova de arte.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.tradeName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalProductionValue = orders
    .filter((o) => o.currentStage !== "INSTALLED_COMPLETED")
    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Topo do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.06] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              Chão de Fábrica & CNC
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Esteira Fabril Ativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#FF650F]" />
            Linha de Produção (Kanban Industrial)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            Gerencie as fases fabris arrastando os cards e configure novas etapas da esteira sob medida.
          </p>
        </div>

        {/* Métricas e Modo de Visualização */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-white/[0.03] px-4 py-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Em Produção</span>
              <span className="text-base font-black text-[#FF650F] font-mono">
                {orders.filter((o) => o.currentStage !== "INSTALLED_COMPLETED").length} OSs
              </span>
            </div>
            <div className="w-px h-7 bg-black/[0.08] dark:bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Volume Fabril</span>
              <span className="text-base font-black text-zinc-900 dark:text-white font-mono">
                {formatCurrency(totalProductionValue)}
              </span>
            </div>
            <div className="w-px h-7 bg-black/[0.08] dark:bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Concluídas</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {orders.filter((o) => o.currentStage === "INSTALLED_COMPLETED").length}
              </span>
            </div>
          </div>

          {/* Alternador de Modo: Kanban vs Grid */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.08]">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "KANBAN"
                  ? "bg-white dark:bg-[#18191E] text-[#FF650F] shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-[#18191E] text-[#FF650F] shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtro e Ações de Colunas da Produção */}
      <div className="px-4 py-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código da OS, cliente ou serviço..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-50 dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm"
          />
        </div>

        {/* Controles de Navegação por Arrasto e Nova Coluna */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleScrollLeft}
              title="Rolar para esquerda"
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202128] dark:hover:bg-[#282932] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              title="Rolar para direita"
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202128] dark:hover:bg-[#282932] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAddColumn}
            className="rounded-full text-xs font-bold gap-1.5 border-dashed border-[#FF650F]/50 text-[#FF650F] hover:bg-orange-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Etapa</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODO 1: KANBAN FABRIL COM MOUSE DRAG-TO-SCROLL (MÃOZINHA) */}
      {/* ======================================================== */}
      {viewMode === "KANBAN" && (
        <div className="rounded-3xl bg-zinc-100/80 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.08] p-4 relative shadow-m3-1 overflow-hidden">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#FF650F] border-t-transparent rounded-full animate-spin" />
              <span>Carregando esteira da linha de produção...</span>
            </div>
          ) : (
            <div
              ref={kanbanViewportRef}
              onMouseDown={handleViewportMouseDown}
              onMouseMove={handleViewportMouseMove}
              onMouseUp={handleViewportMouseUp}
              onMouseLeave={handleViewportMouseLeave}
              className={`flex gap-4 overflow-x-auto pb-4 pt-1 items-start no-scrollbar select-none ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {columns.map((col, cIdx) => {
                const stageOrders = filteredOrders.filter((o) => {
                  if (col.stageKey && o.currentStage === col.stageKey) return true;
                  if (o.productionColumnId && o.productionColumnId === col.id) return true;
                  if (o.currentStage === col.id) return true;
                  return false;
                });

                const stageValue = stageOrders.reduce(
                  (acc, curr) => acc + Number(curr.totalAmount || 0),
                  0
                );
                const isDropTarget = dragOverStageId === col.id;

                return (
                  <div key={col.id} className="shrink-0">
                    <div
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col)}
                      className={`w-80 rounded-3xl bg-white dark:bg-[#17181F] border flex flex-col h-fit self-start shadow-m3-1 transition-all duration-200 ${
                        isDropTarget
                          ? "border-[#FF650F] ring-2 ring-[#FF650F] ring-offset-2 dark:ring-offset-[#121316] scale-[1.01] bg-orange-500/[0.03]"
                          : "border-black/[0.06] dark:border-white/[0.08]"
                      }`}
                    >
                      {/* Cabeçalho da Etapa Fabril com Controles de CRUD */}
                      <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: col.color || "#FF650F" }}
                          />
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate" title={col.name}>
                            {col.name}
                          </h3>
                          <span className="text-[10px] bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono font-semibold shrink-0">
                            {stageOrders.length}
                          </span>
                        </div>

                        {/* Ações de Reordenação e Edição da Coluna */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveColumn(cIdx, "left")}
                            disabled={cIdx === 0}
                            title="Mover etapa para a esquerda"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveColumn(cIdx, "right")}
                            disabled={cIdx === columns.length - 1}
                            title="Mover etapa para a direita"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditColumn(col)}
                            title="Editar etapa"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(col)}
                            title="Excluir etapa"
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-barra de Volume Financeiro */}
                      <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#14151B] border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-medium">Etapa {cIdx + 1} de {columns.length}</span>
                        <span className="font-mono font-bold text-[#FF650F]">
                          {formatCurrency(stageValue)}
                        </span>
                      </div>

                      {/* Cards da Coluna */}
                      <div className="p-3 space-y-3 flex-grow min-h-[220px]">
                        {isDropTarget && draggedOrderId && (
                          <div className="p-4 rounded-2xl border-2 border-dashed border-[#FF650F] bg-orange-500/10 text-center animate-pulse flex items-center justify-center gap-2 text-xs font-bold text-[#FF650F]">
                            <span>Soltar nesta fase</span>
                          </div>
                        )}

                        {stageOrders.length === 0 && !isDropTarget && (
                          <div className="h-28 border border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-3 text-zinc-400 text-xs">
                            Nenhuma OS nesta etapa
                          </div>
                        )}

                        {stageOrders.map((order) => {
                          const clientName =
                            order.customer?.companyName ||
                            order.customer?.tradeName ||
                            order.customer?.fullName ||
                            order.customer?.user?.name ||
                            "Cliente";
                          const clientPhone =
                            order.customer?.whatsapp ||
                            order.customer?.phone ||
                            order.customer?.user?.phone;
                          const latestProof = order.artworkProofs?.[0];

                          return (
                            <div
                              key={order.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, order.id)}
                              onDragEnd={handleDragEnd}
                              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.05] dark:border-white/[0.06] hover:border-[#FF650F]/50 cursor-grab active:cursor-grabbing transition-all duration-200 group hover:shadow-md space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-[10px] font-black text-[#FF650F] bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                                  {order.code}
                                </span>
                                <Badge
                                  variant={
                                    order.priority === "URGENT" || order.priority === "HIGH"
                                      ? "warning"
                                      : "outline"
                                  }
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {order.priority}
                                </Badge>
                              </div>

                              <div className="space-y-0.5">
                                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#FF650F] transition-colors">
                                  {order.title}
                                </h4>
                                <p className="text-[11px] text-zinc-500 truncate">{clientName}</p>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>

                              {latestProof && (
                                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-purple-700 dark:text-purple-300 truncate">
                                    Layout v{latestProof.version}
                                  </span>
                                  <a
                                    href={latestProof.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    Ver <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 pt-1">
                                {clientPhone && (
                                  <a
                                    href={`https://wa.me/${clientPhone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1 flex-1 justify-center transition-colors"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUploadModalOrder(order)}
                                  className="rounded-xl text-[10px] font-bold py-1 h-7 px-2"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  <span>Prova</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botão no final do scroll para Adicionar Nova Etapa */}
              <div className="shrink-0 w-72 flex flex-col">
                <button
                  type="button"
                  onClick={handleOpenAddColumn}
                  className="w-full py-16 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#FF650F] bg-white/40 dark:bg-[#17181F]/40 hover:bg-orange-500/5 text-zinc-500 hover:text-[#FF650F] transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-[#FF650F] group-hover:text-white flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">Adicionar Nova Etapa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO 2: VISUALIZAÇÃO EM GRADE */}
      {viewMode === "GRID" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const clientName =
              order.customer?.companyName ||
              order.customer?.tradeName ||
              order.customer?.fullName ||
              order.customer?.user?.name ||
              "Cliente";

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#FF650F] bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    {order.code}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {order.priority}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {order.title}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">{clientName}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border text-xs flex items-center justify-between">
                  <span className="text-zinc-500">Valor Total:</span>
                  <span className="font-mono font-black text-[#FF650F]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOVO / EDITAR CAMPO DA PRODUÇÃO */}
      {isColumnModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsColumnModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18191E] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Esteira de Fabricação
                </span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  {editingColumn ? "Editar Etapa Fabril" : "Nova Etapa na Linha"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nome da Etapa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pintura Eletrostática, Dobra CNC..."
                  value={columnForm.name}
                  onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Cor de Destaque
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {[
                    "#FF650F", // Laranja Ícthus
                    "#8B5CF6", // Roxo
                    "#3B82F6", // Azul
                    "#10B981", // Verde
                    "#F59E0B", // Âmbar
                    "#EC4899", // Rosa
                    "#06B6D4", // Ciano
                    "#14B8A6", // Teal
                  ].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColumnForm({ ...columnForm, color: hex })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        columnForm.color === hex
                          ? "scale-110 ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-[#18191E]"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {columnForm.color === hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={columnForm.color}
                    onChange={(e) => setColumnForm({ ...columnForm, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono text-zinc-500 uppercase">{columnForm.color}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsColumnModalOpen(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingColumn}
                  className="rounded-full px-5 text-xs font-bold"
                >
                  {editingColumn ? "Atualizar Etapa" : "Criar Etapa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DE PROVA DE ARTE */}
      {uploadModalOrder && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setUploadModalOrder(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#18191E] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Enviar Prova Digital ({uploadModalOrder.code})
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProof} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Layout / Versão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prova de Layout com LED Noturno v2"
                  value={proofForm.title}
                  onChange={(e) => setProofForm({ ...proofForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border text-xs sm:text-sm text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  URL da Prova (Imagem ou PDF)
                </label>
                <input
                  type="url"
                  required
                  value={proofForm.fileUrl}
                  onChange={(e) => setProofForm({ ...proofForm, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadModalOrder(null)}
                  className="rounded-full text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingProof}
                  className="rounded-full text-xs font-bold"
                >
                  Salvar Prova
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
