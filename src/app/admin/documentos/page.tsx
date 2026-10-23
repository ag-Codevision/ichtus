"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MessageCircle,
  ExternalLink,
  Layers,
  FileCheck,
  Calendar,
  X,
  Plus,
  RefreshCw,
  Phone,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DocumentItem {
  id: string;
  code: string | null;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: number | null;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  totalAmount: number | string | null;
  status: string;
  sentViaWhatsapp: boolean;
  sentAt: string | null;
  createdAt: string;
  customer?: {
    id: string;
    tradeName: string | null;
    fullName: string | null;
    whatsapp: string | null;
    phone: string | null;
  } | null;
  lead?: {
    id: string;
    title: string;
    columnId: string;
  } | null;
}

interface Metrics {
  totalCount: number;
  orcamentosCount: number;
  sentWhatsappCount: number;
  totalVolume: number;
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalCount: 0,
    orcamentosCount: 0,
    sentWhatsappCount: 0,
    totalVolume: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modais
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [whatsappModalDoc, setWhatsappModalDoc] = useState<DocumentItem | null>(null);
  const [whatsappRecipientPhone, setWhatsappRecipientPhone] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPeriod !== "ALL") params.set("period", selectedPeriod);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/v1/documents?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedPeriod, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  // Handler para envio via WhatsApp
  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappModalDoc) return;
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch(`/api/v1/documents/${whatsappModalDoc.id}/send-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: whatsappRecipientPhone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Documento disparado com sucesso pelo WhatsApp!");
        setWhatsappModalDoc(null);
        fetchDocuments();
      } else {
        alert(data.error || "Falha ao enviar documento via WhatsApp.");
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Handler para exclusão
  const handleDeleteDocument = async () => {
    if (!deleteDocId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/documents/${deleteDocId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDocId(null);
        fetchDocuments();
      } else {
        alert(data.error || "Erro ao excluir documento.");
      }
    } catch {
      alert("Falha na comunicação ao tentar excluir documento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    { id: "ALL", label: "Todos os Documentos" },
    { id: "ORCAMENTO", label: "Orçamentos" },
    { id: "PROPOSTA", label: "Propostas Comerciais" },
    { id: "CONTRATO", label: "Contratos" },
    { id: "ORDEM_SERVICO", label: "Ordens de Serviço" },
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Central de Documentos & Orçamentos
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            Documentos Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Consulte todos os orçamentos, propostas e contratos emitidos no sistema com filtros e disparo pelo WhatsApp.
          </p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#14151B] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white font-mono">
              {metrics.totalCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#14151B] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Orçamentos</span>
            <span className="text-lg font-black text-[#FF650F] font-mono">
              {metrics.orcamentosCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#14151B] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Via WhatsApp</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.sentWhatsappCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#14151B] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Volume Total</span>
            <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white font-mono truncate block">
              {formatCurrency(metrics.totalVolume)}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca Textual */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, código, projeto..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-50 dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm"
            />
          </div>

          {/* Chips de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? "bg-[#FF650F] text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-[#141519] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.05] dark:border-white/[0.06]"
                }`}
              >
                {c.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 transition-colors ${
                showAdvancedFilters
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300"
                  : "bg-zinc-100 dark:bg-[#141519] text-zinc-600 dark:text-zinc-400 border-black/[0.05] dark:border-white/[0.06]"
              }`}
              title="Filtros Avançados"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF650F]" />
            </button>
          </div>
        </div>

        {/* Gaveta de Filtros Avançados */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                Período de Emissão:
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-white"
              >
                <option value="ALL">Todo o Histórico</option>
                <option value="today">Emitidos Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Este Mês</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                Status de Envio WhatsApp:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-white"
              >
                <option value="ALL">Todos os Status</option>
                <option value="SENT_WHATSAPP">Enviados via WhatsApp</option>
                <option value="NOT_SENT">Não Enviados</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedPeriod("ALL");
                  setSelectedStatus("ALL");
                  setSearchTerm("");
                }}
                className="w-full rounded-xl text-xs font-bold gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Documentos */}
      <div className="rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-xs text-zinc-500">
            <div className="w-6 h-6 border-2 border-[#FF650F] border-t-transparent rounded-full animate-spin" />
            <span>Consultando repositório de documentos...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Nenhum documento localizado
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Ao cadastrar um novo serviço no Funil Kanban, o orçamento em PDF será gerado e catalogado automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-zinc-50 dark:bg-[#14151B] text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">Documento / Código</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Cliente / Contato</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Status WhatsApp</th>
                  <th className="p-4">Emissão</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {documents.map((doc) => {
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-900 dark:text-white block hover:text-[#FF650F] transition-colors">
                            {doc.title}
                          </span>
                          {doc.code && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-orange-500/10 text-[#FF650F] font-mono text-[10px] font-bold">
                              [{doc.code}]
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300">
                          {doc.category === "ORCAMENTO"
                            ? "Orçamento"
                            : doc.category === "PROPOSTA"
                            ? "Proposta"
                            : doc.category === "CONTRATO"
                            ? "Contrato"
                            : "Ordem de Serviço"}
                        </span>
                      </td>

                      <td className="p-4 min-w-[180px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-900 dark:text-white block">
                            {doc.clientName}
                          </span>
                          {doc.clientPhone && (
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-zinc-400" />
                              {doc.clientPhone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(doc.totalAmount)}
                      </td>

                      <td className="p-4">
                        {doc.sentViaWhatsapp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Enviado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 text-[10px] font-semibold">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {formatDate(doc.createdAt)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Visualizar */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            title="Visualizar PDF"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-[#FF650F] hover:bg-orange-500/10 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Baixar */}
                          <a
                            href={doc.fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            title="Baixar PDF"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Enviar WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsappModalDoc(doc);
                              setWhatsappRecipientPhone(doc.clientPhone || "");
                            }}
                            title="Disparar no WhatsApp"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => setDeleteDocId(doc.id)}
                            title="Excluir Documento"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: PREVIEW DO PDF */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="w-full max-w-4xl h-[90vh] bg-white dark:bg-[#18191E] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Visualizador de Documento Oficial
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                  {previewDoc.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Guia</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              <iframe
                src={`${previewDoc.fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title="Pré-visualização do PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPARO / REENVIO POR WHATSAPP */}
      {whatsappModalDoc && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setWhatsappModalDoc(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18191E] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Enviar pelo WhatsApp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalDoc(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              O documento PDF <strong>{whatsappModalDoc.title}</strong> será anexado e despachado automaticamente via Baileys.
            </p>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Número de WhatsApp do Destinatário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="(41) 99999-9999"
                  value={whatsappRecipientPhone}
                  onChange={(e) => setWhatsappRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWhatsappModalDoc(null)}
                  className="rounded-full text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSendingWhatsApp}
                  className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                >
                  Disparar PDF
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteDocId && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDeleteDocId(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18191E] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Excluir este documento?
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Esta ação removerá o arquivo PDF e o registro de histórico de orçamentos do banco de dados.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setDeleteDocId(null)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                isLoading={isDeleting}
                onClick={handleDeleteDocument}
                className="rounded-xl px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
