"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Kanban,
  Plus,
  Search,
  Filter,
  Layers,
  X,
  MessageCircle,
} from "lucide-react";

interface Lead {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  source: string;
  estimatedValue: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes: string | null;
  columnId: string;
  orderInColumn: number;
  createdAt: string;
}

interface Column {
  id: string;
  name: string;
  order: number;
  color: string | null;
  leads: Lead[];
}

export default function CrmKanbanPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Estados de modais
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [newLeadForm, setNewLeadForm] = useState({
    title: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    estimatedValue: "",
    priority: "MEDIUM",
    notes: "",
  });

  const fetchKanban = async () => {
    try {
      const res = await fetch("/api/v1/crm/leads");
      const data = await res.json();
      if (data.success && data.columns) {
        setColumns(data.columns);
      }
    } catch (err) {
      console.error("Erro ao carregar CRM Kanban:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!leadId) return;

    // Atualização otimista no estado local
    setColumns((prev) => {
      let movedLead: Lead | null = null;
      const updated = prev.map((col) => {
        const found = col.leads.find((l) => l.id === leadId);
        if (found) movedLead = { ...found, columnId: targetColumnId };
        return {
          ...col,
          leads: col.leads.filter((l) => l.id !== leadId),
        };
      });

      if (movedLead) {
        return updated.map((col) => {
          if (col.id === targetColumnId) {
            return {
              ...col,
              leads: [...col.leads, movedLead!],
            };
          }
          return col;
        });
      }
      return prev;
    });

    setDraggedLeadId(null);

    // Persistência no PostgreSQL via API
    try {
      await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColumnId }),
      });
    } catch (err) {
      console.error("Falha ao sincronizar movimentação do lead:", err);
      fetchKanban(); // Reverte em caso de falha
    }
  };

  // Conversão de Lead em OS
  const handleConvertToOS = async (leadId: string) => {
    setConvertingLeadId(leadId);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/convert-to-os`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchKanban();
        const shouldGo = confirm(
          `${data.message || "Lead convertido com sucesso em Ordem de Serviço!"}\n\nDeseja abrir a Ordem de Serviço agora na Linha de Produção Fabril?`
        );
        if (shouldGo) {
          router.push("/admin/producao");
        }
      } else {
        alert("Erro na conversão: " + data.error);
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setConvertingLeadId(null);
    }
  };

  // Criação de Novo Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewLeadModalOpen(false);
        setNewLeadForm({
          title: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          estimatedValue: "",
          priority: "MEDIUM",
          notes: "",
        });
        fetchKanban();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Falha ao registrar novo lead.");
    }
  };

  // Métricas calculadas
  const allLeads = columns.flatMap((c) => c.leads);
  const totalValue = allLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
  const urgentCount = allLeads.filter((l) => l.priority === "URGENT" || l.priority === "HIGH").length;

  const priorityBadges = {
    URGENT: { label: "Urgente", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
    HIGH: { label: "Alta", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    MEDIUM: { label: "Média", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    LOW: { label: "Baixa", className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho do CRM e Métricas em Tempo Real - M3 Expressive Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Módulo Comercial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <Kanban className="w-7 h-7 text-glessios-orange" />
            Funil Comercial & CRM Kanban
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Gerencie oportunidades, arraste cards entre as etapas e converta negócios fechados em Ordens de Serviço.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 bg-black/[0.03] dark:bg-white/[0.04] px-4 py-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-xs">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Oportunidades</span>
              <span className="text-sm font-black text-zinc-900 dark:text-white font-mono">{allLeads.length}</span>
            </div>
            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Volume Total</span>
              <span className="text-sm font-black text-glessios-orange font-mono">
                {formatCurrency(totalValue)}
              </span>
            </div>
            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Atenção Alta</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">{urgentCount}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="gap-2 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Busca - M3 Form Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, projeto ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-glessios-orange" />
            Prioridade:
          </span>
          {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                priorityFilter === p
                  ? "bg-glessios-orange text-white shadow-sm"
                  : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08]"
              }`}
            >
              {p === "ALL" ? "Todas" : priorityBadges[p as keyof typeof priorityBadges]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabuleiro Kanban com Colunas M3 Tonal Containers */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
          Carregando funil comercial...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
          {columns.map((col) => {
            const filteredLeads = col.leads.filter((lead) => {
              const matchSearch =
                lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.contactPhone.includes(searchTerm);
              const matchPriority = priorityFilter === "ALL" || lead.priority === priorityFilter;
              return matchSearch && matchPriority;
            });

            const colValue = filteredLeads.reduce(
              (sum, l) => sum + (Number(l.estimatedValue) || 0),
              0
            );

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-80 shrink-0 rounded-3xl bg-[#F6F1EC] dark:bg-[#141519] border border-black/[0.04] dark:border-white/[0.05] flex flex-col max-h-[calc(100vh-260px)] shadow-m3-1"
              >
                {/* Cabeçalho da Coluna */}
                <div className="p-4 border-b border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color || "#FF650F" }}
                    />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{col.name}</h3>
                    <span className="text-[11px] bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                      {filteredLeads.length}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-glessios-orange">
                    {formatCurrency(colValue)}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="p-3 overflow-y-auto space-y-3 flex-grow min-h-[160px]">
                  {filteredLeads.map((lead) => {
                    const pBadge = priorityBadges[lead.priority] || priorityBadges.MEDIUM;
                    const isApprovedStage = col.name.includes("Aprovado") || col.name.includes("Produção");

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="p-4 rounded-2xl bg-white dark:bg-[#1C1D24] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 hover:border-orange-500/40 transition-all cursor-grab active:cursor-grabbing space-y-3"
                      >
                        {/* Badges do Card */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${pBadge.className}`}
                          >
                            {pBadge.label}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-white">
                            {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
                          </span>
                        </div>

                        {/* Título & Cliente */}
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                            {lead.title}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                            {lead.contactName}
                          </p>
                        </div>

                        {/* Contato & WhatsApp */}
                        <div className="pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                          <a
                            href={`https://wa.me/${lead.contactPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {lead.contactPhone}
                          </a>

                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>

                        {/* Ação: Converter em Ordem de Serviço */}
                        {isApprovedStage && (
                          <div className="pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={convertingLeadId === lead.id}
                              onClick={() => handleConvertToOS(lead.id)}
                              className="w-full text-xs font-bold gap-1.5 h-8 bg-orange-gradient rounded-xl"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Converter em OS
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredLeads.length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-2xl">
                      Nenhum lead nesta coluna
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Criação de Novo Lead Manual - M3 Expressive Dialog */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <Plus className="w-4 h-4" />
                </div>
                Cadastrar Oportunidade
              </h3>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Título da Oportunidade *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  placeholder="Ex: Fachada ACM Loja Roupas Batel"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.contactName}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, contactName: e.target.value })
                    }
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.contactPhone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, contactPhone: e.target.value })
                    }
                    placeholder="(41) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })
                    }
                    placeholder="Ex: 8500"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Prioridade
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, priority: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                  >
                    <option value="LOW" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Baixa</option>
                    <option value="MEDIUM" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Média</option>
                    <option value="HIGH" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Alta</option>
                    <option value="URGENT" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Anotações Iniciais
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Informações sobre medidas, materiais preferidos ou prazo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewLeadModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Adicionar ao Funil
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
