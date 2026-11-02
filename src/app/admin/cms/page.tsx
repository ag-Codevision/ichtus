"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Edit3,
  ExternalLink,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminCMSPage() {
  const [stats, setStats] = useState({
    portfolioCount: 0,
    categoriesCount: 0,
    sectionsReady: 8,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/v1/admin/cms/portfolio");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.projects)) {
            setStats((prev) => ({
              ...prev,
              portfolioCount: json.projects.length,
            }));
          }
        }
      } catch (err) {
        console.warn("Falha ao buscar estatísticas do CMS:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF650F] mb-1">
            <Globe className="w-4 h-4" />
            <span>Gerenciador de Conteúdo do Site Público</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            CMS &amp; Editor Visual On-Page
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Gerencie e personalize 100% dos títulos, textos, mídias de fundo, botões, cards e portfólio diretamente no site público ou através dos controles rápidos abaixo.
          </p>
        </div>

        {/* BOTÃO PRINCIPAL SOLICITADO PELO USUÁRIO */}
        <Link
          href="/?cms_edit=true"
          target="_blank"
          className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#FF650F] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <Edit3 className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>EDITAR SITE AO VIVO (ON-PAGE)</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </Link>
      </div>

      {/* Banner de Destaque da Experiência On-Page */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#18191D] to-[#121316] text-white border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF650F]/15 blur-[100px] pointer-events-none -z-0" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold border border-[#FF650F]/30">
            <Sparkles className="w-3.5 h-3.5" />
            Edição em Tempo Real
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Edite cada detalhe no próprio site com um clique
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Ao clicar no botão <strong>&quot;Editar Site ao Vivo&quot;</strong>, o site público se abrirá com uma barra de controle exclusiva no topo. Você poderá clicar diretamente em qualquer título, parágrafo, botão ou card para alterar textos, ícones, imagens e links, além de poder adicionar ou excluir cards em todas as seções.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-zinc-300">
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
              CRUD de cards em todas as seções
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Propagação automática de WhatsApp e contatos
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Seções e Funcionalidades Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Hero */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Hero Section &amp; Mídia de Fundo
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tag, palavras rotativas animadas, subtítulo, 2 botões de CTA, 3 métricas de confiança e fundo com upload de vídeo/imagem por drag &amp; drop.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <Link
              href="/?cms_edit=true#hero"
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              Editar Hero ao Vivo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card Contatos Globais */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Contatos Globais (CRUD)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              WhatsApp oficial, lista de telefones, e-mails e endereço comercial completo. A alteração reflete automaticamente em todo o site.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <Link
              href="/?cms_edit=true#contato"
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              Gerenciar Contatos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card Portfólio */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Portfólio &amp; Páginas Internas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {stats.portfolioCount} projetos ativos. Crie novos projetos (gerando o card e a página interna), gerencie categorias e exclua trabalhos com um clique.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <Link
              href="/?cms_edit=true#portfolio"
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              Gerenciar Portfólio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card Seções com Cards */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Seções com Cards (CRUD Total)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Soluções e Pilares, Áreas de Atuação, Catálogo de Serviços, Diferenciais e Depoimentos. Adicione, edite ou exclua cards livremente.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <Link
              href="/?cms_edit=true#solucoes"
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              Editar Cards ao Vivo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card Botões do Site */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Botões e Links de Ação
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Todos os botões do site público possuem texto e URL de destino customizáveis, permitindo apontar para qualquer formulário ou link externo.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <Link
              href="/?cms_edit=true"
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              Ver no Editor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card Segurança e Auditoria */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Segurança &amp; Performance
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              O modo de edição só é visível para administradores autenticados. Visitantes comuns recebem o conteúdo ultra-rápido via SSR e banco PostgreSQL.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-white/5 mt-4">
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sistema Operacional
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
