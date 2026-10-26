"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  AlertCircle,
  MessageCircle,
  Zap,
  Wrench,
  Truck,
  Paintbrush,
  Layers,
  Paperclip,
  CheckSquare,
  Link as LinkIcon,
  HardDrive,
  Cloud,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { RichTextEditor } from "@/components/admin/crm/RichTextEditor";
import { ServiceCategoriesModal, ServiceCategoryData } from "@/components/admin/crm/ServiceCategoriesModal";
import { ResourcesSelector } from "@/components/admin/crm/ResourcesSelector";
import { getDueDateStatus } from "@/lib/due-date-status";

interface KanbanColumnSimple {
  id: string;
  name: string;
  color?: string | null;
}

interface LeadCreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLeadId?: string) => void;
  columns: KanbanColumnSimple[];
  initialColumnId?: string;
  serviceProviders: any[];
}

export function LeadCreateCardModal({
  isOpen,
  onClose,
  onSuccess,
  columns,
  initialColumnId,
  serviceProviders,
}: LeadCreateCardModalProps) {
  // Formulário Geral
  const [title, setTitle] = useState("");
  const [columnId, setColumnId] = useState(initialColumnId || "");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [source, setSource] = useState("WEBSITE_FORM");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  // Cliente Vinculado
  const [selectedClient, setSelectedClient] = useState<SearchedClient | null>(null);

  // Categorias & Subcategorias de Serviços
  const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Especificações Técnicas de Campo
  const [voltage, setVoltage] = useState("110V");
  const [helperId, setHelperId] = useState("");
  const [paintDetails, setPaintDetails] = useState("");
  const [freightDetails, setFreightDetails] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Checklists Iniciais
  const [checklistTitle, setChecklistTitle] = useState("Etapas Iniciais");
  const [checklistItems, setChecklistItems] = useState<string[]>([
    "Realizar levantamento de medidas no local",
    "Coletar fotos e detalhes da fachada",
  ]);
  const [newItemInput, setNewItemInput] = useState("");

  // Anexos em Nuvem Iniciais
  const [cloudLinks, setCloudLinks] = useState<{ fileName: string; fileUrl: string; fileType: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkProvider, setNewLinkProvider] = useState<"GOOGLE_DRIVE" | "ONEDRIVE" | "DROPBOX" | "LINK">("GOOGLE_DRIVE");
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpeza completa do formulário ao abrir (garante sempre novo card zerado)
  const resetForm = () => {
    setTitle("");
    setColumnId(initialColumnId || (columns.length > 0 ? columns[0].id : ""));
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setSource("WEBSITE_FORM");
    setSelectedClient(null);
    setCategoryId("");
    setSubcategoryId("");
    setEstimatedValue("");
    setPriority("MEDIUM");
    setDueDate("");
    setNotes("");
    setSendWhatsApp(false);
    setVoltage("110V");
    setHelperId("");
    setPaintDetails("");
    setFreightDetails("");
    setSelectedTools([]);
    setChecklistTitle("Etapas Iniciais");
    setChecklistItems([
      "Realizar levantamento de medidas no local",
      "Coletar fotos e detalhes da fachada",
    ]);
    setNewItemInput("");
    setCloudLinks([]);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setIsAddingLink(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/crm/categories");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.warn("Erro ao carregar categorias:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchCategories();
    }
  }, [isOpen]);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  // Checklists
  const handleAddChecklistItem = () => {
    if (!newItemInput.trim()) return;
    setChecklistItems([...checklistItems, newItemInput.trim()]);
    setNewItemInput("");
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  // Links em Nuvem
  const handleAddCloudLink = () => {
    if (!newLinkUrl.trim()) return;
    setCloudLinks([
      ...cloudLinks,
      {
        fileName: newLinkTitle.trim() || newLinkUrl.trim(),
        fileUrl: newLinkUrl.trim(),
        fileType: newLinkProvider,
      },
    ]);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setIsAddingLink(false);
  };

  const handleRemoveCloudLink = (idx: number) => {
    setCloudLinks(cloudLinks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim() || !contactPhone.trim()) {
      alert("Por favor, preencha o título do serviço, nome e telefone de contato.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        columnId: columnId || columns[0]?.id,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || null,
        customerId: selectedClient?.id || null,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        source,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        priority,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
        voltage,
        helperId: helperId || null,
        paintDetails: paintDetails.trim() || null,
        freightDetails: freightDetails.trim() || null,
        tools: selectedTools,
        sendWhatsApp,
        initialChecklist: {
          title: checklistTitle,
          items: checklistItems,
        },
        initialAttachments: cloudLinks,
      };

      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        onSuccess(data.lead?.id);
        onClose();
      } else {
        alert(data.error || "Falha ao criar serviço.");
      }
    } catch (err) {
      console.error("Erro ao criar lead:", err);
      alert("Erro na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const dueStatus = getDueDateStatus(dueDate);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[100vh] sm:max-h-[92vh] bg-[#F8F9FA] dark:bg-[#141519] sm:rounded-3xl border-0 sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO CARD (IDÊNTICO AO VERSO DO CARD TRELLO) */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#18191E] border-b border-black/[0.05] dark:border-white/[0.06] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF650F] border border-orange-500/20 text-[11px] font-mono font-black">
                Novo Serviço
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              {/* Seletor de Coluna */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-500 font-medium">na lista:</span>
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
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

            {/* Título do Card */}
            <div>
              <input
                type="text"
                required
                placeholder="Ex: Fachada em ACM Loja Conceito - Letreiro Luminoso"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg sm:text-xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/60 border border-black/10 dark:border-white/10 px-3.5 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO EM 2 COLUNAS (8 COLUNAS CONTEÚDO PRINCIPAL + 4 COLUNAS LATERAL) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL (8 COLUNAS)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bloco: Categoria & Subcategoria */}
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
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId("");
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
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    disabled={!categoryId}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!categoryId
                        ? "Escolha uma categoria primeiro"
                        : availableSubcategories.length === 0
                        ? "Sem subcategorias cadastradas"
                        : "Selecione a Subcategoria..."}
                    </option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bloco: Dados da Oportunidade & Contato */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF650F]" />
                  <span>Dados da Oportunidade & Contato</span>
                </h3>
              </div>

              {/* Seletor Inteligente de Cliente */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cliente Vinculado (CRM)
                </label>
                <ClientSearchAutocomplete
                  selectedClient={selectedClient}
                  onSelectClient={(client) => {
                    setSelectedClient(client);
                    if (client) {
                      setContactName(client.displayName);
                      setContactPhone(client.whatsapp || client.phone || contactPhone);
                      setContactEmail(client.email || contactEmail);
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
                    placeholder="Responsável da obra / cliente"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(41) 99999-9999"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>
            </div>

            {/* Bloco: Especificações Técnicas de Instalação (Ícthus) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#FF650F]" />
                  <span>Especificações Técnicas de Instalação & Campo</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Voltagem do Local */}
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
                        onClick={() => setVoltage(volt)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          voltage === volt
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
                    value={helperId}
                    onChange={(e) => setHelperId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
                  >
                    <option value="">Nenhum ajudante vinculado</option>
                    {serviceProviders.map((prov) => (
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
                    value={paintDetails}
                    onChange={(e) => setPaintDetails(e.target.value)}
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
                    value={freightDetails}
                    onChange={(e) => setFreightDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Recursos & Ferramentas Necessárias (CRUD Completo) */}
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
                <ResourcesSelector
                  selectedTools={selectedTools}
                  onChange={setSelectedTools}
                />
              </div>
            </div>

            {/* Bloco: Descrição Rica com Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF650F]" />
                  <span>Descrição & Escopo do Trabalho (Texto Formatado)</span>
                </h3>
              </div>
              <RichTextEditor
                value={notes}
                onChange={setNotes}
                placeholder="Insira regras, escopo, medidas, tipos de materiais, instruções da obra e links técnicos..."
                minRows={5}
              />
            </div>

            {/* Bloco: Checklists Iniciais */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#FF650F]" />
                  <input
                    type="text"
                    value={checklistTitle}
                    onChange={(e) => setChecklistTitle(e.target.value)}
                    className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white bg-transparent border-0 focus:outline-none focus:underline"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {checklistItems.length} subtarefas iniciais
                </span>
              </div>

              {/* Lista de Itens */}
              <div className="space-y-1.5">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.03] dark:border-white/[0.04]">
                    <span className="text-xs text-zinc-800 dark:text-zinc-200">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="text-zinc-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar Novo Item */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Adicionar subtarefa de checklist..."
                  value={newItemInput}
                  onChange={(e) => setNewItemInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChecklistItem())}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={handleAddChecklistItem}
                  className="rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Bloco: Anexos Iniciais em Nuvem */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#FF650F]" />
                  <span>Anexos em Nuvem (Google Drive, OneDrive, Dropbox)</span>
                </h3>
                {!isAddingLink && (
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(true)}
                    className="text-[11px] font-bold text-[#FF650F] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Link</span>
                  </button>
                )}
              </div>

              {isAddingLink && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 space-y-2.5">
                  <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-black/20 rounded-lg">
                    {(["GOOGLE_DRIVE", "ONEDRIVE", "DROPBOX", "LINK"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setNewLinkProvider(prov)}
                        className={`py-1 text-[10px] font-bold rounded ${
                          newLinkProvider === prov
                            ? "bg-[#FF650F] text-white shadow-xs"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                        }`}
                      >
                        {prov === "GOOGLE_DRIVE" ? "Drive" : prov === "ONEDRIVE" ? "OneDrive" : prov === "DROPBOX" ? "Dropbox" : "Web"}
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="URL de compartilhamento..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18191E] border text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Título amigável (ex: Pasta de Fotos da Fachada)..."
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18191E] border text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" type="button" onClick={() => setIsAddingLink(false)} className="rounded-lg text-xs">
                      Cancelar
                    </Button>
                    <Button size="sm" type="button" onClick={handleAddCloudLink} className="rounded-lg text-xs bg-[#FF650F] text-white">
                      Anexar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de Links Adicionados */}
              {cloudLinks.length > 0 ? (
                <div className="space-y-1.5">
                  {cloudLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-[#FF650F]">
                          {link.fileType}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {link.fileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCloudLink(idx)}
                        className="text-zinc-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  Nenhum arquivo ou link em nuvem adicionado ainda.
                </p>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUNA DIREITA: DADOS COMERCIAIS & FINANCEIROS (4 COLS)  */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-5">
            {/* Bloco: Dados Comerciais & Financeiros */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                Dados Comerciais & Prazos
              </span>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Valor Estimado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Nível de Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
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
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
                {dueStatus && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${dueStatus.badgeClass}`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{dueStatus.label}</span>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Origem do Contato
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
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

            {/* Switch WhatsApp do Orçamento */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Enviar Orçamento no WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => setSendWhatsApp(!sendWhatsApp)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sendWhatsApp ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      sendWhatsApp ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                Ao salvar, gera o documento em PDF e dispara automaticamente para o cliente.
              </p>
            </div>

            {/* Botões Finais de Ação */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-2xl py-2.5 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-2 rounded-2xl py-2.5 text-xs font-bold shadow-md bg-[#FF650F] hover:bg-[#e0580c] text-white"
              >
                Criar Serviço & Gerar Orçamento
              </Button>
            </div>
          </div>
        </form>

        {/* MODAL SECUNDÁRIO: GERENCIAR CATEGORIAS E SUBCATEGORIAS */}
        <ServiceCategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          onCategoriesChanged={fetchCategories}
        />
      </div>
    </div>
  );
}
