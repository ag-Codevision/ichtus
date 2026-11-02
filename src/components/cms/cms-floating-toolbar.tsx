"use client";

import React from "react";
import Link from "next/link";
import { useCMS } from "./cms-provider";
import {
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Phone,
  Video,
  PlusCircle,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function CMSFloatingToolbar() {
  const {
    isEditMode,
    isPreviewMode,
    isAdmin,
    hasUnsavedChanges,
    isSaving,
    saveMessage,
    saveAllChanges,
    discardChanges,
    togglePreview,
    setHeroMediaModalOpen,
    setContactModalOpen,
    openPortfolioModal,
    disableEditMode,
  } = useCMS();

  // Exibe somente se o usuário for administrador e estiver no modo de edição
  if (!isAdmin || !isEditMode) {
    return null;
  }

  return (
    <aside aria-label="Barra de ferramentas do CMS" className="fixed top-0 left-0 right-0 z-[9999] bg-[#0E0F12]/95 backdrop-blur-md border-b border-[#FF650F]/50 shadow-2xl text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Lado Esquerdo: Identificação do Modo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF650F]/20 border border-[#FF650F]/40 text-[#FF650F] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#FF650F] animate-pulse" />
            MODO DE EDIÇÃO ON-PAGE
          </div>

          {saveMessage && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn ${
                saveMessage.includes("sucesso")
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {saveMessage.includes("sucesso") ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {saveMessage}
            </span>
          )}

          {hasUnsavedChanges && !saveMessage && (
            <span className="text-xs text-amber-400 font-medium hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Alterações pendentes de publicação
            </span>
          )}
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Botão Fundo Hero */}
          <button
            onClick={() => setHeroMediaModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10"
            title="Alterar vídeo, imagem ou link do fundo da Hero"
          >
            <Video className="w-3.5 h-3.5 text-[#FF650F]" />
            <span className="hidden md:inline">Fundo Hero</span>
          </button>

          {/* Botão Contatos Globais */}
          <button
            onClick={() => setContactModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10"
            title="Editar WhatsApp, Telefones, E-mails e Endereço com propagação para todo o site"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF650F]" />
            <span className="hidden md:inline">Contatos Globais</span>
          </button>

          {/* Botão Novo Portfólio */}
          <button
            onClick={() => openPortfolioModal(null)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10"
            title="Adicionar novo trabalho ao Portfólio"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FF650F]" />
            <span className="hidden md:inline">Novo Portfólio</span>
          </button>

          {/* Toggle Modo Visitante */}
          <button
            onClick={togglePreview}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              isPreviewMode
                ? "bg-[#FF650F] text-white border-[#FF650F]"
                : "bg-zinc-800 text-zinc-300 hover:text-white border-white/10 hover:bg-zinc-700"
            }`}
            title={isPreviewMode ? "Voltar ao modo de edição com marcações" : "Visualizar o site como visitante normal"}
          >
            {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreviewMode ? "Editando (Preview)" : "Ver como Visitante"}
          </button>

          {/* Descartar Alterações */}
          {hasUnsavedChanges && (
            <button
              onClick={discardChanges}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/40 text-xs font-semibold text-zinc-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 border border-white/10"
              title="Descartar mudanças não salvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Descartar</span>
            </button>
          )}

          {/* Salvar Alterações */}
          <button
            onClick={saveAllChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              hasUnsavedChanges
                ? "bg-gradient-to-r from-[#FF650F] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-500/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Publicando..." : "Salvar no Site"}
          </button>

          {/* Voltar ao Painel Admin */}
          <Link
            href="/admin/cms"
            onClick={disableEditMode}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10"
            title="Voltar ao Painel Administrativo"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Painel Admin</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
