"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Bot,
  Brain,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings,
  Layers,
  ArrowRight,
  Sliders,
  Image as ImageIcon,
  Check,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface BlogTopic {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  targetAudience: string;
  tone: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  postsGeneratedCount: number;
  createdAt: string;
}

interface BlogAgentConfig {
  id: string;
  isActive: boolean;
  postsPerDay: number;
  allowedDays: string[];
  preferredHours: string[];
  autoPublish: boolean;
  imageProvider: string;
  defaultAuthor: string;
  lastRunAt: string | null;
  lastPostTitle: string | null;
  lastStatus: string | null;
  lastError: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  imagePhotographer: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  tags: string[];
  readingTimeMin: number;
  viewCount: number;
  publishedAt: string;
}

export default function AdminBlogPage() {
  const [activeTab, setActiveTab] = useState<"brain" | "schedule" | "posts">("brain");

  // Estados dos Dados
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [config, setConfig] = useState<BlogAgentConfig | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [topicStats, setTopicStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [postStats, setPostStats] = useState({ total: 0, published: 0, drafts: 0, archived: 0 });

  // Loadings
  const [loading, setLoading] = useState(true);
  const [generatingNow, setGeneratingNow] = useState(false);
  const [suggestingTopics, setSuggestingTopics] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Modais e Filtros
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [newTopicMode, setNewTopicMode] = useState<"single" | "bulk">("single");
  const [singleTitle, setSingleTitle] = useState("");
  const [singleCategory, setSingleCategory] = useState("Fachadas e Comunicação Visual");
  const [singlePriority, setSinglePriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [bulkTitles, setBulkTitles] = useState("");

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  // Carrega Dados Iniciais
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [topicsRes, configRes, postsRes] = await Promise.all([
        fetch("/api/v1/blog/topics"),
        fetch("/api/v1/blog/agent/config"),
        fetch("/api/v1/blog/posts"),
      ]);

      if (topicsRes.ok) {
        const json = await topicsRes.json();
        setTopics(json.data || []);
        if (json.stats) setTopicStats(json.stats);
      }

      if (configRes.ok) {
        const json = await configRes.json();
        setConfig(json.data || null);
      }

      if (postsRes.ok) {
        const json = await postsRes.json();
        setPosts(json.data || []);
        if (json.stats) setPostStats(json.stats);
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados do blog:", err);
      showFeedback("error", "Erro ao carregar dados do servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ação: Disparar Geração Imediata com IA
  const handleGenerateNow = async (forcedTopicId?: string) => {
    setGeneratingNow(true);
    showFeedback("info", "O Agente de IA está escrevendo o artigo e selecionando fotos no Pexels...");
    try {
      const res = await fetch("/api/v1/blog/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: forcedTopicId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.details || "Falha na geração");
      }

      showFeedback("success", `Sucesso! Artigo "${json.data?.post?.title}" publicado.`);
      await fetchData();
    } catch (err: any) {
      console.error("Erro na geração manual:", err);
      showFeedback("error", err.message || "Erro durante a execução do agente.");
    } finally {
      setGeneratingNow(false);
    }
  };

  // Ação: Sugerir 10 Pautas com IA
  const handleSuggestTopics = async () => {
    setSuggestingTopics(true);
    showFeedback("info", "A IA está analisando tendências e gerando 10 pautas estratégicas de SEO...");
    try {
      const res = await fetch("/api/v1/blog/topics/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10, autoSave: true }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao sugerir pautas");
      }

      showFeedback("success", json.message || "10 novas pautas foram adicionadas ao Mini-Cérebro!");
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao sugerir tópicos:", err);
      showFeedback("error", err.message || "Falha ao gerar pautas.");
    } finally {
      setSuggestingTopics(false);
    }
  };

  // Ação: Criar Nova Pauta Manual
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newTopicMode === "single") {
        if (!singleTitle.trim()) return;
        const res = await fetch("/api/v1/blog/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: singleTitle.trim(),
            category: singleCategory,
            priority: singlePriority,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showFeedback("success", "Pauta adicionada ao Mini-Cérebro!");
      } else {
        const lines = bulkTitles
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 3);
        if (lines.length === 0) return;

        const payload = lines.map((title) => ({
          title,
          category: singleCategory,
          priority: singlePriority,
        }));

        const res = await fetch("/api/v1/blog/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics: payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showFeedback("success", `${lines.length} pautas cadastradas com sucesso!`);
      }

      setIsNewTopicModalOpen(false);
      setSingleTitle("");
      setBulkTitles("");
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao salvar pauta.");
    }
  };

  // Ação: Alterar Status da Pauta
  const handleUpdateTopicStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/blog/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status");
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message);
    }
  };

  // Ação: Excluir Pauta
  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pauta do mini-cérebro?")) return;
    try {
      const res = await fetch(`/api/v1/blog/topics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      showFeedback("success", "Pauta removida.");
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message);
    }
  };

  // Ação: Alternar Status do Post (PUBLISHED <-> DRAFT)
  const handleTogglePostStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/v1/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Falha ao alterar status");
      showFeedback("success", `Post ${nextStatus === "PUBLISHED" ? "publicado no ar" : "movido para rascunho"}.`);
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message);
    }
  };

  // Ação: Excluir Post
  const handleDeletePost = async (id: string) => {
    if (!confirm("Excluir definitivamente este artigo do blog?")) return;
    try {
      const res = await fetch(`/api/v1/blog/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      showFeedback("success", "Artigo excluído.");
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message);
    }
  };

  // Ação: Salvar Configurações
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSavingConfig(true);
    try {
      const res = await fetch("/api/v1/blog/agent/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showFeedback("success", "Configurações de agendamento salvas com sucesso!");
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao salvar.");
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (topicFilter === "ALL") return true;
    return t.status === topicFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn text-zinc-100">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
              : feedback.type === "error"
              ? "bg-red-950/90 text-red-200 border-red-500/40"
              : "bg-blue-950/90 text-blue-200 border-blue-500/40"
          }`}
        >
          {feedback.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {feedback.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {feedback.type === "info" && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Cabeçalho Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF650F] mb-1.5">
            <Bot className="w-4 h-4" />
            <span>Sistema Autônomo de Conteúdo &amp; Inbound Marketing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Blog Autônomo com IA</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF650F]/20 text-[#FF650F] border border-[#FF650F]/30 font-bold uppercase tracking-wider">
              Mini-Cérebro Ativo
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Planejamento estratégico de pautas, geração técnica especializada em engenharia visual (ACM, LED e CNC) com busca automática de fotos no Pexels.
          </p>
        </div>

        {/* Botões de Ação Imediata */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => handleGenerateNow()}
            disabled={generatingNow}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF650F] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {generatingNow ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Artigo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GERAR POST AGORA COM IA</span>
              </>
            )}
          </button>

          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors"
          >
            <span>Ver Blog Público</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Cards de Métricas e Indicadores de Saúde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Artigos Publicados */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191D] to-[#121316] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Artigos no Blog</span>
            <BookOpen className="w-4 h-4 text-[#FF650F]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{postStats.total}</span>
            <span className="text-xs text-emerald-400 font-medium">({postStats.published} no ar)</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Prisma PostgreSQL</p>
        </div>

        {/* Card 2: Pautas no Mini-Cérebro */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191D] to-[#121316] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pautas no Mini-Cérebro</span>
            <Brain className="w-4 h-4 text-[#FF650F]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{topicStats.pending}</span>
            <span className="text-xs text-zinc-400">pendentes / {topicStats.total} total</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">{topicStats.completed} já publicadas</p>
        </div>

        {/* Card 3: Cadência de Agendamento */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191D] to-[#121316] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Cadência Diária</span>
            <Calendar className="w-4 h-4 text-[#FF650F]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{config?.postsPerDay || 1}</span>
            <span className="text-xs text-zinc-400">post(s) por dia</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {config?.isActive ? "🟢 Automação ativa" : "⏸️ Pausado"}
          </p>
        </div>

        {/* Card 4: Banco de Imagens Pexels */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191D] to-[#121316] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Banco de Fotos</span>
            <ImageIcon className="w-4 h-4 text-[#FF650F]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">Pexels API</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Fotos gratuitas em alta definição</p>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("brain")}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "brain"
              ? "border-[#FF650F] text-[#FF650F] bg-white/[0.02]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Mini-Cérebro de Pautas ({topics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "schedule"
              ? "border-[#FF650F] text-[#FF650F] bg-white/[0.02]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Regras de Agendamento &amp; Robô</span>
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "posts"
              ? "border-[#FF650F] text-[#FF650F] bg-white/[0.02]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artigos Gerados ({posts.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MINI-CÉREBRO */}
      {activeTab === "brain" && (
        <div className="space-y-6">
          {/* Barra de Ações da Aba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141518] border border-white/10">
            {/* Filtros por Status */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-zinc-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filtrar:
              </span>
              {[
                { label: "Todas", value: "ALL" },
                { label: "Pendentes", value: "PENDING" },
                { label: "Em Produção", value: "IN_PROGRESS" },
                { label: "Publicadas", value: "COMPLETED" },
                { label: "Pausadas", value: "PAUSED" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTopicFilter(f.value)}
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    topicFilter === f.value
                      ? "bg-[#FF650F] text-white"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSuggestTopics}
                disabled={suggestingTopics}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                {suggestingTopics ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Sugerir 10 Pautas com IA</span>
              </button>

              <button
                onClick={() => setIsNewTopicModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Pauta Manual</span>
              </button>
            </div>
          </div>

          {/* Lista de Pautas */}
          {loading ? (
            <div className="p-12 text-center text-zinc-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF650F]" />
              <p className="text-sm">Carregando pautas do mini-cérebro...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#141518] border border-white/10 space-y-3">
              <Brain className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Nenhuma pauta encontrada</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Adicione pautas manualmente ou clique em &quot;Sugerir 10 Pautas com IA&quot; para o robô popular o mini-cérebro com ideias de alto impacto.
              </p>
              <button
                onClick={handleSuggestTopics}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sugerir Pautas Agora</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl bg-[#141518] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          topic.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : topic.status === "IN_PROGRESS"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : topic.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30"
                        }`}
                      >
                        {topic.status === "PENDING" && "Pendente"}
                        {topic.status === "IN_PROGRESS" && "Em Produção"}
                        {topic.status === "COMPLETED" && "Publicada"}
                        {topic.status === "PAUSED" && "Pausada"}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          topic.priority === "URGENT"
                            ? "bg-red-500/20 text-red-300"
                            : topic.priority === "HIGH"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Prioridade: {topic.priority}
                      </span>

                      <span className="text-xs text-zinc-400 font-medium">
                        {topic.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {topic.title}
                    </h3>

                    {topic.keywords && topic.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {topic.keywords.slice(0, 4).map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-400"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações da Pauta */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {topic.status === "PENDING" && (
                      <button
                        onClick={() => handleGenerateNow(topic.id)}
                        disabled={generatingNow}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF650F]/20 hover:bg-[#FF650F] text-[#FF650F] hover:text-white border border-[#FF650F]/40 text-xs font-bold transition-all disabled:opacity-50"
                        title="Produzir artigo imediatamente com base nesta pauta"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gerar Post</span>
                      </button>
                    )}

                    {topic.status === "PENDING" ? (
                      <button
                        onClick={() => handleUpdateTopicStatus(topic.id, "PAUSED")}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
                        title="Pausar pauta"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : topic.status === "PAUSED" ? (
                      <button
                        onClick={() => handleUpdateTopicStatus(topic.id, "PENDING")}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
                        title="Ativar pauta"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                      title="Excluir pauta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: AGENDAMENTO E REGRAS */}
      {activeTab === "schedule" && config && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141518] border border-white/10 space-y-8">
            {/* Status Geral do Robô */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#FF650F]" />
                  <span>Status do Agente Autônomo</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Quando ativo, o robô monitora as pautas do mini-cérebro e gera novos artigos de acordo com a cadência.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#FF650F]"></div>
                <span className="ml-3 text-sm font-bold text-white">
                  {config.isActive ? "🟢 ATIVADO" : "⏸️ PAUSADO"}
                </span>
              </label>
            </div>

            {/* Configuração de Posts por Dia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF650F]" />
                  <span>Cadência de Postagens por Dia</span>
                </label>
                <p className="text-xs text-zinc-400">
                  Defina quantos artigos a IA deve redigir e publicar a cada 24 horas.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setConfig({ ...config, postsPerDay: num })}
                      className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                        config.postsPerDay === num
                          ? "bg-[#FF650F] text-white shadow-lg shadow-orange-500/25"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5"
                      }`}
                    >
                      {num} post{num > 1 ? "s" : ""}/dia
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo de Publicação (Direto vs Rascunho) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF650F]" />
                  <span>Modo de Publicação</span>
                </label>
                <p className="text-xs text-zinc-400">
                  Escolha se os artigos entram no ar imediatamente ou ficam em rascunho para sua aprovação.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10">
                    <input
                      type="radio"
                      name="autoPublish"
                      checked={config.autoPublish === true}
                      onChange={() => setConfig({ ...config, autoPublish: true })}
                      className="accent-[#FF650F] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        🚀 Publicação Direta (100% Autônomo)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        O post é gerado, recebe a foto do Pexels e vai ao ar automaticamente no blog público.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10">
                    <input
                      type="radio"
                      name="autoPublish"
                      checked={config.autoPublish === false}
                      onChange={() => setConfig({ ...config, autoPublish: false })}
                      className="accent-[#FF650F] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        📝 Modo Revisor (Rascunho)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        O post é salvo como DRAFT. Você revisa e publica com 1 clique.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Banco de Imagens & Autoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#FF650F]" />
                  <span>Provedor de Banco de Imagens Gratuito</span>
                </label>
                <p className="text-xs text-zinc-400">
                  Fotos profissionais integradas via API oficial com atribuição legal ao fotógrafo.
                </p>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-white">Pexels API Oficial</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">Chave Conectada</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#FF650F]" />
                  <span>Assinatura de Autoria Padrão</span>
                </label>
                <p className="text-xs text-zinc-400">
                  Nome exibido como autor técnico nos artigos do blog.
                </p>
                <input
                  type="text"
                  value={config.defaultAuthor}
                  onChange={(e) => setConfig({ ...config, defaultAuthor: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                />
              </div>
            </div>

            {/* Informações Técnicas do Trigger Cron */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF650F]" />
                Webhook para Cron Job Automatizado (VPS Linux / Cronjob.org)
              </span>
              <p className="text-[11px] text-zinc-400">
                Para disparar o agente de forma agendada na VPS, configure o crontab ou serviço externo para chamar:
              </p>
              <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-zinc-300 overflow-x-auto select-all">
                curl -X POST https://icthusbrasil.com/api/v1/blog/agent/generate -H &quot;Authorization: Bearer c593749da9104553bbd4a708c03062c8d0710350ca4fac707f4e0ad9e653d4dc&quot;
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FF650F] hover:bg-orange-600 text-white text-sm font-extrabold transition-all shadow-xl shadow-orange-500/25 disabled:opacity-50"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SALVAR REGRAS DE AGENDAMENTO</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CONTEÚDO DA ABA 3: ARTIGOS GERADOS */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141518] border border-white/10 text-xs">
            <span className="text-zinc-400">
              Total de <strong>{posts.length}</strong> artigos salvos no banco de dados.
            </span>
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[#FF650F] hover:underline font-bold"
            >
              <span>Abrir Blog Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#141518] border border-white/10 space-y-3">
              <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Nenhum artigo postado ainda</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Clique no botão principal no topo &quot;GERAR POST AGORA COM IA&quot; para publicar seu primeiro artigo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl bg-[#141518] border border-white/10 hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Imagem de Capa */}
                  <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-[#FF650F]" />
                        <span>{post.readingTimeMin} min de leitura</span>
                        <span>•</span>
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF650F] hover:text-orange-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Post</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePostStatus(post.id, post.status)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 transition-colors"
                        >
                          {post.status === "PUBLISHED" ? "Tornar Rascunho" : "Publicar"}
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVA PAUTA MANUAL */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#18191D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#FF650F]" />
                <span>Adicionar Pauta ao Mini-Cérebro</span>
              </h3>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Alternador de Modo: Unitário vs Lote */}
            <div className="flex p-1 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewTopicMode("single")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  newTopicMode === "single"
                    ? "bg-[#FF650F] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pauta Individual
              </button>
              <button
                type="button"
                onClick={() => setNewTopicMode("bulk")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  newTopicMode === "bulk"
                    ? "bg-[#FF650F] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Em Lote (Colar Lista)
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              {newTopicMode === "single" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Título / Tema da Pauta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Como escolher a espessura de ACM ideal para fachadas"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Cole suas pautas (1 título por linha) *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Tendências de iluminação LED em 2027&#10;Vantagens do corte CNC em acrílico&#10;Como revitalizar fachadas comerciais antigas"
                    value={bulkTitles}
                    onChange={(e) => setBulkTitles(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none resize-none font-mono"
                  ></textarea>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Categoria</label>
                  <select
                    value={singleCategory}
                    onChange={(e) => setSingleCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="Fachadas Comerciais">Fachadas Comerciais</option>
                    <option value="Letreiros & Iluminação">Letreiros &amp; Iluminação</option>
                    <option value="Engenharia de Materiais">Engenharia de Materiais</option>
                    <option value="Usinagem CNC & Corte">Usinagem CNC &amp; Corte</option>
                    <option value="Normas Técnicas & ROI">Normas Técnicas &amp; ROI</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Prioridade</label>
                  <select
                    value={singlePriority}
                    onChange={(e) => setSinglePriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/20"
                >
                  Adicionar ao Mini-Cérebro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
