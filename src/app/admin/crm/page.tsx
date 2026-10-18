"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedButton } from "@/components/ui/segmented-button";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Kanban,
  Users,
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
import { GoogleSearchBarWithChips, FilterChipType } from "@/components/admin/crm/GoogleSearchBarWithChips";
import { ContactsListGoogleStyle, ContactItem } from "@/components/admin/crm/ContactsListGoogleStyle";
import { ContactDetailsSheet } from "@/components/admin/crm/ContactDetailsSheet";
import { ContactFormModal } from "@/components/admin/crm/ContactFormModal";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { LeadCardDrawerModal } from "@/components/admin/crm/LeadCardDrawerModal";

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
  leads: Lead[];
}

export default function CrmPage() {
  const router = useRouter();

  // Modo de visualização: "CONTACTS" (Google Style CRM) ou "KANBAN" (Funil de Vendas)
  const [activeView, setActiveView] = useState<"CONTACTS" | "KANBAN">("CONTACTS");

  // ==========================================
  // ESTADOS DO CRM DE CONTATOS (GOOGLE STYLE)
  // ==========================================
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const [contactSortBy, setContactSortBy] = useState<string>("default");
  const [activeChipFilter, setActiveChipFilter] = useState<FilterChipType>("ALL");
  const [contactKpis, setContactKpis] = useState({
    total: 0,
    customers: 0,
    suppliers: 0,
    serviceProviders: 0,
    active: 0,
  });

  // Modais do CRM de Contatos
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContactData, setEditingContactData] = useState<any | null>(null);

  // ==========================================
  // ESTADOS DO FUNIL KANBAN
  // ==========================================
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
  const kanbanViewportRef = React.useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartXRef = React.useRef(0);
  const panScrollLeftRef = React.useRef(0);
  const isDraggingLeadsRef = React.useRef(false);

  // Estados do Verso do Cartão (Estilo Trello)
  const [selectedCardLeadId, setSelectedCardLeadId] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

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
  });

  // Clientes disponíveis para vincular no Kanban
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Carrega lista de contatos do CRM com ordenação
  const fetchContacts = useCallback(async () => {
    setIsContactsLoading(true);
    try {
      let typeParam = "ALL";
      let personTypeParam = "ALL";

      if (activeChipFilter === "CUSTOMER" || activeChipFilter === "SUPPLIER" || activeChipFilter === "SERVICE_PROVIDER") {
        typeParam = activeChipFilter;
      } else if (activeChipFilter === "PJ" || activeChipFilter === "PF") {
        personTypeParam = activeChipFilter;
      }

      const params = new URLSearchParams({
        search: contactSearch,
        type: typeParam,
        personType: personTypeParam,
        sortBy: contactSortBy,
        limit: "100",
      });

      const res = await fetch(`/api/v1/crm/contacts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        if (data.kpis) {
          setContactKpis(data.kpis);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar contatos do CRM:", err);
    } finally {
      setIsContactsLoading(false);
    }
  }, [contactSearch, activeChipFilter, contactSortBy]);

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
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (activeView === "KANBAN") {
      fetchKanban();
      fetchAvailableClients();
    }
  }, [activeView, fetchKanban]);

  // Handlers de Contatos
  const handleOpenContactDetails = (contact: ContactItem) => {
    setSelectedContactId(contact.id);
    setIsDetailsOpen(true);
  };

  const handleOpenNewContact = () => {
    setEditingContactData(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditContact = (contact: any) => {
    setIsDetailsOpen(false);
    setEditingContactData(contact);
    setIsFormModalOpen(true);
  };

  // Exclusão de contato a partir da lista
  const handleDeleteContactFromList = async (contactId: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato? Esta ação removerá ou inativará os dados associados na Icthus.")) return;
    try {
      const res = await fetch(`/api/v1/crm/contacts/${contactId}?force=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
      } else {
        alert("Erro ao excluir contato: " + (data.error || "Falha na exclusão."));
      }
    } catch {
      alert("Falha de comunicação com o servidor ao excluir contato.");
    }
  };

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
    // Não ativa panning se o clique for em card de lead, botão, input ou seletor
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
    const walk = (x - panStartXRef.current) * 1.5; // Velocidade fluida
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
        fetchContacts();
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
      {/* Top Header Card com Alternador M3 Expressive */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Ecossistema Comercial & Operacional
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {activeView === "CONTACTS" ? (
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            ) : (
              <Kanban className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            )}
            {activeView === "CONTACTS" ? "CRM & Base de Contatos" : "Funil Comercial & Kanban"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {activeView === "CONTACTS"
              ? "Gerencie clientes, fornecedores de insumos e prestadores de serviços de forma 360º."
              : "Acompanhe oportunidades, arraste cards e converta negociações em Ordens de Serviço."}
          </p>
        </div>

        {/* Alternador de Abas Principais no Topo (Segmented Button M3) */}
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedButton<"CONTACTS" | "KANBAN">
            options={[
              {
                value: "CONTACTS",
                label: "Contatos & CRM",
                icon: <Users className="w-4 h-4" />,
                count: contactKpis.total,
              },
              {
                value: "KANBAN",
                label: "Funil Kanban",
                icon: <Kanban className="w-4 h-4" />,
                count: allLeads.length,
              },
            ]}
            value={activeView}
            onChange={(val) => setActiveView(val)}
            size="md"
            layoutId="crm-top-mode-selector"
          />

          <Button
            variant="primary"
            size="md"
            onClick={activeView === "CONTACTS" ? handleOpenNewContact : () => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{activeView === "CONTACTS" ? "Novo Contato" : "Nova Oportunidade"}</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: BASE DE CONTATOS & CRM NO FORMATO APP DO GOOGLE */}
      {/* ======================================================== */}
      {activeView === "CONTACTS" && (
        <div className="space-y-4">
          {/* Métricas e KPIs em Cards Tonais Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 block truncate">
                  Clientes
                </span>
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {contactKpis.customers}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 block truncate">
                  Fornecedores
                </span>
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {contactKpis.suppliers}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 block truncate">
                  Prestadores
                </span>
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {contactKpis.serviceProviders}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 block truncate">
                  Cadastros Ativos
                </span>
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {contactKpis.active}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa e Chips estilo Google Contacts */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1">
            <GoogleSearchBarWithChips
              searchQuery={contactSearch}
              onSearchChange={setContactSearch}
              activeFilter={activeChipFilter}
              onFilterChange={setActiveChipFilter}
              counts={contactKpis}
              sortBy={contactSortBy}
              onSortChange={setContactSortBy}
            />

            {/* Lista de Contatos em Formato Google App */}
            <div className="mt-4 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
              <ContactsListGoogleStyle
                contacts={contacts}
                isLoading={isContactsLoading}
                onSelectContact={handleOpenContactDetails}
                onEditContact={handleOpenEditContact}
                onDeleteContact={(c) => handleDeleteContactFromList(c.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: FUNIL COMERCIAL & KANBAN DE VENDAS             */}
      {/* ======================================================== */}
      {activeView === "KANBAN" && (
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
                  placeholder="Buscar oportunidade, projeto..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-50 dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-[#FF650F]" />
                  Prioridade:
                </span>
                {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      priorityFilter === p
                        ? "bg-[#FF650F] text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-[#141519] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.05] dark:border-white/[0.06]"
                    }`}
                  >
                    {p === "ALL" ? "Todas" : priorityBadges[p as keyof typeof priorityBadges]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações Rápidas: + Nova Coluna / Campo e Navegação Lateral */}
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-[#121316] px-2.5 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] text-[11px] text-zinc-500 font-medium">
                <Hand className="w-3.5 h-3.5 text-[#FF650F]" />
                <span>Arraste para rolar</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  title="Rolar para esquerda"
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202128] dark:hover:bg-[#282932] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  title="Rolar para direita"
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202128] dark:hover:bg-[#282932] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddColumn}
                className="rounded-full text-xs font-bold gap-1.5 border-dashed border-[#FF650F]/50 text-[#FF650F] hover:bg-orange-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Campo</span>
              </Button>
            </div>
          </div>

          {/* CONTÊINER TIPO CARD COM MOUSE DRAG-TO-SCROLL (MÃOZINHA DO MOUSE) */}
          <div className="rounded-3xl bg-zinc-100/80 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.08] p-4 relative shadow-m3-1 overflow-hidden">
            {isKanbanLoading ? (
              <div className="flex items-center justify-center py-28 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="w-5 h-5 border-2 border-[#FF650F] border-t-transparent rounded-full animate-spin mr-3" />
                Carregando campos do funil comercial...
              </div>
            ) : (
              <div
                ref={kanbanViewportRef}
                onMouseDown={handleViewportMouseDown}
                onMouseMove={handleViewportMouseMove}
                onMouseUp={handleViewportMouseUp}
                onMouseLeave={handleViewportMouseLeave}
                className={`flex gap-4 overflow-x-auto pb-4 pt-1 items-start no-scrollbar select-none ${
                  isPanning ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {columns.map((col, index) => {
                  const filteredLeads = col.leads.filter((lead) => {
                    const matchSearch =
                      lead.contactName.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
                      lead.title.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
                      lead.contactPhone.includes(kanbanSearch) ||
                      (lead.customer?.tradeName || "").toLowerCase().includes(kanbanSearch.toLowerCase());
                    const matchPriority = priorityFilter === "ALL" || lead.priority === priorityFilter;
                    return matchSearch && matchPriority;
                  });

                  const colValue = filteredLeads.reduce(
                    (sum, l) => sum + (Number(l.estimatedValue) || 0),
                    0
                  );

                  const isDropActive = dragOverColumnId === col.id;

                  return (
                    <div
                      key={col.id}
                      className="shrink-0"
                    >
                      <div
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className={`w-80 rounded-3xl bg-white dark:bg-[#17181F] border flex flex-col h-fit self-start shadow-m3-1 transition-all duration-200 ${
                          isDropActive
                            ? "border-[#FF650F] ring-2 ring-[#FF650F] ring-offset-2 dark:ring-offset-[#121316] scale-[1.01] bg-orange-500/[0.03]"
                            : "border-black/[0.06] dark:border-white/[0.08]"
                        }`}
                      >
                        {/* Cabeçalho da Coluna com Controles de CRUD */}
                        <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: col.color || "#FF650F" }}
                            />
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate" title={col.name}>
                              {col.name}
                            </h3>
                            <span className="text-[10px] bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono font-semibold shrink-0">
                              {filteredLeads.length}
                            </span>
                          </div>

                          {/* Ações de Reordenação e Edição da Coluna */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(index, "left")}
                              disabled={index === 0}
                              title="Mover coluna para a esquerda"
                              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(index, "right")}
                              disabled={index === columns.length - 1}
                              title="Mover coluna para a direita"
                              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditColumn(col)}
                              title="Editar campo"
                              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col)}
                              title="Excluir campo"
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Sub-barra de Total Financeiro */}
                        <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#14151B] border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-medium">Volume Estimado:</span>
                          <span className="font-mono font-bold text-[#FF650F]">
                            {formatCurrency(colValue)}
                          </span>
                        </div>

                        {/* Cards da Coluna com Expansão Natural (Sem scroll interno) */}
                        <div className="p-3 space-y-3 flex-grow min-h-[180px]">
                          {/* Placeholder animado de drop quando arrastando oportunidade */}
                          {isDropActive && draggedLeadId && (
                            <div className="p-3 rounded-2xl border-2 border-dashed border-[#FF650F] bg-orange-500/10 text-center animate-pulse flex items-center justify-center gap-2 text-xs font-bold text-[#FF650F]">
                              <Layers className="w-4 h-4 animate-bounce" />
                              <span>Solte para fixar oportunidade aqui</span>
                            </div>
                          )}

                          {filteredLeads.map((lead) => {
                            const pBadge = priorityBadges[lead.priority] || priorityBadges.MEDIUM;
                            const isApprovedStage = col.name.includes("Aprovado") || col.name.includes("Produção");
                            const isBeingDragged = draggedLeadId === lead.id;

                            // Totalizadores de checklist
                            const allChecklistItems = lead.checklists?.flatMap((c) => c.items || []) || [];
                            const completedChecklistItems = allChecklistItems.filter((i) => i.isCompleted).length;
                            const isChecklistComplete =
                              allChecklistItems.length > 0 &&
                              completedChecklistItems === allChecklistItems.length;

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
                                className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-3 overflow-hidden ${
                                  isBeingDragged
                                    ? "opacity-40 scale-[0.98] rotate-[-1deg] border-dashed border-2 border-[#FF650F] shadow-2xl bg-orange-500/5 cursor-grabbing"
                                    : "bg-white dark:bg-[#1F2028] border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 hover:-translate-y-0.5 hover:border-orange-500/40"
                                }`}
                              >
                                {/* Imagem de Capa do Cartão Estilo Trello */}
                                {lead.coverImage && (
                                  <div className="w-full h-28 -mt-4 -mx-4 mb-3 overflow-hidden bg-zinc-900 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={lead.coverImage}
                                      alt={lead.title}
                                      className="w-full h-full object-cover object-center"
                                    />
                                  </div>
                                )}

                                {/* Etiquetas Coloridas Estilo Trello */}
                                {lead.tags && lead.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {lead.tags.map(({ tag }) => (
                                      <span
                                        key={tag.id}
                                        className="h-1.5 px-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: tag.color }}
                                        title={tag.name}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${pBadge.className}`}
                                  >
                                    {pBadge.label}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-white">
                                      {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
                                    </span>
                                    <button
                                      type="button"
                                      title="Excluir Oportunidade"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Deseja excluir a oportunidade "${lead.title}"?`)) {
                                          handleDeleteLeadQuick(lead.id);
                                        }
                                      }}
                                      className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                                    {lead.title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                                    <span className="text-zinc-500 font-medium">{lead.contactName}</span>
                                    {lead.customer && (
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (lead.customer?.id) {
                                            setSelectedContactId(lead.customer.id);
                                            setIsDetailsOpen(true);
                                          }
                                        }}
                                        className="text-[10px] bg-orange-500/10 text-[#FF650F] px-2 py-0.5 rounded-full font-bold hover:underline cursor-pointer"
                                      >
                                        CRM 360º
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Micro-indicadores estilo Trello (Checklists, Anexos, Comentários, Prazos) */}
                                {(allChecklistItems.length > 0 ||
                                  (lead.attachments && lead.attachments.length > 0) ||
                                  (lead._count && lead._count.comments > 0) ||
                                  lead.dueDate) && (
                                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-500 font-medium">
                                    {/* Checklist */}
                                    {allChecklistItems.length > 0 && (
                                      <span
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                                          isChecklistComplete
                                            ? "bg-emerald-500/10 text-emerald-600 font-bold"
                                            : "text-zinc-500"
                                        }`}
                                      >
                                        <CheckSquare className="w-3 h-3" />
                                        <span className="font-mono">
                                          {completedChecklistItems}/{allChecklistItems.length}
                                        </span>
                                      </span>
                                    )}

                                    {/* Anexos */}
                                    {lead.attachments && lead.attachments.length > 0 && (
                                      <span className="flex items-center gap-0.5 text-zinc-500">
                                        <Paperclip className="w-3 h-3" />
                                        <span className="font-mono">{lead.attachments.length}</span>
                                      </span>
                                    )}

                                    {/* Comentários */}
                                    {lead._count && lead._count.comments > 0 && (
                                      <span className="flex items-center gap-0.5 text-zinc-500">
                                        <MessageSquare className="w-3 h-3" />
                                        <span className="font-mono">{lead._count.comments}</span>
                                      </span>
                                    )}

                                    {/* Prazo de Entrega */}
                                    {lead.dueDate && (
                                      <span
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                          new Date(lead.dueDate).getTime() < Date.now()
                                            ? "bg-red-500/10 text-red-600"
                                            : "bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                                        }`}
                                      >
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(lead.dueDate)}</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                                  <a
                                    href={`https://wa.me/${lead.contactPhone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    {lead.contactPhone}
                                  </a>

                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    {formatDate(lead.createdAt)}
                                  </span>
                                </div>

                                {isApprovedStage && (
                                  <div className="pt-1">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      isLoading={convertingLeadId === lead.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConvertToOS(lead.id);
                                      }}
                                      className="w-full text-xs font-bold rounded-xl gap-1.5 py-1.5"
                                    >
                                      <Layers className="w-3.5 h-3.5" />
                                      Converter em Ordem de Serviço
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Botão de Adicionar Nova Coluna no Final do Kanban */}
                <div className="shrink-0 w-72 flex flex-col">
                  <button
                    type="button"
                    onClick={handleOpenAddColumn}
                    className="w-full py-16 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#FF650F] bg-white/40 dark:bg-[#17181F]/40 hover:bg-orange-500/5 text-zinc-500 hover:text-[#FF650F] transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-[#FF650F] group-hover:text-white flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">Adicionar Novo Campo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: FORMULÁRIO COMPLETO DE CONTATO (GOOGLE STYLE)   */}
      {/* ======================================================== */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
          if (activeView === "KANBAN") fetchAvailableClients();
        }}
        initialData={editingContactData}
      />

      {/* ======================================================== */}
      {/* MODAL 2: FICHA 360º DO CONTATO (GOOGLE BOTTOM SHEET)     */}
      {/* ======================================================== */}
      <ContactDetailsSheet
        contactId={selectedContactId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedContactId(null);
        }}
        onEdit={handleOpenEditContact}
        onContactDeleted={fetchContacts}
      />

      {/* ======================================================== */}
      {/* MODAL 3: NOVO LEAD DO KANBAN COM VÍNCULO AO CRM          */}
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

            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Funil de Vendas
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Nova Oportunidade
                </h3>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
              {/* Seleção Inteligente de Cliente (com busca preditiva ou Lead Avulso) */}
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
                onOpenNewContactModal={() => {
                  setIsNewLeadModalOpen(false);
                  handleOpenNewContact();
                }}
              />

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fachada Comercial ACM 3mm"
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={newLeadForm.contactName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="5541999999999"
                    value={newLeadForm.contactPhone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4500.00"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Data de Entrega (Prazo)
                  </label>
                  <input
                    type="date"
                    value={newLeadForm.dueDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações & Briefing
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre medidas, cores e prazos..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
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
                  Adicionar ao Funil
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CRIAÇÃO / EDIÇÃO DE CAMPO / COLUNA DO FUNIL     */}
      {/* ======================================================== */}
      {isColumnModalOpen && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsColumnModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Personalização do Funil
                </span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
                  {editingColumn ? "Editar Campo do Funil" : "Novo Campo no Funil"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nome do Campo / Coluna *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Em Negociação, Em Produção..."
                  value={columnForm.name}
                  onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Cor de Identificação
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {[
                    "#FF650F", // Laranja Icthus
                    "#2563EB", // Azul
                    "#16A34A", // Verde
                    "#9333EA", // Roxo
                    "#D97706", // Âmbar
                    "#DC2626", // Vermelho
                    "#DB2777", // Rosa
                    "#0891B2", // Ciano
                    "#4B5563", // Grafite
                  ].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColumnForm({ ...columnForm, color: hex })}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        columnForm.color === hex
                          ? "scale-110 ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-[#18191E]"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {columnForm.color === hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={columnForm.color}
                    onChange={(e) => setColumnForm({ ...columnForm, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono text-zinc-500 uppercase">{columnForm.color}</span>
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
                  {editingColumn ? "Atualizar Campo" : "Criar Campo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: O VERSO DO CARTÃO ESTILO TRELLO (CENTRAL TAREFA) */}
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
          setIsDetailsOpen(true);
        }}
      />

      {/* Botão Flutuante (FAB) de Adicionar no Mobile — Alinhado perfeitamente com o Menu Hamburger */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={activeView === "CONTACTS" ? handleOpenNewContact : () => setIsNewLeadModalOpen(true)}
          aria-label={activeView === "CONTACTS" ? "Novo Contato" : "Nova Oportunidade"}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
