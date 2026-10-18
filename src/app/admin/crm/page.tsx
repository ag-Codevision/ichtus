"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedButton } from "@/components/ui/segmented-button";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";
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
} from "lucide-react";
import { GoogleSearchBarWithChips, FilterChipType } from "@/components/admin/crm/GoogleSearchBarWithChips";
import { ContactsListGoogleStyle, ContactItem } from "@/components/admin/crm/ContactsListGoogleStyle";
import { ContactDetailsSheet } from "@/components/admin/crm/ContactDetailsSheet";
import { ContactFormModal } from "@/components/admin/crm/ContactFormModal";

interface Lead {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  customerId: string | null;
  customer?: {
    id: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    type: string;
    whatsapp: string | null;
    email: string | null;
    city: string | null;
  } | null;
  source: string;
  estimatedValue: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes: string | null;
  columnId: string;
  orderInColumn: number;
  createdAt: string;
}

interface Column {
  id: string;
  name: string;
  order: number;
  color: string | null;
  leads: Lead[];
}

export default function CrmPage() {
  const router = useRouter();

  // Modo de visualização: "CONTACTS" (Google Style CRM) ou "KANBAN" (Funil de Vendas)
  const [activeView, setActiveView] = useState<"CONTACTS" | "KANBAN">("CONTACTS");

  // ==========================================
  // ESTADOS DO CRM DE CONTATOS (GOOGLE STYLE)
  // ==========================================
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
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

  // ==========================================
  // ESTADOS DO FUNIL KANBAN
  // ==========================================
  const [columns, setColumns] = useState<Column[]>([]);
  const [isKanbanLoading, setIsKanbanLoading] = useState(true);
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [newLeadForm, setNewLeadForm] = useState({
    title: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    customerId: "",
    estimatedValue: "",
    priority: "MEDIUM",
    notes: "",
  });

  // Clientes disponíveis para vincular no Kanban
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Carrega lista de contatos do CRM
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
  }, [contactSearch, activeChipFilter]);

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
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (activeView === "KANBAN") {
      fetchKanban();
      fetchAvailableClients();
    }
  }, [activeView, fetchKanban]);

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

  // Handlers do Kanban
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
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
        fetchContacts();
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

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewLeadModalOpen(false);
        setNewLeadForm({
          title: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          customerId: "",
          estimatedValue: "",
          priority: "MEDIUM",
          notes: "",
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
      {/* Top Header Card com Alternador M3 Expressive */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Ecossistema Comercial & Operacional
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {activeView === "CONTACTS" ? (
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            ) : (
              <Kanban className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF650F]" />
            )}
            {activeView === "CONTACTS" ? "CRM & Base de Contatos" : "Funil Comercial & Kanban"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {activeView === "CONTACTS"
              ? "Gerencie clientes, fornecedores de insumos e prestadores de serviços de forma 360º."
              : "Acompanhe oportunidades, arraste cards e converta negociações em Ordens de Serviço."}
          </p>
        </div>

        {/* Alternador de Abas Principais no Topo (Segmented Button M3) */}
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedButton<"CONTACTS" | "KANBAN">
            options={[
              {
                value: "CONTACTS",
                label: "Contatos & CRM",
                icon: <Users className="w-4 h-4" />,
                count: contactKpis.total,
              },
              {
                value: "KANBAN",
                label: "Funil Kanban",
                icon: <Kanban className="w-4 h-4" />,
                count: allLeads.length,
              },
            ]}
            value={activeView}
            onChange={(val) => setActiveView(val)}
            size="md"
            layoutId="crm-top-mode-selector"
          />

          <Button
            variant="primary"
            size="md"
            onClick={activeView === "CONTACTS" ? handleOpenNewContact : () => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{activeView === "CONTACTS" ? "Novo Contato" : "Nova Oportunidade"}</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: BASE DE CONTATOS & CRM NO FORMATO APP DO GOOGLE */}
      {/* ======================================================== */}
      {activeView === "CONTACTS" && (
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
            />

            {/* Lista de Contatos em Formato Google App */}
            <div className="mt-4 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
              <ContactsListGoogleStyle
                contacts={contacts}
                isLoading={isContactsLoading}
                onSelectContact={handleOpenContactDetails}
                onEditContact={handleOpenEditContact}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: FUNIL COMERCIAL & KANBAN DE VENDAS             */}
      {/* ======================================================== */}
      {activeView === "KANBAN" && (
        <div className="space-y-4">
          {/* Métricas do Funil */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                placeholder="Buscar oportunidade, projeto ou contato..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#FF650F]" />
                Prioridade:
              </span>
              {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    priorityFilter === p
                      ? "bg-[#FF650F] text-white shadow-sm"
                      : "bg-white dark:bg-[#18191E] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                >
                  {p === "ALL" ? "Todas" : priorityBadges[p as keyof typeof priorityBadges]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colunas do Kanban */}
          {isKanbanLoading ? (
            <div className="flex items-center justify-center py-24 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="w-5 h-5 border-2 border-[#FF650F] border-t-transparent rounded-full animate-spin mr-3" />
              Carregando funil comercial...
            </div>
          ) : (
            <M3TabPanel activeKey={priorityFilter}>
              <M3StaggerContainer className="flex gap-4 overflow-x-auto pb-6 items-start no-scrollbar">
                {columns.map((col) => {
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

                  return (
                    <M3StaggerItem key={col.id} className="shrink-0">
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className="w-80 rounded-3xl bg-[#F6F1EC] dark:bg-[#141519] border border-black/[0.04] dark:border-white/[0.05] flex flex-col max-h-[calc(100vh-260px)] shadow-m3-1"
                      >
                        {/* Cabeçalho da Coluna */}
                        <div className="p-4 border-b border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: col.color || "#FF650F" }}
                            />
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{col.name}</h3>
                            <span className="text-[11px] bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                              {filteredLeads.length}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#FF650F]">
                            {formatCurrency(colValue)}
                          </span>
                        </div>

                        {/* Cards da Coluna */}
                        <div className="p-3 overflow-y-auto space-y-3 flex-grow min-h-[160px] no-scrollbar">
                          {filteredLeads.map((lead) => {
                            const pBadge = priorityBadges[lead.priority] || priorityBadges.MEDIUM;
                            const isApprovedStage = col.name.includes("Aprovado") || col.name.includes("Produção");

                            return (
                              <div
                                key={lead.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                className="p-4 rounded-2xl bg-white dark:bg-[#1C1D24] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 hover:border-orange-500/40 transition-all cursor-grab active:cursor-grabbing space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${pBadge.className}`}
                                  >
                                    {pBadge.label}
                                  </span>
                                  <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-white">
                                    {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
                                  </span>
                                </div>

                                <div>
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                                    {lead.title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                                    <span className="text-zinc-500 font-medium">{lead.contactName}</span>
                                    {lead.customer && (
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (lead.customer?.id) {
                                            setSelectedContactId(lead.customer.id);
                                            setIsDetailsOpen(true);
                                          }
                                        }}
                                        className="text-[10px] bg-orange-500/10 text-[#FF650F] px-2 py-0.2 rounded-full font-bold hover:underline cursor-pointer"
                                      >
                                        CRM 360º
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                                  <a
                                    href={`https://wa.me/${lead.contactPhone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    {lead.contactPhone}
                                  </a>

                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    {formatDate(lead.createdAt)}
                                  </span>
                                </div>

                                {isApprovedStage && (
                                  <div className="pt-1">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      isLoading={convertingLeadId === lead.id}
                                      onClick={() => handleConvertToOS(lead.id)}
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
                    </M3StaggerItem>
                  );
                })}
              </M3StaggerContainer>
            </M3TabPanel>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: FORMULÁRIO COMPLETO DE CONTATO (GOOGLE STYLE)   */}
      {/* ======================================================== */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
          if (activeView === "KANBAN") fetchAvailableClients();
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
      />

      {/* ======================================================== */}
      {/* MODAL 3: NOVO LEAD DO KANBAN COM VÍNCULO AO CRM          */}
      {/* ======================================================== */}
      {isNewLeadModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-[#18191E] rounded-t-[32px] sm:rounded-3xl border-t sm:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col items-center pt-2 sm:hidden shrink-0">
              <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F]">
                  Funil de Vendas
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Nova Oportunidade
                </h3>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
              {/* Selecionar Cliente Existente do CRM */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cliente Vinculado (CRM)
                </label>
                <select
                  value={newLeadForm.customerId}
                  onChange={(e) => handleSelectClientForLead(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                >
                  <option value="">-- Cadastrar como Novo / Não Vinculado --</option>
                  {availableClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.displayName} ({client.type === "CUSTOMER" ? "Cliente" : client.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fachada Comercial ACM 3mm"
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={newLeadForm.contactName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="5541999999999"
                    value={newLeadForm.contactPhone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4500.00"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações & Briefing
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre medidas, cores e prazos..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-full px-5 text-xs font-bold"
                >
                  Adicionar ao Funil
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) de Adicionar no Mobile — Alinhado perfeitamente com o Menu Hamburger */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={activeView === "CONTACTS" ? handleOpenNewContact : () => setIsNewLeadModalOpen(true)}
          aria-label={activeView === "CONTACTS" ? "Novo Contato" : "Nova Oportunidade"}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
