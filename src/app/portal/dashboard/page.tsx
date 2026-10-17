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
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Calendar,
  FileText,
  LogOut,
  ChevronRight,
  Truck,
  Eye,
  X,
  UserCog,
  MapPin,
} from "lucide-react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

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
    user: { id: string; name: string; email?: string; phone: string | null; avatarUrl?: string | null };
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
  { id: "READY_FOR_INSTALLATION", label: "Pronto p/ Instalação", step: 7 },
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

  // Modal de Edição de Perfil do Cliente
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
      <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0E0F12] flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-xs">
        <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
        Carregando seu portal do cliente...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0E0F12] flex flex-col items-center justify-center text-zinc-900 dark:text-white gap-4 p-6">
        <h2 className="text-xl font-bold">Não foi possível carregar seus dados</h2>
        <Button onClick={() => router.push("/portal/login")} variant="outline" className="rounded-full">
          Voltar para o Login
        </Button>
      </div>
    );
  }

  const primaryOrder = data.serviceOrders[0];

  return (
    <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Barra de Navegação do Portal - M3 Expressive Header */}
      <header className="bg-white/80 dark:bg-[#141519]/80 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-gradient flex items-center justify-center font-extrabold text-white text-base shadow-sm">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-zinc-900 dark:text-white text-sm tracking-tight">GLESSIOS</span>
                <span className="text-[9px] uppercase tracking-widest text-glessios-orange font-mono -mt-0.5 font-bold">
                  Portal do Cliente
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Informações do Cliente & Botão de Editar Perfil (Conforme LGPD: sem exibir e-mail) */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-2.5 p-1 pl-3 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all text-left group"
              title="Clique para editar seu nome e foto de perfil"
            >
              <div className="hidden sm:flex flex-col text-right max-w-[150px]">
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-glessios-orange transition-colors truncate">
                  {data.customer.user.name || data.customer.tradeName}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono -mt-0.5 truncate">
                  Cliente Contratante
                </span>
              </div>

              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500/40 bg-orange-gradient flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  {data.customer.user.avatarUrl ? (
                    <img
                      src={data.customer.user.avatarUrl}
                      alt={data.customer.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(data.customer.user.name?.[0] || data.customer.tradeName?.[0] || "C").toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#141519]" />
              </div>

              <UserCog className="w-3.5 h-3.5 text-zinc-400 group-hover:text-glessios-orange transition-colors hidden sm:block mr-1" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs gap-1.5 h-8 px-3 rounded-full font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Boas-Vindas - M3 Expressive Card */}
        <div className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-m3-1">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                  Área do Cliente
                </span>
                {data.metrics.pendingProofsCount > 0 && (
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 animate-pulse">
                    Arte Aguardando Sua Aprovação
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Olá, {data.customer.user.name}!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
                Acompanhe a fabricação da sua fachada em tempo real, aprove maquetes de arte com 1 clique e acesse cobranças instantâneas via PIX.
              </p>
            </div>

            {primaryOrder && (
              <div className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between shrink-0 min-w-[260px]">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">
                  Ordem Principal em Andamento
                </span>
                <span className="font-mono text-base font-black text-glessios-orange mt-0.5">
                  {primaryOrder.code}
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[240px] mt-0.5">
                  {primaryOrder.title}
                </span>

                <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Progresso Fabril:</span>
                  <span className="font-bold text-zinc-900 dark:text-white font-mono">{primaryOrder.progressPercentage}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificação em Destaque: Prova de Arte Pendente */}
        {data.pendingProofs.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Prova Digital de Arte Pronta para Avaliação!
                </h4>
                <p className="text-xs text-purple-900/70 dark:text-purple-200/80 mt-0.5">
                  Nossa equipe de design finalizou o layout da sua ordem <strong>{data.pendingProofs[0].serviceOrder.code}</strong>. Avalie o mockup 3D para liberar a usinagem CNC.
                </p>
              </div>
            </div>

            <Link
              href={`/portal/provas/${data.pendingProofs[0].id}`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Avaliar & Aprovar Prova
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4 Cards de Métricas do Cliente - M3 Expressive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#18191E] p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Projetos Ativos
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {data.metrics.activeOrders} obra(s)
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Em fabricação no galpão
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center text-glessios-orange">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18191E] p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Provas de Arte
              </span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {data.metrics.pendingProofsCount} pendente(s)
              </div>
              <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-0.5 block font-semibold">
                Aguardando sua validação
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18191E] p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Previsão de Instalação
              </span>
              <div className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                {primaryOrder?.deadline ? formatDate(primaryOrder.deadline) : "A definir"}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Cascavel e região
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18191E] p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Cobranças PIX
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.metrics.pendingInvoicesCount} a pagar
              </div>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block font-semibold">
                Liberação instantânea
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Cliente - M3 Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] mb-6 overflow-x-auto scrollbar-none w-fit">
          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ORDERS"
                ? "bg-white dark:bg-[#252730] text-zinc-900 dark:text-white shadow-sm font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Linha de Produção & Timeline
          </button>

          <button
            onClick={() => setActiveTab("PROOFS")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "PROOFS"
                ? "bg-white dark:bg-[#252730] text-zinc-900 dark:text-white shadow-sm font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Provas Digitais ({data.serviceOrders.flatMap((o) => o.artworkProofs).length})
          </button>

          <button
            onClick={() => setActiveTab("FINANCIAL")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "FINANCIAL"
                ? "bg-white dark:bg-[#252730] text-zinc-900 dark:text-white shadow-sm font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Faturas PIX ({data.invoices.length})
          </button>

          <button
            onClick={() => setActiveTab("APPOINTMENTS")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "APPOINTMENTS"
                ? "bg-white dark:bg-[#252730] text-zinc-900 dark:text-white shadow-sm font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4" />
            Instalação & Cronograma ({data.appointments.length})
          </button>
        </div>

        {/* Aba 1: Linha de Produção & Timeline Industrial */}
        {activeTab === "ORDERS" && (
          <div className="space-y-6">
            {data.serviceOrders.map((os) => (
              <div
                key={os.id}
                className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-m3-1"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-black/[0.06] dark:border-white/[0.06] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-glessios-orange bg-orange-500/10 px-3 py-0.5 rounded-full border border-orange-500/20">
                        {os.code}
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        Em Fabricação
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{os.title}</h3>
                    {os.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">{os.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/propostas/${os.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.04] rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-glessios-orange" />
                      Proposta / Memorial em PDF
                    </Link>
                  </div>
                </div>

                {/* Esteira Fabril das 8 Etapas */}
                <div className="py-6 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium"
                              : isCurrent
                              ? "bg-orange-500/15 border-orange-500 text-zinc-900 dark:text-white font-bold shadow-sm"
                              : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-zinc-400 dark:text-zinc-500 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : isCurrent ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-glessios-orange animate-ping" />
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-400">{stage.step}</span>
                            )}
                          </div>
                          <span className="text-[10px] block leading-tight">
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Itens do Projeto */}
                <div className="pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                    Itens e Especificações Técnicas de Fabricação
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {os.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] p-3.5 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white text-xs block">{item.description}</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
                className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-m3-1 flex flex-col justify-between"
              >
                <div className="relative h-56 bg-zinc-100 dark:bg-zinc-900 border-b border-black/[0.06] dark:border-white/[0.06] overflow-hidden group">
                  <img
                    src={proof.fileUrl}
                    alt={proof.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold rounded-full">
                      Versão {proof.version}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {proof.status === "APPROVED" ? (
                      <Badge className="bg-emerald-600 text-white font-bold text-xs rounded-full">
                        Aprovada Sem Ressalvas
                      </Badge>
                    ) : proof.status === "REVISION_REQUESTED" ? (
                      <Badge className="bg-amber-500 text-black font-bold text-xs rounded-full">
                        Ajuste Solicitado
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-600 text-white font-bold text-xs animate-pulse rounded-full">
                        Aguardando Sua Decisão
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1">{proof.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Mockup 3D em escala real com especificação de pintura automotiva e iluminação LED 6500K.
                    </p>
                    {proof.customerNotes && (
                      <div className="mt-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Suas observações:</strong> {proof.customerNotes}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {proof.reviewedAt ? `Validada em ${formatDate(proof.reviewedAt)}` : "Pendente de validação"}
                    </span>
                    <Link
                      href={`/portal/provas/${proof.id}`}
                      className="px-4 py-2 bg-orange-gradient hover:opacity-95 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
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
          <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-1">
            {data.invoices.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                Nenhuma fatura emitida para sua empresa até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">Fatura / Ordem</th>
                      <th className="py-3.5 px-5">Vencimento</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Valor</th>
                      <th className="py-3.5 px-5 text-center">Pagamento Instantâneo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {data.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-mono text-zinc-900 dark:text-white font-bold block">{inv.code}</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{inv.serviceOrder.title}</span>
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-800 dark:text-zinc-200">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-4 px-5">
                          {inv.status === "PAID" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                              Liquidada com Sucesso
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                              Pendente de Pagamento
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right font-mono font-black text-sm text-zinc-900 dark:text-white">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-4 px-5 text-center">
                          {inv.status === "PENDING" ? (
                            <button
                              onClick={() => openPix(inv)}
                              className="px-3.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-glessios-orange border border-orange-500/20 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Pagar com PIX
                            </button>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
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
              <div className="bg-white dark:bg-[#18191E] p-12 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] text-center shadow-m3-1">
                <Truck className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">Nenhum agendamento de campo agendado</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Assim que sua fachada for finalizada e passar pelo teste de qualidade, nossa equipe agendará a fixação e ligação elétrica.
                </p>
              </div>
            ) : (
              data.appointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-m3-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider">
                        {app.type === "EXTERNAL_INSTALLATION" ? "Instalação de Campo" : "Visita Técnica & Medição"}
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">{app.title}</h4>
                      {app.locationAddress && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-glessios-orange" />
                          {app.locationAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left md:text-right font-mono text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div className="text-zinc-900 dark:text-white font-bold text-sm">
                      {formatDate(app.scheduledAt)} às{" "}
                      {new Date(app.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <span className="text-zinc-400 dark:text-zinc-500 block">
                      Equipe alocada: {app.assignedTeam || "Equipe Alpha de Instalação Glessios"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal de Pagamento PIX - M3 Expressive Dialog */}
      {pixModalOpen && selectedInvoiceForPix && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-center space-y-3">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-2 text-glessios-orange">
              <QrCode className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider block">
              {selectedInvoiceForPix.code}
            </span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Pagamento Instantâneo via PIX
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {selectedInvoiceForPix.serviceOrder.title}
            </p>

            {/* QR Code Vetorial */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm mb-2 border border-black/10">
              {selectedInvoiceForPix.pixQrCodeBase64 ? (
                <img
                  src={selectedInvoiceForPix.pixQrCodeBase64}
                  alt="QR Code PIX"
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-zinc-500 text-xs">
                  QR Code Indisponível
                </div>
              )}
            </div>

            <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
              {formatCurrency(selectedInvoiceForPix.amount)}
            </div>

            {/* Código Copia e Cola */}
            <div className="bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate text-left flex-1 select-all">
                {selectedInvoiceForPix.pixCopyPasteCode}
              </span>
              <button
                onClick={copyPixCode}
                className="px-3 py-1.5 bg-glessios-orange hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
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

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              Abra o aplicativo do seu banco, escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code acima.
            </p>

            <Button
              variant="outline"
              onClick={() => setPixModalOpen(false)}
              className="w-full border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl mt-2"
            >
              Fechar Janela
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfil do Cliente */}
      {data && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          initialData={{
            id: data.customer.user.id,
            name: data.customer.user.name,
            role: "CUSTOMER",
            avatarUrl: data.customer.user.avatarUrl,
            phone: data.customer.user.phone,
          }}
          onProfileUpdated={(updated) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                customer: {
                  ...prev.customer,
                  user: {
                    ...prev.customer.user,
                    name: updated.name,
                    avatarUrl: updated.avatarUrl,
                    phone: updated.phone || null,
                  },
                },
              };
            });
          }}
        />
      )}
    </div>
  );
}
