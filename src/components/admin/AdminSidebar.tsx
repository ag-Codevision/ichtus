"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Kanban,
  Calendar,
  Layers,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
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

  const navItems = [
    {
      label: "CRM Kanban",
      description: "Funil & Leads",
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
      label: "Produção & Fábrica",
      description: "8 Fases & Provas",
      href: "/admin/producao",
      icon: Layers,
      active: pathname.startsWith("/admin/producao"),
    },
    {
      label: "Estoque",
      description: "ACM, LEDs & Insumos",
      href: "/admin/estoque",
      icon: Package,
      active: pathname.startsWith("/admin/estoque"),
    },
    {
      label: "Financeiro & DRE",
      description: "Faturamento & CMV",
      href: "/admin/financeiro",
      icon: DollarSign,
      active: pathname.startsWith("/admin/financeiro"),
    },
  ];

  return (
    <>
      {/* Overlay Escuro para Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container Estreita / Slim */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-glessios-graphite border-r border-glessios-border-dark transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-16" : "lg:w-56"} w-64`}
      >
        {/* Topo da Sidebar: Marca & Botão de Recolher */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-glessios-border-dark shrink-0">
          <Link
            href="/admin/crm"
            className="flex items-center gap-2 overflow-hidden group py-1"
            title="Glessios - ERP & Fábrica"
          >
            {isCollapsed && !isMobileOpen ? (
              <div className="w-8 h-8 flex items-center justify-center rounded-xl overflow-hidden group-hover:scale-110 transition-transform mx-auto shadow-orange-glow">
                <Image
                  src="/icon-web.png"
                  alt="Glessios Ícone"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <Image
                  src="/logo-web.png"
                  alt="Glessios Soluções & Design"
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
            className="lg:hidden p-1 rounded-lg text-glessios-text-body hover:text-white hover:bg-white/[0.05]"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Botão de Toggle Retrátil no Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded-lg text-glessios-text-body hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-glessios-orange" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navegação Vertical com os Links das Abas */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          <div className="px-2.5 pb-1.5 text-[9px] font-mono uppercase tracking-wider text-glessios-text-body/70 font-semibold">
            {(!isCollapsed || isMobileOpen) ? "Módulos" : "•••"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`relative group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-glessios-orange/15 text-glessios-orange border border-glessios-border-orange/60 shadow-sm"
                    : "text-glessios-text-body hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    item.active
                      ? "text-glessios-orange bg-glessios-orange/10"
                      : "text-glessios-text-body group-hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Rótulo expandido */}
                {(!isCollapsed || isMobileOpen) ? (
                  <div className="flex flex-col truncate flex-1 min-w-0">
                    <span className="truncate text-[11px] leading-tight font-bold">{item.label}</span>
                    <span className="text-[9px] text-glessios-text-body/70 font-normal truncate">
                      {item.description}
                    </span>
                  </div>
                ) : null}

                {/* Tooltip flutuante no modo recolhido (Desktop) */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-xl bg-glessios-graphite border border-glessios-border-dark text-white text-xs font-bold shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                    <div className="font-bold text-white text-xs">{item.label}</div>
                    <div className="text-[9px] font-normal text-glessios-text-body">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-2 border-t border-glessios-border-dark shrink-0 bg-white/[0.01]">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] flex items-center justify-between">
              <span className="text-white text-[10px] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Fábrica Ativa
              </span>
              <span className="font-mono text-glessios-orange text-[9px]">v1.0.0</span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Fábrica Conectada & Operações Ativas">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
