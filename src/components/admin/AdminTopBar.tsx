"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, ShieldCheck } from "lucide-react";
import { AdminUserMenu } from "./AdminUserMenu";

interface AdminTopBarProps {
  onOpenMobileMenu: () => void;
}

export function AdminTopBar({ onOpenMobileMenu }: AdminTopBarProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/crm")) return "Funil Comercial & CRM Kanban";
    if (pathname.startsWith("/admin/agendamentos")) return "Agendamentos de Campo & Instalação";
    if (pathname.startsWith("/admin/producao")) return "Linha de Produção Fabril (8 Etapas)";
    if (pathname.startsWith("/admin/estoque")) return "Controle de Estoque & Insumos";
    if (pathname.startsWith("/admin/financeiro")) return "Gestão Financeira & DRE Fabril";
    if (pathname.startsWith("/admin/propostas")) return "Proposta Comercial Executiva";
    return "Painel ERP & Operações";
  };

  return (
    <header className="h-14 px-4 sm:px-6 lg:px-8 bg-glessios-graphite border-b border-glessios-border-dark flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        {/* Botão para abrir a Sidebar no Mobile */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-glessios-text-body hover:text-white hover:bg-white/[0.05] transition-colors"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5 text-glessios-orange" />
        </button>

        {/* Título da Página / Módulo */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {getPageTitle()}
          </h2>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-medium text-glessios-orange bg-glessios-orange/10 px-2 py-0.5 rounded-full border border-glessios-border-orange/40">
            <span className="w-1.5 h-1.5 rounded-full bg-glessios-orange animate-pulse" />
            Operação Integrada
          </span>
        </div>
      </div>

      {/* Canto Direito: Submenu do Avatar */}
      <div className="flex items-center gap-3">
        <AdminUserMenu />
      </div>
    </header>
  );
}
