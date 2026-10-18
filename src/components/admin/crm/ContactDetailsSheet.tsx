"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Layers,
  DollarSign,
  Package,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Wrench,
  Briefcase,
  User,
  Trash2,
  KeyRound,
  ShieldCheck,
  Loader2,
  Power,
  Send,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContactDetailsSheetProps {
  contactId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: any) => void;
  onContactDeleted?: () => void;
}

export function ContactDetailsSheet({
  contactId,
  isOpen,
  onClose,
  onEdit,
  onContactDeleted,
}: ContactDetailsSheetProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ORDERS" | "FINANCE" | "LEADS" | "STOCK" | "SCHEDULE">("OVERVIEW");
  const [copiedKey, setCopiedKey] = useState(false);

  // Estados de Gerenciamento do Acesso ao Portal (Icthus)
  const [isTogglingAccess, setIsTogglingAccess] = useState(false);
  const [isResendingCreds, setIsResendingCreds] = useState(false);
  const [accessFeedback, setAccessFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Estados de Exclusão do Contato
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (contactId && isOpen) {
      setIsLoading(true);
      setAccessFeedback(null);
      setIsConfirmingDelete(false);
      fetch(`/api/v1/crm/contacts/${contactId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setData(json.contact);
        })
        .catch((err) => console.error("Erro ao carregar contato:", err))
        .finally(() => setIsLoading(false));
    } else {
      setData(null);
      setAccessFeedback(null);
      setIsConfirmingDelete(false);
    }
  }, [contactId, isOpen]);

  const handleToggleAccess = async () => {
    if (!data?.id) return;
    setIsTogglingAccess(true);
    setAccessFeedback(null);
    try {
      const currentActive = Boolean(data.user?.isActive);
      const nextActive = !currentActive;

      const res = await fetch(`/api/v1/crm/contacts/${data.id}/toggle-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          user: {
            ...(prev?.user || {}),
            isActive: json.isActive,
            email: json.user?.email || prev?.email,
          },
        }));
        setAccessFeedback({
          type: "success",
          text: json.message || (nextActive ? "Acesso ativado e credenciais enviadas via WhatsApp!" : "Acesso ao portal desativado."),
        });
      } else {
        setAccessFeedback({
          type: "error",
          text: json.error || "Não foi possível alterar o status de acesso.",
        });
      }
    } catch {
      setAccessFeedback({ type: "error", text: "Erro ao comunicar com o servidor." });
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!data?.id) return;
    setIsResendingCreds(true);
    setAccessFeedback(null);
    try {
      const res = await fetch(`/api/v1/crm/contacts/${data.id}/toggle-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resendOnly: true }),
      });
      const json = await res.json();
      if (json.success) {
        setAccessFeedback({
          type: "success",
          text: "Credenciais de acesso da Icthus enviadas com sucesso via WhatsApp!",
        });
      } else {
        setAccessFeedback({
          type: "error",
          text: json.error || "Falha ao enviar credenciais.",
        });
      }
    } catch {
      setAccessFeedback({ type: "error", text: "Erro ao comunicar com o servidor." });
    } finally {
      setIsResendingCreds(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!data?.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/crm/contacts/${data.id}?force=true`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setIsConfirmingDelete(false);
        onClose();
        if (onContactDeleted) onContactDeleted();
      } else {
        alert(json.error || "Falha ao excluir o contato.");
      }
    } catch {
      alert("Erro ao comunicar com o servidor ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const contact = data;
  const displayName = contact?.tradeName || contact?.fullName || contact?.companyName || "Carregando...";
  const initial = displayName.trim().charAt(0).toUpperCase();

  const rawWpp = contact?.whatsapp?.replace(/\D/g, "");
  const wppUrl = rawWpp ? `https://wa.me/${rawWpp.startsWith("55") ? rawWpp : `55${rawWpp}`}` : null;
  const phoneUrl = contact?.phone ? `tel:${contact.phone.replace(/\D/g, "")}` : null;
  const emailUrl = contact?.email ? `mailto:${contact.email}` : null;

  const handleCopyPix = () => {
    if (contact?.pixKey) {
      navigator.clipboard.writeText(contact.pixKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const typeConfig = {
    CUSTOMER: { label: "Cliente", icon: Briefcase, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    SUPPLIER: { label: "Fornecedor de Insumos", icon: Truck, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    SERVICE_PROVIDER: { label: "Prestador de Serviços", icon: Wrench, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  };

  const currentType = contact?.type ? typeConfig[contact.type as keyof typeof typeConfig] : typeConfig.CUSTOMER;
  const TypeIcon = currentType?.icon || User;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container Principal: Bottom Sheet no Mobile / Modal Centralizado no Desktop */}
      <div
        className="w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-[#18191E] rounded-t-[32px] sm:rounded-3xl border-t sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar do Google Bottom Sheet (visível no mobile) */}
        <div className="w-full flex flex-col items-center pt-2 sm:hidden shrink-0">
          <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Top Bar com Botão Fechar e Editar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Ficha 360º do Contato
          </span>
          <div className="flex items-center gap-2">
            {contact && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="gap-1.5 text-xs rounded-full h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(contact)}
                  className="gap-1.5 text-xs rounded-full h-8 px-3"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal / Diálogo de Confirmação de Exclusão */}
        {isConfirmingDelete && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-xs text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Deseja realmente remover este contato do sistema? Caso possua histórico, ele será arquivado com segurança.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="text-xs rounded-full h-7 px-3"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteContact}
                disabled={isDeleting}
                className="text-xs rounded-full h-7 px-4 bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#FF650F] border-t-transparent animate-spin" />
              <p className="text-xs text-zinc-500">Carregando perfil completo...</p>
            </div>
          ) : contact ? (
            <div className="flex flex-col">
              {/* Header Visual Estilo Google Contatos */}
              <div className="px-6 pt-5 pb-4 flex flex-col items-center text-center bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="w-20 h-20 rounded-full flex items-center justify-center font-extrabold text-3xl bg-gradient-to-br from-orange-400 to-[#FF650F] text-white shadow-md mb-3 border-4 border-white dark:border-[#18191E]">
                  {initial}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {displayName}
                </h2>
                {contact.companyName && contact.companyName !== displayName && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {contact.companyName}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${currentType?.color}`}>
                    <TypeIcon className="w-3.5 h-3.5" />
                    {currentType?.label}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300">
                    {contact.personType === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                  </span>
                  {contact.documentNumber && (
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300">
                      Doc: {contact.documentNumber}
                    </span>
                  )}
                </div>

                {/* Botões de Ação Rápida em Pílula (Google Action Pills) */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
                  {wppUrl && (
                    <a
                      href={wppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                      WhatsApp
                    </a>
                  )}
                  {phoneUrl && (
                    <a
                      href={phoneUrl}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Ligar
                    </a>
                  )}
                  {emailUrl && (
                    <a
                      href={emailUrl}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 active:scale-95 transition-all shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      E-mail
                    </a>
                  )}
                  {contact.pixKey && (
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 active:scale-95 transition-all shadow-sm"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copiedKey ? "Chave Copiada!" : "Copiar PIX"}
                    </button>
                  )}
                </div>
              </div>

              {/* Abas Deslizáveis estilo Google M3 Tabs */}
              <div className="w-full border-y border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] px-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 min-w-max py-2">
                  <button
                    onClick={() => setActiveTab("OVERVIEW")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === "OVERVIEW"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    onClick={() => setActiveTab("ORDERS")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "ORDERS"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>Ordens de Serviço</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {contact.serviceOrders?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("FINANCE")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "FINANCE"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>Financeiro</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {contact.invoices?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("LEADS")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "LEADS"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>Funil / Leads</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {contact.leads?.length || 0}
                    </span>
                  </button>
                  {contact.type === "SUPPLIER" && (
                    <button
                      onClick={() => setActiveTab("STOCK")}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeTab === "STOCK"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>Insumos Fornecidos</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                        {contact.stockItems?.length || 0}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("SCHEDULE")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "SCHEDULE"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>Agendamentos</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {contact.appointments?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Corpo da Aba Selecionada */}
              <div className="p-5 sm:p-6 space-y-4">
                {activeTab === "OVERVIEW" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bloco Destaque: Acesso à Plataforma do Cliente (Icthus) com Switcher M3 */}
                    <div className="col-span-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-500/[0.04] via-orange-500/[0.02] to-transparent dark:from-orange-500/[0.08] dark:to-transparent border border-orange-500/20 shadow-sm space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                Acesso ao Portal do Cliente (Icthus)
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  contact.user?.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                                }`}
                              >
                                {contact.user?.isActive ? "Ativado • Acesso Liberado" : "Desligado • Acesso Bloqueado"}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              O cliente só pode acessar o portal quando esta chave estiver ligada.
                            </p>
                          </div>
                        </div>

                        {/* Switcher M3 com toggle elegante */}
                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                            {contact.user?.isActive ? "Ligado" : "Desligado"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(contact.user?.isActive)}
                            disabled={isTogglingAccess || !contact.email}
                            onClick={handleToggleAccess}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                              contact.user?.isActive ? "bg-[#FF650F]" : "bg-zinc-300 dark:bg-zinc-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                contact.user?.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            >
                              {isTogglingAccess ? (
                                <Loader2 className="w-3 h-3 text-[#FF650F] animate-spin" />
                              ) : (
                                <Power className={`w-3 h-3 ${contact.user?.isActive ? "text-[#FF650F]" : "text-zinc-400"}`} />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Informações de Credenciais e Ações Rápidas */}
                      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Login de Acesso</span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-white truncate block">
                            {contact.email || "Sem e-mail cadastrado"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Senha Inicial Padrão</span>
                          <span className="font-mono font-semibold text-[#FF650F] block">
                            Icthus@123
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isResendingCreds || !contact.email}
                            onClick={handleResendCredentials}
                            className="w-full text-xs font-semibold rounded-xl gap-1.5 h-10 border-orange-500/20 text-[#FF650F] hover:bg-orange-500/10"
                          >
                            {isResendingCreds ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Reenviar Credenciais WhatsApp
                          </Button>
                        </div>
                      </div>

                      {/* Feedback Toast / Notificação de Ação */}
                      {accessFeedback && (
                        <div
                          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                            accessFeedback.type === "success"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {accessFeedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                          )}
                          <span>{accessFeedback.text}</span>
                        </div>
                      )}

                      {!contact.email && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Cadastre um e-mail para este contato para liberar o perfil de acesso ao Portal do Cliente.</span>
                        </div>
                      )}
                    </div>
                    {/* Bloco 1: Contato e Comunicação */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Contato & Comunicação
                      </h4>
                      <div className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                        <p><span className="font-semibold text-zinc-500">Responsável:</span> {contact.contactPerson || "Não informado"} {contact.contactRole ? `(${contact.contactRole})` : ""}</p>
                        <p><span className="font-semibold text-zinc-500">WhatsApp:</span> {contact.whatsapp || "Não informado"}</p>
                        <p><span className="font-semibold text-zinc-500">Telefone:</span> {contact.phone || "Não informado"}</p>
                        <p><span className="font-semibold text-zinc-500">E-mail:</span> {contact.email || "Não informado"}</p>
                        {contact.financialEmail && (
                          <p><span className="font-semibold text-zinc-500">E-mail Financeiro/NFe:</span> {contact.financialEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Bloco 2: Endereço & Localização */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Endereço & Ponto de Referência
                      </h4>
                      <div className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                        <p>
                          {contact.street ? `${contact.street}, ${contact.number || "S/N"}` : "Endereço não cadastrado"}
                          {contact.complement ? ` - ${contact.complement}` : ""}
                        </p>
                        <p>{contact.neighborhood ? `${contact.neighborhood} • ` : ""}{contact.city ? `${contact.city}/${contact.state}` : ""}</p>
                        <p><span className="font-semibold text-zinc-500">CEP:</span> {contact.zipCode || "Não informado"}</p>
                        {contact.referencePoint && (
                          <p className="p-2 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 text-[11px] font-medium mt-1">
                            📍 Ref: {contact.referencePoint}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bloco 3: Dados Bancários & Condições Comerciais */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Financeiro & Pagamento
                      </h4>
                      <div className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                        <p><span className="font-semibold text-zinc-500">Condição Padrão:</span> {contact.paymentTerms || "Padrão da empresa"}</p>
                        {contact.creditLimit && (
                          <p><span className="font-semibold text-zinc-500">Limite de Crédito:</span> {formatCurrency(Number(contact.creditLimit))}</p>
                        )}
                        <p><span className="font-semibold text-zinc-500">Chave PIX:</span> {contact.pixKey ? `${contact.pixKey} (${contact.pixKeyType || "PIX"})` : "Não cadastrada"}</p>
                        {contact.bankName && (
                          <p><span className="font-semibold text-zinc-500">Banco:</span> {contact.bankName} • Ag: {contact.bankAgency || "-"} • CC: {contact.bankAccount || "-"}</p>
                        )}
                      </div>
                    </div>

                    {/* Bloco 4: Notas e Observações */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        Observações Internas
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                        {contact.notes || "Nenhuma observação interna cadastrada."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "ORDERS" && (
                  <div className="space-y-3">
                    {contact.serviceOrders?.length > 0 ? (
                      contact.serviceOrders.map((os: any) => (
                        <div
                          key={os.id}
                          className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-glessios-orange">{os.code}</span>
                              <span className="font-semibold text-zinc-900 dark:text-white">{os.title}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Fase atual: <span className="font-medium text-zinc-700 dark:text-zinc-300">{os.currentStage}</span> • Criada em {formatDate(os.createdAt)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                              {formatCurrency(Number(os.totalAmount))}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-6">Nenhuma Ordem de Serviço registrada para este contato.</p>
                    )}
                  </div>
                )}

                {activeTab === "FINANCE" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-center text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Faturado</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">{formatCurrency(contact.kpis?.totalInvoiced || 0)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Liquidado</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(contact.kpis?.totalPaid || 0)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Pendente</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatCurrency(contact.kpis?.totalPending || 0)}</span>
                      </div>
                    </div>

                    {contact.invoices?.length > 0 ? (
                      contact.invoices.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{inv.code}</span>
                            <p className="text-[11px] text-zinc-500">Vencimento: {formatDate(inv.dueDate)}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                              {formatCurrency(Number(inv.amount))}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              inv.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-4">Nenhuma fatura registrada.</p>
                    )}
                  </div>
                )}

                {activeTab === "LEADS" && (
                  <div className="space-y-3">
                    {contact.leads?.length > 0 ? (
                      contact.leads.map((lead: any) => (
                        <div
                          key={lead.id}
                          className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{lead.title}</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Etapa: <span className="font-semibold text-glessios-orange">{lead.column?.name || "Kanban"}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white">
                              {lead.estimatedValue ? formatCurrency(Number(lead.estimatedValue)) : "A calcular"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-6">Nenhuma oportunidade registrada no funil.</p>
                    )}
                  </div>
                )}

                {activeTab === "STOCK" && (
                  <div className="space-y-3">
                    {contact.stockItems?.length > 0 ? (
                      contact.stockItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{item.name}</span>
                            <p className="text-[11px] text-zinc-500 font-mono">SKU: {item.sku} • {item.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                              {Number(item.currentQuantity)} {item.unit}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Custo Médio: {formatCurrency(Number(item.averageUnitCost))}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-6">Nenhum material de estoque vinculado a este fornecedor.</p>
                    )}
                  </div>
                )}

                {activeTab === "SCHEDULE" && (
                  <div className="space-y-3">
                    {contact.appointments?.length > 0 ? (
                      contact.appointments.map((app: any) => (
                        <div
                          key={app.id}
                          className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{app.title}</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {app.type} • {formatDate(app.scheduledAt)} ({app.durationMinutes} min)
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-6">Nenhum agendamento vinculado.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
