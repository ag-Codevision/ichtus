"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  M3StaggerContainer,
  M3StaggerItem,
} from "@/components/ui/m3-motion";
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
  ChevronDown,
  Truck,
  Eye,
  X,
  UserCog,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";

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
    user: {
      id: string;
      name: string;
      phone: string | null;
      avatarUrl?: string | null;
    };
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Menu do Avatar do Cliente (Desktop dropdown)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Google Account Bottom Sheet (Mobile)
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsAccountSheetOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/portal/dashboard");
      const json = await res.json();
      if (json.success) {
        // Assegura persistência imediata do avatar mesmo após CTRL+F5
        if (typeof window !== "undefined") {
          const customerUserId = json.customer?.user?.id;
          const cachedAvatar = customerUserId
            ? localStorage.getItem(`glessios_avatar_${customerUserId}`) || localStorage.getItem("glessios_avatar_current")
            : null;

          if (json.customer?.user?.avatarUrl) {
            localStorage.setItem(`glessios_avatar_${customerUserId}`, json.customer.user.avatarUrl);
            localStorage.setItem("glessios_avatar_current", json.customer.user.avatarUrl);
          } else if (cachedAvatar) {
            json.customer.user.avatarUrl = cachedAvatar;
          }
        }
        setData(json);
      } else {
        router.push("/portal/login");
      }
    } catch (err) {
      console.error("Erro ao carregar dados do portal:", err);
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    document.cookie = "glessios_portal_session=; path=/; max-age=0";
    if (typeof window !== "undefined") {
      localStorage.removeItem("glessios_avatar_current");
    }
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
  const userInitials = (data.customer.user.name?.[0] || data.customer.tradeName?.[0] || "C").toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* ======================================================== */}
      {/* 1. TOP APP BAR ESTILO GOOGLE (Mobile & Desktop) */}
      {/* ======================================================== */}
      <header className="bg-white/90 dark:bg-[#141519]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo e Identificação */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/" className="inline-flex items-center gap-2.5 py-1 group" aria-label="ICTHUS - Soluções & Design">
              <Image
                src="/logo-horizontal-escuro.png"
                alt="ICTHUS Soluções & Design"
                width={140}
                height={32}
                priority
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-102 transition-transform dark:hidden"
              />
              <Image
                src="/logo-web.png"
                alt="ICTHUS Soluções & Design"
                width={140}
                height={32}
                priority
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-102 transition-transform hidden dark:block"
              />
              <div className="hidden sm:block h-4 w-px bg-black/10 dark:bg-white/10" />
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-glessios-orange font-mono font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Portal do Cliente
              </span>
            </Link>
          </div>

          {/* Ações Rápidas: Alternador de Tema (apenas Desktop) + Google Account Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Avatar do Usuário (Desktop: Dropdown | Mobile: Abre Google Account Sheet) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsAccountSheetOpen(true);
                  } else {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }
                }}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pl-3 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:border-glessios-orange/40 transition-all text-left group focus:outline-none"
                aria-expanded={isUserMenuOpen || isAccountSheetOpen}
                aria-label="Conta do Usuário"
              >
                <div className="hidden sm:flex flex-col text-right max-w-[160px]">
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
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#141519]" />
                </div>

                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-zinc-400 group-hover:text-glessios-orange transition-transform duration-200 mr-1 ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Submenu Dropdown Desktop (Conforme LGPD: sem expor e-mail) */}
              {isUserMenuOpen && (
                <div className="hidden md:block absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Cabeçalho do Submenu */}
                  <div className="p-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Sessão Segura • LGPD Protegido
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {data.customer.user.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      {data.customer.tradeName || data.customer.companyName || "Loja Concept Batel"}
                    </p>
                  </div>

                  {/* Ações do Submenu Desktop */}
                  <div className="py-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsEditProfileOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCog className="w-4 h-4 text-glessios-orange" />
                        <span>Editar Perfil & Foto</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <KeyRound className="w-4 h-4 text-[#FF650F]" />
                        <span>Alterar Minha Senha</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <div className="border-t border-black/[0.06] dark:border-white/[0.06] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. GOOGLE ACCOUNT SHEET (Diálogo Mobile estilo App do Google) */}
      {/* ======================================================== */}
      {isAccountSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full bg-white dark:bg-[#1E1F25] rounded-t-3xl border-t border-black/10 dark:border-white/10 shadow-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto"
          >
            {/* Puxador M3 */}
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto" />

            {/* Cabeçalho com Fechar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Conta ICTHUS
              </span>
              <button
                onClick={() => setIsAccountSheetOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card Central da Conta estilo Google */}
            <div className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-3xl p-5 flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500/50 bg-orange-gradient flex items-center justify-center font-black text-white text-xl shadow-md">
                  {data.customer.user.avatarUrl ? (
                    <img
                      src={data.customer.user.avatarUrl}
                      alt={data.customer.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsAccountSheetOpen(false);
                    setIsEditProfileOpen(true);
                  }}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-glessios-orange text-white shadow-md border-2 border-white dark:border-[#1E1F25]"
                  title="Alterar foto"
                >
                  <UserCog className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {data.customer.user.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {data.customer.tradeName || data.customer.companyName || "Cliente Contratante"}
                </p>
                {/* Conforme LGPD: sem expor e-mail */}
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conta Protegida • LGPD</span>
                </div>
              </div>

              {/* Botão Pill M3 do Google: Gerenciar Perfil */}
              <button
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  setIsEditProfileOpen(true);
                }}
                className="w-full max-w-xs py-2.5 px-5 rounded-full border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <UserCog className="w-4 h-4 text-glessios-orange" />
                <span>Gerenciar Perfil & Foto</span>
              </button>

              <button
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="w-full max-w-xs py-2.5 px-5 rounded-full border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-[#FF650F]" />
                <span>Alterar Minha Senha</span>
              </button>
            </div>

            {/* Lista de Ações do Google Sheet */}
            <div className="space-y-2 pt-1">
              {/* Alternador de Tema Claro/Escuro (Submenu Mobile no Avatar) */}
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08]">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Modo de Exibição
                </span>
                <ThemeToggle showLabel className="text-xs" />
              </div>

              <a
                href={`https://wa.me/5545999999999?text=${encodeURIComponent(`Olá! Sou ${data.customer.user.name} da empresa ${data.customer.tradeName || "Cliente"} e gostaria de informações sobre o andamento do meu projeto.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Suporte Direto com a Produção</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sair da Conta no Aparelho</span>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 text-center pt-2">
              Privacidade & Termos • ICTHUS Soluções & Design
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONTEÚDO PRINCIPAL (com padding inferior para o menu mobile) */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-8">
        {/* Banner de Boas-Vindas - M3 Expressive Card */}
        <div className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 sm:p-8 mb-6 relative overflow-hidden shadow-m3-1">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
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
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Prova Digital de Arte Pronta para Avaliação!
                </h4>
                <p className="text-xs text-purple-900/70 dark:text-purple-200/80 mt-0.5">
                  Nossa equipe finalizou o layout da ordem <strong>{data.pendingProofs[0].serviceOrder.code}</strong>. Avalie o mockup 3D para liberar a usinagem CNC.
                </p>
              </div>
            </div>

            <Link
              href={`/portal/provas/${data.pendingProofs[0].id}`}
              className="w-full sm:w-auto justify-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Avaliar & Aprovar Prova
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4 Cards de Métricas - Estilo Google App Widgets (Grid 2x2 no Mobile, 4 Colunas no Desktop) */}
        <M3StaggerContainer className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 mb-6">
          {/* Card 1: Projetos Ativos */}
          <M3StaggerItem>
            <div className="bg-white dark:bg-[#18191E] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between h-full group hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  Projetos Ativos
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#FF650F] shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {data.metrics.activeOrders} <span className="text-xs sm:text-sm font-semibold text-zinc-500">obra(s)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block truncate">
                  Em fabricação fabril
                </span>
              </div>
            </div>
          </M3StaggerItem>

          {/* Card 2: Provas de Arte */}
          <M3StaggerItem>
            <div className="bg-white dark:bg-[#18191E] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between h-full group hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  Provas de Arte
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 leading-tight">
                  {data.metrics.pendingProofsCount} <span className="text-xs sm:text-sm font-semibold text-purple-500/80">pendente(s)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-0.5 block font-semibold truncate">
                  Aguardando validação
                </span>
              </div>
            </div>
          </M3StaggerItem>

          {/* Card 3: Previsão de Instalação */}
          <M3StaggerItem>
            <div className="bg-white dark:bg-[#18191E] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between h-full group hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  Instalação
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-black text-zinc-900 dark:text-white leading-tight truncate">
                  {primaryOrder?.deadline ? formatDate(primaryOrder.deadline) : "A definir"}
                </div>
                <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block truncate">
                  Equipe em campo
                </span>
              </div>
            </div>
          </M3StaggerItem>

          {/* Card 4: Cobranças PIX */}
          <M3StaggerItem>
            <div className="bg-white dark:bg-[#18191E] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between h-full group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  Cobranças PIX
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                  {data.metrics.pendingInvoicesCount} <span className="text-xs sm:text-sm font-semibold text-emerald-500/80">a pagar</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block font-semibold truncate">
                  Liberação instantânea
                </span>
              </div>
            </div>
          </M3StaggerItem>
        </M3StaggerContainer>

        {/* Abas no Desktop (No mobile, a navegação é feita pela M3 Bottom Navigation Bar) */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] mb-6 overflow-x-auto scrollbar-none w-fit">
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

        {/* ======================================================== */}
        {/* ABA 1: LINHA DE PRODUÇÃO & TIMELINE INDUSTRIAL */}
        {/* ======================================================== */}
        {activeTab === "ORDERS" && (
          <div className="space-y-6">
            {data.serviceOrders.map((os) => (
              <div
                key={os.id}
                className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 sm:p-8 shadow-m3-1"
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
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{os.title}</h3>
                    {os.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">{os.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/propostas/${os.id}`}
                      target="_blank"
                      className="w-full sm:w-auto justify-center px-4 py-2 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.04] rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5"
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

        {/* ======================================================== */}
        {/* ABA 2: PROVAS DIGITAIS DE ARTE */}
        {/* ======================================================== */}
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

        {/* ======================================================== */}
        {/* ABA 3: FATURAS & PAGAMENTOS PIX */}
        {/* ======================================================== */}
        {activeTab === "FINANCIAL" && (
          <div className="space-y-4">
            {/* Visualização em Cards Táteis para Mobile */}
            <div className="md:hidden space-y-3">
              {data.invoices.length === 0 ? (
                <div className="bg-white dark:bg-[#18191E] p-8 rounded-3xl text-center text-zinc-500 text-xs border border-black/[0.06] dark:border-white/[0.08]">
                  Nenhuma fatura emitida para sua empresa até o momento.
                </div>
              ) : (
                data.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 shadow-m3-1 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-glessios-orange bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                        {inv.code}
                      </span>
                      {inv.status === "PAID" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          Liquidada
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                          Pendente
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {inv.serviceOrder.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                        Vencimento: {formatDate(inv.dueDate)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Valor:</span>
                        <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">
                          {formatCurrency(inv.amount)}
                        </span>
                      </div>

                      {inv.status === "PENDING" ? (
                        <button
                          onClick={() => openPix(inv)}
                          className="px-4 py-2 bg-orange-gradient text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5"
                        >
                          <QrCode className="w-4 h-4" />
                          Pagar via PIX
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Recibo OK
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Visualização em Tabela para Desktop */}
            <div className="hidden md:block bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-1">
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
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: INSTALAÇÃO & CRONOGRAMA DE CAMPO */}
        {/* ======================================================== */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {data.appointments.length === 0 ? (
              <div className="bg-white dark:bg-[#18191E] p-8 sm:p-12 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] text-center shadow-m3-1">
                <Truck className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">Nenhum agendamento de campo agendado</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
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



      {/* ======================================================== */}
      {/* 5. M3 BOTTOM NAVIGATION BAR (Fixa no Rodapé Mobile) */}
      {/* ======================================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#141519]/95 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-2 py-1.5 safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
        aria-label="Navegação Principal do Aplicativo"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Aba 1: Produção */}
          <button
            onClick={() => setActiveTab("ORDERS")}
            className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-all group"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                activeTab === "ORDERS"
                  ? "bg-orange-500/15 dark:bg-orange-500/25 text-[#FF650F]"
                  : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                activeTab === "ORDERS"
                  ? "font-bold text-zinc-900 dark:text-white"
                  : "font-medium text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Produção
            </span>
          </button>

          {/* Aba 2: Provas */}
          <button
            onClick={() => setActiveTab("PROOFS")}
            className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-all group relative"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all flex items-center justify-center relative ${
                activeTab === "PROOFS"
                  ? "bg-purple-500/15 dark:bg-purple-500/25 text-purple-600 dark:text-purple-400"
                  : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {data.metrics.pendingProofsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {data.metrics.pendingProofsCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                activeTab === "PROOFS"
                  ? "font-bold text-zinc-900 dark:text-white"
                  : "font-medium text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Provas
            </span>
          </button>

          {/* Aba 3: Faturas */}
          <button
            onClick={() => setActiveTab("FINANCIAL")}
            className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-all group relative"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all flex items-center justify-center relative ${
                activeTab === "FINANCIAL"
                  ? "bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
              }`}
            >
              <QrCode className="w-5 h-5" />
              {data.metrics.pendingInvoicesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {data.metrics.pendingInvoicesCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                activeTab === "FINANCIAL"
                  ? "font-bold text-zinc-900 dark:text-white"
                  : "font-medium text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Faturas
            </span>
          </button>

          {/* Aba 4: Cronograma */}
          <button
            onClick={() => setActiveTab("APPOINTMENTS")}
            className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-all group"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                activeTab === "APPOINTMENTS"
                  ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                activeTab === "APPOINTMENTS"
                  ? "font-bold text-zinc-900 dark:text-white"
                  : "font-medium text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Instalação
            </span>
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 6. MODAIS (PIX & PERFIL) */}
      {/* ======================================================== */}
      {/* Modal de Pagamento PIX */}
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
            // Atualiza state e cache local imediatamente
            if (typeof window !== "undefined" && updated.id) {
              try {
                if (updated.avatarUrl) {
                  localStorage.setItem(`glessios_avatar_${updated.id}`, updated.avatarUrl);
                  localStorage.setItem("glessios_avatar_current", updated.avatarUrl);
                } else {
                  localStorage.removeItem(`glessios_avatar_${updated.id}`);
                  localStorage.removeItem("glessios_avatar_current");
                }
              } catch (storageErr) {
                console.warn("Aviso ao persistir avatar atualizado:", storageErr);
              }
            }
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

      {/* Modal de Alteração de Senha do Cliente */}
      {data && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userId={data.customer.user.id}
          userEmail={data.customer.user.phone || data.customer.tradeName}
        />
      )}
    </div>
  );
}
