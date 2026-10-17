"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  Calendar,
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Wrench,
  Truck,
  Eye,
  X,
} from "lucide-react";

interface CustomerDashboardData {
  customer: {
    id: string;
    tradeName: string;
    companyName: string | null;
    documentNumber: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    user: { id: string; name: string; email: string; phone: string | null };
  };
  serviceOrders: Array<{
    id: string;
    code: string;
    title: string;
    description: string | null;
    currentStage: string;
    priority: string;
    deadline: string | null;
    installationDate: string | null;
    totalAmount: number;
    progressPercentage: number;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      widthMeters: number | null;
      heightMeters: number | null;
    }>;
    artworkProofs: Array<{
      id: string;
      version: number;
      title: string;
      fileUrl: string;
      status: "PENDING_CUSTOMER_REVIEW" | "APPROVED" | "REVISION_REQUESTED";
      customerNotes: string | null;
      reviewedAt: string | null;
    }>;
  }>;
  invoices: Array<{
    id: string;
    code: string;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    paymentMethod: string | null;
    pixCopyPasteCode: string | null;
    pixQrCodeBase64: string | null;
    serviceOrder: { code: string; title: string };
  }>;
  pendingProofs: Array<{
    id: string;
    version: number;
    title: string;
    fileUrl: string;
    serviceOrder: { id: string; code: string; title: string };
  }>;
  appointments: Array<{
    id: string;
    title: string;
    type: string;
    scheduledAt: string;
    durationMinutes: number;
    locationAddress: string | null;
    assignedTeam: string | null;
    serviceOrder?: { code: string; title: string } | null;
  }>;
  metrics: {
    totalOrders: number;
    activeOrders: number;
    pendingProofsCount: number;
    pendingInvoicesCount: number;
  };
}

const STAGES_LIST = [
  { id: "BRIEFING_ARTWORK", label: "Briefing & Arte", step: 1 },
  { id: "ARTWORK_APPROVAL", label: "Aprovação de Prova", step: 2 },
  { id: "CNC_ROUTER_CUTTING", label: "Corte CNC Router", step: 3 },
  { id: "DIGITAL_PRINTING", label: "Impressão UV", step: 4 },
  { id: "ASSEMBLY_STRUCTURE", label: "Serralheria & Solda", step: 5 },
  { id: "QUALITY_CONTROL", label: "Acabamento & Elétrica LED", step: 6 },
  { id: "READY_FOR_INSTALLATION", label: "Pronto para Instalação", step: 7 },
  { id: "INSTALLED_COMPLETED", label: "Instalação Concluída", step: 8 },
];

export default function PortalDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ORDERS" | "PROOFS" | "FINANCIAL" | "APPOINTMENTS">("ORDERS");

  // Modal de PIX
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedInvoiceForPix, setSelectedInvoiceForPix] = useState<CustomerDashboardData["invoices"][0] | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/portal/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do portal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    document.cookie = "glessios_portal_session=; path=/; max-age=0";
    router.push("/portal/login");
  };

  const openPix = (inv: CustomerDashboardData["invoices"][0]) => {
    setSelectedInvoiceForPix(inv);
    setCopiedPix(false);
    setPixModalOpen(true);
  };

  const copyPixCode = () => {
    if (selectedInvoiceForPix?.pixCopyPasteCode) {
      navigator.clipboard.writeText(selectedInvoiceForPix.pixCopyPasteCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-glessios-dark flex items-center justify-center text-white text-sm">
        Carregando seu portal do cliente...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-glessios-dark flex flex-col items-center justify-center text-white gap-4 p-6">
        <h2 className="text-xl font-bold">Não foi possível carregar seus dados</h2>
        <Button onClick={() => router.push("/portal/login")} variant="outline" className="text-white border-white/20">
          Voltar para o Login
        </Button>
      </div>
    );
  }

  const primaryOrder = data.serviceOrders[0];

  return (
    <div className="min-h-screen bg-glessios-dark text-glessios-ivory flex flex-col font-sans">
      {/* Barra de Navegação do Portal */}
      <header className="bg-glessios-graphite border-b border-glessios-border-dark sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-gradient flex items-center justify-center font-extrabold text-white text-base shadow-orange-glow">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm tracking-tight">GLESSIOS</span>
                <span className="text-[9px] uppercase tracking-widest text-glessios-orange font-mono -mt-0.5">
                  Portal do Cliente
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{data.customer.tradeName}</span>
              <span className="text-[10px] text-glessios-text-muted">{data.customer.user.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-glessios-border-dark bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs gap-1.5 h-8 px-3 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5 text-glessios-text-muted" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Boas-Vindas */}
        <div className="bg-gradient-to-r from-glessios-graphite via-glessios-graphite to-glessios-charcoal border border-glessios-border-orange/30 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-glessios-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-glessios-orange/20 text-glessios-orange border border-glessios-border-orange text-xs font-bold px-3 py-0.5">
                  Área Exclusiva do Contratante
                </Badge>
                {data.metrics.pendingProofsCount > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold animate-pulse">
                    Arte Aguardando Sua Aprovação
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Olá, {data.customer.user.name}!
              </h1>
              <p className="text-sm text-glessios-text-body mt-1 max-w-2xl">
                Acompanhe a fabricação da sua fachada em tempo real, aprove maquetes de arte com 1 clique e acesse cobranças instantâneas via PIX.
              </p>
            </div>

            {primaryOrder && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shrink-0 min-w-[260px]">
                <span className="text-[11px] text-glessios-text-muted font-mono uppercase tracking-wider">
                  Ordem Principal em Andamento
                </span>
                <span className="font-mono text-base font-black text-glessios-orange mt-0.5">
                  {primaryOrder.code}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[240px] mt-0.5">
                  {primaryOrder.title}
                </span>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-glessios-text-body">Progresso Fabril:</span>
                  <span className="font-bold text-white font-mono">{primaryOrder.progressPercentage}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificação em Destaque: Prova de Arte Pendente */}
        {data.pendingProofs.length > 0 && (
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-950/20">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Prova Digital de Arte Pronta para Avaliação!
                </h4>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  Nossa equipe de design finalizou o layout da sua ordem <strong>{data.pendingProofs[0].serviceOrder.code}</strong>. Avalie o mockup 3D para liberar a usinagem CNC.
                </p>
              </div>
            </div>

            <Link
              href={`/portal/provas/${data.pendingProofs[0].id}`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Avaliar & Aprovar Prova
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4 Cards de Métricas do Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Projetos Ativos
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {data.metrics.activeOrders} obra(s)
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Em esteira de fabricação fabril
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-glessios-orange">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Provas de Arte
              </span>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {data.metrics.pendingProofsCount} pendente(s)
              </div>
              <span className="text-[11px] text-purple-400/80 mt-0.5 block">
                Aguardando sua validação
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Previsão de Instalação
              </span>
              <div className="text-xl font-black text-white mt-1">
                {primaryOrder?.deadline ? formatDate(primaryOrder.deadline) : "A definir"}
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Cascavel e região metropolitana
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Cobranças PIX
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {data.metrics.pendingInvoicesCount} a pagar
              </div>
              <span className="text-[11px] text-emerald-500/80 mt-0.5 block">
                Liberação instantânea pós-pagamento
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Cliente */}
        <div className="flex items-center gap-2 border-b border-glessios-border-dark mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === "ORDERS" ? "text-glessios-orange" : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Linha de Produção & Timeline
            </div>
            {activeTab === "ORDERS" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />}
          </button>

          <button
            onClick={() => setActiveTab("PROOFS")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === "PROOFS" ? "text-glessios-orange" : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Provas Digitais de Arte ({data.serviceOrders.flatMap((o) => o.artworkProofs).length})
            </div>
            {activeTab === "PROOFS" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />}
          </button>

          <button
            onClick={() => setActiveTab("FINANCIAL")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === "FINANCIAL" ? "text-glessios-orange" : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Faturas & Pagamentos PIX ({data.invoices.length})
            </div>
            {activeTab === "FINANCIAL" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />}
          </button>

          <button
            onClick={() => setActiveTab("APPOINTMENTS")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === "APPOINTMENTS" ? "text-glessios-orange" : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Instalação & Cronograma de Campo ({data.appointments.length})
            </div>
            {activeTab === "APPOINTMENTS" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />}
          </button>
        </div>

        {/* Aba 1: Linha de Produção & Timeline Industrial */}
        {activeTab === "ORDERS" && (
          <div className="space-y-6">
            {data.serviceOrders.map((os) => (
              <div
                key={os.id}
                className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl p-6 shadow-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-glessios-border-dark gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-glessios-orange bg-glessios-orange/10 px-2.5 py-0.5 rounded border border-glessios-border-orange">
                        {os.code}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        Em Fabricação
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white">{os.title}</h3>
                    {os.description && (
                      <p className="text-xs text-glessios-text-body mt-1 max-w-3xl">{os.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/propostas/${os.id}`}
                      target="_blank"
                      className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-glessios-orange" />
                      Proposta / Memorial em PDF
                    </Link>
                  </div>
                </div>

                {/* Esteira Fabril das 8 Etapas */}
                <div className="py-6 border-b border-glessios-border-dark">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-glessios-text-body">
                      Esteira Industrial de Fabricação
                    </span>
                    <span className="text-xs font-mono font-bold text-glessios-orange">
                      Etapa Atual: {STAGES_LIST.find((s) => s.id === os.currentStage)?.label || os.currentStage}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {STAGES_LIST.map((stage, idx) => {
                      const currentStageIdx = STAGES_LIST.findIndex((s) => s.id === os.currentStage);
                      const isCompleted = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div
                          key={stage.id}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : isCurrent
                              ? "bg-glessios-orange/20 border-glessios-orange text-white shadow-orange-glow"
                              : "bg-glessios-charcoal/50 border-white/5 text-glessios-text-muted opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isCurrent ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-glessios-orange animate-ping" />
                            ) : (
                              <span className="text-[10px] font-mono text-glessios-text-muted">{stage.step}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold block leading-tight">
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Itens do Projeto */}
                <div className="pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-glessios-text-body mb-3">
                    Itens e Especificações Técnicas de Fabricação
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {os.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-glessios-charcoal border border-glessios-border-dark p-3.5 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white text-xs block">{item.description}</span>
                          <span className="text-[11px] text-glessios-text-muted">
                            Dimensões: {item.widthMeters && item.heightMeters ? `${item.widthMeters}m x ${item.heightMeters}m` : "Conforme Memorial Técnico"}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-glessios-orange">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aba 2: Provas Digitais de Arte */}
        {activeTab === "PROOFS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.serviceOrders.flatMap((o) => o.artworkProofs).map((proof) => (
              <div
                key={proof.id}
                className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div className="relative h-56 bg-zinc-900 border-b border-glessios-border-dark overflow-hidden group">
                  <img
                    src={proof.fileUrl}
                    alt={proof.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold">
                      Versão {proof.version}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {proof.status === "APPROVED" ? (
                      <Badge className="bg-emerald-500 text-white font-bold text-xs">
                        Aprovada Sem Ressalvas
                      </Badge>
                    ) : proof.status === "REVISION_REQUESTED" ? (
                      <Badge className="bg-amber-500 text-black font-bold text-xs">
                        Ajuste Solicitado
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-600 text-white font-bold text-xs animate-pulse">
                        Aguardando Sua Decisão
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{proof.title}</h4>
                    <p className="text-xs text-glessios-text-body">
                      Mockup 3D em escala real com especificação de pintura automotiva e iluminação LED 6500K.
                    </p>
                    {proof.customerNotes && (
                      <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-glessios-text-body">
                        <strong>Suas observações:</strong> {proof.customerNotes}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-glessios-border-dark flex items-center justify-between">
                    <span className="text-[11px] text-glessios-text-muted">
                      {proof.reviewedAt ? `Validada em ${formatDate(proof.reviewedAt)}` : "Pendente de validação"}
                    </span>
                    <Link
                      href={`/portal/provas/${proof.id}`}
                      className="px-4 py-2 bg-glessios-orange hover:bg-glessios-orange-light text-white rounded-xl text-xs font-bold transition-all shadow-orange-glow flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar Maquete
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aba 3: Faturas & Pagamentos PIX */}
        {activeTab === "FINANCIAL" && (
          <div className="bg-glessios-graphite rounded-2xl border border-glessios-border-dark overflow-hidden shadow-xl">
            {data.invoices.length === 0 ? (
              <div className="py-20 text-center text-glessios-text-muted text-sm">
                Nenhuma fatura emitida para sua empresa até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-glessios-border-dark bg-white/[0.02] text-glessios-text-body uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Fatura / Ordem</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center">Pagamento Instantâneo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glessios-border-dark">
                    {data.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-white font-bold block">{inv.code}</span>
                          <span className="text-[11px] text-glessios-text-muted">{inv.serviceOrder.title}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-white">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.status === "PAID" ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              Liquidada com Sucesso
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                              Pendente de Pagamento
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {inv.status === "PENDING" ? (
                            <button
                              onClick={() => openPix(inv)}
                              className="px-3 py-1.5 bg-glessios-orange/20 hover:bg-glessios-orange/30 text-glessios-orange border border-glessios-border-orange rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Pagar com PIX
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Recibo Disponível
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aba 4: Instalação & Cronograma de Campo */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {data.appointments.length === 0 ? (
              <div className="bg-glessios-graphite p-12 rounded-2xl border border-glessios-border-dark text-center">
                <Truck className="w-12 h-12 text-glessios-text-muted mx-auto mb-3 opacity-30" />
                <h4 className="text-base font-bold text-white">Nenhum agendamento de campo agendado</h4>
                <p className="text-xs text-glessios-text-body mt-1">
                  Assim que sua fachada for finalizada e passar pelo teste de qualidade, nossa equipe agendará a fixação e ligação elétrica.
                </p>
              </div>
            ) : (
              data.appointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-glessios-orange font-bold uppercase">
                        {app.type === "EXTERNAL_INSTALLATION" ? "Instalação de Campo" : "Visita Técnica & Medição"}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{app.title}</h4>
                      {app.locationAddress && (
                        <p className="text-xs text-glessios-text-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-glessios-orange" />
                          {app.locationAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left md:text-right font-mono text-xs text-glessios-text-body space-y-1">
                    <div className="text-white font-bold text-sm">
                      {formatDate(app.scheduledAt)} às{" "}
                      {new Date(app.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <span className="text-glessios-text-muted block">
                      Equipe alocada: {app.assignedTeam || "Equipe Alpha de Instalação Glessios"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal de Pagamento PIX */}
      {pixModalOpen && selectedInvoiceForPix && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-glessios-orange/15 border border-glessios-border-orange flex items-center justify-center mx-auto mb-3 text-glessios-orange">
              <QrCode className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider">
              {selectedInvoiceForPix.code}
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              Pagamento Instantâneo via PIX
            </h3>
            <p className="text-xs text-glessios-text-body mt-1 mb-5">
              {selectedInvoiceForPix.serviceOrder.title}
            </p>

            {/* QR Code Vetorial */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-4 border-2 border-glessios-orange">
              {selectedInvoiceForPix.pixQrCodeBase64 ? (
                <img
                  src={selectedInvoiceForPix.pixQrCodeBase64}
                  alt="QR Code PIX"
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-black text-xs">
                  QR Code Indisponível
                </div>
              )}
            </div>

            <div className="text-2xl font-black text-white mb-4 font-mono">
              {formatCurrency(selectedInvoiceForPix.amount)}
            </div>

            {/* Código Copia e Cola */}
            <div className="bg-glessios-charcoal border border-glessios-border-dark rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-[11px] text-glessios-text-muted truncate text-left flex-1 select-all">
                {selectedInvoiceForPix.pixCopyPasteCode}
              </span>
              <button
                onClick={copyPixCode}
                className="px-3 py-1.5 bg-glessios-orange hover:bg-glessios-orange-light text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-glessios-text-muted mb-4">
              Abra o aplicativo do seu banco, escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code acima.
            </p>

            <Button
              variant="outline"
              onClick={() => setPixModalOpen(false)}
              className="w-full border-glessios-border-dark text-white text-xs font-semibold"
            >
              Fechar Janela
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
