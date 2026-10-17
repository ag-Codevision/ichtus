"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
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
    tradeName: string | null;
    companyName: string | null;
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
  { id: "BRIEFING_ARTWORK", label: "Briefing & Criação de Arte", icon: Sparkles, color: "#8B5CF6" },
  { id: "ARTWORK_APPROVAL", label: "Aprovação de Prova Digital", icon: FileCheck, color: "#F59E0B" },
  { id: "CNC_ROUTER_CUTTING", label: "Corte Router CNC & Laser", icon: Cpu, color: "#FF650F" },
  { id: "DIGITAL_PRINTING", label: "Impressão UV & Laminação", icon: Layers, color: "#3B82F6" },
  { id: "ASSEMBLY_STRUCTURE", label: "Serralheria & LED", icon: Wrench, color: "#EC4899" },
  { id: "QUALITY_CONTROL", label: "Controle de Qualidade", icon: ShieldCheck, color: "#14B8A6" },
  { id: "READY_FOR_INSTALLATION", label: "Pronto para Instalação", icon: Truck, color: "#06B6D4" },
  { id: "INSTALLED_COMPLETED", label: "Instalado & Concluído", icon: CheckCircle2, color: "#10B981" },
];

export default function ProducaoPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Avançar estágio da OS com 1 clique
  const handleAdvanceStage = async (orderId: string, currentStageId: string) => {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStageId);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) return;

    const nextStageId = STAGES[currentIndex + 1].id;

    try {
      const res = await fetch(`/api/v1/production/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStage: nextStageId }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, currentStage: nextStageId } : o))
        );
      }
    } catch (err) {
      console.error("Falha ao avançar estágio:", err);
    }
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

  const filteredOrders = orders.filter((o) => {
    const matchStage = selectedStage === "ALL" || o.currentStage === selectedStage;
    const matchSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStage && matchSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.06] shadow-m3-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/15 px-2.5 py-0.5 rounded-full border border-glessios-orange/20">
              Chão de Fábrica & CNC
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Linha Ativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-glessios-orange" />
            Esteira de Produção & Ordens de Serviço
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            Acompanhe o corte router CNC, impressão UV, montagem e envie provas digitais com disparo via WACLI (WhatsApp).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-100/80 dark:bg-white/[0.03] px-4 py-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] text-xs shrink-0">
          <div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-bold">Em Produção</span>
            <span className="text-base font-black text-glessios-orange font-mono">
              {orders.filter((o) => o.currentStage !== "INSTALLED_COMPLETED").length} OSs
            </span>
          </div>
          <div className="w-px h-7 bg-black/[0.08] dark:bg-white/10" />
          <div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-bold">Concluídas</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {orders.filter((o) => o.currentStage === "INSTALLED_COMPLETED").length}
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline Visual das 8 Etapas Industriais no Padrão M3 Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedStage("ALL")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            selectedStage === "ALL"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-m3-1 scale-[1.02]"
              : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.06] dark:border-white/[0.06]"
          }`}
        >
          Todas as Etapas ({orders.length})
        </button>
        {STAGES.map((st, idx) => {
          const count = orders.filter((o) => o.currentStage === st.id).length;
          const Icon = st.icon;
          const isSelected = selectedStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? "bg-glessios-orange text-white shadow-m3-1 scale-[1.02]"
                  : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.06] dark:border-white/[0.06]"
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

      {/* Barra de Busca Expressiva */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filtrar por código da OS, cliente ou serviço..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-glessios-orange/30 shadow-sm"
        />
      </div>

      {/* Lista de Ordens de Serviço */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-zinc-500 dark:text-zinc-400">
          Carregando esteira fabril...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.06] shadow-m3-1">
          <Layers className="w-10 h-10 text-glessios-orange mx-auto mb-3 opacity-60" />
          <h4 className="text-zinc-900 dark:text-white font-bold text-sm">Nenhuma Ordem de Serviço nesta etapa</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Converta oportunidades do CRM ou crie uma OS para acompanhar a produção.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const currentStageIdx = STAGES.findIndex((s) => s.id === order.currentStage);
            const stageInfo = STAGES[currentStageIdx] || STAGES[0];
            const progressPct = Math.round(((currentStageIdx + 1) / STAGES.length) * 100);
            const latestProof = order.artworkProofs[0];

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.06] shadow-m3-1 hover:shadow-m3-2 p-6 flex flex-col justify-between space-y-5 transition-all duration-200"
              >
                  <div className="space-y-4">
                    {/* Código & Prioridade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono text-zinc-900 dark:text-white bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                          {order.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-glessios-orange border border-glessios-orange/20">
                          {order.priority}
                        </span>
                      </div>

                      <span className="text-base font-black font-mono text-glessios-orange">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    {/* Título & Cliente */}
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                        {order.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Cliente: <span className="text-zinc-900 dark:text-white font-medium">{order.customer?.user?.name}</span>
                        {order.customer?.tradeName && ` (${order.customer.tradeName})`}
                      </p>
                    </div>

                    {/* Barra de Progresso Industrial M3 */}
                    <div className="space-y-2 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageInfo.color }} />
                          {stageInfo.label}
                        </span>
                        <span className="font-mono text-glessios-orange font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-orange-gradient h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Se houver Prova de Arte cadastrada */}
                    {latestProof ? (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-4 h-4 text-glessios-orange shrink-0" />
                          <div>
                            <span className="text-zinc-900 dark:text-white font-semibold block">{latestProof.title}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              Status:{" "}
                              {latestProof.status === "APPROVED" ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Aprovada pelo Cliente</span>
                              ) : latestProof.status === "REVISION_REQUESTED" ? (
                                <span className="text-amber-600 dark:text-amber-400 font-bold">Ajuste Solicitado</span>
                              ) : (
                                <span className="text-blue-600 dark:text-blue-400 font-bold">Aguardando Avaliação</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/portal/provas/${latestProof.id}`}
                          target="_blank"
                          className="text-xs text-glessios-orange hover:underline font-bold flex items-center gap-1"
                        >
                          Ver Prova
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 italic flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-glessios-orange" />
                        Nenhuma prova de arte enviada ao cliente ainda.
                      </div>
                    )}
                  </div>

                  {/* Ações Operacionais M3 */}
                  <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setUploadModalOrder(order);
                          setProofForm({
                            title: `Prova de Arte v${(order.artworkProofs[0]?.version || 0) + 1} — ${order.title}`,
                            fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-glessios-orange" />
                        Prova de Arte
                      </button>

                      <Link href={`/admin/propostas/${order.id}`} target="_blank">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          Proposta A4
                        </span>
                      </Link>

                      <Link href="/admin/estoque">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                          <Package className="w-3.5 h-3.5 text-amber-500" />
                          Estoque
                        </span>
                      </Link>

                      <Link href="/admin/financeiro">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          Faturas
                        </span>
                      </Link>
                    </div>

                    {currentStageIdx < STAGES.length - 1 && (
                      <button
                        onClick={() => handleAdvanceStage(order.id, order.currentStage)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-glessios-orange hover:bg-glessios-orange-hover text-white shadow-sm transition-all"
                      >
                        Avançar Etapa
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Modal para Upload/Cadastro de Prova Digital de Arte - Padrão M3 Expressive Dialog */}
      {uploadModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
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
                  Ao confirmar, o WhatsApp do cliente (<strong className="text-zinc-800 dark:text-zinc-200">{uploadModalOrder.customer?.user?.phone}</strong>) receberá a mensagem oficial com o link direto de aprovação.
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
