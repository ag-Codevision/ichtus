"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, ShieldCheck } from "lucide-react";
import { AdminUserMenu } from "./AdminUserMenu";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
    <header className="h-14 px-4 sm:px-6 lg:px-8 bg-[#FDF9F6]/90 dark:bg-[#0E0F12]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Botão para abrir a Sidebar no Mobile */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5 text-glessios-orange" />
        </button>

        {/* Título da Página / Módulo */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight truncate">
            {getPageTitle()}
          </h2>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-glessios-orange bg-glessios-orange/10 px-2.5 py-0.5 rounded-full border border-glessios-orange/20">
            <span className="w-1.5 h-1.5 rounded-full bg-glessios-orange animate-pulse" />
            Operação Integrada
          </span>
        </div>
      </div>

      {/* Canto Direito: Toggle de Tema M3 e Menu do Usuário */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <AdminUserMenu />
      </div>
    </header>
  );
}
