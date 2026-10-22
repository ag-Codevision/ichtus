"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Briefcase,
  Truck,
  Wrench,
  UserCheck,
} from "lucide-react";
import { GoogleSearchBarWithChips, FilterChipType } from "@/components/admin/crm/GoogleSearchBarWithChips";
import { ContactsListGoogleStyle, ContactItem } from "@/components/admin/crm/ContactsListGoogleStyle";
import { ContactDetailsSheet } from "@/components/admin/crm/ContactDetailsSheet";
import { ContactFormModal } from "@/components/admin/crm/ContactFormModal";

export default function CrmPage() {
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

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-[#FF650F] text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Gestão de Relacionamento</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            CRM & Base de Contatos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Gerencie clientes, fornecedores de insumos e prestadores de serviços de forma 360°.
          </p>
        </div>

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenNewContact}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contato</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BASE DE CONTATOS & CRM NO FORMATO APP DO GOOGLE         */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* MODAL 1: FORMULÁRIO COMPLETO DE CONTATO (GOOGLE STYLE)   */}
      {/* ======================================================== */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
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

      {/* Botão Flutuante (FAB) de Adicionar Contato no Mobile */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={handleOpenNewContact}
          aria-label="Novo Contato"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
