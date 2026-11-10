"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Sliders,
  Check,
  ChevronRight,
  BookOpen,
  X,
  Minus,
  Pencil,
  FileText,
} from "lucide-react";

const WEEK_DAYS = [
  { key: "MON", label: "Seg", full: "Segunda" },
  { key: "TUE", label: "Ter", full: "Terça" },
  { key: "WED", label: "Qua", full: "Quarta" },
  { key: "THU", label: "Qui", full: "Quinta" },
  { key: "FRI", label: "Sex", full: "Sexta" },
  { key: "SAT", label: "Sáb", full: "Sábado" },
  { key: "SUN", label: "Dom", full: "Domingo" },
];

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

  // Modais de Criação e Edição de Pautas
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicMode, setNewTopicMode] = useState<"single" | "bulk">("single");
  const [singleTitle, setSingleTitle] = useState("");
  const [singleCategory, setSingleCategory] = useState("Fachadas Comerciais");
  const [singlePriority, setSinglePriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [bulkTitles, setBulkTitles] = useState("");

  // Modal de Edição (CRUD)
  const [editingTopic, setEditingTopic] = useState<BlogTopic | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Fachadas Comerciais");
  const [editPriority, setEditPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [editKeywords, setEditKeywords] = useState("");
  const [savingEditTopic, setSavingEditTopic] = useState(false);

  // Filtros de Pautas
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [topicSearch, setTopicSearch] = useState("");

  // Input de Horário
  const [newHourInput, setNewHourInput] = useState("09:00");

  // Feedback Notification Toast
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Funções de Cadência (Dias e Horários)
  const handleToggleDay = (dayKey: string) => {
    if (!config) return;
    const current = config.allowedDays || [];
    let updated: string[];
    if (current.includes(dayKey)) {
      if (current.length === 1) {
        showFeedback("info", "Mantenha ao menos 1 dia da semana ativo.");
        return;
      }
      updated = current.filter((d) => d !== dayKey);
    } else {
      updated = [...current, dayKey];
    }
    setConfig({ ...config, allowedDays: updated });
  };

  const handleSetDaysPreset = (preset: "all" | "weekdays" | "weekend") => {
    if (!config) return;
    let days: string[] = [];
    if (preset === "all") {
      days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    } else if (preset === "weekdays") {
      days = ["MON", "TUE", "WED", "THU", "FRI"];
    } else if (preset === "weekend") {
      days = ["SAT", "SUN"];
    }
    setConfig({ ...config, allowedDays: days });
  };

  const handleAddHour = (hourToAdd?: string) => {
    if (!config) return;
    const hour = (hourToAdd || newHourInput).trim();
    if (!hour || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hour)) {
      showFeedback("error", "Informe um horário válido no formato HH:mm (ex: 14:30)");
      return;
    }
    const current = config.preferredHours || [];
    if (current.includes(hour)) {
      showFeedback("info", `O horário ${hour} já está cadastrado.`);
      return;
    }
    const updated = Array.from(new Set([...current, hour])).sort();
    setConfig({ ...config, preferredHours: updated });
    setNewHourInput("12:00");
  };

  const handleRemoveHour = (hourToRemove: string) => {
    if (!config) return;
    const current = config.preferredHours || [];
    if (current.length === 1) {
      showFeedback("info", "Mantenha ao menos 1 horário cadastrado.");
      return;
    }
    const updated = current.filter((h) => h !== hourToRemove);
    setConfig({ ...config, preferredHours: updated });
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
        const tJson = await topicsRes.json();
        setTopics(tJson.data || []);
        if (tJson.stats) setTopicStats(tJson.stats);
      }

      if (configRes.ok) {
        const cJson = await configRes.json();
        setConfig(cJson.data);
      }

      if (postsRes.ok) {
        const pJson = await postsRes.json();
        setPosts(pJson.data || []);
        if (pJson.stats) setPostStats(pJson.stats);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do blog:", err);
      showFeedback("error", "Erro ao sincronizar informações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ação: Disparar Geração Imediata com IA
  const handleGenerateNow = async (topicId?: string) => {
    setGeneratingNow(true);
    try {
      const res = await fetch("/api/v1/blog/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          ignoreSchedule: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.details || "Falha na geração");

      showFeedback("success", `Artigo gerado com sucesso! "${json.data?.post?.title || "Novo Post"}"`);
      await fetchData();
      setActiveTab("posts");
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao gerar artigo.");
    } finally {
      setGeneratingNow(false);
    }
  };

  // Ação: Sugerir 10 Pautas com IA
  const handleSuggestTopics = async () => {
    setSuggestingTopics(true);
    try {
      const res = await fetch("/api/v1/blog/topics/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao sugerir pautas");

      showFeedback("success", "10 pautas estratégicas adicionadas ao Mini-Cérebro!");
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao sugerir tópicos.");
    } finally {
      setSuggestingTopics(false);
    }
  };

  // Ação: Criar Nova Pauta (CRUD - Create)
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

  // Ação: Abrir Modal de Edição (CRUD - Edit)
  const handleOpenEditTopic = (topic: BlogTopic) => {
    setEditingTopic(topic);
    setEditTitle(topic.title);
    setEditCategory(topic.category || "Fachadas Comerciais");
    setEditPriority(topic.priority || "MEDIUM");
    setEditKeywords(Array.isArray(topic.keywords) ? topic.keywords.join(", ") : "");
  };

  // Ação: Salvar Edição da Pauta (CRUD - Update)
  const handleSaveEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTitle.trim()) return;
    setSavingEditTopic(true);
    try {
      const res = await fetch(`/api/v1/blog/topics/${editingTopic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          priority: editPriority,
          keywords: editKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao atualizar pauta.");

      showFeedback("success", "Pauta atualizada com sucesso!");
      setEditingTopic(null);
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao salvar alterações.");
    } finally {
      setSavingEditTopic(false);
    }
  };

  // Ação: Pausar / Reativar Pauta
  const handleToggleTopicPause = async (topic: BlogTopic) => {
    const nextStatus = topic.status === "PAUSED" ? "PENDING" : "PAUSED";
    try {
      const res = await fetch(`/api/v1/blog/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Falha ao alternar status da pauta.");
      showFeedback("success", `Pauta ${nextStatus === "PAUSED" ? "pausada" : "ativada para rodízio"}.`);
      await fetchData();
    } catch (err: any) {
      showFeedback("error", err.message);
    }
  };

  // Ação: Excluir Pauta (CRUD - Delete)
  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pauta do mini-cérebro?")) return;
    try {
      const res = await fetch(`/api/v1/blog/topics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir.");
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
      showFeedback("success", `Post ${nextStatus === "PUBLISHED" ? "publicado" : "em rascunho"}.`);
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

  // Ação: Salvar Configurações de Agendamento
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
      showFeedback("success", "Regras de agendamento salvas com sucesso!");
    } catch (err: any) {
      showFeedback("error", err.message || "Erro ao salvar.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Filtragem de Pautas
  const filteredTopics = topics.filter((t) => {
    if (topicFilter === "ACTIVE" && t.status === "PAUSED") return false;
    if (topicFilter === "PAUSED" && t.status !== "PAUSED") return false;
    if (topicSearch.trim()) {
      const search = topicSearch.toLowerCase();
      return (
        t.title.toLowerCase().includes(search) ||
        (t.category && t.category.toLowerCase().includes(search)) ||
        (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(search)))
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn text-zinc-100">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
              : feedback.type === "error"
              ? "bg-red-950/90 text-red-300 border-red-500/40"
              : "bg-blue-950/90 text-blue-300 border-blue-500/40"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : feedback.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Bot className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Topo Compacto: Título & Botão de Geração Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF650F] animate-pulse"></span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Plataforma ICTHUS • Blog IA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Gerenciador do Blog &amp; Mini-Cérebro
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleGenerateNow()}
            disabled={generatingNow}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            title="Gera 1 artigo imediatamente usando o próximo tema do Mini-Cérebro"
          >
            {generatingNow ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando Artigo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Artigo Agora</span>
              </>
            )}
          </button>

          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <span>Ver Blog</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Cards de Métricas Compactos (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Pautas no Mini-Cérebro */}
        <div className="p-4 rounded-xl bg-[#141518] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Pautas Cadastradas
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{topics.length}</span>
              <span className="text-xs text-zinc-400">
                ({topics.filter((t) => t.status !== "PAUSED").length} ativas)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Artigos Publicados */}
        <div className="p-4 rounded-xl bg-[#141518] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Artigos no Ar
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{postStats.published}</span>
              <span className="text-xs text-emerald-400">publicados</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Status do Robô & Cadência */}
        <div className="p-4 rounded-xl bg-[#141518] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Cadência do Robô
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{config?.postsPerDay || 1}</span>
              <span className="text-xs text-zinc-400">post(s) / dia</span>
            </div>
            <span className="text-[11px] text-zinc-500 block truncate">
              {config?.isActive ? "🟢 Agendador Operacional" : "⏸️ Robô Pausado"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF650F]/10 border border-[#FF650F]/20 flex items-center justify-center text-[#FF650F]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navegação por Abas Limpa */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("brain")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "schedule"
              ? "border-[#FF650F] text-[#FF650F] bg-white/[0.02]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Regras de Agendamento</span>
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "posts"
              ? "border-[#FF650F] text-[#FF650F] bg-white/[0.02]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artigos Gerados ({posts.length})</span>
        </button>
      </div>

      {/* ABA 1: MINI-CÉREBRO DE PAUTAS (CRUD COMPLETO) */}
      {activeTab === "brain" && (
        <div className="space-y-4">
          {/* Barra Superior: Busca, Filtro e Ações */}
          <div className="p-3.5 rounded-2xl bg-[#141518] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Campo de Busca & Filtros Rápidos */}
            <div className="flex flex-wrap items-center gap-2 flex-grow">
              <div className="relative min-w-[200px] sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pauta ou categoria..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                {[
                  { label: "Todas", value: "ALL" },
                  { label: "Ativas", value: "ACTIVE" },
                  { label: "Pausadas", value: "PAUSED" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTopicFilter(f.value)}
                    className={`px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold ${
                      topicFilter === f.value
                        ? "bg-[#FF650F] text-white"
                        : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões: Sugerir IA & Nova Pauta */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSuggestTopics}
                disabled={suggestingTopics}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
                title="Gera 10 ideias de pautas de alto impacto com IA"
              >
                {suggestingTopics ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Sugerir 10 Pautas</span>
              </button>

              <button
                onClick={() => setIsNewTopicModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Pauta</span>
              </button>
            </div>
          </div>

          {/* Listagem de Pautas em Linhas Compactas */}
          {loading ? (
            <div className="p-8 text-center text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FF650F]" />
              <p className="text-xs">Carregando pautas do mini-cérebro...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#141518] border border-white/10 space-y-2">
              <Brain className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhuma pauta encontrada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Adicione suas ideias de temas ou use &quot;Sugerir 10 Pautas&quot; para abastecer o robô.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3.5 rounded-xl bg-[#141518] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    topic.status === "PAUSED"
                      ? "border-white/5 opacity-60"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Informações da Pauta */}
                  <div className="space-y-1 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                        {topic.category || "Geral"}
                      </span>

                      {topic.priority === "URGENT" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                          Urgente
                        </span>
                      )}
                      {topic.priority === "HIGH" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          Alta
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-500 font-medium">
                        {topic.postsGeneratedCount === 0
                          ? "Ainda não utilizada"
                          : `${topic.postsGeneratedCount} artigo(s) já gerado(s)`}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {topic.title}
                    </h3>

                    {topic.keywords && topic.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {topic.keywords.slice(0, 4).map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-zinc-400 font-mono"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações CRUD da Pauta */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Botão de Disparo Rápido com Este Tema */}
                    <button
                      onClick={() => handleGenerateNow(topic.id)}
                      disabled={generatingNow}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF650F]/15 hover:bg-[#FF650F] text-[#FF650F] hover:text-white border border-[#FF650F]/30 text-xs font-bold transition-all disabled:opacity-50"
                      title="Gerar um novo artigo com IA sobre esta pauta agora"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Gerar Artigo</span>
                    </button>

                    {/* Editar Pauta (CRUD - Edit) */}
                    <button
                      onClick={() => handleOpenEditTopic(topic)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="Editar pauta"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Pausar / Reativar Pauta */}
                    <button
                      onClick={() => handleToggleTopicPause(topic)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        topic.status === "PAUSED"
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      }`}
                      title={topic.status === "PAUSED" ? "Reativar pauta no rodízio" : "Pausar pauta temporariamente"}
                    >
                      {topic.status === "PAUSED" ? (
                        <Play className="w-3.5 h-3.5" />
                      ) : (
                        <Pause className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Excluir Pauta (CRUD - Delete) */}
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Excluir pauta do mini-cérebro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: REGRAS DE AGENDAMENTO (LAYOUT COMPACTO & LIMPO) */}
      {activeTab === "schedule" && config && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#141518] border border-white/10 space-y-6">
            {/* Bloco 1: Status Geral & Modo de Publicação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-white/10">
              {/* Status do Robô */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#FF650F]" />
                    Status do Robô Autônomo
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {config.isActive
                      ? "O robô monitora a cadência e publica nos horários previstos."
                      : "O agendador automático está pausado."}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={config.isActive}
                    onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650F]"></div>
                </label>
              </div>

              {/* Modo de Publicação */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#FF650F]" />
                  Modo de Publicação
                </span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, autoPublish: true })}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold border transition-all text-center ${
                      config.autoPublish
                        ? "bg-[#FF650F] text-white border-orange-500 shadow-sm"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                    }`}
                  >
                    🚀 Direto no Ar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, autoPublish: false })}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold border transition-all text-center ${
                      !config.autoPublish
                        ? "bg-[#FF650F] text-white border-orange-500 shadow-sm"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                    }`}
                  >
                    📝 Salvar Rascunho
                  </button>
                </div>
              </div>
            </div>

            {/* Bloco 2: Posts por Dia */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FF650F]" />
                  Cadência Diária de Artigos
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Quantidade máxima de artigos que a IA produzirá a cada 24 horas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Stepper Compacto */}
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, postsPerDay: Math.max(1, (config.postsPerDay || 1) - 1) })}
                    disabled={(config.postsPerDay || 1) <= 1}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-white">
                    {config.postsPerDay || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, postsPerDay: Math.min(10, (config.postsPerDay || 1) + 1) })}
                    disabled={(config.postsPerDay || 1) >= 10}
                    className="w-7 h-7 rounded-lg bg-[#FF650F] hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Presets Rápidos */}
                {[1, 2, 3].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setConfig({ ...config, postsPerDay: num })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      (config.postsPerDay || 1) === num
                        ? "bg-[#FF650F] text-white"
                        : "bg-white/5 hover:bg-white/10 text-zinc-400"
                    }`}
                  >
                    {num}/dia
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco 3: Dias da Semana */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FF650F]" />
                    Dias da Semana Autorizados
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    O robô só publica nos dias marcados abaixo.
                  </p>
                </div>

                {/* Presets de Dias */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetDaysPreset("weekdays")}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 border border-white/5"
                  >
                    Seg-Sex
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDaysPreset("weekend")}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 border border-white/5"
                  >
                    Finais de Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDaysPreset("all")}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 border border-white/5"
                  >
                    Todos
                  </button>
                </div>
              </div>

              {/* Grade Compacta de Dias */}
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK_DAYS.map((day) => {
                  const isSelected = (config.allowedDays || []).includes(day.key);
                  return (
                    <button
                      type="button"
                      key={day.key}
                      onClick={() => handleToggleDay(day.key)}
                      className={`py-2 rounded-xl text-center border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? "bg-[#FF650F] text-white border-orange-400/50 shadow-sm"
                          : "bg-black/30 hover:bg-white/5 text-zinc-500 border-white/5"
                      }`}
                    >
                      <span>{day.label}</span>
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-transparent"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 4: Horários de Postagem */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FF650F]" />
                    Horários Programados (Horário de Brasília)
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    O robô valida a hora atual e posta de acordo com a janela destes horários.
                  </p>
                </div>

                {/* Campo de Adição Compacto */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={newHourInput}
                    onChange={(e) => setNewHourInput(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHour()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#FF650F] text-white text-xs font-bold transition-all border border-white/10 hover:border-transparent"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista de Horários Cadastrados */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(config.preferredHours || []).map((hour) => (
                  <div
                    key={hour}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-mono font-bold"
                  >
                    <Clock className="w-3 h-3 text-[#FF650F]" />
                    <span>{hour}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHour(hour)}
                      className="text-zinc-500 hover:text-red-400 ml-1"
                      title="Remover horário"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Sugestões Rápidas */}
                <span className="text-[11px] text-zinc-500 font-medium ml-2">Sugestões:</span>
                {["08:30", "12:00", "15:00", "18:30"].map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => handleAddHour(h)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-mono border border-white/5"
                  >
                    +{h}
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco 5: Autoria Técnica */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#FF650F]" />
                  Assinatura de Autoria Padrão
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Nome do autor exibido nos artigos publicados.
                </p>
              </div>

              <input
                type="text"
                value={config.defaultAuthor}
                onChange={(e) => setConfig({ ...config, defaultAuthor: e.target.value })}
                className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: Engenharia ICTHUS"
              />
            </div>

            {/* Botão Salvar Compacto */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Regras de Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: ARTIGOS GERADOS */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141518] border border-white/10 text-xs">
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
            <div className="p-8 text-center rounded-2xl bg-[#141518] border border-white/10 space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum artigo gerado ainda</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Clique em &quot;Gerar Artigo Agora&quot; ou aguarde o agendador automático produzir os primeiros conteúdos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl bg-[#141518] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-grow">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Publicado no Ar" : "Rascunho"}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="Visualizar post no blog"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleTogglePostStatus(post.id, post.status)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors"
                      title="Alternar entre publicado e rascunho"
                    >
                      {post.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                    </button>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Excluir post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: NOVA PAUTA (CRUD - CREATE) */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#18191D] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#FF650F]" />
                <span>Adicionar Pauta ao Mini-Cérebro</span>
              </h3>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Alternador de Modo: Unitário vs Lote */}
            <div className="flex p-1 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewTopicMode("single")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  newTopicMode === "single"
                    ? "bg-[#FF650F] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pauta Única
              </button>
              <button
                type="button"
                onClick={() => setNewTopicMode("bulk")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  newTopicMode === "bulk"
                    ? "bg-[#FF650F] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Em Lote (1 por linha)
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3">
              {newTopicMode === "single" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Título / Tema da Pauta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Como escolher a espessura ideal de ACM para fachadas"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Cole as pautas (1 título por linha) *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tendências de iluminação LED em 2027&#10;Vantagens do corte CNC em acrílico&#10;Como revitalizar fachadas comerciais antigas"
                    value={bulkTitles}
                    onChange={(e) => setBulkTitles(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none resize-none font-mono"
                  ></textarea>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Categoria</label>
                  <select
                    value={singleCategory}
                    onChange={(e) => setSingleCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="Fachadas Comerciais">Fachadas Comerciais</option>
                    <option value="Letreiros & Iluminação">Letreiros &amp; Iluminação</option>
                    <option value="Engenharia de Materiais">Engenharia de Materiais</option>
                    <option value="Usinagem CNC & Corte">Usinagem CNC &amp; Corte</option>
                    <option value="Normas Técnicas & ROI">Normas Técnicas &amp; ROI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Prioridade</label>
                  <select
                    value={singlePriority}
                    onChange={(e) => setSinglePriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/20"
                >
                  Adicionar Pauta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR PAUTA (CRUD - EDIT / UPDATE) */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#18191D] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#FF650F]" />
                <span>Editar Pauta do Mini-Cérebro</span>
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTopic} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">
                  Título / Tema da Pauta *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="Fachadas Comerciais">Fachadas Comerciais</option>
                    <option value="Letreiros & Iluminação">Letreiros &amp; Iluminação</option>
                    <option value="Engenharia de Materiais">Engenharia de Materiais</option>
                    <option value="Usinagem CNC & Corte">Usinagem CNC &amp; Corte</option>
                    <option value="Normas Técnicas & ROI">Normas Técnicas &amp; ROI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Prioridade</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  >
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">
                  Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: fachadas de ACM, iluminação LED, durabilidade"
                  value={editKeywords}
                  onChange={(e) => setEditKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEditTopic}
                  className="px-5 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {savingEditTopic ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
