"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

  const overviewItem = {
    label: "Visão Geral",
    description: "Painel Central Consolidado",
    href: "/admin",
    icon: LayoutDashboard,
    active: pathname === "/admin",
  };

  const businessItems = [
    {
      label: "CRM Kanban",
      description: "Funil & Vendas",
      href: "/admin/crm",
      icon: Kanban,
      active: pathname.startsWith("/admin/crm"),
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

  const renderLink = (item: {
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
  }) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 ${
          item.active
            ? "bg-glessios-orange/15 dark:bg-glessios-orange/20 text-glessios-orange font-bold shadow-sm"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            item.active
              ? "text-glessios-orange bg-glessios-orange/15"
              : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Rótulo expandido */}
        {!isCollapsed || isMobileOpen ? (
          <div className="flex flex-col truncate flex-1 min-w-0">
            <span className="truncate text-xs leading-tight">
              {item.label}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal truncate">
              {item.description}
            </span>
          </div>
        ) : null}

        {/* Tooltip flutuante no modo recolhido (Desktop) */}
        {isCollapsed && !isMobileOpen && (
          <div className="absolute left-full ml-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1F24] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs font-bold shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
            <div className="font-bold text-xs">{item.label}</div>
            <div className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
              {item.description}
            </div>
          </div>
        )}
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

      {/* Sidebar Container M3 Navigation Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#F6F1EC] dark:bg-[#141519] border-r border-black/[0.06] dark:border-white/[0.06] transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-16" : "lg:w-60"} w-64`}
      >
        {/* Topo da Sidebar: Marca & Botão de Recolher */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 overflow-hidden group py-1"
            title="ICTHUS / Glessios - Painel Integrado"
          >
            {isCollapsed && !isMobileOpen ? (
              <div className="w-8 h-8 flex items-center justify-center rounded-xl overflow-hidden group-hover:scale-105 transition-transform mx-auto shadow-sm">
                <Image
                  src="/icon-web.png"
                  alt="ICTHUS Ícone"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <Image
                  src="/logo-web.png"
                  alt="ICTHUS Soluções & Design"
                  width={150}
                  height={33}
                  className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
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

          {/* Botão de Toggle Retrátil no Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-glessios-orange" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navegação Vertical com Seções Unificadas */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin">
          {/* Visão Geral Principal */}
          <div>
            {renderLink(overviewItem)}
          </div>

          {/* Grupo 1: Gestão & Negócios */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 pt-1 text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1.5">
              {!isCollapsed || isMobileOpen ? (
                <>
                  <Briefcase className="w-3 h-3 text-glessios-orange" />
                  <span>Gestão & Negócios</span>
                </>
              ) : (
                <div className="w-full border-t border-black/[0.08] dark:border-white/10 my-1" />
              )}
            </div>
            {businessItems.map(renderLink)}
          </div>

          {/* Grupo 2: Fábrica & Operações CNC */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 pt-2 text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1.5">
              {!isCollapsed || isMobileOpen ? (
                <>
                  <Factory className="w-3 h-3 text-emerald-500" />
                  <span>Fábrica & CNC</span>
                </>
              ) : (
                <div className="w-full border-t border-black/[0.08] dark:border-white/10 my-1" />
              )}
            </div>
            {factoryItems.map(renderLink)}
          </div>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-2.5 border-t border-black/[0.06] dark:border-white/[0.06] shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
          {!isCollapsed || isMobileOpen ? (
            <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-[10px] flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-300 text-[10px] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Painel Integrado
              </span>
              <span className="font-mono text-glessios-orange font-bold text-[9px]">Admin</span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Painel Integrado: Gestão + Fábrica">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
