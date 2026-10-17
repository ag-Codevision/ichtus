"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileText,
  Building,
  Check,
} from "lucide-react";

export function AdminUserMenu() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    // Remove o cookie da sessão administrativa
    document.cookie = "glessios_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/glessios/login");
  };

  const isDark = theme === "dark";

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão de Disparo com Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Menu do Administrador"
        className="flex items-center gap-3 p-1.5 pl-2.5 rounded-2xl border border-glessios-border-dark bg-glessios-graphite hover:bg-glessios-graphite-hover hover:border-glessios-orange/40 transition-all duration-200 group focus:outline-none shadow-sm"
      >
        <div className="flex flex-col text-right hidden sm:flex">
          <span className="text-xs font-bold text-white group-hover:text-glessios-orange transition-colors">
            Admin Geral
          </span>
          <span className="text-[10px] text-glessios-text-body font-mono -mt-0.5">
            Operações & Fábrica
          </span>
        </div>

        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-orange-gradient flex items-center justify-center font-black text-white text-xs shadow-orange-glow">
            A
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-glessios-graphite" />
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-glessios-text-body transition-transform duration-200 ${
            isOpen ? "rotate-180 text-glessios-orange" : "group-hover:text-white"
          }`}
        />
      </button>

      {/* Submenu Dropdown Flutuante */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-glessios-graphite border border-glessios-border-dark shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Cabeçalho do Perfil */}
          <div className="p-3 pb-3 border-b border-glessios-border-dark bg-white/[0.02] rounded-xl mb-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/15 px-2 py-0.5 rounded-full border border-glessios-border-orange">
                Role: ADMIN
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-white truncate">
              Administrador Geral & Operações
            </h4>
            <p className="text-[11px] text-glessios-text-body truncate mt-0.5 font-mono">
              admin@glessios.com.br
            </p>
          </div>

          <div className="space-y-0.5 pt-1">
            {/* Alternar Modo Claro / Modo Escuro */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-glessios-text-heading hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-glessios-orange" />
                )}
                <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
              </div>
              <span className="text-[10px] font-mono text-glessios-text-body bg-white/[0.05] px-2 py-0.5 rounded-md">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>

            {/* Ver Site Público */}
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-glessios-text-heading hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>Ver Site Público</span>
              </div>
              <span className="text-[10px] text-glessios-text-body">Nova aba</span>
            </Link>

            {/* Portal do Cliente (Visão do Contratante) */}
            <Link
              href="/portal/dashboard"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-glessios-text-heading hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-purple-400" />
                <span>Visão do Cliente</span>
              </div>
              <span className="text-[10px] text-glessios-text-body">Portal</span>
            </Link>

            {/* Proposta Comercial Piloto */}
            <Link
              href="/admin/propostas/cm8a7b6c5000108l4f1h20987"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-glessios-text-heading hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Proposta A4 Modelo</span>
              </div>
              <span className="text-[10px] text-glessios-text-body">PDF</span>
            </Link>
          </div>

          {/* Divisor */}
          <div className="my-1.5 border-t border-glessios-border-dark" />

          {/* Botão de Sair / Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Encerrar Sessão / Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}
