"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Truck,
  Wrench,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  UserCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null;
}

const ROLE_SUGGESTIONS = [
  "Secretária",
  "Indicação",
  "Proprietário(a)",
  "Arquiteto(a)",
  "Gerente de Compras",
  "Recepção",
  "Diretor(a)",
];

export function ContactFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ContactFormModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    type: "CUSTOMER",
    personType: "PJ",
    status: "ACTIVE",
    companyName: "",
    tradeName: "",
    fullName: "",
    documentNumber: "",
    stateRegistration: "",
    municipalRegistration: "",
    rg: "",
    // Interlocutor / Quem estou falando
    contactPerson: "",
    contactRole: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    contactPersonNotes: "",
    leadChannel: "",
    leadChannelDetails: "",
    // Contatos da Empresa
    phone: "",
    whatsapp: "",
    email: "",
    financialEmail: "",
    // Endereço
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    referencePoint: "",
    // Financeiro
    creditLimit: "",
    paymentTerms: "",
    pixKeyType: "CNPJ",
    pixKey: "",
    bankName: "",
    bankAgency: "",
    bankAccount: "",
    notes: "",
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "CUSTOMER",
        personType: initialData.personType || "PJ",
        status: initialData.status || "ACTIVE",
        companyName: initialData.companyName || "",
        tradeName: initialData.tradeName || "",
        fullName: initialData.fullName || "",
        documentNumber: initialData.documentNumber || "",
        stateRegistration: initialData.stateRegistration || "",
        municipalRegistration: initialData.municipalRegistration || "",
        rg: initialData.rg || "",
        contactPerson: initialData.contactPerson || "",
        contactRole: initialData.contactRole || "",
        contactPersonPhone: initialData.contactPersonPhone || "",
        contactPersonEmail: initialData.contactPersonEmail || "",
        contactPersonNotes: initialData.contactPersonNotes || "",
        leadChannel: initialData.leadChannel || "",
        leadChannelDetails: initialData.leadChannelDetails || "",
        phone: initialData.phone || "",
        whatsapp: initialData.whatsapp || "",
        email: initialData.email || "",
        financialEmail: initialData.financialEmail || "",
        zipCode: initialData.zipCode || "",
        street: initialData.street || "",
        number: initialData.number || "",
        complement: initialData.complement || "",
        neighborhood: initialData.neighborhood || "",
        city: initialData.city || "",
        state: initialData.state || "",
        referencePoint: initialData.referencePoint || "",
        creditLimit: initialData.creditLimit ? String(initialData.creditLimit) : "",
        paymentTerms: initialData.paymentTerms || "",
        pixKeyType: initialData.pixKeyType || "CNPJ",
        pixKey: initialData.pixKey || "",
        bankName: initialData.bankName || "",
        bankAgency: initialData.bankAgency || "",
        bankAccount: initialData.bankAccount || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        type: "CUSTOMER",
        personType: "PJ",
        status: "ACTIVE",
        companyName: "",
        tradeName: "",
        fullName: "",
        documentNumber: "",
        stateRegistration: "",
        municipalRegistration: "",
        rg: "",
        contactPerson: "",
        contactRole: "",
        contactPersonPhone: "",
        contactPersonEmail: "",
        contactPersonNotes: "",
        leadChannel: "",
        leadChannelDetails: "",
        phone: "",
        whatsapp: "",
        email: "",
        financialEmail: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        referencePoint: "",
        creditLimit: "",
        paymentTerms: "",
        pixKeyType: "CNPJ",
        pixKey: "",
        bankName: "",
        bankAgency: "",
        bankAccount: "",
        notes: "",
      });
    }
    setErrorMessage("");
  }, [initialData, isOpen]);

  // Consulta automática de CEP via ViaCEP / BrasilAPI
  const handleCepBlur = async () => {
    const rawCep = formData.zipCode.replace(/\D/g, "");
    if (rawCep.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const cepData = await res.json();
        if (!cepData.erro) {
          setFormData((prev) => ({
            ...prev,
            street: cepData.logradouro || prev.street,
            neighborhood: cepData.bairro || prev.neighborhood,
            city: cepData.localidade || prev.city,
            state: cepData.uf || prev.state,
          }));
        }
      } catch (err) {
        console.error("Falha ao consultar CEP:", err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const url = isEditing
        ? `/api/v1/crm/contacts/${initialData.id}`
        : "/api/v1/crm/contacts";
      const method = isEditing ? "PUT" : "POST";

      // Assegura que se o usuário preencheu o celular do interlocutor mas não preencheu o WhatsApp da empresa, ele seja aproveitado
      const payload = {
        ...formData,
        whatsapp: formData.whatsapp?.trim() || formData.contactPersonPhone?.trim() || "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(data.error || "Ocorreu um erro ao salvar o contato.");
      }
    } catch {
      setErrorMessage("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-[#18191E] rounded-t-[32px] sm:rounded-3xl border-t sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar para Mobile Bottom Sheet */}
        <div className="w-full flex flex-col items-center pt-2 sm:hidden shrink-0">
          <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header do Formulário */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
              {isEditing ? "Edição Cadastral" : "Novo Cadastro no CRM"}
            </span>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              {isEditing ? "Editar Registro" : "Adicionar Contato ou Parceiro"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seletor de Tipo de Cadastro estilo Material You */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Tipo de Cadastro
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: "CUSTOMER" }))}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all border ${
                  formData.type === "CUSTOMER"
                    ? "bg-[#FF650F] text-white border-[#FF650F] shadow-sm"
                    : "bg-black/[0.02] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.05]"
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: "SUPPLIER" }))}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all border ${
                  formData.type === "SUPPLIER"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-black/[0.02] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.05]"
                }`}
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span>Fornecedor</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: "SERVICE_PROVIDER" }))}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all border ${
                  formData.type === "SERVICE_PROVIDER"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-black/[0.02] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.05]"
                }`}
              >
                <Wrench className="w-4 h-4 shrink-0" />
                <span>Prestador</span>
              </button>
            </div>
          </div>

          {/* Alternador Pessoa Jurídica vs Pessoa Física */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Natureza do Contato
            </label>
            <div className="inline-flex rounded-full p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, personType: "PJ" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  formData.personType === "PJ"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Pessoa Jurídica (PJ)
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, personType: "PF" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  formData.personType === "PF"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Pessoa Física (PF)
              </button>
            </div>
          </div>

          {/* Dados de Identificação */}
          <div className="p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FF650F]" />
              Identificação & Documentação
            </h4>

            {formData.personType === "PJ" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome Fantasia / Nome Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Ex: Clínica Odonto Vida, Construtora Batel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ex: Odonto Vida Serviços Odontológicos Ltda"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Inscrição Estadual (IE)
                  </label>
                  <input
                    type="text"
                    value={formData.stateRegistration}
                    onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                    placeholder="Isento ou número da IE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    placeholder="Número do RG"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO DEDICADA: INTERLOCUTOR / COM QUEM ESTOU CONVERSANDO                  */}
          {/* ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-orange-500/[0.05] via-orange-500/[0.02] to-transparent border-2 border-orange-500/25 dark:border-orange-500/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-500/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-[#FF650F] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Com Quem Estou Conversando? (Interlocutor Direto)
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF650F] border border-orange-500/20">
                      Atendimento
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Dados da pessoa física em contato com você (ex: secretária da clínica, quem indicou, arquiteta ou comprador).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome da Pessoa de Contato
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ex: Patrícia (Secretária), Dra. Camila, Carlos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-orange-500/20 focus:border-[#FF650F] text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Relação com a Empresa / Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.contactRole}
                    onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                    placeholder="Ex: Secretária da Clínica, Quem fez a indicação, Arquiteta..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-orange-500/20 focus:border-[#FF650F] text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sugestões rápidas de relação / cargo */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                  Atalhos:
                </span>
                {ROLE_SUGGESTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, contactRole: role }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      formData.contactRole === role
                        ? "bg-[#FF650F] text-white shadow-xs"
                        : "bg-white/80 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    WhatsApp / Celular Direto do Interlocutor
                  </label>
                  <input
                    type="text"
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    placeholder="5541999999999 (Celular direto)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-orange-500/20 focus:border-[#FF650F] text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    E-mail Direto do Interlocutor
                  </label>
                  <input
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                    placeholder="patricia.secretaria@clinica.com.br"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-orange-500/20 focus:border-[#FF650F] text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Anotações da Conversa & Contexto da Indicação
                </label>
                <textarea
                  rows={2}
                  value={formData.contactPersonNotes}
                  onChange={(e) => setFormData({ ...formData, contactPersonNotes: e.target.value })}
                  placeholder="Ex: Veio por indicação do Dr. Roberto; foi quem pediu o orçamento da fachada; prefere ser contatada pelo WhatsApp à tarde..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-orange-500/20 focus:border-[#FF650F] text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          
          {/* Seletor de Origem do Lead / Canal de Aquisição */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/[0.04] to-indigo-500/[0.08] dark:from-blue-500/[0.06] dark:to-indigo-500/[0.12] border border-blue-500/20 dark:border-blue-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Origem do Lead / Canal de Aquisição
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Marketing & CRM
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    De onde este contato conheceu a empresa ou como chegou até nós.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
              {[
                { id: "INDICATION", label: "Indicação", icon: "🤝" },
                { id: "GOOGLE", label: "Google", icon: "🔍" },
                { id: "INSTAGRAM", label: "Instagram", icon: "📸" },
                { id: "FACEBOOK", label: "Facebook", icon: "📘" },
                { id: "WHATSAPP", label: "WhatsApp", icon: "💬" },
                { id: "OTHER", label: "Outro", icon: "🌐" },
              ].map((channel) => {
                const isSelected = formData.leadChannel === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({
                        ...prev,
                        leadChannel: isSelected ? "" : channel.id,
                        leadChannelDetails: isSelected ? "" : prev.leadChannelDetails,
                      }));
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30"
                        : "bg-white dark:bg-[#121316] text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:border-blue-500/40"
                    }`}
                  >
                    <span className="text-base">{channel.icon}</span>
                    <span>{channel.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.leadChannel === "INDICATION" && (
              <div className="pt-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  De quem é a indicação? (Nome da pessoa ou empresa que indicou)
                </label>
                <input
                  type="text"
                  value={formData.leadChannelDetails}
                  onChange={(e) => setFormData({ ...formData, leadChannelDetails: e.target.value })}
                  placeholder="Ex: Dr. Roberto, Loja Vizinha, Arquiteto Fernando..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-blue-500/30 focus:border-blue-500 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {formData.leadChannel === "OTHER" && (
              <div className="pt-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Qual o canal de origem?
                </label>
                <input
                  type="text"
                  value={formData.leadChannelDetails}
                  onChange={(e) => setFormData({ ...formData, leadChannelDetails: e.target.value })}
                  placeholder="Ex: Fachada de rua, Evento, Feira comercial, Rádio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-blue-500/30 focus:border-blue-500 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            )}
          </div>


          {/* Dados de Contato Institucional da Empresa / Titular */}
          <div className="p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF650F]" />
                Comunicação da Empresa / Geral
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Telefones e e-mails institucionais do estabelecimento (ex: recepção, SAC e faturamento).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  WhatsApp Geral da Empresa *
                </label>
                <input
                  type="text"
                  required={!formData.contactPersonPhone}
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5541999999999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Telefone Fixo / Recepção
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(41) 3333-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  E-mail Geral / Comercial
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  E-mail Financeiro (NFe / Faturas)
                </label>
                <input
                  type="email"
                  value={formData.financialEmail}
                  onChange={(e) => setFormData({ ...formData, financialEmail: e.target.value })}
                  placeholder="financeiro@empresa.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>
          </div>

          {/* Endereço & Localização com Busca Automática de CEP */}
          <div className="p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF650F]" />
                Endereço & Ponto de Referência
              </h4>
              {isLoadingCep && (
                <span className="text-[10px] text-[#FF650F] flex items-center gap-1 font-semibold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Buscando CEP...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onBlur={handleCepBlur}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="80000-000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Logradouro / Rua
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Rua, Avenida, Praça..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  placeholder="Sala 04, Galpão B"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Batel, Centro..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Curitiba"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  placeholder="PR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Ponto de Referência (vital para equipes de campo e instalação)
                </label>
                <input
                  type="text"
                  value={formData.referencePoint}
                  onChange={(e) => setFormData({ ...formData, referencePoint: e.target.value })}
                  placeholder="Ex: Em frente ao posto Shell, ao lado da agência bancária"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>
          </div>

          {/* Dados Bancários & PIX */}
          <div className="p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#FF650F]" />
              Dados Financeiros & Chave PIX
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tipo da Chave PIX
                </label>
                <select
                  value={formData.pixKeyType}
                  onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone</option>
                  <option value="RANDOM">Chave Aleatória</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="Chave para transferências"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Banco
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Ex: Nubank, Itaú, Banco do Brasil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Condição de Pagamento Acordada
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="Ex: 50% entrada + 50% na entrega, 30 dias"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>
          </div>

          {/* Anotações Gerais */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Observações Gerais do Cadastro
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Histórico da empresa/fornecedor, particularidades contratuais, horários de funcionamento..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5 text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="rounded-full px-6 text-xs font-bold gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Concluir Cadastro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
