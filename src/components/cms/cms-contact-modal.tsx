"use client";

import React, { useState } from "react";
import { useCMS } from "./cms-provider";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  X,
  Check,
  Building,
} from "lucide-react";
import type { CMSContactPhone, CMSContactEmail } from "@/lib/cms-defaults";

export function CMSContactModal() {
  const { contactModalOpen, setContactModalOpen, data, updateSection } = useCMS();
  const current = data.contact_info;

  // Estados locais para edição
  const [whatsapp, setWhatsapp] = useState(current.whatsapp);
  const [phones, setPhones] = useState<CMSContactPhone[]>(current.phones || []);
  const [emails, setEmails] = useState<CMSContactEmail[]>(current.emails || []);
  const [address, setAddress] = useState(current.address);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "phones" | "emails" | "address">("whatsapp");

  if (!contactModalOpen) return null;

  // Handlers para Telefones (CRUD)
  const handleAddPhone = () => {
    const newPhone: CMSContactPhone = {
      id: `tel-${Date.now()}`,
      number: "+5551900000000",
      formatted: "+55 51 90000.0000",
      label: "Novo Telefone",
      isWhatsapp: false,
    };
    setPhones([...phones, newPhone]);
  };

  const handleUpdatePhone = (id: string, field: keyof CMSContactPhone, val: any) => {
    setPhones(phones.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const handleDeletePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  // Handlers para E-mails (CRUD)
  const handleAddEmail = () => {
    const newEmail: CMSContactEmail = {
      id: `mail-${Date.now()}`,
      email: "contato@empresa.com",
      label: "Contato Comercial",
    };
    setEmails([...emails, newEmail]);
  };

  const handleUpdateEmail = (id: string, field: keyof CMSContactEmail, val: string) => {
    setEmails(emails.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const handleDeleteEmail = (id: string) => {
    setEmails(emails.filter((e) => e.id !== id));
  };

  // Salvar alterações e propagar
  const handleSave = () => {
    updateSection("contact_info", {
      whatsapp,
      phones,
      emails,
      address,
    });
    setContactModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => setContactModalOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
              <Phone className="w-5 h-5 text-[#FF650F]" />
              Gerenciador Central de Contatos
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              As alterações feitas aqui são propagadas automaticamente para o Formulário, Rodapé, Navbar e Botões de WhatsApp.
            </p>
          </div>
          <button
            onClick={() => setContactModalOpen(false)}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "whatsapp"
                ? "bg-[#FF650F] text-white shadow"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("phones")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "phones"
                ? "bg-[#FF650F] text-white shadow"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Phone className="w-4 h-4" />
            Telefones ({phones.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emails")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "emails"
                ? "bg-[#FF650F] text-white shadow"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Mail className="w-4 h-4" />
            E-mails ({emails.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("address")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "address"
                ? "bg-[#FF650F] text-white shadow"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Endereço
          </button>
        </div>

        {/* Conteúdo da Aba 1: WhatsApp */}
        {activeTab === "whatsapp" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Número do WhatsApp (com DDI e DDD sem caracteres especiais)
              </label>
              <input
                type="text"
                value={whatsapp.number}
                onChange={(e) => setWhatsapp({ ...whatsapp, number: e.target.value.replace(/\D/g, "") })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
                placeholder="Ex: 5551981192976"
              />
              <span className="block text-[11px] text-zinc-400 mt-1">
                Utilizado para montar os links automáticos <code>https://wa.me/{whatsapp.number}</code>.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Formato de Exibição Visual
              </label>
              <input
                type="text"
                value={whatsapp.formatted}
                onChange={(e) => setWhatsapp({ ...whatsapp, formatted: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: +55 51 98119.2976"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Mensagem Padrão de Início de Conversa
              </label>
              <textarea
                value={whatsapp.defaultMessage}
                onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessage: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Mensagem pré-preenchida quando o cliente clica para falar no WhatsApp..."
              />
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Telefones (CRUD) */}
        {activeTab === "phones" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Lista de Números Telefônicos
              </span>
              <button
                type="button"
                onClick={handleAddPhone}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Telefone
              </button>
            </div>

            <div className="space-y-3">
              {phones.map((phone) => (
                <div
                  key={phone.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Rótulo / Tipo
                    </label>
                    <input
                      type="text"
                      value={phone.label}
                      onChange={(e) => handleUpdatePhone(phone.id, "label", e.target.value)}
                      className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                      placeholder="Ex: Fixo Comercial, Celular Vendas"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Número Formatado
                    </label>
                    <input
                      type="text"
                      value={phone.formatted}
                      onChange={(e) => handleUpdatePhone(phone.id, "formatted", e.target.value)}
                      className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                      placeholder="Ex: 55 51 3574.6167"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Número de Discagem
                    </label>
                    <input
                      type="text"
                      value={phone.number}
                      onChange={(e) => handleUpdatePhone(phone.id, "number", e.target.value)}
                      className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none font-mono"
                      placeholder="tel:+555135746167"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePhone(phone.id)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors self-end sm:self-center"
                    title="Excluir este telefone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 3: E-mails (CRUD) */}
        {activeTab === "emails" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Lista de E-mails Oficiais
              </span>
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar E-mail
              </button>
            </div>

            <div className="space-y-3">
              {emails.map((mail) => (
                <div
                  key={mail.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Rótulo / Descrição
                    </label>
                    <input
                      type="text"
                      value={mail.label}
                      onChange={(e) => handleUpdateEmail(mail.id, "label", e.target.value)}
                      className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                      placeholder="Ex: Contato Geral, Orçamentos"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Endereço de E-mail
                    </label>
                    <input
                      type="email"
                      value={mail.email}
                      onChange={(e) => handleUpdateEmail(mail.id, "email", e.target.value)}
                      className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                      placeholder="exemplo@glessios.com.br"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEmail(mail.id)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors self-end sm:self-center"
                    title="Excluir este e-mail"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 4: Endereço (CRUD) */}
        {activeTab === "address" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Logradouro (Rua / Avenida)
              </label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Número / Complemento
              </label>
              <input
                type="text"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Cidade / Estado
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Cidade"
                />
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-20 p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none uppercase"
                  placeholder="UF"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                CEP
              </label>
              <input
                type="text"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                País
              </label>
              <input
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setContactModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Check className="w-4 h-4" />
            Salvar e Propagar em Todo o Site
          </button>
        </div>
      </div>
    </div>
  );
}
