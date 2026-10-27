"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  Eye,
  Download,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Palette,
  GripVertical,
SlidersHorizontal,
  AlertCircle,
  Loader2,
  RotateCw,
  CheckCheck,
  MoreVertical,
  Check,
  CheckSquare,
  Paperclip,
  Clock,
  MessageSquare,
} from "lucide-react";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { LeadCardDrawerModal } from "@/components/admin/crm/LeadCardDrawerModal";
import { LeadCreateCardModal } from "@/components/admin/crm/LeadCreateCardModal";
import { ServiceCategoriesModal } from "@/components/admin/crm/ServiceCategoriesModal";
import { getDueDateStatus } from "@/lib/due-date-status";
import { ContactDetailsSheet } from "@/components/admin/crm/ContactDetailsSheet";

interface Lead {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  customerId: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string | null } | null;
  subcategoryId?: string | null;
  subcategory?: { id: string; name: string } | null;
  customer?: {
    id: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    type: string;
    whatsapp: string | null;
    phone?: string | null;
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
  budgetSentViaWhatsApp?: boolean;
  budgetSentAt?: string | null;
  budgetCode?: string | null;
  helperId?: string | null;
  voltage?: string | null;
  tools?: string[];
  paintDetails?: string | null;
  freightDetails?: string | null;
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
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [sendWhatsAppViaModal, setSendWhatsAppViaModal] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [sendingBudgetId, setSendingBudgetId] = useState<string | null>(null);
  const { toast } = useToast();

  // Disparo / Reenvio de Orçamento via WhatsApp direto do Card
  const handleToggleSendBudget = async (lead: Lead, isResend = false) => {
    if (sendingBudgetId) return;
    setSendingBudgetId(lead.id);

    try {
      const res = await fetch(`/api/v1/crm/leads/${lead.id}/dispatch-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "budget" }),
      });

      const data = await res.json();

      if (data.success && data.wacliSuccess) {
        setColumns((prevCols) =>
          prevCols.map((col) => ({
            ...col,
            leads: col.leads.map((l) =>
              l.id === lead.id
                ? {
                    ...l,
                    budgetSentViaWhatsApp: true,
                    budgetSentAt: new Date().toISOString(),
                  }
                : l
            ),
          }))
        );

        const recipient = data.recipientPhone ? `+${data.recipientPhone}` : (lead.contactPhone || "cliente");
        const clientName = data.clientName || lead.customer?.tradeName || lead.customer?.fullName || lead.contactName || "o cliente";
        toast.success(
          isResend
            ? `Orçamento em PDF reenviado diretamente para ${clientName} (${recipient}) via WhatsApp!`
            : `Orçamento em PDF enviado diretamente para ${clientName} (${recipient}) via WhatsApp!`,
          "WhatsApp Enviado"
        );
        if (data.isSelf) {
          toast.info(
            "Atenção: O telefone informado é idêntico ao número pareado no robô WhatsApp.",
            "Número do Aparelho Conectado",
            6000
          );
        }
      } else {
        const errorMsg =
          data.error ||
          data.wacliError ||
          "O robô WACLI não conseguiu entregar o documento. Verifique se o WhatsApp está conectado em Configurações.";
        toast.error(errorMsg, "Falha no Envio Automático");
      }
    } catch (err) {
      console.error("Erro ao disparar orçamento via WhatsApp:", err);
      toast.error("Erro de comunicação com o servidor.", "Falha de Conexão");
    } finally {
      setSendingBudgetId(null);
    }
  };

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

  // Detalhes do contato (caso aberto via card)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Cliente selecionado no Seletor Inteligente para nova oportunidade
  const [selectedClientForNewLead, setSelectedClientForNewLead] = useState<SearchedClient | null>(null);

  // Estados de Edição do Serviço (CRUD do Card)
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [selectedClientForEditLead, setSelectedClientForEditLead] = useState<SearchedClient | null>(null);
  const [isSavingEditLead, setIsSavingEditLead] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState({
    title: "",
    columnId: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    customerId: "",
    estimatedValue: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
    notes: "",
    budgetCode: "",
    helperId: "",
    voltage: "110V",
    tools: [] as string[],
    paintDetails: "",
    freightDetails: "",
  });

  // Estados de Exclusão do Serviço (CRUD do Card)
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; title: string } | null>(null);
    const [isDeletingLeadDirect, setIsDeletingLeadDirect] = useState(false);

  // Visualizador de PDF de Orçamento
  const [previewBudgetDoc, setPreviewBudgetDoc] = useState<{
    title: string;
    fileUrl: string;
    code?: string | null;
  } | null>(null);
  const [isLoadingBudgetDoc, setIsLoadingBudgetDoc] = useState(false);

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

  const handleViewLeadBudgetDocument = async (leadId: string | null, fallbackBudgetCode?: string | null) => {
    if (!leadId) return;
    setIsLoadingBudgetDoc(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/budget-document`);
      const data = await res.json();
      if (data.success && data.document) {
        setPreviewBudgetDoc({
          title: data.document.title,
          fileUrl: data.document.fileUrl,
          code: data.document.code,
        });
      } else {
        alert(data.error || "Não foi possível carregar o documento de orçamento.");
      }
    } catch {
      alert("Falha na comunicação ao tentar carregar o documento.");
    } finally {
      setIsLoadingBudgetDoc(false);
    }
  };

  const handleOpenEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    const rawDueDate = lead.dueDate ? new Date(lead.dueDate) : null;
    const safeDueDate = rawDueDate && !isNaN(rawDueDate.getTime()) ? rawDueDate.toISOString().split("T")[0] : "";

    setEditLeadForm({
      title: lead.title || "",
      columnId: lead.columnId || (columns[0]?.id || ""),
      contactName: lead.contactName || "",
      contactPhone: lead.contactPhone || "",
      contactEmail: lead.contactEmail || "",
      customerId: lead.customerId || "",
      estimatedValue: lead.estimatedValue != null ? String(lead.estimatedValue) : "",
      priority: lead.priority || "MEDIUM",
      dueDate: safeDueDate,
      notes: lead.notes || "",
      budgetCode: lead.budgetCode || "",
      helperId: lead.helperId || "",
      voltage: lead.voltage || "110V",
      tools: Array.isArray(lead.tools) ? lead.tools : [],
      paintDetails: lead.paintDetails || "",
      freightDetails: lead.freightDetails || "",
    });

    if (lead.customer) {
      setSelectedClientForEditLead({
        id: lead.customer.id,
        displayName:
          lead.customer.tradeName ||
          lead.customer.fullName ||
          lead.customer.companyName ||
          lead.contactName,
        tradeName: lead.customer.tradeName,
        companyName: lead.customer.companyName,
        fullName: lead.customer.fullName,
        type: lead.customer.type || "CLIENT",
        personType: "LEGAL",
        documentNumber: null,
        phone: lead.customer.phone || null,
        whatsapp: lead.customer.whatsapp || null,
        email: lead.customer.email || null,
        city: lead.customer.city || null,
        state: null,
        status: "ACTIVE",
      });
    } else {
      setSelectedClientForEditLead(null);
    }

    setIsEditLeadModalOpen(true);
  };

  const handleOpenEditLeadById = (leadId: string) => {
    for (const col of columns) {
      const found = col.leads.find((l) => l.id === leadId);
      if (found) {
        handleOpenEditLead(found);
        return;
      }
    }
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeadId) return;
    setIsSavingEditLead(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${editingLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editLeadForm,
          estimatedValue: editLeadForm.estimatedValue ? parseFloat(editLeadForm.estimatedValue) : null,
          dueDate: editLeadForm.dueDate || null,
          customerId: editLeadForm.customerId || null,
          helperId: editLeadForm.helperId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditLeadModalOpen(false);
        setEditingLeadId(null);
        fetchKanban();
      } else {
        alert("Erro ao salvar serviço: " + (data.error || "Tente novamente"));
      }
    } catch {
      alert("Falha de rede ao tentar atualizar o serviço.");
    } finally {
      setIsSavingEditLead(false);
    }
  };

  const handleConfirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeletingLeadDirect(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setLeadToDelete(null);
        fetchKanban();
      } else {
        alert("Erro ao excluir serviço: " + (data.error || ""));
      }
    } catch {
      alert("Falha ao comunicar com o servidor para exclusão.");
    } finally {
      setIsDeletingLeadDirect(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLeadForm, sendWhatsApp: sendWhatsAppViaModal }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewLeadModalOpen(false);
        setSelectedClientForNewLead(null);
        setSendWhatsAppViaModal(false);
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
      {/* Top Header Card com Identidade Exata do Print (Sem o SegmentedButton) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Ecossistema Comercial & Operacional
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            Funil Comercial & Kanban
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Acompanhe oportunidades, arraste cards e converta negociações em Ordens de Serviço.
          </p>
        </div>

        {/* Botão de Ação Primária idêntico ao do print */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full cursor-pointer hover:bg-orange-500/10 hover:text-[#FF650F] hover:border-orange-500/30 transition-all"
          >
            <Layers className="w-4 h-4 text-[#FF650F]" />
            <span>Categorias</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Serviço</span>
          </Button>
        </div>
      </div>

      {/* ÁREA DO FUNIL COMERCIAL & KANBAN (100% IDÊNTICA AO PRINT) */}
      <div className="space-y-4">
        {/* Barra de Ferramentas Superior do Funil (Linha Única) */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Lado Esquerdo: Busca + Filtro de Prioridade alinhados em linha única */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
            {/* Campo de Busca */}
            <div className="relative w-48 sm:w-56 md:w-64 lg:w-72 shrink-0">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                placeholder="Buscar oportunidade, projeto..."
                className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 rounded-full bg-zinc-50 dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm transition-all"
              />
            </div>

            {/* Separador Vertical */}
            <div className="h-5 w-px bg-black/[0.06] dark:bg-white/[0.08] hidden sm:block shrink-0" />

            {/* Filtros de Prioridade */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#FF650F]" />
                Prioridade:
              </span>
              {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <button
                  key={p}
                  type="button"
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

          {/* Lado Direito: Ações Rápidas (Navegação Lateral e + Novo Campo) */}
          <div className="flex items-center gap-2 shrink-0">
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
              className="rounded-full text-xs font-bold gap-1.5 border-dashed border-[#FF650F]/50 text-[#FF650F] hover:bg-orange-500/10 shrink-0"
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
                  <div key={col.id} className="shrink-0">
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
                          {!(col.name.trim().toLowerCase().includes("produção") || col.name.trim().toLowerCase().includes("producao")) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col)}
                              title="Excluir campo"
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-barra de Total Financeiro */}
                      <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#14151B] border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-medium">Volume Estimado:</span>
                        <span className="font-mono font-bold text-[#FF650F]">
                          {formatCurrency(colValue)}
                        </span>
                      </div>

                      {/* Cards da Coluna com Expansão Natural */}
                      <div className="p-3 space-y-3 flex-grow min-h-[180px]">
                        {isDropActive && draggedLeadId && (
                          <div className="p-3 rounded-2xl border-2 border-dashed border-[#FF650F] bg-orange-500/10 text-center animate-pulse flex items-center justify-center gap-2 text-xs font-bold text-[#FF650F]">
                            Solte o trabalho aqui
                          </div>
                        )}

                        {filteredLeads.map((lead) => {
                          const priorityInfo = priorityBadges[lead.priority] || priorityBadges.MEDIUM;
                          const isApprovedStage = col.name.toLowerCase().includes("aprovad") || col.name.toLowerCase().includes("fechad");

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
                              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.05] dark:border-white/[0.06] hover:border-[#FF650F]/50 dark:hover:border-[#FF650F]/50 cursor-pointer transition-all duration-200 group hover:shadow-md space-y-2.5 relative overflow-hidden"
                            >
                              {/* Faixa Horizontal de Capa no Topo do Card (Exibida dinamicamente quando houver coverImage) */}
                              {lead.coverImage && (
                                <div className="-mx-3.5 -mt-3.5 mb-2.5 h-24 sm:h-28 overflow-hidden rounded-t-2xl relative border-b border-black/[0.05] dark:border-white/[0.08] bg-zinc-100 dark:bg-black/40">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={lead.coverImage}
                                    alt={lead.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </div>
                              )}
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#FF650F] transition-colors">
                                    {lead.title}
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 truncate">
                                    {lead.customer?.tradeName || lead.customer?.companyName || lead.customer?.fullName || lead.contactName}
                                  </p>
                                  {(lead.category || lead.subcategory) && (
                                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                      {lead.category && (
                                        <span
                                          className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-2xs"
                                          style={{ backgroundColor: lead.category.color || "#FF650F" }}
                                        >
                                          {lead.category.name}
                                        </span>
                                      )}
                                      {lead.subcategory && (
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                                          {lead.subcategory.name}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${priorityInfo.className}`}>
                                    {priorityInfo.label}
                                  </span>
                                  {/* Botoes de Acao Rapida do Card */}
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      title="Visualizar Orçamento em PDF"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewLeadBudgetDocument(lead.id, lead.budgetCode);
                                      }}
                                      className="w-6 h-6 rounded-lg bg-zinc-200/70 hover:bg-[#FF650F] hover:text-white text-zinc-600 dark:bg-white/10 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Editar Serviço (Estilo Trello)"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCardLeadId(lead.id);
                                        setIsCardModalOpen(true);
                                      }}
                                      className="w-6 h-6 rounded-lg bg-zinc-200/70 hover:bg-[#FF650F] hover:text-white text-zinc-600 dark:bg-white/10 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Excluir Serviço"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLeadToDelete({ id: lead.id, title: lead.title });
                                      }}
                                      className="w-6 h-6 rounded-lg bg-zinc-200/70 hover:bg-red-600 hover:text-white text-zinc-600 dark:bg-white/10 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {lead.source}
                                </span>
                                <span className="font-mono font-black text-sm text-[#FF650F]">
                                  {formatCurrency(Number(lead.estimatedValue) || 0)}
                                </span>
                              </div>

                              {lead.dueDate && (() => {
                                const dueStatus = getDueDateStatus(lead.dueDate);
                                return (
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <span
                                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] ${
                                        dueStatus?.badgeClass ||
                                        "bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                                      }`}
                                    >
                                      <Clock className="w-3 h-3 shrink-0" />
                                      <span>{formatDate(lead.dueDate)}</span>
                                      {dueStatus && (
                                        <>
                                          <span className="opacity-50">•</span>
                                          <span className="font-black">{dueStatus.label}</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                );
                              })()}

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

                              {/* Mini Dashboard do Card: Switch de Envio de Orçamento WhatsApp & Botão de Reenvio */}
                              {(() => {
                                const targetPhone = lead.customer?.whatsapp || lead.customer?.phone || lead.contactPhone;
                                const targetName = lead.customer?.tradeName || lead.customer?.fullName || lead.contactName || "o cliente";
                                return (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={Boolean(lead.budgetSentViaWhatsApp)}
                                        disabled={sendingBudgetId === lead.id}
                                        onClick={() => handleToggleSendBudget(lead, false)}
                                        title={
                                          lead.budgetSentViaWhatsApp
                                            ? `Orçamento já enviado via WhatsApp para ${targetName} (${targetPhone || "sem telefone"})`
                                            : `Enviar orçamento via WhatsApp para ${targetName} (${targetPhone || "sem telefone"})`
                                        }
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF650F] focus:ring-offset-1 disabled:opacity-50 ${
                                          lead.budgetSentViaWhatsApp
                                            ? "bg-emerald-500 dark:bg-emerald-500"
                                            : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                                        }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            lead.budgetSentViaWhatsApp ? "translate-x-4" : "translate-x-0"
                                          }`}
                                        />
                                      </button>

                                      <div className="flex items-center gap-1 min-w-0 text-[11px]">
                                        {lead.budgetSentViaWhatsApp ? (
                                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                                            <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">Orçamento Enviado</span>
                                          </span>
                                        ) : (
                                          <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            Enviar Orçamento
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {lead.budgetSentViaWhatsApp && (
                                      <button
                                        type="button"
                                        disabled={sendingBudgetId === lead.id}
                                        onClick={() => handleToggleSendBudget(lead, true)}
                                        title={`Reenviar orçamento via WhatsApp para ${targetName} (${targetPhone || "sem telefone"})`}
                                        className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center shadow-2xs"
                                      >
                                        {sendingBudgetId === lead.id ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <RotateCw className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}

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

      {/* ======================================================== */}
      {/* MODAL: NOVO SERVIÇO ESTILO TRELLO COM VÍNCULO AO CRM    */}
      {/* ======================================================== */}
      <LeadCreateCardModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSuccess={() => {
          setIsNewLeadModalOpen(false);
          fetchKanban();
        }}
        columns={columns.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
        serviceProviders={serviceProviders}
      />

      {/* ======================================================== */}
      {/* MODAL: NOVO / EDITAR CAMPO DO FUNIL                      */}
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
      {/* MODAL: EDITAR SERVIÇO (CRUD DO CARD NO KANBAN)          */}
      {/* ======================================================== */}
      {isEditLeadModalOpen && (
        <div
          className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsEditLeadModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-[#18191E] rounded-t-[32px] sm:rounded-3xl border-t sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col items-center pt-2 sm:hidden shrink-0">
              <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Edição de Serviço
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#FF650F]" />
                  <span>Editar Informações do Serviço</span>
                </h3>
                {editLeadForm.budgetCode && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      ID Orçamento: [{editLeadForm.budgetCode}]
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewLeadBudgetDocument(editingLeadId, editLeadForm.budgetCode)}
                      title="Visualizar documento de orçamento gerado (PDF)"
                      className="p-1 rounded-md bg-orange-500/10 hover:bg-[#FF650F] text-[#FF650F] hover:text-white transition-all border border-orange-500/20 cursor-pointer flex items-center justify-center"
                    >
                      {isLoadingBudgetDoc ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditLeadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="p-6 space-y-4 overflow-y-auto max-h-[72vh] no-scrollbar">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Serviço / Oportunidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fachada ACM Loja Conceito"
                  value={editLeadForm.title}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Seletor de Coluna do Funil */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Etapa no Funil Kanban
                </label>
                <select
                  value={editLeadForm.columnId}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, columnId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seletor Inteligente de Cliente */}
              <div>
                <ClientSearchAutocomplete
                  selectedClient={selectedClientForEditLead}
                  onSelectClient={(client) => {
                    setSelectedClientForEditLead(client);
                    if (client) {
                      setEditLeadForm((prev) => ({
                        ...prev,
                        customerId: client.id,
                        contactName: client.displayName,
                        contactPhone: client.whatsapp || client.phone || prev.contactPhone,
                        contactEmail: client.email || prev.contactEmail,
                      }));
                    } else {
                      setEditLeadForm((prev) => ({
                        ...prev,
                        customerId: "",
                      }));
                    }
                  }}
                />
              </div>

              {/* Se NÃO houver cliente vinculado (Lead Avulso), exibe inputs manuais de contato */}
              {!selectedClientForEditLead ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      required={!selectedClientForEditLead}
                      placeholder="Nome do cliente"
                      value={editLeadForm.contactName}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="text"
                      required={!selectedClientForEditLead}
                      placeholder="(41) 99999-9999"
                      value={editLeadForm.contactPhone}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="cliente@exemplo.com"
                      value={editLeadForm.contactEmail}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Contato e dados de envio vinculados diretamente ao cadastro do cliente acima.
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editLeadForm.estimatedValue}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, estimatedValue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={editLeadForm.priority}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, priority: e.target.value as any })}
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
                    value={editLeadForm.dueDate}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Especificações Técnicas de Instalação */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block uppercase tracking-wide">
                  Especificações Técnicas de Campo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Voltagem do Local
                    </label>
                    <select
                      value={editLeadForm.voltage}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, voltage: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    >
                      <option value="110V">110V</option>
                      <option value="220V">220V</option>
                      <option value="Bivolt">Bivolt</option>
                      <option value="Sem elétrica">Sem elétrica</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Ajudante Auxiliar
                    </label>
                    <select
                      value={editLeadForm.helperId}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, helperId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    >
                      <option value="">Nenhum ajudante</option>
                      {serviceProviders.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.tradeName || prov.fullName || prov.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Especificação de Tinta
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Esmalte sintético preto fosco"
                      value={editLeadForm.paintDetails}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, paintDetails: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Frete / Logística
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Frete próprio com entrega em Curitiba"
                      value={editLeadForm.freightDetails}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, freightDetails: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações & Briefing
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre medidas, cores e prazos..."
                  value={editLeadForm.notes}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditLeadModalOpen(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingEditLead}
                  className="rounded-full px-5 text-xs font-bold"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE SERVIÇO (CRUD DIRETO)      */}
      {/* ======================================================== */}
      {leadToDelete && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setLeadToDelete(null)}
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
                Excluir este serviço?
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Tem certeza que deseja remover o serviço <strong className="text-zinc-900 dark:text-white">&quot;{leadToDelete.title}&quot;</strong>? Esta ação excluirá permanentemente o card do funil e todos os documentos vinculados.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                isLoading={isDeletingLeadDirect}
                onClick={handleConfirmDeleteLead}
                className="rounded-xl px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: O VERSO DO CARTÃO ESTILO TRELLO (CENTRAL TAREFA)  */}
      {/* ======================================================== */}
      <ErrorBoundary fallbackTitle="Não foi possível exibir os detalhes deste card">
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
        onOpenEditLead={(leadId) => handleOpenEditLeadById(leadId)}
        onViewBudgetDocument={(leadId) => handleViewLeadBudgetDocument(leadId)}
        onOpenContactDetails={(contactId) => {
          setSelectedContactId(contactId);
          setIsDetailsOpen(true);
        }}
      />
      </ErrorBoundary>

      {/* MODAL: GERENCIAMENTO DE CATEGORIAS E SUBCATEGORIAS */}
      <ServiceCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onCategoriesChanged={fetchKanban}
      />

      {/* MODAL: FICHA 360º DO CONTATO (CASO CLIQUE DENTRO DO CARD) */}
      <ContactDetailsSheet
        contactId={selectedContactId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedContactId(null);
        }}
        onEdit={() => {}}
        onContactDeleted={() => {
          fetchKanban();
        }}
      />

      {/* Botão Flutuante (FAB) de Adicionar Oportunidade no Mobile */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsNewLeadModalOpen(true)}
          aria-label="Nova Oportunidade"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
      {/* ======================================================== */}
      {/* MODAL: PREVIEW DO PDF DO ORÇAMENTO (VISUALIZADOR)       */}
      {/* ======================================================== */}
      {previewBudgetDoc && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewBudgetDoc(null)}
        >
          <div
            className="w-full max-w-4xl h-[90vh] bg-white dark:bg-[#18191E] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-2.5 py-0.5 rounded-md border border-orange-500/20">
                    Documento Oficial
                  </span>
                  {previewBudgetDoc.code && (
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      [{previewBudgetDoc.code}]
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                  {previewBudgetDoc.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewBudgetDoc.fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  title="Baixar PDF"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Baixar</span>
                </a>
                <a
                  href={previewBudgetDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir em Nova Guia"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Guia</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewBudgetDoc(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              <iframe
                src={`${previewBudgetDoc.fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title="Visualizador do Orçamento em PDF"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
