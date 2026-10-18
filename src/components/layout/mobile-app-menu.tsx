"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Compass,
  Layers,
  Sparkles,
  Palette,
  Lightbulb,
  FileText,
  Users,
  Calculator,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  User,
  Wrench,
  Building,
  LogOut,
  QrCode,
  Calendar,
  LayoutDashboard,
  Kanban,
  Package,
  DollarSign,
  Factory,
} from "lucide-react";
import { appMotion } from "@/lib/motion";

interface GoogleAppItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: string;
  isExternal?: boolean;
}

// 1. Menu de Aplicativos para o Site Público
const GOOGLE_STYLE_APPS: GoogleAppItem[] = [
  {
    id: "home",
    name: "Início",
    description: "Página principal",
    href: "/#",
    icon: Home,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "solucoes",
    name: "Soluções",
    description: "Pilares e consultoria",
    href: "/#solucoes",
    icon: Compass,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "fachadas",
    name: "Fachadas ACM",
    description: "Projetos arquitetônicos",
    href: "/#portfolio",
    icon: Building,
    iconBg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-[#FF650F]",
    badge: "Destaque",
  },
  {
    id: "letreiros",
    name: "Letreiros LED",
    description: "Letras caixa & luminoso",
    href: "/#portfolio",
    icon: Lightbulb,
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    id: "cnc",
    name: "Corte CNC",
    description: "Laser & usinagem",
    href: "/#servicos",
    icon: Wrench,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    id: "portfolio",
    name: "Portfólio",
    description: "Obras executadas",
    href: "/#portfolio",
    icon: Palette,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "sobre",
    name: "Sobre Nós",
    description: "História e equipe",
    href: "/#sobre",
    icon: Users,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "orcamento",
    name: "Orçamento",
    description: "Cotação expressa",
    href: "/#orcamento",
    icon: Calculator,
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-400",
    badge: "Grátis",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Tendências visuais",
    href: "/blog",
    icon: FileText,
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
];

// 2. Menu de Aplicativos Exclusivo do Portal do Cliente
const PORTAL_STYLE_APPS: GoogleAppItem[] = [
  {
    id: "portal_orders",
    name: "Produção",
    description: "Linha fabril da obra",
    href: "/portal/dashboard?tab=ORDERS",
    icon: Layers,
    iconBg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-[#FF650F]",
    badge: "Fábrica",
  },
  {
    id: "portal_proofs",
    name: "Provas de Arte",
    description: "Aprovar maquetes 3D",
    href: "/portal/dashboard?tab=PROOFS",
    icon: Sparkles,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
    badge: "Aprovação",
  },
  {
    id: "portal_financial",
    name: "Faturas PIX",
    description: "Copia e Cola rápido",
    href: "/portal/dashboard?tab=FINANCIAL",
    icon: QrCode,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "portal_appointments",
    name: "Instalação",
    description: "Equipe técnica & obra",
    href: "/portal/dashboard?tab=APPOINTMENTS",
    icon: Calendar,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "portal_wpp",
    name: "Falar c/ Produção",
    description: "Suporte com engenheiro",
    href: "https://wa.me/5551981192976?text=" + encodeURIComponent("Olá equipe de produção da ICTHUS! Sou cliente do portal e gostaria de falar sobre o andamento do meu projeto/obra."),
    icon: MessageCircle,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    isExternal: true,
    badge: "Direto",
  },
  {
    id: "portal_home",
    name: "Site Público",
    description: "Ir para a página inicial",
    href: "/",
    icon: Home,
    iconBg: "bg-zinc-500/10 border-zinc-500/20",
    iconColor: "text-zinc-300",
  },
];

// 3. Menu de Aplicativos Exclusivo do Portal Admin
const ADMIN_STYLE_APPS: GoogleAppItem[] = [
  {
    id: "admin_overview",
    name: "Visão Geral",
    description: "Painel Central Consolidado",
    href: "/admin",
    icon: LayoutDashboard,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "admin_crm",
    name: "CRM Kanban",
    description: "Funil Comercial & Leads",
    href: "/admin/crm",
    icon: Kanban,
    iconBg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-[#FF650F]",
    badge: "Vendas",
  },
  {
    id: "admin_producao",
    name: "Produção CNC",
    description: "8 Fases Industriais & Provas",
    href: "/admin/producao",
    icon: Layers,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    badge: "Fábrica",
  },
  {
    id: "admin_estoque",
    name: "Almoxarifado",
    description: "Chapas ACM, LEDs & Insumos",
    href: "/admin/estoque",
    icon: Package,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    id: "admin_financeiro",
    name: "Financeiro & DRE",
    description: "Faturamento, PIX & Caixa",
    href: "/admin/financeiro",
    icon: DollarSign,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "admin_agendamentos",
    name: "Agendamentos",
    description: "Medições & Equipes de Campo",
    href: "/admin/agendamentos",
    icon: Calendar,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "admin_proposta_a4",
    name: "Proposta A4",
    description: "Modelo Comercial PDF",
    href: "/admin/propostas/cm8a7b6c5000108l4f1h20987",
    icon: FileText,
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-400",
    isExternal: true,
  },
  {
    id: "admin_home",
    name: "Site Público",
    description: "Página Institucional",
    href: "/",
    icon: Home,
    iconBg: "bg-zinc-500/10 border-zinc-500/20",
    iconColor: "text-zinc-300",
  },
];

interface MobileAppMenuProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

/**
 * MobileAppMenu: Menu de aplicativo estilo Google com animação de máscara de onda
 * (Ripple Effect) circular, adaptado para o Site Público, Portal do Cliente e Portal Admin.
 */
export function MobileAppMenu({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: MobileAppMenuProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const isAdmin = pathname?.startsWith("/admin");
  const isPortal = pathname?.startsWith("/portal");

  const activeApps = isAdmin
    ? ADMIN_STYLE_APPS
    : isPortal
    ? PORTAL_STYLE_APPS
    : GOOGLE_STYLE_APPS;

  const handleToggle = () => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Trava a rolagem do body quando o menu de aplicativo estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escuta evento global disparado pelo header ou outros gatilhos
  useEffect(() => {
    const handleCustomToggle = () => {
      setInternalIsOpen((prev) => !prev);
    };
    const handleCustomClose = () => {
      setInternalIsOpen(false);
    };
    window.addEventListener("glessios:toggle-menu", handleCustomToggle);
    window.addEventListener("glessios:close-menu", handleCustomClose);
    return () => {
      window.removeEventListener("glessios:toggle-menu", handleCustomToggle);
      window.removeEventListener("glessios:close-menu", handleCustomClose);
    };
  }, []);

  // Fecha o menu com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setInternalIsOpen(false);
  }, [pathname]);

  // Oculta exclusivamente em telas de login e visualização de proposta A4
  if (
    pathname === "/admin/login" ||
    pathname === "/glessios/login" ||
    pathname === "/portal/login" ||
    pathname?.startsWith("/admin/propostas/")
  ) {
    return null;
  }

  const handleAdminLogout = () => {
    handleClose();
    document.cookie = "glessios_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/glessios/login");
  };

  const handleItemClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    handleClose();
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const hash = href.replace("/", "");
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      }
    }
  };

  // Posição do botão FAB:
  // No Portal do Cliente fica em bottom-20 para não cobrir o menu inferior (M3 Bottom Navigation)
  // No Admin fica em bottom-6 right-6
  // No Site Público fica em bottom-6 right-5
  const fabPositionClass = isPortal
    ? "bottom-20 right-4"
    : isAdmin
    ? "bottom-6 right-6"
    : "bottom-6 right-5";

  // Centro da onda do ripple effect (clip-path origin):
  const rippleOrigin = isPortal
    ? "calc(100% - 44px) calc(100% - 108px)"
    : isAdmin
    ? "calc(100% - 52px) calc(100% - 52px)"
    : "calc(100% - 48px) calc(100% - 48px)";

  return (
    <>
      {/* ====================================================
          1. BOTÃO FLUTUANTE HAMBURGER (FAB) MOBILE
          Posicionado conforme a tela (admin vs portal vs site público)
          ==================================================== */}
      <div className={`md:hidden fixed ${fabPositionClass} z-50`}>
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isOpen ? "Fechar menu de aplicativos" : "Abrir menu de aplicativos"}
          aria-expanded={isOpen}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#FF650F]/40 active:scale-95 ${
            isOpen
              ? "bg-[#202127] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
              : "bg-gradient-to-tr from-[#18191D] via-[#22242B] to-[#2B2D37] border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          }`}
        >
          {/* Brilho âmbar sutil de fundo do botão */}
          <span
            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
              isOpen
                ? "bg-white/[0.08] opacity-100"
                : "bg-gradient-to-tr from-[#FF650F]/30 to-amber-500/20 opacity-80"
            }`}
          />

          {/* Ícone com rotação e transição spring entre Menu e X */}
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 1.05 : 1 }}
            transition={appMotion.expressive.fastSpatial}
            className="relative z-10 flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <Menu className="w-6 h-6 text-white" />
              </div>
            )}
          </motion.div>
        </button>
      </div>

      {/* ====================================================
          2. MENU DE APLICATIVO COM MÁSCARA DE ONDA CIRCULAR (RIPPLE EFFECT)
          Z-Index elevado para z-[70] cobrindo completamente cabeçalhos fixos
          ==================================================== */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end">
            {/* Backdrop com desfoque e fade suave */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={appMotion.effects.default}
              onClick={handleClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Painel do Menu com Máscara de Onda Circular (Clip-path Ripple) */}
            <motion.div
              initial={{
                clipPath: `circle(0px at ${rippleOrigin})`,
                opacity: 0.95,
              }}
              animate={{
                clipPath: `circle(150vmax at ${rippleOrigin})`,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  mass: 0.85,
                },
              }}
              exit={{
                clipPath: `circle(0px at ${rippleOrigin})`,
                opacity: 0.8,
                transition: {
                  type: "spring",
                  stiffness: 380,
                  damping: 34,
                },
              }}
              className="relative w-full h-[92vh] max-h-[820px] bg-[#141519] border-t border-white/10 rounded-t-[32px] shadow-[0_-12px_48px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white will-change-[clip-path]"
            >
              {/* Onda visual luminosa que corre na borda da expansão do ripple */}
              <div
                className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_calc(100%-48px)_calc(100%-48px),rgba(255,101,15,0.18)_0%,transparent_60%)] -z-10"
                aria-hidden="true"
              />

              {/* Barra superior de arrasto / puxador estilo aplicativo */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Cabeçalho do Menu de Aplicativos com Logo Oficial ICTHUS */}
              <div className="px-6 py-3.5 flex items-center justify-between border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-auto flex items-center">
                    <Image
                      src="/logo-web.png"
                      alt="ICTHUS Soluções & Design"
                      width={130}
                      height={32}
                      priority
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="border-l border-white/15 pl-2.5">
                    <h2 className="text-xs font-bold text-white leading-tight">
                      {isAdmin
                        ? "Glessios ERP & Fábrica"
                        : isPortal
                        ? "Portal do Cliente"
                        : "ICTHUS Soluções"}
                    </h2>
                    <p className="text-[10px] text-zinc-400">
                      {isAdmin
                        ? "Painel Operacional Integrado"
                        : isPortal
                        ? "Linha de Produção & Obras"
                        : "Comunicação Visual & Design"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-zinc-300 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Área Rolável de Conteúdo dos Aplicativos */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-28">
                {/* 1. Grade de Aplicativos Estilo Google (3 colunas) */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
                      {isAdmin
                        ? "Módulos de Gestão & Fábrica"
                        : isPortal
                        ? "Módulos do Portal"
                        : "Aplicativos & Serviços"}
                    </span>
                    <span className="text-[11px] text-[#FF650F] font-medium font-mono">
                      {activeApps.length} opções
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {activeApps.map((app, index) => {
                      const Icon = app.icon;
                      const isExt = app.isExternal;

                      const itemContent = (
                        <>
                          {app.badge && (
                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#FF650F] text-white shadow-sm">
                              {app.badge}
                            </span>
                          )}

                          {/* Ícone dentro de contêiner tonal estilo Google Apps */}
                          <div
                            className={`w-12 h-12 rounded-2xl ${app.iconBg} border flex items-center justify-center mb-2 group-hover:scale-105 group-active:scale-95 transition-transform duration-200 shadow-sm`}
                          >
                            <Icon className={`w-6 h-6 ${app.iconColor}`} />
                          </div>

                          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-1">
                            {app.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                            {app.description}
                          </span>
                        </>
                      );

                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 16, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            ...appMotion.expressive.fastSpatial,
                            delay: 0.04 + index * 0.025,
                          }}
                        >
                          {isExt ? (
                            <a
                              href={app.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleItemClick(e, app.href)}
                              className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] transition-all duration-200 group h-full justify-center"
                            >
                              {itemContent}
                            </a>
                          ) : (
                            <Link
                              href={app.href}
                              onClick={(e) => handleItemClick(e, app.href)}
                              className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] transition-all duration-200 group h-full justify-center"
                            >
                              {itemContent}
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Card de Contexto: Logout do Admin / Logout do Portal / Acesso ao Portal */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...appMotion.expressive.defaultSpatial, delay: 0.28 }}
                >
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm shadow-md">
                          <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">
                              Encerrar Sessão no Admin
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            Sair do painel operacional e de gestão
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : isPortal ? (
                    <Link
                      href="/portal/login"
                      onClick={handleClose}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm shadow-md">
                          <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">
                              Sair da Conta
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            Encerrar sessão neste aparelho
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      href="/portal/login"
                      onClick={handleClose}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#FF650F]/5 to-transparent border border-[#FF650F]/25 hover:border-[#FF650F]/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#FF650F] text-white flex items-center justify-center font-bold text-sm shadow-md">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">
                              Portal do Cliente
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                          <p className="text-xs text-zinc-400">
                            Acompanhar fabricação e aprovação de arte
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#FF650F] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </motion.div>

                {/* 3. Rodapé com Atendimento / Informações Técnicas */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...appMotion.expressive.defaultSpatial, delay: 0.34 }}
                  className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-400"
                >
                  {isAdmin ? (
                    <div className="flex items-center justify-center px-1 py-0.5">
                      <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Sessão Administrativa Segura
                      </span>
                    </div>
                  ) : !isPortal ? (
                    <div className="flex items-center justify-center px-1 py-0.5">
                      <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Fábrica certificada NR-35 & ART
                      </span>
                    </div>
                  ) : null}

                  {!isAdmin && (
                    <a
                      href={
                        isPortal
                          ? "https://wa.me/5551981192976?text=" +
                            encodeURIComponent(
                              "Olá equipe de produção da ICTHUS! Sou cliente do portal e gostaria de falar sobre o andamento do meu projeto/obra."
                            )
                          : "https://wa.me/5551981192976?text=" +
                            encodeURIComponent(
                              "Olá! Gostaria de um orçamento para comunicação visual e fachadas."
                            )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleClose}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      {isPortal ? "Falar com Mestre de Produção" : "Conversar direto no WhatsApp"}
                    </a>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
