"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  M3StaggerContainer,
  M3StaggerItem,
} from "@/components/ui/m3-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Layers,
  Search,
  Filter,
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
  X,
  ExternalLink,
  MessageCircle,
  Package,
  DollarSign,
  FileText,
  Kanban,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";

interface ServiceOrder {
  id: string;
  code: string;
  title: string;
  currentStage: string;
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

const STAGES = [
  { id: "BRIEFING_ARTWORK", label: "Briefing & Criação", icon: Sparkles, color: "#8B5CF6" },
  { id: "ARTWORK_APPROVAL", label: "Aprovação de Layout", icon: FileCheck, color: "#F59E0B" },
  { id: "CNC_ROUTER_CUTTING", label: "Corte Router & Laser", icon: Cpu, color: "#FF650F" },
  { id: "DIGITAL_PRINTING", label: "Impressão UV & Vinil", icon: Layers, color: "#3B82F6" },
  { id: "ASSEMBLY_STRUCTURE", label: "Serralheria & LED", icon: Wrench, color: "#EC4899" },
  { id: "QUALITY_CONTROL", label: "Controle de Qualidade", icon: ShieldCheck, color: "#14B8A6" },
  { id: "READY_FOR_INSTALLATION", label: "Pronto p/ Instalação", icon: Truck, color: "#06B6D4" },
  { id: "INSTALLED_COMPLETED", label: "Instalado & Concluído", icon: CheckCircle2, color: "#10B981" },
];

export default function ProducaoPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"KANBAN" | "GRID">("KANBAN");
  const [selectedGridStage, setSelectedGridStage] = useState<string>("ALL");

  // Drag and Drop State
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Modal para upload de prova de arte
  const [uploadModalOrder, setUploadModalOrder] = useState<ServiceOrder | null>(null);
  const [proofForm, setProofForm] = useState({
    title: "",
    fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
  });
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/v1/production/orders");
      const data = await res.json();
      if (data.success && data.serviceOrders) {
        setOrders(data.serviceOrders);
      }
    } catch (e) {
      console.error("Erro ao listar OSs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Mudar estágio da OS (via Drag and Drop ou botões)
  const handleUpdateStage = async (orderId: string, newStageId: string) => {
    // Atualização otimista
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, currentStage: newStageId } : o))
    );

    try {
      const res = await fetch(`/api/v1/production/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStage: newStageId }),
      });
      if (!res.ok) {
        fetchOrders(); // Reverte em caso de erro
      }
    } catch (err) {
      console.error("Falha ao atualizar estágio da OS:", err);
      fetchOrders();
    }
  };

  // Avançar estágio da OS com 1 clique
  const handleAdvanceStage = (orderId: string, currentStageId: string) => {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStageId);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) return;
    handleUpdateStage(orderId, STAGES[currentIndex + 1].id);
  };

  // Recuar estágio da OS com 1 clique
  const handleRewindStage = (orderId: string, currentStageId: string) => {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStageId);
    if (currentIndex <= 0) return;
    handleUpdateStage(orderId, STAGES[currentIndex - 1].id);
  };

  // Enviar nova versão de prova de arte
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
        alert(data.message || "Prova enviada com sucesso!");
        setUploadModalOrder(null);
        fetchOrders();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erro ao enviar prova de arte.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("text/plain", orderId);
    setDraggedOrderId(orderId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("text/plain") || draggedOrderId;
    setDragOverStageId(null);
    setDraggedOrderId(null);

    if (orderId) {
      handleUpdateStage(orderId, targetStageId);
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
            Gerencie o fluxo fabril de corte CNC, impressão UV, serralheria, LED e expedição arrastando os cards entre as fases.
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

      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código da OS, cliente ou serviço..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF650F]/30 shadow-xs"
          />
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Dica: <strong className="text-zinc-700 dark:text-zinc-300">Arraste os cards</strong> entre as colunas para atualizar a etapa de fabricação em tempo real.
        </span>
      </div>

      {/* ======================================================== */}
      {/* MODO 1: KANBAN FABRIL COM 8 FASES INDUSTRIAIS            */}
      {/* ======================================================== */}
      {viewMode === "KANBAN" && (
        <div className="w-full overflow-x-auto pb-6 no-scrollbar">
          <div className="flex gap-4 min-w-[2200px] items-start">
            {STAGES.map((stage, sIdx) => {
              const stageOrders = filteredOrders.filter((o) => o.currentStage === stage.id);
              const stageValue = stageOrders.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
              const isDropTarget = dragOverStageId === stage.id;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`w-72 shrink-0 rounded-3xl bg-zinc-100/70 dark:bg-[#14151B] border transition-all duration-200 flex flex-col ${
                    isDropTarget
                      ? "border-[#FF650F] ring-2 ring-orange-500/20 bg-orange-500/[0.04]"
                      : "border-black/[0.06] dark:border-white/[0.06]"
                  }`}
                >
                  {/* Cabeçalho da Coluna Fabril */}
                  <div className="p-3.5 border-b border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                          style={{ backgroundColor: stage.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 border border-black/[0.05] dark:border-white/[0.08]">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                      <span className="font-mono text-[10px] text-zinc-400">Etapa {sIdx + 1} de 8</span>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {formatCurrency(stageValue)}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Cards da Coluna */}
                  <div className="p-3 space-y-3 min-h-[350px] flex-1">
                    {isDropTarget && draggedOrderId && (
                      <div className="p-4 rounded-2xl border-2 border-dashed border-[#FF650F] bg-orange-500/10 text-center animate-pulse flex items-center justify-center gap-2 text-xs font-bold text-[#FF650F]">
                        <span>Soltar nesta fase</span>
                      </div>
                    )}

                    {stageOrders.length === 0 && !isDropTarget && (
                      <div className="h-32 border-2 border-dashed border-black/[0.04] dark:border-white/[0.04] rounded-2xl flex flex-col items-center justify-center text-center p-3 text-zinc-400">
                        <span className="text-[11px]">Nenhuma peça nesta etapa</span>
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
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                        >
                          {/* Código e Prioridade */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
                              {order.code}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                order.priority === "URGENT"
                                  ? "bg-red-500/15 text-red-600 border border-red-500/30"
                                  : order.priority === "HIGH"
                                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              }`}
                            >
                              {order.priority}
                            </span>
                          </div>

                          {/* Título do Trabalho */}
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                            {order.title}
                          </h4>

                          {/* Cliente e Contato */}
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-0.5">
                            <p className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                              {clientName}
                            </p>
                            {clientPhone && (
                              <a
                                href={`https://wa.me/${clientPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{clientPhone}</span>
                              </a>
                            )}
                          </div>

                          {/* Prova de Arte (se houver) */}
                          {latestProof && (
                            <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/15 text-[10px] flex items-center justify-between">
                              <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                                <FileCheck className="w-3 h-3 text-[#FF650F] shrink-0" />
                                <span className="truncate">{latestProof.title}</span>
                              </span>
                              <Link
                                href={`/portal/provas/${latestProof.id}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#FF650F] hover:underline font-bold shrink-0 ml-1"
                              >
                                Ver
                              </Link>
                            </div>
                          )}

                          {/* Valor e Ações de Avanço */}
                          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                            <span className="text-xs font-black font-mono text-[#FF650F]">
                              {formatCurrency(Number(order.totalAmount || 0))}
                            </span>

                            <div className="flex items-center gap-1">
                              {sIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRewindStage(order.id, stage.id)}
                                  title="Voltar etapa anterior"
                                  className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setUploadModalOrder(order)}
                                title="Enviar Prova Digital de Arte"
                                className="w-6 h-6 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-[#FF650F] flex items-center justify-center text-xs"
                              >
                                <Upload className="w-3 h-3" />
                              </button>

                              {sIdx < STAGES.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStage(order.id, stage.id)}
                                  title="Avançar para a próxima etapa"
                                  className="w-6 h-6 rounded-lg bg-[#FF650F] hover:bg-orange-600 text-white flex items-center justify-center text-xs shadow-xs"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 2: GRADE TRADICIONAL COM FILTROS DE CHIPS           */}
      {/* ======================================================== */}
      {viewMode === "GRID" && (
        <div className="space-y-6">
          {/* Pipeline Visual das 8 Etapas Industriais */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedGridStage("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedGridStage === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.06]"
              }`}
            >
              Todas as Etapas ({orders.length})
            </button>
            {STAGES.map((st, idx) => {
              const count = orders.filter((o) => o.currentStage === st.id).length;
              const Icon = st.icon;
              const isSelected = selectedGridStage === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedGridStage(st.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#FF650F] text-white shadow-sm"
                      : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.06]"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span>
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? "#fff" : st.color }} />
                  <span>{st.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? "bg-black/20 text-white" : "bg-black/[0.05] dark:bg-white/10"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <M3StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders
              .filter((o) => selectedGridStage === "ALL" || o.currentStage === selectedGridStage)
              .map((order) => {
                const currentStageIdx = STAGES.findIndex((s) => s.id === order.currentStage);
                const stageInfo = STAGES[currentStageIdx] || STAGES[0];
                const progressPct = Math.round(((currentStageIdx + 1) / STAGES.length) * 100);

                return (
                  <M3StaggerItem key={order.id}>
                    <div className="rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.06] shadow-sm p-6 flex flex-col justify-between space-y-5 h-full">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-zinc-900 dark:text-white bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1 rounded-xl">
                            {order.code}
                          </span>
                          <span className="text-base font-black font-mono text-[#FF650F]">
                            {formatCurrency(Number(order.totalAmount || 0))}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                            {order.title}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Cliente: <span className="font-medium text-zinc-900 dark:text-white">{order.customer?.companyName || order.customer?.tradeName || order.customer?.user?.name}</span>
                          </p>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="space-y-1.5 bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageInfo.color }} />
                              {stageInfo.label}
                            </span>
                            <span className="font-mono text-[#FF650F] font-bold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#FF650F] h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadModalOrder(order)}
                          className="text-xs rounded-xl gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#FF650F]" />
                          <span>Enviar Prova</span>
                        </Button>

                        {currentStageIdx < STAGES.length - 1 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAdvanceStage(order.id, order.currentStage)}
                            className="text-xs rounded-xl gap-1"
                          >
                            <span>Avançar Etapa</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </M3StaggerItem>
                );
              })}
          </M3StaggerContainer>
        </div>
      )}

      {/* Modal para Upload/Cadastro de Prova Digital de Arte */}
      {uploadModalOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setUploadModalOrder(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-[#FF650F]">
                    <Upload className="w-4 h-4" />
                  </div>
                  Enviar Prova de Arte
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                  Ordem de Serviço: <strong className="text-zinc-800 dark:text-zinc-200">{uploadModalOrder.code}</strong>
                </span>
              </div>
              <button
                onClick={() => setUploadModalOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProof} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Identificação da Prova
                </label>
                <input
                  type="text"
                  required
                  value={proofForm.title}
                  onChange={(e) => setProofForm({ ...proofForm, title: e.target.value })}
                  placeholder="Ex: Layout Fachada 3D - Versão 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  URL da Arte Renderizada (Mockup 3D / Imagem)
                </label>
                <input
                  type="url"
                  required
                  value={proofForm.fileUrl}
                  onChange={(e) => setProofForm({ ...proofForm, fileUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all placeholder:text-zinc-400"
                />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  O cliente visualizará esta arte no portal e poderá aprovar diretamente no celular.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  Disparo Automático via WACLI (WhatsApp)
                </span>
                <p className="text-[11px] leading-relaxed">
                  Ao confirmar, o WhatsApp do cliente receberá a mensagem oficial com o link direto de aprovação.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUploadModalOrder(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingProof}
                >
                  Enviar Prova ao Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
