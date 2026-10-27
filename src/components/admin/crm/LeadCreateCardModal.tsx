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
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { RichTextEditor } from "@/components/admin/crm/RichTextEditor";
import { ServiceCategoriesModal, ServiceCategoryData } from "@/components/admin/crm/ServiceCategoriesModal";
import { ResourcesSelector } from "@/components/admin/crm/ResourcesSelector";
import { ServiceMaterialsTable, ServiceMaterialItem } from "@/components/admin/crm/ServiceMaterialsTable";
import { ServiceAttachmentsSection } from "@/components/admin/crm/ServiceAttachmentsSection";
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

  // Materiais & Insumos do Serviço (Estoque)
  const [materials, setMaterials] = useState<ServiceMaterialItem[]>([]);

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

  // Anexos (Arquivos Locais Drag-and-Drop + Links em Nuvem)
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [cloudLinks, setCloudLinks] = useState<{ fileName: string; fileUrl: string; fileType: string }[]>([]);

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
    setMaterials([]);
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
    setLocalFiles([]);
    setCloudLinks([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContactName = selectedClient
      ? (selectedClient.displayName || selectedClient.tradeName || selectedClient.fullName || contactName).trim()
      : contactName.trim();
    const finalContactPhone = selectedClient
      ? (selectedClient.whatsapp || selectedClient.phone || contactPhone).trim()
      : contactPhone.trim();
    const finalContactEmail = selectedClient
      ? (selectedClient.email || contactEmail || null)
      : (contactEmail.trim() || null);

    if (!title.trim() || !finalContactName || !finalContactPhone) {
      alert("Por favor, informe o título do serviço e certifique-se de que o cliente selecionado ou contato possui nome e telefone.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        columnId: columnId || columns[0]?.id,
        contactName: finalContactName,
        contactPhone: finalContactPhone,
        contactEmail: finalContactEmail,
        customerId: selectedClient?.id || null,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        materials,
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
      if (data.success && data.lead) {
        // Se houver arquivos locais selecionados via drag-and-drop, envia para a API do lead criado
        if (localFiles.length > 0) {
          try {
            const formData = new FormData();
            localFiles.forEach((file) => formData.append("files", file));
            formData.append("userName", "Equipe Icthus");
            await fetch(`/api/v1/crm/leads/${data.lead.id}/attachments`, {
              method: "POST",
              body: formData,
            });
          } catch (uploadErr) {
            console.warn("Aviso ao fazer upload de arquivos anexados:", uploadErr);
          }
        }

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

            {/* Título do Cartão em Destaque */}
            <input
              type="text"
              required
              placeholder="Nome do Serviço (ex: Fachada Loja Principal ACM + Letras Caixa LED)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg sm:text-xl font-black bg-transparent border-b-2 border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-[#FF650F] text-zinc-900 dark:text-white focus:outline-none transition-colors px-1 py-0.5 placeholder:text-zinc-400 font-sans"
            />
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

            {/* BLOCO 1: DADOS DA OPORTUNIDADE & CONTATO (PRIMEIRO BLOCO APÓS O TÍTULO) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF650F]" />
                  <span>Dados da Oportunidade & Contato</span>
                </h3>
              </div>

              {/* Seletor Inteligente de Cliente */}
              <div>
                <ClientSearchAutocomplete
                  selectedClient={selectedClient}
                  onSelectClient={(client) => {
                    setSelectedClient(client);
                    if (client) {
                      setContactName(client.displayName);
                      if (client.whatsapp || client.phone) {
                        setContactPhone(client.whatsapp || client.phone || "");
                      }
                      if (client.email) {
                        setContactEmail(client.email);
                      }
                    }
                  }}
                />
              </div>

              {/* Se NÃO houver cliente selecionado (Lead Avulso), exibe inputs manuais de contato */}
              {!selectedClient ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      required={!selectedClient}
                      placeholder="Nome do responsável"
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
                      required={!selectedClient}
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
                      placeholder="email@cliente.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
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
            </div>

            {/* BLOCO 2: CATEGORIA & SUBCATEGORIA (LOGO ABAIXO DE DADOS DA OPORTUNIDADE & CONTATO) */}
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

            {/* BLOCO 3: MATERIAIS & INSUMOS DO SERVIÇO (ACIMA DE ESPECIFICAÇÕES TÉCNICAS) */}
            <ServiceMaterialsTable
              materials={materials}
              onChange={setMaterials}
            />

            {/* BLOCO 4: ESPECIFICAÇÕES TÉCNICAS DE INSTALAÇÃO & CAMPO (ÍCTHUS) */}
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

            {/* BLOCO 5: DESCRIÇÃO RICA COM TOOLBAR */}
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

            {/* BLOCO 6: CHECKLIST INICIAL ESTILO TRELLO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#FF650F]" />
                  <span>Checklist Inicial</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {checklistItems.length} {checklistItems.length === 1 ? "item" : "itens"}
                </span>
              </div>

              <input
                type="text"
                value={checklistTitle}
                onChange={(e) => setChecklistTitle(e.target.value)}
                placeholder="Título da Checklist"
                className="w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />

              <div className="space-y-1.5">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.03] dark:border-white/[0.04] text-xs"
                  >
                    <span className="text-zinc-800 dark:text-zinc-200">{item}</span>
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Novo item na checklist..."
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

            {/* BLOCO 7: ANEXOS (ARQUIVOS LOCAIS COM DRAG-AND-DROP + LINKS EM NUVEM) */}
            <ServiceAttachmentsSection
              localFiles={localFiles}
              onLocalFilesChange={setLocalFiles}
              cloudLinks={cloudLinks}
              onCloudLinksChange={setCloudLinks}
            />

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
                <p className="text-[10px] text-zinc-400 mt-1">
                  * Este é o valor oficial que constará no Documento de Orçamento.
                </p>
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
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1 flex items-center justify-between">
                  <span>Data de Entrega / Prazo</span>
                  {dueStatus && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${dueStatus.badgeClass}`}>
                      {dueStatus.label}
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Chave Switch: Enviar Orçamento por WhatsApp */}
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center h-5 rounded-full w-9 shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={sendWhatsApp}
                      onChange={(e) => setSendWhatsApp(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF650F]" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      Enviar Orçamento via WhatsApp
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Dispara automaticamente o PDF do orçamento pelo WhatsApp para o número cadastrado.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-2xl bg-[#FF650F] hover:bg-[#e0580c] text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <span>Criando Serviço...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Criar Serviço</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full h-10 rounded-2xl border-black/10 dark:border-white/10 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Gestão de Categorias */}
      {isCategoriesModalOpen && (
        <ServiceCategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          onCategoriesChanged={() => {
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
