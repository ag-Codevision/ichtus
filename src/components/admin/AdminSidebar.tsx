"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { appMotion } from "@/lib/motion";
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  Layers,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Factory,
  Briefcase,
  Users,
  Settings,
  Sliders,
} from "lucide-react";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Efeito Ripple oficial Material Design 3 Expressive
  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.className = "m3-ripple-wave";

    const prev = el.querySelector(".m3-ripple-wave");
    if (prev) prev.remove();

    el.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const overviewItem = {
    label: "Visão Geral",
    description: "Painel Central Consolidado",
    href: "/admin",
    icon: LayoutDashboard,
    active: pathname === "/admin",
  };

  const businessItems = [
    {
      label: "CRM & Contatos",
      description: "Clientes, Fornecedores & Insumos",
      href: "/admin/crm",
      icon: Users,
      active: pathname === "/admin/crm" || (pathname.startsWith("/admin/crm") && !pathname.startsWith("/admin/crm/kanban")),
    },
    {
      label: "Funil Kanban",
      description: "Pipeline Comercial & Leads",
      href: "/admin/kanban",
      icon: Kanban,
      active: pathname.startsWith("/admin/kanban"),
    },
    {
      label: "Agendamentos",
      description: "Medição & Instalação",
      href: "/admin/agendamentos",
      icon: Calendar,
      active: pathname.startsWith("/admin/agendamentos"),
    },
    {
      label: "Financeiro & DRE",
      description: "Faturamento & CMV",
      href: "/admin/financeiro",
      icon: DollarSign,
      active: pathname.startsWith("/admin/financeiro"),
    },
  ];

  const factoryItems = [
    {
      label: "Linha de Produção",
      description: "8 Fases & Provas WACLI",
      href: "/admin/producao",
      icon: Layers,
      active: pathname.startsWith("/admin/producao"),
    },
    {
      label: "Estoque & Insumos",
      description: "ACM, LEDs & Router CNC",
      href: "/admin/estoque",
      icon: Package,
      active: pathname.startsWith("/admin/estoque"),
    },
  ];

  const systemItems = [
    {
      label: "Configurações",
      description: "WhatsApp, Portal & Sistema",
      href: "/admin/configuracoes",
      icon: Settings,
      active: pathname.startsWith("/admin/configuracoes"),
    },
  ];

  const renderLink = (item: {
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
  }) => {
    const Icon = item.icon;

    if (isCollapsed && !isMobileOpen) {
      // Modo Recolhido: M3 Navigation Rail Item perfeitamente centrado com Active Indicator
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={(e) => {
            triggerRipple(e);
            setIsMobileOpen(false);
          }}
          onMouseDown={triggerRipple}
          className="group relative flex flex-col items-center justify-center w-full my-1.5 focus:outline-none"
          aria-label={item.label}
        >
          {/* M3 Active Indicator Container (Pill Expressivo e Centralizado com Mola) */}
          <div
            className={`m3-ripple-container relative w-14 h-10 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
              item.active
                ? "text-[#FF650F]"
                : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.08]"
            }`}
          >
            {item.active && (
              <motion.div
                layoutId="admin-sidebar-rail-active"
                className="absolute inset-0 bg-[#FF650F]/15 dark:bg-[#FF650F]/25 rounded-2xl shadow-[0_2px_10px_rgba(255,101,15,0.2)] border border-[#FF650F]/30"
                transition={appMotion.expressive.fastSpatial}
              />
            )}
            <Icon
              className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                item.active ? "scale-110 stroke-[2.2]" : "group-hover:scale-110"
              }`}
            />
          </div>

          {/* Tooltip Flutuante M3 Expressive com sombra suave e backdrop blur */}
          <div className="absolute left-full ml-3 px-3.5 py-2 rounded-2xl bg-[#1E1B19]/95 dark:bg-[#1C1D22]/95 text-white border border-white/10 text-xs font-semibold shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50 whitespace-nowrap">
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-[#FF650F]" : "bg-zinc-400"}`} />
              {item.label}
            </div>
            <div className="text-[10px] font-normal text-zinc-300 mt-0.5">
              {item.description}
            </div>
          </div>
        </Link>
      );
    }

    // Modo Expandido: M3 Expressive Navigation Drawer List Item com Mola
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(e) => {
          triggerRipple(e);
          setIsMobileOpen(false);
        }}
        onMouseDown={triggerRipple}
        className={`group relative m3-ripple-container flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-colors duration-200 overflow-hidden my-0.5 ${
          item.active
            ? "text-[#FF650F] font-bold"
            : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        }`}
      >
        {item.active && (
          <motion.div
            layoutId="admin-sidebar-active"
            className="absolute inset-0 bg-[#FF650F]/15 dark:bg-[#FF650F]/20 rounded-2xl border border-[#FF650F]/25 shadow-sm"
            transition={appMotion.expressive.fastSpatial}
          />
        )}
        <div
          className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            item.active
              ? "text-[#FF650F] bg-[#FF650F]/15"
              : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="relative z-10 flex flex-col truncate flex-1 min-w-0">
          <span className="truncate text-xs leading-tight font-semibold">
            {item.label}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal truncate">
            {item.description}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay Escuro para Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container M3 Expressive Navigation Drawer (Exclusivo Desktop lg+) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 hidden lg:flex flex-col bg-[#F6F1EC] dark:bg-[#141519] border-r border-black/[0.06] dark:border-white/[0.06] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } overflow-visible`}
      >
        {/* Botão de Toggle Retrátil Flutuante (metade dentro da sidebar e metade fora na linha divisória) */}
        <button
          onClick={(e) => {
            triggerRipple(e);
            setIsCollapsed(!isCollapsed);
          }}
          onMouseDown={triggerRipple}
          style={{ left: "100%", transform: "translateX(-50%)" }}
          className="m3-ripple-container hidden lg:flex absolute top-[14px] z-50 w-7 h-7 rounded-full bg-white dark:bg-[#1E1F24] border border-black/10 dark:border-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.18)] items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:border-[#FF650F]/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-[#FF650F]" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Topo da Sidebar: Marca */}
        <div
          className={`shrink-0 border-b border-black/[0.06] dark:border-white/[0.06] transition-all duration-200 ${
            isCollapsed && !isMobileOpen
              ? "h-20 flex items-center justify-center px-2"
              : "h-16 px-4 flex items-center justify-between"
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center group py-1"
            title="ICTHUS / Glessios - Painel Integrado"
          >
            {isCollapsed && !isMobileOpen ? (
              /* Logo M3 Expressive no modo recolhido: grande, centrado e com presença */
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-orange-gradient p-2 shadow-md shadow-orange-500/25 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-500/35 transition-all">
                <Image
                  src="/icon-web.png"
                  alt="ICTHUS Ícone"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            ) : (
              /* Logo M3 Expressive no modo expandido: claro ou escuro conforme o tema */
              <div className="flex items-center">
                <Image
                  src="/logo-horizontal-escuro.png"
                  alt="ICTHUS Soluções & Design"
                  width={150}
                  height={34}
                  priority
                  className="h-8 w-auto object-contain group-hover:scale-102 transition-transform dark:hidden"
                />
                <Image
                  src="/logo-web.png"
                  alt="ICTHUS Soluções & Design"
                  width={150}
                  height={34}
                  priority
                  className="h-8 w-auto object-contain group-hover:scale-102 transition-transform hidden dark:block"
                />
              </div>
            )}
          </Link>

          {/* Botão para fechar no Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação Vertical com Seções M3 (Sem rolagem no modo recolhido) */}
        <nav
          className={`flex-1 py-3 ${
            isCollapsed && !isMobileOpen
              ? "overflow-visible px-2 space-y-2 select-none"
              : "overflow-y-auto overflow-x-hidden no-scrollbar px-3 space-y-3"
          }`}
        >
          {/* Visão Geral Principal */}
          <div>
            {renderLink(overviewItem)}
          </div>

          {/* Grupo 1: Gestão & Negócios */}
          <div className="space-y-0.5">
            <div className="py-1">
              {!isCollapsed || isMobileOpen ? (
                <div className="px-3 pb-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#FF650F]" />
                  <span>Gestão & Negócios</span>
                </div>
              ) : (
                <div className="w-8 mx-auto border-t border-black/[0.08] dark:border-white/10 my-1" />
              )}
            </div>
            {businessItems.map(renderLink)}
          </div>

          {/* Grupo 2: Fábrica & Operações CNC */}
          <div className="space-y-0.5">
            <div className="py-1">
              {!isCollapsed || isMobileOpen ? (
                <div className="px-3 pb-1 pt-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
                  <Factory className="w-3 h-3 text-emerald-500" />
                  <span>Fábrica & CNC</span>
                </div>
              ) : (
                <div className="w-8 mx-auto border-t border-black/[0.08] dark:border-white/10 my-1" />
              )}
            </div>
            {factoryItems.map(renderLink)}
          </div>

          {/* Grupo 3: Sistema & Conexões */}
          <div className="space-y-0.5">
            <div className="py-1">
              {!isCollapsed || isMobileOpen ? (
                <div className="px-3 pb-1 pt-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-blue-500" />
                  <span>Sistema & Conexões</span>
                </div>
              ) : (
                <div className="w-8 mx-auto border-t border-black/[0.08] dark:border-white/10 my-1" />
              )}
            </div>
            {systemItems.map(renderLink)}
          </div>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
          {!isCollapsed || isMobileOpen ? (
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-[10px] flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-300 text-[10px] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Painel Integrado
              </span>
              <span className="font-mono text-[#FF650F] font-bold text-[9px] px-1.5 py-0.5 rounded-md bg-[#FF650F]/10">Admin</span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Painel Integrado: Gestão + Fábrica">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
