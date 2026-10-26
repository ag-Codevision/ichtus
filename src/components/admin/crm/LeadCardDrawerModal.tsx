"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Calendar,
  Tag,
  Clock,
  Layers,
  Phone,
  MessageCircle,
  ExternalLink,
  Trash2,
  Edit2,
  Plus,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  User,
  ArrowRight,
  MoreVertical,
  Download,
  Star,
  Sparkles,
  DollarSign,
  Mail,
  Building2,
  Share2,
  Zap,
  Smile,
  AtSign,
  Cloud,
  HardDrive,
  Wrench,
  Truck,
  Paintbrush,
  FileCheck,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { RichTextEditor } from "@/components/admin/crm/RichTextEditor";
import { ServiceCategoriesModal, ServiceCategoryData } from "@/components/admin/crm/ServiceCategoriesModal";
import { ResourcesSelector } from "@/components/admin/crm/ResourcesSelector";
import { getDueDateStatus } from "@/lib/due-date-status";
import { ServiceMaterialsTable, ServiceMaterialItem } from "@/components/admin/crm/ServiceMaterialsTable";
import { ServiceAttachmentsSection } from "@/components/admin/crm/ServiceAttachmentsSection";

export interface KanbanTagItem {
  id: string;
  name: string;
  color: string;
}

export interface LeadChecklistItemData {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  order: number;
  dueDate: string | null;
}

export interface LeadChecklistData {
  id: string;
  title: string;
  order: number;
  items: LeadChecklistItemData[];
}

export interface LeadAttachmentData {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  isCover: boolean;
  isExternalLink: boolean;
  createdAt: string;
}

export interface LeadCommentData {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface LeadDetailFull {
  id: string;
  title: string;
  columnId: string;
  column: {
    id: string;
    name: string;
    color: string | null;
  };
  customerId: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string | null } | null;
  subcategoryId?: string | null;
  subcategory?: { id: string; name: string } | null;
  customer?: {
    id: string;
    displayName?: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    type: string;
    whatsapp: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
  } | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  estimatedValue: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  source: string;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  coverImage: string | null;
  budgetCode?: string | null;
  helperId?: string | null;
  helper?: {
    id: string;
    tradeName?: string | null;
    companyName?: string | null;
    fullName?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
  voltage?: string | null;
  tools?: string[];
  materials?: ServiceMaterialItem[] | any;
  paintDetails?: string | null;
  freightDetails?: string | null;
  proposalContent?: string | null;
  contractContent?: string | null;
  tags: { tag: KanbanTagItem }[];
  checklists: LeadChecklistData[];
  attachments: LeadAttachmentData[];
  comments: LeadCommentData[];
  createdAt: string;
  updatedAt: string;
}

interface LeadCardDrawerModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  columns: { id: string; name: string; color: string | null }[];
  onConvertToOS?: (leadId: string) => void;
  onOpenContactDetails?: (contactId: string) => void;
  onOpenEditLead?: (leadId: string) => void;
  onViewBudgetDocument?: (leadId: string) => void;
}

export function LeadCardDrawerModal({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
  columns,
  onConvertToOS,
  onOpenContactDetails,
  onOpenEditLead,
  onViewBudgetDocument,
}: LeadCardDrawerModalProps) {
  const [data, setData] = useState<LeadDetailFull | null>(null);
  const [materials, setMaterials] = useState<ServiceMaterialItem[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastWaMeUrl, setLastWaMeUrl] = useState<string | null>(null);

  // Edição de Título
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Edição de Descrição / Briefing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  // Gestão de Etiquetas (Tags)
  const [allTags, setAllTags] = useState<KanbanTagItem[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#FF650F");

  // Gestão de Checklists
  const [isNewChecklistOpen, setIsNewChecklistOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemInputs, setNewItemInputs] = useState<{ [checklistId: string]: string }>({});

  // Gestão de Anexos em Nuvem (Google Drive, OneDrive, Dropbox)
  const [cloudAttachmentTab, setCloudAttachmentTab] = useState<"GOOGLE_DRIVE" | "ONEDRIVE" | "DROPBOX" | "LINK">("GOOGLE_DRIVE");
  const [cloudUrlInput, setCloudUrlInput] = useState("");
  const [cloudTitleInput, setCloudTitleInput] = useState("");
  const [isSavingCloudLink, setIsSavingCloudLink] = useState(false);

  // Timeline Unificada de Atividades e Comentários
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [showOnlyComments, setShowOnlyComments] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const quickEmojis = ["👍", "❤️", "🚀", "🔧", "📐", "✅", "⚠️", "💬", "📦", "🎨", "👏", "💰"];
  const teamMembers = ["Administrador", "Marcio", "Engenharia & Projetos", "Comercial Ícthus", "Produção CNC", "Equipe de Instalação"];
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Gestão de Anexos
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({ fileName: "", fileUrl: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gestão de Comentários
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Gestão de Data de Entrega (Prazo)
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");

  // Edição Completa da Oportunidade e Contato (CRUD do Card)
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Estados para Disparo de Orçamento/Contrato e Geração com IA
  const [isDispatchingBudget, setIsDispatchingBudget] = useState(false);
  const [isDispatchingContract, setIsDispatchingContract] = useState(false);
  const [isGeneratingAIDocs, setIsGeneratingAIDocs] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);
  const [drawerHelpers, setDrawerHelpers] = useState<any[]>([]);
  const [newDrawerCustomTool, setNewDrawerCustomTool] = useState("");
  const [isAddingDrawerCustomTool, setIsAddingDrawerCustomTool] = useState(false);

  const [infoForm, setInfoForm] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    estimatedValue: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    source: "WEBSITE_FORM",
    customerId: null as string | null,
  });
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<SearchedClient | null>(null);

  // Exclusão da Oportunidade
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Categorias & Subcategorias
  const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/crm/categories");
      const resData = await res.json();
      if (resData.success && resData.categories) {
        setCategories(resData.categories);
      }
    } catch (e) {
      console.warn("Erro ao carregar categorias:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Carrega dados completos do lead
  const fetchLeadDetails = async () => {
    if (!leadId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}`);
      const json = await res.json();
      if (json.success && json.lead) {
        setData(json.lead);
        setMaterials(Array.isArray(json.lead.materials) ? json.lead.materials : []);
        setTitleValue(json.lead.title);
    // Carrega histórico e atividades
    try {
      const actRes = await fetch(`/api/v1/crm/leads/${leadId}/activities`);
      const actJson = await actRes.json();
      if (actJson.success && actJson.timeline) {
        setTimelineItems(actJson.timeline);
      }
    } catch (actErr) {
      console.warn("Aviso ao carregar timeline:", actErr);
    }

        setNotesValue(json.lead.notes || "");
        const rawDueDate = json.lead.dueDate ? new Date(json.lead.dueDate) : null;
        setDueDateInput(rawDueDate && !isNaN(rawDueDate.getTime()) ? rawDueDate.toISOString().split("T")[0] : "");
        setInfoForm({
          contactName: json.lead.contactName || "",
          contactPhone: json.lead.contactPhone || "",
          contactEmail: json.lead.contactEmail || "",
          estimatedValue: json.lead.estimatedValue != null ? String(json.lead.estimatedValue) : "",
          priority: json.lead.priority || "MEDIUM",
          source: json.lead.source || "WEBSITE_FORM",
          customerId: json.lead.customerId || null,
        });
        if (json.lead.customer) {
          setSelectedCustomerObj({
            id: json.lead.customer.id,
            displayName:
              json.lead.customer.tradeName ||
              json.lead.customer.fullName ||
              json.lead.customer.companyName ||
              "Cliente",
            tradeName: json.lead.customer.tradeName,
            companyName: json.lead.customer.companyName,
            fullName: json.lead.customer.fullName,
            type: json.lead.customer.type || "CLIENT",
            personType: "LEGAL",
            documentNumber: null,
            phone: json.lead.customer.phone,
            whatsapp: json.lead.customer.whatsapp,
            email: json.lead.customer.email,
            city: json.lead.customer.city,
            state: json.lead.customer.state,
            status: "ACTIVE",
          });
        } else {
          setSelectedCustomerObj(null);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do lead:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega todas as tags do sistema
  const fetchAllTags = async () => {
    try {
      const res = await fetch("/api/v1/crm/tags");
      const json = await res.json();
      if (json.success) {
        setAllTags(json.tags || []);
      }
    } catch (err) {
      console.error("Erro ao buscar tags:", err);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
      fetchAllTags();
    } else {
      setData(null);
      setIsEditingTitle(false);
      setIsEditingNotes(false);
      setIsTagDropdownOpen(false);
      setIsNewChecklistOpen(false);
      setIsDueDateModalOpen(false);
    }
  }, [isOpen, leadId]);

  // Atualização genérica de campos do lead
  
  // Carrega lista de prestadores para seleção de ajudante auxiliar
  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/crm/contacts?type=SERVICE_PROVIDER&limit=50")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.contacts) {
            setDrawerHelpers(resData.contacts);
          }
        })
        .catch((e) => console.warn("Aviso ao carregar prestadores:", e));
    }
  }, [isOpen]);

  const handleUpdateMaterials = (newMaterials: ServiceMaterialItem[]) => {
    setMaterials(newMaterials);
    setData((prev) => (prev ? { ...prev, materials: newMaterials } : null));
    handleUpdateLeadField({ materials: newMaterials });
  };

  const handleUpdateLeadField = async (payload: any) => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => (prev ? { ...prev, ...json.lead } : null));
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao atualizar lead:", err);
    }
  };

  // Salvar Título
  
  const handleDispatchWhatsApp = async (type: "budget" | "contract") => {
    if (!leadId) return;
    const isBudget = type === "budget";
    if (isBudget) setIsDispatchingBudget(true);
    else setIsDispatchingContract(true);
    setDispatchFeedback(null);

    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/dispatch-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const resData = await res.json();
      if (resData.success) {
        const destPhone = resData.recipientPhone ? `+${resData.recipientPhone}` : (data?.contactPhone || "");
        const docName = isBudget ? "Orçamento" : "Contrato";

        if (resData.wacliSuccess) {
          const successMsg = `${docName} enviado com sucesso via WhatsApp para ${resData.clientName || "o cliente"} (${destPhone})!`;
          setDispatchFeedback(successMsg);
          toast.success(successMsg, "Disparo Automático Concluído", 6500);

          if (resData.isSelf) {
            toast.info(
              "Atenção: O telefone do destinatário é o mesmo pareado na plataforma.",
              "Envio para Número Conectado",
              5000
            );
          }
        } else {
          const warnMsg = `O robô não conseguiu entregar via WhatsApp (${resData.wacliError || "serviço desconectado"}). Você pode abrir manualmente no WhatsApp Web abaixo.`;
          setDispatchFeedback(warnMsg);
          toast.warning(warnMsg, "Envio Automático Indisponível", 7000);
        }

        if (resData.waMeUrl) {
          setLastWaMeUrl(resData.waMeUrl);
        }
      } else {
        toast.error(resData.error || "Falha no disparo via WhatsApp.", "Falha no Envio");
      }
    } catch {
      toast.error("Erro ao disparar mensagem para o cliente.", "Falha de Rede");
    } finally {
      if (isBudget) setIsDispatchingBudget(false);
      else setIsDispatchingContract(false);
    }
  };

  const handleRegenerateAIDocs = async () => {
    if (!leadId) return;
    setIsGeneratingAIDocs(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/generate-ai-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "both" }),
      });
      const resData = await res.json();
      if (resData.success) {
        setDispatchFeedback("Proposta e Contrato atualizados e sincronizados com a IA!");
        fetchLeadDetails();
      } else {
        alert(resData.error || "Falha ao sincronizar documentos.");
      }
    } catch {
      alert("Erro ao conectar ao motor de IA.");
    } finally {
      setIsGeneratingAIDocs(false);
    }
  };

  const handleSaveTitle = () => {
    if (!titleValue.trim()) return;
    setIsEditingTitle(false);
    handleUpdateLeadField({ title: titleValue.trim() });
  };

  // Salvar Descrição
  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    handleUpdateLeadField({ notes: notesValue });
  };

  // Salvar Informações Comerciais e de Contato do Lead (CRUD)
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    await handleUpdateLeadField({
      contactName: infoForm.contactName.trim(),
      contactPhone: infoForm.contactPhone.trim(),
      contactEmail: infoForm.contactEmail.trim() || null,
      estimatedValue: infoForm.estimatedValue ? parseFloat(infoForm.estimatedValue) : null,
      priority: infoForm.priority,
      source: infoForm.source,
      customerId: infoForm.customerId || null,
    });
    setIsEditingInfo(false);
    fetchLeadDetails();
  };

  // Excluir Oportunidade (Cartão)
  const handleDeleteLead = async () => {
    if (!leadId) return;
    setIsDeletingLead(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setIsDeleteConfirmOpen(false);
        onClose();
        onLeadUpdated();
      } else {
        alert(json.error || "Falha ao excluir cartão.");
      }
    } catch (err) {
      alert("Falha na comunicação ao tentar excluir cartão.");
    } finally {
      setIsDeletingLead(false);
    }
  };

  // Mover Coluna do Lead pelo Dropdown
  const handleChangeColumn = (columnId: string) => {
    handleUpdateLeadField({ columnId });
  };

  // Toggle de Tag (Vincular / Desvincular)
  const handleToggleTag = async (tagId: string) => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao vincular tag:", err);
    }
  };

  // Criar Nova Tag
  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/v1/crm/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAllTags();
        if (leadId) handleToggleTag(json.tag.id);
        setNewTagName("");
      }
    } catch (err) {
      console.error("Erro ao criar tag:", err);
    }
  };

  // Criar Checklist
  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim() || !leadId) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChecklistTitle.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewChecklistTitle("");
        setIsNewChecklistOpen(false);
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao criar checklist:", err);
    }
  };

  // Excluir Checklist
  const handleDeleteChecklist = async (checklistId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta lista de tarefas?")) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/checklists/${checklistId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao excluir checklist:", err);
    }
  };

  // Adicionar Item na Checklist
  const handleAddItemToChecklist = async (checklistId: string) => {
    const text = newItemInputs[checklistId]?.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/checklists/${checklistId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text }),
      });
      const json = await res.json();
      if (json.success) {
        setNewItemInputs((prev) => ({ ...prev, [checklistId]: "" }));
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  };

  // Toggle de Item da Checklist (Concluir/Desmarcar)
  const handleToggleChecklistItem = async (itemId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/checklists/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentState }),
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao alternar item:", err);
    }
  };

  // Excluir Item da Checklist
  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/checklists/items/${itemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

  // Upload de Anexo Local
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !leadId) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const isFirstImage = !data?.coverImage && file.type.startsWith("image/");
      if (isFirstImage) {
        formData.append("isCover", "true");
      }

      const res = await fetch(`/api/v1/crm/leads/${leadId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      } else {
        alert(json.error || "Falha ao enviar arquivo.");
      }
    } catch (err) {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Salvar Link em Nuvem
  const handleSaveCloudAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudUrlInput.trim() || !leadId) return;
    setIsSavingCloudLink(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: cloudTitleInput.trim() || cloudUrlInput.trim(),
          fileUrl: cloudUrlInput.trim(),
          fileType: cloudAttachmentTab,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCloudUrlInput("");
        setCloudTitleInput("");
        setIsLinkModalOpen(false);
        fetchLeadDetails();
        onLeadUpdated();
      } else {
        alert(json.error || "Falha ao salvar link.");
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setIsSavingCloudLink(false);
    }
  };

  // Adicionar Link Externo
  const handleAddExternalLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.fileUrl.trim() || !leadId) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });
      const json = await res.json();
      if (json.success) {
        setLinkForm({ fileName: "", fileUrl: "" });
        setIsLinkModalOpen(false);
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao adicionar link:", err);
    }
  };

  // Toggle de Capa do Cartão
  const handleToggleCover = async (attachment: LeadAttachmentData) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/attachments/${attachment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCover: !attachment.isCover }),
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao definir capa:", err);
    }
  };

  // Excluir Anexo
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Deseja realmente remover este anexo?")) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao excluir anexo:", err);
    }
  };

  // Adicionar Comentário
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !leadId) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setCommentInput("");
        fetchLeadDetails();
        onLeadUpdated();
      }
    } catch (err) {
      console.error("Erro ao registrar comentário:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Salvar Data de Entrega
  const handleSaveDueDate = () => {
    handleUpdateLeadField({ dueDate: dueDateInput ? new Date(dueDateInput) : null });
    setIsDueDateModalOpen(false);
  };

  if (!isOpen) return null;

  // Cálculos de Status de Prazo
  const leadDueDateObj = data?.dueDate ? new Date(data.dueDate) : null;
  const isLeadDateValid = leadDueDateObj && !isNaN(leadDueDateObj.getTime());
  const isOverdue =
    isLeadDateValid && !data?.isCompleted && leadDueDateObj.getTime() < Date.now();
  const isDueToday =
    isLeadDateValid &&
    leadDueDateObj.toDateString() === new Date().toDateString();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[100vh] sm:max-h-[90vh] bg-[#F8F9FA] dark:bg-[#141519] sm:rounded-3xl border-0 sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* IMAGEM DE CAPA ESTILO TRELLO (SE HOUVER) */}
        {data?.coverImage && (
          <div className="relative w-full h-44 sm:h-56 bg-zinc-900 shrink-0 overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.coverImage}
              alt="Capa do cartão"
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            <button
              type="button"
              onClick={() => handleUpdateLeadField({ coverImage: null })}
              className="absolute top-4 right-14 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md transition-colors"
            >
              Remover Capa
            </button>
          </div>
        )}

        {/* CABEÇALHO DO VERSO DO CARTÃO */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#18191E] border-b border-black/[0.05] dark:border-white/[0.06] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            
              {/* ID do Orçamento Sequencial Inteligente */}
              {data?.budgetCode && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF650F] border border-orange-500/20 text-[11px] font-mono font-black">
                    <span>ID Orçamento: [{data.budgetCode}]</span>
                  </div>
                  {onViewBudgetDocument && (
                    <button
                      type="button"
                      onClick={() => onViewBudgetDocument(data.id)}
                      title="Visualizar documento de orçamento gerado (PDF)"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 hover:bg-[#FF650F] text-[#FF650F] hover:text-white text-[11px] font-semibold border border-orange-500/20 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver PDF</span>
                    </button>
                  )}
                </div>
              )}

            {/* Seletor da Coluna no Topo estilo Trello */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium">na lista:</span>
              <div className="relative inline-block">
                <select
                  value={data?.columnId || ""}
                  onChange={(e) => handleChangeColumn(e.target.value)}
                  className="bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-900 dark:text-white font-bold text-xs py-1 px-2.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id} className="dark:bg-[#18191E]">
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Título Diretamente Editável */}
            <div className="pt-1">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                placeholder="Título do Serviço..."
                className="w-full text-lg sm:text-xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/60 border border-black/10 dark:border-white/10 px-3.5 py-1.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">

            <button
              type="button"
              title="Excluir Serviço"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CORPO DO CARTÃO DIVIDIDO EM 2 COLUNAS (ESTILO TRELLO) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL (8 COLUNAS)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chips de Contexto no Topo: Etiquetas e Prazo */}
            {((data?.tags && data.tags.length > 0) || data?.dueDate) && (
              <div className="flex flex-wrap items-center gap-2 pb-1">
                {data?.dueDate && (() => {
                  const dueStatus = getDueDateStatus(data.dueDate);
                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                        dueStatus?.badgeClass ||
                        "bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDate(data.dueDate)}</span>
                      {dueStatus && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>{dueStatus.label}</span>
                        </>
                      )}
                    </span>
                  );
                })()}

                {(data?.tags || []).filter((t) => t && t.tag).map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs flex items-center gap-1"
                    style={{ backgroundColor: tag.color }}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag.name}</span>
                  </span>
                ))}
              </div>
            )}

            {/* SEÇÃO: DADOS DA OPORTUNIDADE & CONTATO (DIRETAMENTE NO CORPO DO CARD) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF650F]" />
                  <span>Dados da Oportunidade & Contato</span>
                </h3>
              </div>

              {/* Seletor Inteligente de Cliente Vinculado */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cliente Vinculado (CRM)
                </label>
                <ClientSearchAutocomplete
                  selectedClient={selectedCustomerObj}
                  onSelectClient={(client: SearchedClient | null) => {
                    setSelectedCustomerObj(client);
                    if (client) {
                      setInfoForm((prev) => ({
                        ...prev,
                        customerId: client.id,
                        contactName: client.displayName || client.tradeName || client.fullName || prev.contactName || "",
                        contactPhone: client.whatsapp || client.phone || prev.contactPhone || "",
                        contactEmail: client.email || prev.contactEmail || "",
                      }));
                      handleUpdateLeadField({
                        customerId: client.id,
                        contactName: client.displayName || client.tradeName || client.fullName || data?.contactName || "",
                        contactPhone: client.whatsapp || client.phone || data?.contactPhone || "",
                        contactEmail: client.email || data?.contactEmail || null,
                      });
                    } else {
                      setInfoForm((prev) => ({ ...prev, customerId: null }));
                      handleUpdateLeadField({ customerId: null });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    value={infoForm.contactName}
                    onChange={(e) => setInfoForm({ ...infoForm, contactName: e.target.value })}
                    onBlur={() => {
                      if (infoForm.contactName.trim() && infoForm.contactName !== data?.contactName) {
                        handleUpdateLeadField({ contactName: infoForm.contactName.trim() });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      WhatsApp / Telefone *
                    </label>
                    {data?.contactPhone && (
                      <a
                        href={`https://wa.me/${data.contactPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Abrir</span>
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={infoForm.contactPhone}
                    onChange={(e) => setInfoForm({ ...infoForm, contactPhone: e.target.value })}
                    onBlur={() => {
                      if (infoForm.contactPhone.trim() && infoForm.contactPhone !== data?.contactPhone) {
                        handleUpdateLeadField({ contactPhone: infoForm.contactPhone.trim() });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    value={infoForm.contactEmail}
                    onChange={(e) => setInfoForm({ ...infoForm, contactEmail: e.target.value })}
                    onBlur={() => {
                      if (infoForm.contactEmail !== data?.contactEmail) {
                        handleUpdateLeadField({ contactEmail: infoForm.contactEmail.trim() || null });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>
            </div>

            {/* BLOCO 2: CATEGORIA & SUBCATEGORIA DO SERVIÇO (LOGO ABAIXO DE DADOS DA OPORTUNIDADE & CONTATO) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF650F]" />
                  <span>Categoria & Subcategoria do Serviço</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="text-[11px] font-bold text-[#FF650F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gerenciar Categorias</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Categoria Principal
                  </label>
                  <select
                    value={data?.categoryId || ""}
                    onChange={(e) => {
                      const newCatId = e.target.value || null;
                      handleUpdateLeadField({ categoryId: newCatId, subcategoryId: null });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
                  >
                    <option value="">Selecione uma Categoria...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Subcategoria
                  </label>
                  <select
                    value={data?.subcategoryId || ""}
                    onChange={(e) => {
                      handleUpdateLeadField({ subcategoryId: e.target.value || null });
                    }}
                    disabled={!data?.categoryId}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!data?.categoryId
                        ? "Escolha uma categoria primeiro"
                        : (categories.find((c) => c.id === data.categoryId)?.subcategories || []).length === 0
                        ? "Sem subcategorias cadastradas"
                        : "Selecione a Subcategoria..."}
                    </option>
                    {(categories.find((c) => c.id === data?.categoryId)?.subcategories || []).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BLOCO 3: MATERIAIS & INSUMOS DO SERVIÇO (ACIMA DE ESPECIFICAÇÕES TÉCNICAS) */}
            <ServiceMaterialsTable
              materials={materials}
              onChange={handleUpdateMaterials}
            />

            {/* SEÇÃO: ESPECIFICAÇÕES TÉCNICAS DE INSTALAÇÃO & CAMPO (ÍCTHUS) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#FF650F]" />
                  <span>Especificações Técnicas de Instalação & Campo</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Voltagem do Local em Chips Diretos */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Voltagem do Local</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["110V", "220V", "Bivolt", "N/A"].map((volt) => (
                      <button
                        key={volt}
                        type="button"
                        onClick={() => handleUpdateLeadField({ voltage: volt })}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          data?.voltage === volt
                            ? "bg-[#FF650F] text-white border-[#FF650F] shadow-xs"
                            : "bg-zinc-50 dark:bg-[#121316] text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-zinc-100"
                        }`}
                      >
                        {volt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ajudante Auxiliar */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Ajudante Auxiliar</span>
                  </label>
                  <select
                    value={data?.helperId || ""}
                    onChange={(e) => handleUpdateLeadField({ helperId: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
                  >
                    <option value="">Nenhum ajudante vinculado</option>
                    {drawerHelpers.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.tradeName || prov.companyName || prov.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Especificação de Tinta */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                    <Paintbrush className="w-3.5 h-3.5 text-purple-500" />
                    <span>Especificação de Tinta</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PU Preto Fosco Automotivo"
                    defaultValue={data?.paintDetails || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (data?.paintDetails || "")) {
                        handleUpdateLeadField({ paintDetails: e.target.value.trim() || null });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                {/* Frete / Logística */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Detalhes de Frete / Logística</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carreto próprio da empresa, veículo utilitário..."
                    defaultValue={data?.freightDetails || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (data?.freightDetails || "")) {
                        handleUpdateLeadField({ freightDetails: e.target.value.trim() || null });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Recursos & Ferramentas Necessárias (CRUD COMPLETO) */}
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
                <ResourcesSelector
                  selectedTools={Array.isArray(data?.tools) ? data.tools : []}
                  onChange={(newTools) => handleUpdateLeadField({ tools: newTools })}
                />
              </div>
            </div>

            {/* SEÇÃO 1: DESCRIÇÃO DETALHADA / BRIEFING (SEMPRE ABERTA DIRETAMENTE) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF650F]" />
                  <span>Descrição & Escopo do Trabalho (Texto Formatado)</span>
                </h3>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="rounded-xl text-xs font-bold bg-[#FF650F] hover:bg-[#e0580c] text-white h-7 px-3"
                >
                  Salvar Descrição
                </Button>
              </div>

              <div className="space-y-2">
                <RichTextEditor
                  value={notesValue}
                  onChange={setNotesValue}
                  placeholder="Adicione escopo, regras, medidas, links técnicos e detalhes da montagem..."
                  minRows={5}
                />
              </div>
            </div>

            {/* SEÇÃO 2: CHECKLISTS COM BARRA DE PROGRESSO */}
            <div className="space-y-4">
              {data?.checklists?.map((cl) => {
                const itemsList = cl.items || [];
                const total = itemsList.length;
                const completed = itemsList.filter((i) => i?.isCompleted).length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isAllDone = total > 0 && completed === total;

                return (
                  <div
                    key={cl.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] space-y-3 shadow-sm"
                  >
                    {/* Cabeçalho da Checklist */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-[#FF650F]" />
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{cl.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklist(cl.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Excluir lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Barra de Progresso com Porcentagem em Destaque Estilo Trello */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-sm font-black text-[#FF650F]">{percentage}%</span>
                        <span className={isAllDone ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500"}>
                          {completed}/{total} concluídos
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] overflow-hidden p-0.5">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isAllDone ? "bg-emerald-500" : "bg-[#FF650F]"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Itens da Checklist */}
                    <div className="space-y-1.5 pt-1">
                      {itemsList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                              className="w-4 h-4 rounded text-[#FF650F] focus:ring-[#FF650F] cursor-pointer"
                            />
                            <span
                              className={`text-xs ${
                                item.isCompleted
                                  ? "line-through text-zinc-400 dark:text-zinc-500"
                                  : "text-zinc-800 dark:text-zinc-200 font-medium"
                              }`}
                            >
                              {item.title}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-1 rounded transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Input Rápido para Adicionar Item */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Adicionar um item na lista..."
                        value={newItemInputs[cl.id] || ""}
                        onChange={(e) =>
                          setNewItemInputs((prev) => ({ ...prev, [cl.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleAddItemToChecklist(cl.id)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddItemToChecklist(cl.id)}
                        className="rounded-xl text-xs font-bold py-1 h-8"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SEÇÃO: ANEXOS (ARQUIVOS LOCAIS COM DRAG-AND-DROP + LINKS EM NUVEM) */}
            <ServiceAttachmentsSection
              leadId={data?.id}
              existingAttachments={data?.attachments || []}
              onAttachmentAdded={(att: any) => {
                setData((prev) =>
                  prev ? { ...prev, attachments: [att, ...(prev.attachments || [])] } : null
                );
                onLeadUpdated();
              }}
              onAttachmentDeleted={handleDeleteAttachment}
              onToggleCover={handleToggleCover}
            />

            {/* SEÇÃO 4: FEED CRONOLÓGICO DE ATIVIDADES & COMENTÁRIOS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#FF650F]" />
                  <span>Atividades & Comentários</span>
                </h3>
                {/* Filtro: Mostrar Tudo vs Apenas Comentários */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/[0.06] p-0.5 rounded-xl text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowOnlyComments(false)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      !showOnlyComments
                        ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Tudo ({timelineItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOnlyComments(true)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      showOnlyComments
                        ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Comentários ({data?.comments?.length || 0})
                  </button>
                </div>
              </div>

              {/* Caixa de Novo Comentário com Emojis e Menções */}
              <form onSubmit={handleAddComment} className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
                <textarea
                  rows={2}
                  value={commentInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCommentInput(val);
                    const lastWord = val.split(/\s+/).pop() || "";
                    if (lastWord.startsWith("@")) {
                      setMentionQuery(lastWord.substring(1));
                    } else {
                      setMentionQuery(null);
                    }
                  }}
                  placeholder="Escreva um comentário, mencione com @usuário ou adicione instruções..."
                  className="w-full bg-transparent border-0 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none resize-none no-scrollbar"
                />

                {/* Dropdown de Sugestões de Menção (@) */}
                {mentionQuery !== null && (
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 flex flex-wrap gap-1 animate-in fade-in duration-100">
                    <span className="text-[10px] text-zinc-400 font-bold block w-full">Mencionar colega:</span>
                    {teamMembers
                      .filter((m) => m.toLowerCase().includes(mentionQuery.toLowerCase()))
                      .map((member) => (
                        <button
                          key={member}
                          type="button"
                          onClick={() => {
                            const words = commentInput.split(/\s+/);
                            words.pop();
                            words.push(`@${member} `);
                            setCommentInput(words.join(" "));
                            setMentionQuery(null);
                          }}
                          className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-orange-500/10 hover:bg-[#FF650F] text-[#FF650F] hover:text-white transition-colors"
                        >
                          @{member}
                        </button>
                      ))}
                  </div>
                )}

                {/* Barra Inferior da Caixa de Comentário */}
                <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <div className="flex items-center gap-1">
                    {/* Botão de Emojis */}
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      title="Inserir Emoji"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {/* Botão de Menção */}
                    <button
                      type="button"
                      onClick={() => setCommentInput((prev) => prev + " @")}
                      title="Mencionar membro da equipe (@)"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>

                    {/* Seletor Rápido de Emojis */}
                    {isEmojiPickerOpen && (
                      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-[#121316] rounded-xl border border-black/5 dark:border-white/5 animate-in fade-in duration-100">
                        {quickEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setCommentInput((prev) => prev + emoji);
                              setIsEmojiPickerOpen(false);
                            }}
                            className="p-1 text-sm hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmittingComment}
                    disabled={!commentInput.trim()}
                    className="rounded-xl text-xs font-bold px-4 h-8"
                  >
                    Salvar Comentário
                  </Button>
                </div>
              </form>

              {/* Feed Cronológico Unificado */}
              <div className="space-y-2.5 pt-1">
                {(showOnlyComments
                  ? timelineItems.filter((i) => i.itemType === "COMMENT")
                  : timelineItems
                ).map((item) => {
                  if (item.itemType === "ACTIVITY") {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-zinc-100/60 dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.03] text-xs text-zinc-500"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#FF650F] shrink-0" />
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.userName}</span>
                        <span className="text-zinc-600 dark:text-zinc-400">{item.content}</span>
                        <span className="text-[10px] font-mono text-zinc-400 ml-auto shrink-0">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {(item.userName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 p-3 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {item.userName}
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {timelineItems.length === 0 && (
                  <p className="text-xs text-zinc-400 italic text-center py-3">
                    Nenhuma atividade ou comentário registrado ainda.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUNA DIREITA: AÇÕES LATERAIS ESTILO TRELLO (4 COLUNAS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Bloco: Dados Comerciais & Prazos (Direto no Cartão) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                Dados Comerciais & Prazos
              </span>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Valor Estimado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={infoForm.estimatedValue}
                    onChange={(e) => setInfoForm({ ...infoForm, estimatedValue: e.target.value })}
                    onBlur={() => {
                      const val = infoForm.estimatedValue ? parseFloat(infoForm.estimatedValue) : null;
                      if (val !== data?.estimatedValue) {
                        handleUpdateLeadField({ estimatedValue: val });
                      }
                    }}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Nível de Prioridade
                </label>
                <select
                  value={data?.priority || "MEDIUM"}
                  onChange={(e) => handleUpdateLeadField({ priority: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                >
                  <option value="LOW">🟢 Baixa</option>
                  <option value="MEDIUM">🟡 Média</option>
                  <option value="HIGH">🟠 Alta</option>
                  <option value="URGENT">🔴 Urgente</option>
                </select>
              </div>

              {/* Data de Entrega com Contagem Regressiva e Cores Dinâmicas */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Data Limite de Entrega
                </label>
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => {
                    setDueDateInput(e.target.value);
                    handleUpdateLeadField({ dueDate: e.target.value ? new Date(e.target.value) : null });
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Origem do Contato
                </label>
                <select
                  value={data?.source || "WEBSITE_FORM"}
                  onChange={(e) => handleUpdateLeadField({ source: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                >
                  <option value="WEBSITE_FORM">Formulário do Site</option>
                  <option value="WHATSAPP">WhatsApp Direto</option>
                  <option value="REFERRAL">Indicação / Boca a Boca</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="GOOGLE_ADS">Google Ads</option>
                  <option value="OUTBOUND">Prospecção Ativa</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>
            </div>

            {/* Bloco 1: Adicionar ao Cartão */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                Adicionar ao Cartão
              </span>
              <div className="space-y-1.5">
                {/* Botão Etiquetas */}
                <button
                  type="button"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18191E] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors shadow-sm"
                >
                  <Tag className="w-4 h-4 text-[#FF650F]" />
                  <span>Etiquetas</span>
                </button>

                {/* Popover de Etiquetas */}
                {isTagDropdownOpen && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-3 animate-in fade-in duration-150">
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white block">
                      Selecionar Etiquetas
                    </span>
                    <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                      {allTags.map((tag) => {
                        const isAssigned = (data?.tags || []).some((t) => t?.tag?.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className="w-full p-2 rounded-xl text-left text-xs font-bold text-white flex items-center justify-between transition-transform active:scale-95"
                            style={{ backgroundColor: tag.color }}
                          >
                            <span>{tag.name}</span>
                            {isAssigned && <Check className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Criar Nova Tag */}
                    <form onSubmit={handleCreateNewTag} className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Criar Nova</span>
                      <input
                        type="text"
                        placeholder="Nome da etiqueta..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-[#121316] border text-xs"
                      />
                      <div className="flex items-center justify-between">
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                        />
                        <Button size="sm" type="submit" className="text-[11px] rounded-lg py-1 h-7">
                          Criar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Botão Checklist */}
                <button
                  type="button"
                  onClick={() => setIsNewChecklistOpen(!isNewChecklistOpen)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18191E] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors shadow-sm"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Checklist</span>
                </button>

                {/* Form de Nova Checklist */}
                {isNewChecklistOpen && (
                  <form
                    onSubmit={handleCreateChecklist}
                    className="p-3 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-2"
                  >
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white block">
                      Nova Lista de Tarefas
                    </span>
                    <input
                      type="text"
                      placeholder="Ex: Medições, Briefing..."
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      autoFocus
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-[#121316] border text-xs"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setIsNewChecklistOpen(false)}
                        className="text-[11px] rounded-lg py-1 h-7"
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" type="submit" className="text-[11px] rounded-lg py-1 h-7">
                        Criar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Botão Datas / Prazos */}
                <button
                  type="button"
                  onClick={() => setIsDueDateModalOpen(!isDueDateModalOpen)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18191E] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Data de Entrega</span>
                </button>

                {isDueDateModalOpen && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-2">
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white block">
                      Definir Prazo
                    </span>
                    <input
                      type="date"
                      value={dueDateInput}
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-[#121316] border text-xs font-mono"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDueDateInput("");
                          handleUpdateLeadField({ dueDate: null });
                          setIsDueDateModalOpen(false);
                        }}
                        className="text-[10px] rounded-lg py-1 h-7 text-red-500"
                      >
                        Remover
                      </Button>
                      <Button size="sm" onClick={handleSaveDueDate} className="text-[11px] rounded-lg py-1 h-7">
                        Salvar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botão Anexar Arquivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18191E] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Paperclip className="w-4 h-4 text-purple-600" />
                  <span>{isUploading ? "Enviando arquivo..." : "Anexar Arquivo"}</span>
                </button>

                {/* Botão Anexar Link Externo */}
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18191E] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors shadow-sm"
                >
                  <LinkIcon className="w-4 h-4 text-amber-600" />
                  <span>Inserir Link Externo</span>
                </button>
              </div>
            </div>

            {/* Bloco 2: Ações Comerciais Icthus */}
            <div className="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                Ações Comerciais
              </span>
              <div className="space-y-2">

                {/* Indicador do Destinatário */}
                <div className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#FF650F]" /> Destinatário:
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {data?.customer?.whatsapp || data?.contactPhone || data?.customer?.phone || "Sem telefone"}
                  </span>
                </div>

                {/* Feedback de Disparo */}
                {dispatchFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{dispatchFeedback}</span>
                  </div>
                )}

                {/* Disparo de Orçamento via WhatsApp */}
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isDispatchingBudget}
                  onClick={() => handleDispatchWhatsApp("budget")}
                  className="w-full justify-start text-xs font-bold gap-2 rounded-xl py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Disparar Orçamento (WhatsApp)</span>
                </Button>

                {/* Disparo de Contrato via WhatsApp */}
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isDispatchingContract}
                  onClick={() => handleDispatchWhatsApp("contract")}
                  className="w-full justify-start text-xs font-bold gap-2 rounded-xl py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
                >
                  <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Disparar Contrato p/ Assinatura</span>
                </Button>

                {/* Opção Manual / Contingência */}
                {lastWaMeUrl && (
                  <a
                    href={lastWaMeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors py-0.5 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir manualmente no WhatsApp Web</span>
                  </a>
                )}

                {/* Abrir Proposta em PDF */}
                <a
                  href={`/admin/crm/trabalhos/${leadId}/proposta`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF650F]" />
                    <span>Ver Proposta Comercial (PDF)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                {/* Abrir Contrato Dinâmico */}
                <a
                  href={`/admin/crm/trabalhos/${leadId}/contrato`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>Ver Contrato Dinâmico</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                {/* Regenerar com IA */}
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isGeneratingAIDocs}
                  onClick={handleRegenerateAIDocs}
                  className="w-full justify-start text-[11px] font-semibold gap-2 rounded-xl py-1.5 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Regenerar Documentos c/ IA</span>
                </Button>

                {/* Converter em OS */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onConvertToOS && leadId) onConvertToOS(leadId);
                  }}
                  className="w-full justify-start text-xs font-bold gap-2 rounded-xl py-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Converter em Ordem de Serviço</span>
                </Button>

                {/* WhatsApp do Contato */}
                {data?.contactPhone && (
                  <a
                    href={`https://wa.me/${data.contactPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Conversar no WhatsApp</span>
                  </a>
                )}

                {/* Botão de Excluir Oportunidade */}
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="w-full p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-3"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Cartão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsDeleteConfirmOpen(false)}
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
                Excluir esta oportunidade?
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Esta ação removerá permanentemente o cartão &quot;{data?.title}&quot;, incluindo todos os checklists, anexos e comentários vinculados.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                isLoading={isDeletingLead}
                onClick={handleDeleteLead}
                className="rounded-xl px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SECUNDÁRIO: GERENCIAR CATEGORIAS */}
      <ServiceCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onCategoriesChanged={() => {
          fetchCategories();
          fetchLeadDetails();
          onLeadUpdated();
        }}
      />

      {/* MODAL SECUNDÁRIO: ANEXAR LINK OU NUVEM */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsLinkModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#18191E] rounded-3xl p-6 border border-black/[0.08] dark:border-white/[0.08] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <span>Anexar Arquivo ou Nuvem</span>
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Integre pastas ou links do Google Drive, OneDrive, Dropbox ou Web
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Abas dos Provedores de Nuvem */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-black/30 rounded-xl">
              <button
                type="button"
                onClick={() => setCloudAttachmentTab("GOOGLE_DRIVE")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                  cloudAttachmentTab === "GOOGLE_DRIVE"
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setCloudAttachmentTab("ONEDRIVE")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                  cloudAttachmentTab === "ONEDRIVE"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>OneDrive</span>
              </button>
              <button
                type="button"
                onClick={() => setCloudAttachmentTab("DROPBOX")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                  cloudAttachmentTab === "DROPBOX"
                    ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Dropbox</span>
              </button>
              <button
                type="button"
                onClick={() => setCloudAttachmentTab("LINK")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                  cloudAttachmentTab === "LINK"
                    ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Web</span>
              </button>
            </div>

            <form onSubmit={handleSaveCloudAttachment} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {cloudAttachmentTab === "GOOGLE_DRIVE" && "Link de Compartilhamento do Google Drive *"}
                  {cloudAttachmentTab === "ONEDRIVE" && "Link de Compartilhamento do OneDrive *"}
                  {cloudAttachmentTab === "DROPBOX" && "Link de Compartilhamento do Dropbox *"}
                  {cloudAttachmentTab === "LINK" && "URL do Link / Arquivo *"}
                </label>
                <input
                  type="url"
                  required
                  placeholder={
                    cloudAttachmentTab === "GOOGLE_DRIVE"
                      ? "https://drive.google.com/file/d/..."
                      : cloudAttachmentTab === "ONEDRIVE"
                      ? "https://1drv.ms/... ou https://onedrive.live.com/..."
                      : cloudAttachmentTab === "DROPBOX"
                      ? "https://www.dropbox.com/scl/..."
                      : "https://exemplo.com/documento.pdf"
                  }
                  value={cloudUrlInput}
                  onChange={(e) => setCloudUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título ou Nome de Exibição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder={
                    cloudAttachmentTab === "GOOGLE_DRIVE"
                      ? "Ex: Pasta de Briefing e Logotipos"
                      : cloudAttachmentTab === "ONEDRIVE"
                      ? "Ex: Projeto Arquitetônico Completo"
                      : cloudAttachmentTab === "DROPBOX"
                      ? "Ex: Fotos da Fachada em Alta Resolução"
                      : "Ex: Apresentação Institucional"
                  }
                  value={cloudTitleInput}
                  onChange={(e) => setCloudTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  isLoading={isSavingCloudLink}
                  className="rounded-xl text-xs font-bold bg-[#FF650F] hover:bg-[#e0580c] text-white"
                >
                  Salvar Anexo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
}
