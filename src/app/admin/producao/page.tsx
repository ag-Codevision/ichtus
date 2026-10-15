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
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body">
      <AdminNav />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full flex flex-col space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glessios-border-dark">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Layers className="w-7 h-7 text-glessios-orange" />
              Esteira de Produção Fabril & Ordens de Serviço
            </h1>
            <p className="text-xs text-glessios-text-body">
              Acompanhe a linha de corte CNC, impressão UV, montagem e envie provas digitais de arte ao cliente com disparo no WhatsApp via WACLI.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-glessios-graphite px-4 py-2 rounded-xl border border-glessios-border-dark text-xs">
            <div>
              <span className="text-[10px] text-glessios-text-body block uppercase">Em Produção</span>
              <span className="text-sm font-bold text-glessios-orange font-mono">
                {orders.filter((o) => o.currentStage !== "INSTALLED_COMPLETED").length} OSs
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-glessios-text-body block uppercase">Concluídas</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {orders.filter((o) => o.currentStage === "INSTALLED_COMPLETED").length}
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Visual das 8 Etapas Industriais */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedStage("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStage === "ALL"
                ? "bg-white text-black font-bold"
                : "bg-glessios-graphite text-glessios-text-body hover:text-white border border-glessios-border-dark"
            }`}
          >
            Todas as Etapas ({orders.length})
          </button>
          {STAGES.map((st, idx) => {
            const count = orders.filter((o) => o.currentStage === st.id).length;
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStage === st.id
                    ? "bg-glessios-orange text-white shadow-orange-glow"
                    : "bg-glessios-graphite text-glessios-text-body hover:text-white border border-glessios-border-dark"
                }`}
              >
                <span className="font-mono text-[10px] opacity-60">{idx + 1}.</span>
                <Icon className="w-3.5 h-3.5" style={{ color: selectedStage === st.id ? "#fff" : st.color }} />
                <span>{st.label}</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barra de Busca */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-glessios-text-body absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código da OS, cliente ou serviço..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-glessios-graphite border border-glessios-border-dark text-white text-xs placeholder:text-glessios-text-body/40 focus:outline-none focus:border-glessios-orange"
          />
        </div>

        {/* Lista de Ordens de Serviço */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-glessios-text-body">
            Carregando esteira fabril...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-glessios-graphite border border-glessios-border-dark">
            <Layers className="w-10 h-10 text-glessios-orange mx-auto mb-3 opacity-60" />
            <h4 className="text-white font-bold text-sm">Nenhuma Ordem de Serviço nesta etapa</h4>
            <p className="text-xs text-glessios-text-body mt-1">
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
                  className="rounded-2xl bg-glessios-graphite border border-glessios-border-dark p-6 flex flex-col justify-between space-y-5 hover:border-glessios-orange/40 hover:shadow-card-hover transition-all"
                >
                  <div className="space-y-4">
                    {/* Código & Prioridade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono text-white bg-glessios-charcoal px-3 py-1 rounded-lg border border-glessios-border-dark">
                          {order.code}
                        </span>
                        <Badge variant="orange" className="text-[10px]">
                          {order.priority}
                        </Badge>
                      </div>

                      <span className="text-sm font-extrabold font-mono text-glessios-orange">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    {/* Título & Cliente */}
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {order.title}
                      </h3>
                      <p className="text-xs text-glessios-text-body mt-1">
                        Cliente: <span className="text-white font-medium">{order.customer?.user?.name}</span>
                        {order.customer?.tradeName && ` (${order.customer.tradeName})`}
                      </p>
                    </div>

                    {/* Barra de Progresso Industrial */}
                    <div className="space-y-1.5 bg-glessios-charcoal p-3.5 rounded-xl border border-glessios-border-dark">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageInfo.color }} />
                          {stageInfo.label}
                        </span>
                        <span className="font-mono text-glessios-orange font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-orange-gradient h-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Se houver Prova de Arte cadastrada */}
                    {latestProof ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-glessios-orange shrink-0" />
                          <div>
                            <span className="text-white font-medium block">{latestProof.title}</span>
                            <span className="text-[10px] text-glessios-text-body">
                              Status:{" "}
                              {latestProof.status === "APPROVED" ? (
                                <span className="text-emerald-400 font-bold">Aprovada pelo Cliente</span>
                              ) : latestProof.status === "REVISION_REQUESTED" ? (
                                <span className="text-amber-400 font-bold">Ajuste Solicitado</span>
                              ) : (
                                <span className="text-blue-400 font-bold">Aguardando Avaliação</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/portal/provas/${latestProof.id}`}
                          target="_blank"
                          className="text-xs text-glessios-orange hover:underline flex items-center gap-1"
                        >
                          Ver Prova
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="text-[11px] text-glessios-text-body/70 italic flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-glessios-orange" />
                        Nenhuma prova de arte enviada ao cliente ainda.
                      </div>
                    )}
                  </div>

                  {/* Ações Operacionais Integradas (Admin & Chão de Fábrica) */}
                  <div className="pt-4 border-t border-glessios-border-dark flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadModalOrder(order);
                          setProofForm({
                            title: `Prova de Arte v${(order.artworkProofs[0]?.version || 0) + 1} — ${order.title}`,
                            fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
                          });
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-glessios-orange" />
                        Prova de Arte
                      </Button>

                      <Link href={`/admin/propostas/${order.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-glessios-text-body hover:text-white">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          Proposta A4
                        </Button>
                      </Link>

                      <Link href="/admin/estoque">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-glessios-text-body hover:text-white">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          Baixar Estoque
                        </Button>
                      </Link>

                      <Link href="/admin/financeiro">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-glessios-text-body hover:text-white">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          Faturas & PIX
                        </Button>
                      </Link>
                    </div>

                    {currentStageIdx < STAGES.length - 1 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAdvanceStage(order.id, order.currentStage)}
                        className="gap-1 text-xs font-bold shrink-0"
                      >
                        Avançar Etapa
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal para Upload/Cadastro de Prova Digital de Arte */}
      {uploadModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-glessios-graphite border border-glessios-border-orange/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-glessios-border-dark">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-glessios-orange" />
                  Enviar Prova de Arte
                </h3>
                <span className="text-xs text-glessios-text-body">
                  Ordem de Serviço: <strong className="text-white">{uploadModalOrder.code}</strong>
                </span>
              </div>
              <button
                onClick={() => setUploadModalOrder(null)}
                className="text-glessios-text-body hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProof} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Identificação da Prova
                </label>
                <input
                  type="text"
                  required
                  value={proofForm.title}
                  onChange={(e) => setProofForm({ ...proofForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  URL da Arte Renderizada (Mockup 3D / Imagem)
                </label>
                <input
                  type="url"
                  required
                  value={proofForm.fileUrl}
                  onChange={(e) => setProofForm({ ...proofForm, fileUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
                <span className="text-[10px] text-glessios-text-body block">
                  O cliente visualizará esta arte no portal e poderá aprovar diretamente no celular.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-xs space-y-1 text-glessios-text-body">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Disparo Automático via WACLI (WhatsApp)
                </span>
                <p className="text-[11px]">
                  Ao confirmar, o WhatsApp do cliente (<strong className="text-white">{uploadModalOrder.customer?.user?.phone}</strong>) receberá a mensagem oficial com o link direto de aprovação.
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
