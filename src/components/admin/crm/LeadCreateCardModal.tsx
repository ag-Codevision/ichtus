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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { RichTextEditor } from "@/components/admin/crm/RichTextEditor";

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
  const [estimatedValue, setEstimatedValue] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  // Cliente Vinculado
  const [selectedClient, setSelectedClient] = useState<SearchedClient | null>(null);

  // Especificações Técnicas de Campo
  const [voltage, setVoltage] = useState("110V");
  const [helperId, setHelperId] = useState("");
  const [paintDetails, setPaintDetails] = useState("");
  const [freightDetails, setFreightDetails] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Checklists Iniciais
  const [checklistTitle, setChecklistTitle] = useState("Etapas de Início");
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

  // Atualiza a coluna padrão ao abrir
  useEffect(() => {
    if (isOpen) {
      if (initialColumnId) {
        setColumnId(initialColumnId);
      } else if (columns.length > 0 && !columnId) {
        setColumnId(columns[0].id);
      }
    }
  }, [isOpen, initialColumnId, columns]);

  if (!isOpen) return null;

  // Ferramentas predefinidas
  const availableTools = [
    "Escada 7 Degraus",
    "Andaime Tubular",
    "Furadeira / Parafusadeira",
    "Fitas Dupla Face 3M",
    "Extensão 50m",
    "Soprador Térmico",
    "Nível Laser",
  ];

  const handleToggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

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
    const safeTitle = newLinkTitle.trim() || newLinkUrl.trim();
    setCloudLinks([
      ...cloudLinks,
      {
        fileName: safeTitle,
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

  // Submissão do Formulário Trello
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim() || !contactPhone.trim()) {
      alert("Por favor, preencha o título do projeto, nome e telefone de contato.");
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
        initialChecklist: checklistItems.length > 0 ? {
          title: checklistTitle.trim() || "Etapas Iniciais",
          items: checklistItems,
        } : null,
        initialAttachments: cloudLinks,
      };

      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.lead) {
        onSuccess(data.lead.id);
        onClose();
      } else {
        alert(data.error || "Erro ao criar serviço no funil.");
      }
    } catch {
      alert("Falha na comunicação com o servidor ao cadastrar serviço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[100vh] sm:max-h-[92vh] bg-[#F8F9FA] dark:bg-[#141519] sm:rounded-3xl border-0 sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Cartão de Criação */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#18191E] border-b border-black/[0.05] dark:border-white/[0.06] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Novo Serviço • Cartão do Funil
              </span>
            </div>

            {/* Input de Título estilo Trello em Destaque */}
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Fachada ACM Loja Conceito + Letreiro LED..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-black/10 focus:border-[#FF650F] transition-colors w-full focus:outline-none placeholder:text-zinc-400"
            />

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium">na lista:</span>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="bg-zinc-100 dark:bg-white/[0.06] text-zinc-900 dark:text-white font-bold text-xs py-1 px-2.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id} className="dark:bg-[#18191E]">
                    {col.name}
                  </option>
                ))}
              </select>
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

        {/* Corpo em 2 Colunas estilo Trello */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL (8 COLUNAS)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bloco: Cliente Vinculado (CRM) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF650F]" />
                <span>Cliente Vinculado (CRM) *</span>
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
              <p className="text-[11px] text-zinc-500">
                Selecione um cliente cadastrado ou digite os dados de contato do lead na coluna lateral.
              </p>
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

            {/* Bloco: Checklists Iniciais com Barra de Progresso */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
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
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF650F]" />
                      <span className="text-xs text-zinc-800 dark:text-zinc-200">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="text-zinc-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input para Adicionar Subtarefa */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar subtarefa na lista..."
                  value={newItemInput}
                  onChange={(e) => setNewItemInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChecklistItem())}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  className="rounded-xl text-xs font-bold py-1 h-8"
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Bloco: Anexos e Links em Nuvem (Google Drive, OneDrive, Dropbox) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#FF650F]" />
                  <span>Anexos & Links de Nuvem ({cloudLinks.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                  className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular Link em Nuvem</span>
                </button>
              </div>

              {/* Formulário de Adicionar Link */}
              {isAddingLink && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 space-y-3 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase block">
                    Selecione o Provedor do Link
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "GOOGLE_DRIVE", label: "Google Drive", color: "text-emerald-600 bg-emerald-500/10" },
                      { id: "ONEDRIVE", label: "OneDrive / SharePoint", color: "text-blue-600 bg-blue-500/10" },
                      { id: "DROPBOX", label: "Dropbox", color: "text-indigo-600 bg-indigo-500/10" },
                      { id: "LINK", label: "Link Geral (Figma, Canva)", color: "text-zinc-600 bg-zinc-500/10" },
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setNewLinkProvider(prov.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                          newLinkProvider === prov.id
                            ? "border-[#FF650F] bg-orange-500/15 text-[#FF650F]"
                            : "border-black/5 dark:border-white/5 bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {prov.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="url"
                      placeholder="Cole a URL (https://drive.google.com/...)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Título ou descrição (ex: Pasta de Fotos do Local)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingLink(false)}
                      className="text-xs rounded-xl"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCloudLink}
                      className="text-xs rounded-xl font-bold"
                    >
                      Salvar Link
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
          {/* COLUNA DIREITA: DADOS COMERCIAIS & TÉCNICOS (4 COLUNAS)  */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-5">
            {/* Bloco: Dados de Contato */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Contato da Oportunidade
              </span>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Nome do Contato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do responsável"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
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
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>

            {/* Bloco: Valores & Prazo */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Planejamento & Prazos
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Data de Entrega (Prazo)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>

            {/* Bloco: Especificações Técnicas de Instalação (Ícthus) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Especificações Técnicas de Campo
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Voltagem
                  </label>
                  <select
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="110V">110V</option>
                    <option value="220V">220V</option>
                    <option value="Bivolt">Bivolt</option>
                    <option value="Sem elétrica">Sem elétrica</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Ajudante
                  </label>
                  <select
                    value={helperId}
                    onChange={(e) => setHelperId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="">Nenhum</option>
                    {serviceProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.tradeName || p.fullName || p.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Especificação de Tinta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Esmalte sintético preto fosco"
                  value={paintDetails}
                  onChange={(e) => setPaintDetails(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Frete / Logística
                </label>
                <input
                  type="text"
                  placeholder="Ex: Frete próprio Curitiba"
                  value={freightDetails}
                  onChange={(e) => setFreightDetails(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              {/* Badges de Ferramentas */}
              <div>
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                  Recursos Necessários
                </span>
                <div className="flex flex-wrap gap-1">
                  {availableTools.map((t) => {
                    const isSelected = selectedTools.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTool(t)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                          isSelected
                            ? "bg-[#FF650F] text-white border-[#FF650F]"
                            : "bg-zinc-50 dark:bg-[#121316] text-zinc-600 dark:text-zinc-400 border-black/5 dark:border-white/5"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Switch de Disparo via WhatsApp */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Enviar Orçamento via WhatsApp
                </span>
                <p className="text-[10px] text-zinc-500">
                  Dispara o PDF oficial com logo e código [3000...] após salvar.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sendWhatsApp}
                onClick={() => setSendWhatsApp(!sendWhatsApp)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sendWhatsApp ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    sendWhatsApp ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Botões de Ação Final */}
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
                className="flex-2 rounded-2xl py-2.5 text-xs font-bold shadow-md"
              >
                Criar Serviço & Gerar Orçamento
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
