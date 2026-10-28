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
    if (pathname.startsWith("/admin/kanban")) return "Funil Comercial & Kanban";
    if (pathname.startsWith("/admin/crm")) return "CRM & Base de Contatos";
    if (pathname.startsWith("/admin/agendamentos")) return "Agendamentos de Campo & Instalação";
    if (pathname.startsWith("/admin/producao")) return "Linha de Produção Fabril (8 Etapas)";
    if (pathname.startsWith("/admin/compras")) return "Compras & Suprimentos por Serviço";
    if (pathname.startsWith("/admin/estoque")) return "Controle de Estoque & Insumos";
    if (pathname.startsWith("/admin/financeiro")) return "Gestão Financeira & DRE Fabril";
    if (pathname.startsWith("/admin/propostas")) return "Proposta Comercial Executiva";
    if (pathname.startsWith("/admin/configuracoes")) return "Configurações do Sistema & WhatsApp";
    return "Painel ERP & Operações";
  };

  return (
    <header className="h-14 px-4 sm:px-6 lg:px-8 bg-[#FDF9F6]/90 dark:bg-[#0E0F12]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Ícone de Aplicativo do Google no Mobile */}
        <div className="lg:hidden w-8 h-8 rounded-xl bg-orange-gradient p-1 shadow-sm flex items-center justify-center shrink-0">
          <img
            src="/icon-web.png"
            alt="Glessios"
            className="w-full h-full object-contain"
          />
        </div>

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

      {/* Canto Direito: Alternador Claro/Escuro (Sol/Lua) e Menu com Avatar do Usuário */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle className="w-9 h-9 p-0 flex items-center justify-center rounded-2xl border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1A1B20]" />
        <AdminUserMenu />
      </div>
    </header>
  );
}
