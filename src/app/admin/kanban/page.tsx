"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Briefcase,
  Truck,
  Wrench,
  UserCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Lock,
  Edit2,
  ArrowLeft,
  ArrowRight,
  Palette,
  GripVertical,
  Hand,
  SlidersHorizontal,
  AlertCircle,
  Loader2,
  MoreVertical,
  Check,
  CheckSquare,
  Paperclip,
  Clock,
  MessageSquare,
} from "lucide-react";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { LeadCardDrawerModal } from "@/components/admin/crm/LeadCardDrawerModal";
import { ContactDetailsSheet } from "@/components/admin/crm/ContactDetailsSheet";

interface Lead {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  customerId: string | null;
  customer?: {
    id: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    type: string;
    whatsapp: string | null;
    email: string | null;
    city: string | null;
  } | null;
  source: string;
  estimatedValue: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  coverImage: string | null;
  tags?: { tag: { id: string; name: string; color: string } }[];
  checklists?: { id: string; title: string; items: { id: string; isCompleted: boolean }[] }[];
  attachments?: { id: string; fileName: string; fileUrl: string; fileType: string; isCover: boolean }[];
  _count?: { comments: number; attachments: number };
  columnId: string;
  orderInColumn: number;
  createdAt: string;
}

interface Column {
  id: string;
  name: string;
  order: number;
  color: string | null;
  isSystem?: boolean;
  leads: Lead[];
}

const DEFAULT_TOOLS = [
  "Dupla face",
  "MDF",
  "Metal",
  "Acrílico",
  "Vidro",
  "Película poliéster",
  "Adesivo vinil",
  "Chaves especiais",
  "Cinta lacre",
  "Manta magnética",
  "Escada",
  "Andaime",
  "Material de limpeza",
  "Soprador",
  "Extensão",
  "Furadeira",
  "Parafusos",
  "Buchas",
  "Espaçadores",
  "Iluminação",
  "LED",
  "ACM",
  "Cola",
];

export default function KanbanPage() {
  const router = useRouter();

  // Estados do Kanban
  const [columns, setColumns] = useState<Column[]>([]);
  const [isKanbanLoading, setIsKanbanLoading] = useState(true);
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);

  // Estados de CRUD de Colunas / Campos do Kanban
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [columnForm, setColumnForm] = useState({ name: "", color: "#FF650F" });
  const [isSavingColumn, setIsSavingColumn] = useState(false);

  // Referência e Estados de Mouse Drag-to-Scroll (Mãozinha fluida do Kanban)
  const kanbanViewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartXRef = useRef(0);
  const panScrollLeftRef = useRef(0);
  const isDraggingLeadsRef = useRef(false);

  // Estados do Verso do Cartão (Estilo Trello)
  const [selectedCardLeadId, setSelectedCardLeadId] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Detalhes do contato vinculado ao lead (sheet lateral)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);

  // Cliente selecionado no Seletor Inteligente para nova oportunidade
  const [selectedClientForNewLead, setSelectedClientForNewLead] = useState<SearchedClient | null>(null);

  const [newLeadForm, setNewLeadForm] = useState({
    title: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    customerId: "",
    estimatedValue: "",
    priority: "MEDIUM",
    dueDate: "",
    notes: "",
    budgetCode: "",
    helperId: "",
    voltage: "110V",
    tools: [] as string[],
    paintDetails: "",
    freightDetails: "",
  });

  const [availableToolsList, setAvailableToolsList] = useState<string[]>(DEFAULT_TOOLS);
  const [customToolInput, setCustomToolInput] = useState("");
  const [isAddingCustomTool, setIsAddingCustomTool] = useState(false);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [nextBudgetCodePreview, setNextBudgetCodePreview] = useState("");
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Carrega código de orçamento e prestadores auxiliares ao abrir modal
  useEffect(() => {
    if (isNewLeadModalOpen) {
      fetch("/api/v1/crm/leads/next-code")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.budgetCode) {
            setNextBudgetCodePreview(data.budgetCode);
            setNewLeadForm((prev) => ({ ...prev, budgetCode: data.budgetCode }));
          }
        })
        .catch((err) => console.warn("Aviso ao carregar próximo código:", err));

      fetch("/api/v1/crm/contacts?type=SERVICE_PROVIDER&limit=50")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.contacts) {
            setServiceProviders(data.contacts);
          }
        })
        .catch((err) => console.warn("Aviso ao carregar prestadores:", err));
    }
  }, [isNewLeadModalOpen]);

  // Carrega o Kanban de Leads
  const fetchKanban = useCallback(async () => {
    setIsKanbanLoading(true);
    try {
      const res = await fetch("/api/v1/crm/leads");
      const data = await res.json();
      if (data.success && data.columns) {
        setColumns(data.columns);
      }
    } catch (err) {
      console.error("Erro ao carregar CRM Kanban:", err);
    } finally {
      setIsKanbanLoading(false);
    }
  }, []);

  // Carrega lista leve de clientes para o seletor do Kanban
  const fetchAvailableClients = async () => {
    try {
      const res = await fetch("/api/v1/crm/contacts/search?limit=50");
      const data = await res.json();
      if (data.success) {
        setAvailableClients(data.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar clientes para o seletor:", err);
    }
  };

  useEffect(() => {
    fetchKanban();
    fetchAvailableClients();
  }, [fetchKanban]);

  // ==========================================
  // HANDLERS DE CRUD DE CAMPOS / COLUNAS
  // ==========================================
  const handleOpenAddColumn = () => {
    setEditingColumn(null);
    setColumnForm({ name: "", color: "#FF650F" });
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumn = (col: Column) => {
    setEditingColumn(col);
    setColumnForm({ name: col.name, color: col.color || "#FF650F" });
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnForm.name.trim()) return;
    setIsSavingColumn(true);
    try {
      if (editingColumn) {
        // Atualizar coluna existente
        const res = await fetch(`/api/v1/crm/kanban/columns/${editingColumn.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(columnForm),
        });
        const data = await res.json();
        if (data.success) {
          setIsColumnModalOpen(false);
          fetchKanban();
        } else {
          alert("Erro ao atualizar campo: " + (data.error || ""));
        }
      } else {
        // Criar nova coluna
        const res = await fetch("/api/v1/crm/kanban/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(columnForm),
        });
        const data = await res.json();
        if (data.success) {
          setIsColumnModalOpen(false);
          fetchKanban();
        } else {
          alert("Erro ao criar campo: " + (data.error || ""));
        }
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsSavingColumn(false);
    }
  };

  const handleDeleteColumn = async (col: Column) => {
    if (columns.length <= 1) {
      alert("O funil comercial precisa ter pelo menos um campo.");
      return;
    }
    const hasLeads = col.leads.length > 0;
    const confirmMsg = hasLeads
      ? `Deseja realmente excluir o campo "${col.name}"? As ${col.leads.length} oportunidade(s) presentes neste campo serão transferidas para o primeiro campo disponível.`
      : `Deseja realmente excluir o campo "${col.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/v1/crm/kanban/columns/${col.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchKanban();
      } else {
        alert("Erro ao excluir campo: " + (data.error || ""));
      }
    } catch {
      alert("Falha na comunicação com o servidor ao excluir campo.");
    }
  };

  const handleMoveColumn = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newColumns = [...columns];
    const [movedCol] = newColumns.splice(index, 1);
    newColumns.splice(targetIndex, 0, movedCol);

    // Atualização otimista imediata
    setColumns(newColumns);

    try {
      await fetch("/api/v1/crm/kanban/columns/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnIds: newColumns.map((c) => c.id) }),
      });
    } catch (err) {
      console.error("Falha ao salvar reordenação de colunas:", err);
      fetchKanban();
    }
  };

  // Exclusão Rápida de Oportunidade no Kanban
  const handleDeleteLeadQuick = async (leadId: string) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchKanban();
      } else {
        alert(data.error || "Erro ao excluir oportunidade.");
      }
    } catch {
      alert("Falha na comunicação ao tentar excluir oportunidade.");
    }
  };

  // ==========================================
  // CONTROLE DE MOUSE DRAG-TO-SCROLL (MÃOZINHA)
  // ==========================================
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[draggable="true"]') ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }
    setIsPanning(true);
    panStartXRef.current = e.pageX - (kanbanViewportRef.current?.offsetLeft || 0);
    panScrollLeftRef.current = kanbanViewportRef.current?.scrollLeft || 0;
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !kanbanViewportRef.current || isDraggingLeadsRef.current) return;
    e.preventDefault();
    const x = e.pageX - (kanbanViewportRef.current.offsetLeft || 0);
    const walk = (x - panStartXRef.current) * 1.5;
    kanbanViewportRef.current.scrollLeft = panScrollLeftRef.current - walk;
  };

  const handleViewportMouseUp = () => {
    setIsPanning(false);
  };

  const handleViewportMouseLeave = () => {
    setIsPanning(false);
  };

  const handleScrollLeft = () => {
    kanbanViewportRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    kanbanViewportRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  };

  // Handlers do Kanban de Leads
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    isDraggingLeadsRef.current = true;
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    isDraggingLeadsRef.current = false;
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    isDraggingLeadsRef.current = false;
    setDragOverColumnId(null);
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!leadId) return;

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

    try {
      await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColumnId }),
      });
    } catch (err) {
      console.error("Falha ao sincronizar movimentação do lead:", err);
      fetchKanban();
    }
  };

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
        setSelectedClientForNewLead(null);
        setNewLeadForm({
          title: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          customerId: "",
          estimatedValue: "",
          priority: "MEDIUM",
          dueDate: "",
          notes: "",
          budgetCode: "",
          helperId: "",
          voltage: "110V",
          tools: [],
          paintDetails: "",
          freightDetails: "",
        });
        fetchKanban();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Falha ao registrar novo lead.");
    }
  };

  const handleSelectClientForLead = (clientId: string) => {
    const selected = availableClients.find((c) => c.id === clientId);
    if (selected) {
      setNewLeadForm((p) => ({
        ...p,
        customerId: selected.id,
        contactName: selected.displayName,
        contactPhone: selected.whatsapp || selected.phone || p.contactPhone,
        contactEmail: selected.email || p.contactEmail,
      }));
    } else {
      setNewLeadForm((p) => ({ ...p, customerId: "" }));
    }
  };

  // Métricas do Kanban
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
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-[#FF650F] text-xs font-bold uppercase tracking-wider">
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline Comercial</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            Funil Comercial & Kanban
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Acompanhe oportunidades, arraste cards e converta negociações em Ordens de Serviço.
          </p>
        </div>

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Trabalho</span>
          </Button>
        </div>
      </div>

      {/* ÁREA DO FUNIL COMERCIAL & KANBAN */}
      <div className="space-y-4">
        {/* Barra de Ferramentas Superior do Funil */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                placeholder="Buscar oportunidade ou cliente..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF650F]"
              >
                <option value="ALL">Todas as prioridades</option>
                <option value="URGENT">Urgente</option>
                <option value="HIGH">Alta prioridade</option>
                <option value="MEDIUM">Média prioridade</option>
                <option value="LOW">Baixa prioridade</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Controles de Navegação Horizontal Fluida */}
            <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={handleScrollLeft}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono px-1 text-zinc-400 font-bold hidden sm:inline">
                Scroll
              </span>
              <button
                type="button"
                onClick={handleScrollRight}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddColumn}
              className="flex items-center gap-1.5 text-xs font-bold rounded-2xl border-dashed"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF650F]" />
              <span>Gerenciar Colunas</span>
            </Button>
          </div>
        </div>

        {/* Resumo de Métricas Rápidas do Funil */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total no Funil
              </span>
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                {allLeads.length} trabalhos
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Pipeline Estimado
              </span>
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Urgentes / Alta
              </span>
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                {urgentCount} prioridades
              </span>
            </div>
          </div>
        </div>

        {/* Quadro Kanban de Colunas */}
        {isKanbanLoading ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF650F]" />
            <span className="text-xs font-semibold">Carregando oportunidades do funil...</span>
          </div>
        ) : (
          <div
            ref={kanbanViewportRef}
            onMouseDown={handleViewportMouseDown}
            onMouseMove={handleViewportMouseMove}
            onMouseUp={handleViewportMouseUp}
            onMouseLeave={handleViewportMouseLeave}
            className={`flex gap-4 overflow-x-auto pb-6 pt-1 select-none no-scrollbar ${
              isPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ scrollBehavior: isPanning ? "auto" : "smooth" }}
          >
            {columns.map((column, colIdx) => {
              const filteredLeads = column.leads.filter((lead) => {
                const matchSearch =
                  lead.title.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
                  lead.contactName.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
                  (lead.customer?.fullName || "").toLowerCase().includes(kanbanSearch.toLowerCase());
                const matchPriority = priorityFilter === "ALL" || lead.priority === priorityFilter;
                return matchSearch && matchPriority;
              });

              const colValue = filteredLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
              const isOver = dragOverColumnId === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`w-[310px] sm:w-[330px] shrink-0 rounded-3xl bg-[#F8F5F2] dark:bg-[#131418] border transition-all duration-200 flex flex-col max-h-[82vh] ${
                    isOver
                      ? "border-[#FF650F] ring-2 ring-[#FF650F]/20 bg-orange-500/[0.03]"
                      : "border-black/[0.06] dark:border-white/[0.06]"
                  }`}
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="p-4 pb-3 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: column.color || "#FF650F" }}
                      />
                      <h3 className="text-xs font-black text-zinc-900 dark:text-white truncate">
                        {column.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400">
                        {filteredLeads.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {colIdx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveColumn(colIdx, "left")}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                          title="Mover coluna para a esquerda"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {colIdx < columns.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveColumn(colIdx, "right")}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                          title="Mover coluna para a direita"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditColumn(column)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                        title="Editar coluna"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!column.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(column)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Excluir coluna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-barra de Valor Total da Coluna */}
                  <div className="px-4 py-2 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-black/[0.03] dark:border-white/[0.03] shrink-0">
                    <span>Subtotal da Fase</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(colValue)}
                    </span>
                  </div>

                  {/* Lista com scroll dos Cards da Coluna */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 no-scrollbar min-h-[150px]">
                    {filteredLeads.map((lead) => {
                      const isDragging = draggedLeadId === lead.id;
                      const hasAttachments = (lead.attachments?.length || 0) > 0;
                      const totalChecklistItems = lead.checklists?.flatMap((c) => c.items).length || 0;
                      const completedChecklistItems = lead.checklists?.flatMap((c) => c.items).filter((i) => i.isCompleted).length || 0;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setSelectedCardLeadId(lead.id);
                            setIsCardModalOpen(true);
                          }}
                          className={`p-3.5 rounded-2xl bg-white dark:bg-[#1C1D22] border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-[#FF650F]/40 group flex flex-col gap-2.5 ${
                            isDragging
                              ? "opacity-40 scale-95 border-dashed border-[#FF650F]"
                              : "border-black/[0.06] dark:border-white/[0.06]"
                          }`}
                        >
                          {/* Imagem de Capa do Card */}
                          {lead.coverImage && (
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 relative">
                              <img
                                src={lead.coverImage}
                                alt={lead.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}

                          {/* Tags / Etiquetas Coloridas */}
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {lead.tags.map((t) => (
                                <span
                                  key={t.tag.id}
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                                  style={{ backgroundColor: t.tag.color }}
                                >
                                  {t.tag.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Título e Prioridade */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#FF650F] transition-colors">
                              {lead.title}
                            </h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                priorityBadges[lead.priority]?.className || ""
                              }`}
                            >
                              {priorityBadges[lead.priority]?.label || lead.priority}
                            </span>
                          </div>

                          {/* Contato / Cliente */}
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate font-medium">
                              {lead.customer?.fullName || lead.customer?.tradeName || lead.contactName}
                            </span>
                          </div>

                          {/* Valor Estimado e Prazo */}
                          <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.05] text-[10px] font-mono">
                            <span className="font-extrabold text-[#FF650F]">
                              {formatCurrency(lead.estimatedValue || 0)}
                            </span>
                            {lead.dueDate && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                <Clock className="w-3 h-3" />
                                {formatDate(lead.dueDate)}
                              </span>
                            )}
                          </div>

                          {/* Indicadores de Checklist, Anexo e Comentários */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                            <div className="flex items-center gap-3">
                              {totalChecklistItems > 0 && (
                                <span
                                  className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                    completedChecklistItems === totalChecklistItems
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-black/[0.04] dark:bg-white/[0.05]"
                                  }`}
                                >
                                  <CheckSquare className="w-3 h-3" />
                                  {completedChecklistItems}/{totalChecklistItems}
                                </span>
                              )}
                              {hasAttachments && (
                                <span className="flex items-center gap-1 text-[9px]">
                                  <Paperclip className="w-3 h-3" />
                                  {lead.attachments?.length}
                                </span>
                              )}
                              {(lead._count?.comments || 0) > 0 && (
                                <span className="flex items-center gap-1 text-[9px]">
                                  <MessageSquare className="w-3 h-3" />
                                  {lead._count?.comments}
                                </span>
                              )}
                            </div>

                            {/* Botão de Excluir Rápido */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Deseja excluir a oportunidade "${lead.title}"?`)) {
                                  handleDeleteLeadQuick(lead.id);
                                }
                              }}
                              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                              title="Excluir card"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredLeads.length === 0 && (
                      <div className="py-8 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-1">
                        <Layers className="w-5 h-5 opacity-40" />
                        <span>Nenhum trabalho nesta fase</span>
                      </div>
                    )}
                  </div>

                  {/* Rodapé da Coluna com Botão de Adicionar Card Rápido */}
                  <div className="p-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setNewLeadForm((prev) => ({ ...prev, columnId: column.id }));
                        setIsNewLeadModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Trabalho</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Botão de Adicionar Coluna no Final do Quadro */}
            <div className="w-[280px] shrink-0">
              <button
                type="button"
                onClick={handleOpenAddColumn}
                className="w-full h-32 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#FF650F]/50 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-orange-500/[0.02] flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#FF650F] transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#FF650F]" />
                </div>
                <span className="text-xs font-bold tracking-tight">Adicionar Novo Campo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: NOVO TRABALHO DO KANBAN COM VÍNCULO AO CRM        */}
      {/* ======================================================== */}
      {isNewLeadModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-[#18191E] rounded-t-[32px] sm:rounded-3xl border-t sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col items-center pt-2 sm:hidden shrink-0">
              <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            <div className="p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    Novo Trabalho no Funil
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Cadastre uma nova oportunidade comercial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Título do Trabalho / Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  placeholder="Ex: Fachada ACM com Letra Caixa LED"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Seletor Inteligente de Cliente */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cliente Vinculado (CRM)
                </label>
                <ClientSearchAutocomplete
                  selectedClient={selectedClientForNewLead}
                  onSelectClient={(client) => {
                    setSelectedClientForNewLead(client);
                    if (client) {
                      setNewLeadForm((prev) => ({
                        ...prev,
                        customerId: client.id,
                        contactName: client.displayName,
                        contactPhone: client.whatsapp || client.phone || prev.contactPhone,
                        contactEmail: client.email || prev.contactEmail,
                      }));
                    } else {
                      setNewLeadForm((prev) => ({
                        ...prev,
                        customerId: "",
                      }));
                    }
                  }}
                  placeholder="Pesquisar cliente por nome, CNPJ, WhatsApp..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.contactName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
                    placeholder="Nome da pessoa de contato"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.contactPhone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPhone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Prazo de Entrega Estimado
                </label>
                <input
                  type="date"
                  value={newLeadForm.dueDate}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Observações / Escopo Técnico
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Detalhes sobre medidas, cores, iluminação..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-full px-5 text-xs font-bold"
                >
                  Criar Trabalho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GERENCIAR COLUNAS / FASES DO KANBAN               */}
      {/* ======================================================== */}
      {isColumnModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsColumnModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {editingColumn ? "Editar Coluna do Funil" : "Nova Coluna do Funil"}
              </h3>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome da Coluna *
                </label>
                <input
                  type="text"
                  required
                  value={columnForm.name}
                  onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
                  placeholder="Ex: Proposta Enviada"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cor da Tag
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={columnForm.color}
                    onChange={(e) => setColumnForm({ ...columnForm, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-zinc-500">{columnForm.color}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsColumnModalOpen(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingColumn}
                  className="rounded-full px-5 text-xs font-bold"
                >
                  {editingColumn ? "Atualizar Coluna" : "Criar Coluna"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: O VERSO DO CARTÃO ESTILO TRELLO (CENTRAL TAREFA)  */}
      {/* ======================================================== */}
      <LeadCardDrawerModal
        leadId={selectedCardLeadId}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCardLeadId(null);
        }}
        onLeadUpdated={fetchKanban}
        columns={columns.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
        onConvertToOS={handleConvertToOS}
        onOpenContactDetails={(contactId) => {
          setSelectedContactId(contactId);
          setIsContactDetailsOpen(true);
        }}
      />

      {/* MODAL: FICHA 360º DO CONTATO (CASO CLIQUE DENTRO DO CARD) */}
      <ContactDetailsSheet
        contactId={selectedContactId}
        isOpen={isContactDetailsOpen}
        onClose={() => {
          setIsContactDetailsOpen(false);
          setSelectedContactId(null);
        }}
        onEdit={() => {}}
        onContactDeleted={() => {
          fetchKanban();
        }}
      />

      {/* Botão Flutuante (FAB) de Adicionar Trabalho no Mobile */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsNewLeadModalOpen(true)}
          aria-label="Novo Trabalho"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
