"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Kanban,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
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
    URGENT: { label: "Urgente", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    HIGH: { label: "Alta", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    MEDIUM: { label: "Média", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    LOW: { label: "Baixa", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  };

  return (
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body">
      <AdminNav />

      <main className="flex-grow p-6 max-w-[1600px] mx-auto w-full flex flex-col space-y-6">
        {/* Cabeçalho do CRM e Métricas em Tempo Real */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-glessios-border-dark">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Kanban className="w-7 h-7 text-glessios-orange" />
              Funil Comercial & CRM Kanban
            </h1>
            <p className="text-xs text-glessios-text-body">
              Gerencie oportunidades, arraste cards entre as etapas e converta negócios fechados em Ordens de Serviço.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 bg-glessios-graphite px-4 py-2 rounded-xl border border-glessios-border-dark text-xs">
              <div>
                <span className="text-glessios-text-body block text-[10px] uppercase">Oportunidades</span>
                <span className="text-sm font-bold text-white font-mono">{allLeads.length}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-glessios-text-body block text-[10px] uppercase">Volume Total</span>
                <span className="text-sm font-bold text-glessios-orange font-mono">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-glessios-text-body block text-[10px] uppercase">Atenção Alta</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{urgentCount}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsNewLeadModalOpen(true)}
              className="gap-2 text-xs font-bold shadow-orange-glow"
            >
              <Plus className="w-4 h-4" />
              Novo Lead Manual
            </Button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-glessios-text-body absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, projeto ou telefone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-glessios-graphite border border-glessios-border-dark text-white text-xs placeholder:text-glessios-text-body/40 focus:outline-none focus:border-glessios-orange"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-glessios-text-body font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-glessios-orange" />
              Prioridade:
            </span>
            {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? "bg-glessios-orange text-white"
                    : "bg-glessios-graphite text-glessios-text-body hover:text-white border border-glessios-border-dark"
                }`}
              >
                {p === "ALL" ? "Todas" : priorityBadges[p as keyof typeof priorityBadges]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabuleiro Kanban com Scroll Horizontal Suave */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-xs text-glessios-text-body">
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
                  className="w-80 shrink-0 rounded-2xl bg-glessios-graphite border border-glessios-border-dark flex flex-col max-h-[calc(100vh-250px)]"
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="p-4 border-b border-glessios-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.color || "#FF650F" }}
                      />
                      <h3 className="font-bold text-sm text-white">{col.name}</h3>
                      <span className="text-[11px] bg-white/10 text-glessios-text-body px-2 py-0.5 rounded-full font-mono">
                        {filteredLeads.length}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-glessios-orange">
                      {formatCurrency(colValue)}
                    </span>
                  </div>

                  {/* Lista de Cards da Coluna */}
                  <div className="p-3 overflow-y-auto space-y-3 flex-grow min-h-[150px]">
                    {filteredLeads.map((lead) => {
                      const pBadge = priorityBadges[lead.priority] || priorityBadges.MEDIUM;
                      const isApprovedStage = col.name.includes("Aprovado") || col.name.includes("Produção");

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className="p-4 rounded-xl bg-glessios-charcoal border border-glessios-border-dark hover:border-glessios-orange/40 hover:shadow-card-hover transition-all cursor-grab active:cursor-grabbing space-y-3"
                        >
                          {/* Badges do Card */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${pBadge.className}`}
                            >
                              {pBadge.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
                            </span>
                          </div>

                          {/* Título & Cliente */}
                          <div>
                            <h4 className="font-bold text-sm text-white leading-tight">
                              {lead.title}
                            </h4>
                            <p className="text-xs text-glessios-text-body mt-1 font-medium">
                              {lead.contactName}
                            </p>
                          </div>

                          {/* Contato & WhatsApp */}
                          <div className="pt-2 border-t border-glessios-border-dark flex items-center justify-between text-xs">
                            <a
                              href={`https://wa.me/${lead.contactPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {lead.contactPhone}
                            </a>

                            <span className="text-[10px] text-glessios-text-body font-mono">
                              {formatDate(lead.createdAt)}
                            </span>
                          </div>

                          {/* Ação: Converter em Ordem de Serviço */}
                          {isApprovedStage && (
                            <div className="pt-2">
                              <Button
                                variant="primary"
                                size="sm"
                                isLoading={convertingLeadId === lead.id}
                                onClick={() => handleConvertToOS(lead.id)}
                                className="w-full text-xs font-bold gap-1.5 h-8 bg-orange-gradient shadow-orange-glow"
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
                      <div className="p-6 text-center text-xs text-glessios-text-body/50 border border-dashed border-glessios-border-dark rounded-xl">
                        Nenhum lead nesta coluna
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal para Criação de Novo Lead Manual */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-glessios-graphite border border-glessios-border-orange/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-glessios-border-dark">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-glessios-orange" />
                Cadastrar Nova Oportunidade
              </h3>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-glessios-text-body hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Título da Oportunidade *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  placeholder="Ex: Fachada ACM Loja Roupas Batel"
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })
                    }
                    placeholder="Ex: 8500"
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    Prioridade
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, priority: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Anotações Iniciais
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Informações sobre medidas, materiais preferidos ou prazo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
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
