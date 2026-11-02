"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  Edit3,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AdminCMSPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Cabeçalho com Título e Botão Principal sem quebra de linha */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF650F] mb-1">
            <Globe className="w-4 h-4" />
            <span>Gerenciador de Conteúdo do Site Público</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            CMS &amp; Editor Visual On-Page
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Gerencie e personalize 100% dos títulos, textos, mídias de fundo, botões, cards e portfólio diretamente no site público.
          </p>
        </div>

        {/* BOTÃO PRINCIPAL SEM QUEBRA DE LINHA */}
        <Link
          href="/?cms_edit=true"
          target="_blank"
          className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#FF650F] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group whitespace-nowrap shrink-0"
        >
          <Edit3 className="w-5 h-5 transition-transform group-hover:rotate-12 shrink-0" />
          <span className="whitespace-nowrap">EDITAR SITE AO VIVO (ON-PAGE)</span>
          <ExternalLink className="w-4 h-4 opacity-75 shrink-0" />
        </Link>
      </div>

      {/* Banner de Destaque da Experiência On-Page */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#18191D] to-[#121316] text-white border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF650F]/15 blur-[100px] pointer-events-none -z-0" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold border border-[#FF650F]/30">
            <Sparkles className="w-3.5 h-3.5" />
            Edição em Tempo Real
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Edite cada detalhe no próprio site com um clique
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Ao clicar no botão <strong>&quot;EDITAR SITE AO VIVO (ON-PAGE)&quot;</strong>, o site público se abrirá com uma barra de controle exclusiva no topo. Você poderá clicar diretamente em qualquer título, parágrafo, botão ou card para alterar textos, ícones, fotos e links, além de poder adicionar ou excluir cards em todas as seções.
          </p>

          <div className="pt-3 flex flex-wrap gap-4 text-xs font-medium text-zinc-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Títulos e textos editáveis inline
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Upload de vídeo e imagem com drag &amp; drop
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              CRUD de cards em todas as seções (incluindo Equipe com foto)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Propagação automática de WhatsApp e contatos
            </span>
          </div>

          <div className="pt-4">
            <Link
              href="/?cms_edit=true"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/20 whitespace-nowrap"
            >
              <span>Abrir Editor On-Page Agora</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
