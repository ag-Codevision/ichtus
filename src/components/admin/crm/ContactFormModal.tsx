"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Truck,
  Wrench,
  Briefcase,
  Search,
  Check,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null;
}

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
    contactPerson: "",
    contactRole: "",
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Ex: Loja Tech Batel, Distribuidora Curitiba"
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
                    placeholder="Ex: Concept Batel Comércio de Roupas Ltda"
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

          {/* Dados de Contato e Comunicação */}
          <div className="p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FF650F]" />
              Contato & WhatsApp
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  WhatsApp Principal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5541999999999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Telefone Fixo / Secundário
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
                  E-mail Geral
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
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Pessoa de Contato / Responsável
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ex: Roberta Mendes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cargo / Setor
                </label>
                <input
                  type="text"
                  value={formData.contactRole}
                  onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                  placeholder="Ex: Gerente de Compras / Arquiteta"
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
                  Ponto de Referência (vital para equipes de instalação)
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
              Observações Internas
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Histórico comercial, particularidades de entrega, horários para instalação..."
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
