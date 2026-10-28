"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  X,
  Wrench,
  Truck,
  Building2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Phone,
  Trash2,
  CalendarDays,
  CalendarRange,
  List,
  Check,
  RotateCw,
  Sparkles,
  Pencil,
  Briefcase,
} from "lucide-react";
import { ClientSearchAutocomplete, SearchedClient } from "@/components/admin/crm/ClientSearchAutocomplete";
import { ServiceSearchAutocomplete, SearchedService } from "@/components/admin/agendamentos/ServiceSearchAutocomplete";
import { TeamMultiSelect } from "@/components/admin/agendamentos/TeamMultiSelect";

interface Appointment {
  id: string;
  title: string;
  type: "TECHNICAL_VISIT_MEASUREMENT" | "INTERNAL_PRODUCTION_RUN" | "EXTERNAL_INSTALLATION" | "DELIVERY_PICKUP" | "OTHER";
  customType?: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  scheduledAt: string;
  durationMinutes: number;
  locationAddress: string | null;
  assignedTeam: string | null;
  assignedProviderIds?: string[];
  notes: string | null;
  customerId?: string | null;
  customer?: {
    id?: string;
    tradeName: string | null;
    companyName: string | null;
    fullName?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    user?: { name: string; phone: string | null } | null;
  } | null;
  leadId?: string | null;
  lead?: {
    id: string;
    title: string;
    budgetCode: string | null;
    column?: { id: string; name: string; color: string | null } | null;
    category?: { id: string; name: string; color: string } | null;
  } | null;
  serviceOrder?: {
    code: string;
    title: string;
  } | null;
}

const typeConfig: Record<string, { label: string; shortLabel: string; icon: any; badge: string; pill: string; dot: string }> = {
  TECHNICAL_VISIT_MEASUREMENT: {
    label: "Visita Técnica & Medição",
    shortLabel: "Visita Técnica",
    icon: Building2,
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
    dot: "bg-blue-500",
  },
  EXTERNAL_INSTALLATION: {
    label: "Instalação Externa Fachada",
    shortLabel: "Instalação",
    icon: Users,
    badge: "bg-orange-500/10 text-[#FF650F] border-orange-500/20 font-bold",
    pill: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60",
    dot: "bg-[#FF650F]",
  },
  INTERNAL_PRODUCTION_RUN: {
    label: "Produção Interna CNC",
    shortLabel: "Produção CNC",
    icon: Wrench,
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    pill: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60",
    dot: "bg-purple-500",
  },
  DELIVERY_PICKUP: {
    label: "Entrega / Retirada",
    shortLabel: "Entrega",
    icon: Truck,
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
    dot: "bg-emerald-500",
  },
  OTHER: {
    label: "Outros",
    shortLabel: "Outros",
    icon: Sparkles,
    badge: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
    pill: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    dot: "bg-zinc-500",
  },
};

const statusConfig: Record<string, { label: string; badge: string }> = {
  SCHEDULED: { label: "Agendado", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  IN_PROGRESS: { label: "Em Andamento", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  COMPLETED: { label: "Concluído", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelado", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  RESCHEDULED: { label: "Reagendado", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
};

function getAppointmentDisplayType(app: Appointment) {
  if (app.type === "OTHER" && app.customType) {
    return app.customType;
  }
  return typeConfig[app.type]?.label || "Compromisso";
}

function getAppointmentDisplayShortType(app: Appointment) {
  if (app.type === "OTHER" && app.customType) {
    return app.customType;
  }
  return typeConfig[app.type]?.shortLabel || "Outros";
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const weekDaysFull = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Seleções do formulário
  const [selectedClient, setSelectedClient] = useState<SearchedClient | null>(null);
  const [selectedService, setSelectedService] = useState<SearchedService | null>(null);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [customTeamName, setCustomTeamName] = useState<string>("");

  // Formulário de Agendamento (Criação & Edição)
  const [form, setForm] = useState({
    title: "",
    type: "TECHNICAL_VISIT_MEASUREMENT" as Appointment["type"],
    customType: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    durationMinutes: "60",
    locationAddress: "",
    assignedTeam: "Equipe de Campo 01",
    notes: "",
    notifyPhone: "",
  });

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/v1/appointments");
      const data = await res.json();
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error("Erro ao carregar agendamentos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Navegação do Calendário
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Abrir modal de novo agendamento com dia pré-selecionado
  const handleOpenNewAppointmentOnDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(date);
    setEditingAppointmentId(null);
    setSelectedClient(null);
    setSelectedService(null);
    setSelectedProviderIds([]);
    setCustomTeamName("");
    setForm({
      title: "",
      type: "TECHNICAL_VISIT_MEASUREMENT",
      customType: "",
      scheduledDate: `${yyyy}-${mm}-${dd}`,
      scheduledTime: "09:00",
      durationMinutes: "60",
      locationAddress: "",
      assignedTeam: "Equipe de Campo 01",
      notes: "",
      notifyPhone: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Abrir modal de edição com dados existentes
  const handleOpenEditAppointment = (app: Appointment) => {
    setIsDetailsOpen(false);
    setEditingAppointmentId(app.id);

    const appDate = new Date(app.scheduledAt);
    const yyyy = appDate.getFullYear();
    const mm = String(appDate.getMonth() + 1).padStart(2, "0");
    const dd = String(appDate.getDate()).padStart(2, "0");
    const hh = String(appDate.getHours()).padStart(2, "0");
    const min = String(appDate.getMinutes()).padStart(2, "0");

    // Cliente
    if (app.customer) {
      setSelectedClient({
        id: app.customer.id || "",
        displayName: app.customer.tradeName || app.customer.fullName || app.customer.companyName || "Cliente",
        companyName: app.customer.companyName,
        tradeName: app.customer.tradeName,
        fullName: app.customer.fullName || null,
        type: "CUSTOMER",
        personType: "PJ",
        documentNumber: null,
        phone: app.customer.phone || null,
        whatsapp: app.customer.whatsapp || null,
        email: null,
        city: app.customer.city || null,
        state: null,
        status: "ACTIVE",
      });
    } else {
      setSelectedClient(null);
    }

    // Serviço Vinculado
    if (app.lead) {
      setSelectedService({
        id: app.lead.id,
        title: app.lead.title,
        budgetCode: app.lead.budgetCode,
        contactName: app.customer?.fullName || "",
        contactPhone: app.customer?.whatsapp || app.customer?.phone || "",
        customerId: app.customerId || null,
        customer: app.customer ? {
          id: app.customer.id || "",
          tradeName: app.customer.tradeName,
          companyName: app.customer.companyName,
          fullName: app.customer.fullName || null,
          phone: app.customer.phone || null,
          whatsapp: app.customer.whatsapp || null,
          city: app.customer.city || null,
          street: app.customer.street || null,
          number: app.customer.number || null,
          neighborhood: app.customer.neighborhood || null,
        } : null,
        category: app.lead.category ? { id: app.lead.category.id, name: app.lead.category.name, color: app.lead.category.color } : null,
        column: app.lead.column ? { id: app.lead.column.id, name: app.lead.column.name, color: app.lead.column.color || "" } : null,
      });
    } else {
      setSelectedService(null);
    }

    // Prestadores e Equipe
    setSelectedProviderIds(app.assignedProviderIds || []);
    setCustomTeamName(app.assignedTeam || "");

    // Formulário
    setForm({
      title: app.title,
      type: app.type,
      customType: app.customType || "",
      scheduledDate: `${yyyy}-${mm}-${dd}`,
      scheduledTime: `${hh}:${min}`,
      durationMinutes: String(app.durationMinutes || 60),
      locationAddress: app.locationAddress || "",
      assignedTeam: app.assignedTeam || "Equipe de Campo 01",
      notes: app.notes || "",
      notifyPhone: app.customer?.whatsapp || app.customer?.phone || "",
    });

    setFormError(null);
    setIsModalOpen(true);
  };

  // Atualizar Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
        );
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
        setSuccessToast(`Status atualizado para ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}!`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch (e) {
      console.error("Falha ao atualizar status:", e);
    }
  };

  // Excluir Agendamento
  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Deseja realmente remover este agendamento do cronograma?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        setIsDetailsOpen(false);
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setSuccessToast("Agendamento excluído com sucesso do cronograma.");
        setTimeout(() => setSuccessToast(null), 3500);
      } else {
        alert(data.error || "Não foi possível excluir o agendamento.");
      }
    } catch (e) {
      console.error("Erro ao excluir agendamento:", e);
      alert("Erro de conexão ao remover agendamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Submissão do Formulário (Criação ou Edição)
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (form.type === "OTHER" && !form.customType.trim()) {
        throw new Error("Por favor, descreva qual é o outro tipo de operação no campo indicado.");
      }

      const scheduledAtIso = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`).toISOString();

      const payload = {
        title: form.title.trim(),
        type: form.type,
        customType: form.type === "OTHER" ? form.customType.trim() : null,
        scheduledAt: scheduledAtIso,
        durationMinutes: Number(form.durationMinutes) || 60,
        locationAddress: form.locationAddress.trim() || null,
        assignedTeam: customTeamName.trim() || form.assignedTeam.trim() || "Equipe Técnica",
        assignedProviderIds: selectedProviderIds,
        notes: form.notes.trim() || null,
        customerId: selectedClient?.id || null,
        leadId: selectedService?.id || null,
        notifyPhone: form.notifyPhone.trim() || selectedClient?.whatsapp || selectedClient?.phone || null,
      };

      let res;
      if (editingAppointmentId) {
        // Atualização (PATCH)
        res = await fetch(`/api/v1/appointments/${editingAppointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Criação (POST)
        res = await fetch("/api/v1/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.details || "Falha ao salvar o agendamento.");
      }

      setIsModalOpen(false);
      setSuccessToast(
        editingAppointmentId
          ? "Agendamento atualizado com sucesso no calendário!"
          : "Compromisso técnico agendado no calendário com sucesso!"
      );
      setTimeout(() => setSuccessToast(null), 4000);

      await fetchAppointments();
    } catch (err: any) {
      console.error("Falha ao salvar agendamento:", err);
      setFormError(err?.message || "Não foi possível salvar o agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agendamentos Filtrados
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
      const matchType = typeFilter === "ALL" || app.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [appointments, statusFilter, typeFilter]);

  // Estatísticas do Mês
  const monthStats = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const inMonth = appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    return {
      total: inMonth.length,
      visits: inMonth.filter((a) => a.type === "TECHNICAL_VISIT_MEASUREMENT").length,
      installations: inMonth.filter((a) => a.type === "EXTERNAL_INSTALLATION").length,
      completed: inMonth.filter((a) => a.status === "COMPLETED").length,
    };
  }, [appointments, currentDate]);

  // Compromissos do Dia Selecionado
  const selectedDayAppointments = useMemo(() => {
    return filteredAppointments.filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate));
  }, [filteredAppointments, selectedDate]);

  // Compromissos de Hoje
  const today = useMemo(() => new Date(), []);
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => isSameDay(new Date(a.scheduledAt), today));
  }, [appointments, today]);

  // Geração dos Dias do Mês na Grade do Calendário
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayDate = new Date(year, month + 1, 0).getDate();
    const prevLastDayDate = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior para completar a 1ª semana
    for (let x = firstDayIndex; x > 0; x--) {
      days.push({
        date: new Date(year, month - 1, prevLastDayDate - x + 1),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDayDate; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês para fechar a grade (múltiplo de 7)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let j = 1; j <= remainingDays; j++) {
        days.push({
          date: new Date(year, month + 1, j),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentDate]);

  const monthTitle = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast de Sucesso */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[120] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/10 dark:border-black/10 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#FF650F]" />
            <span>Operações & Campo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Agendamentos & Montagens
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Acompanhe o cronograma de medições, instalações externas de fachadas e produção CNC no calendário.
          </p>
        </div>

        {/* Botão Novo Agendamento & Seletores de Visão */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 dark:bg-white/[0.06] p-1 rounded-2xl border border-black/[0.05] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "month"
                  ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#FF650F]" />
              <span>Mês</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "week"
                  ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-[#FF650F]" />
              <span>Semana</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#FF650F]" />
              <span>Lista</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenNewAppointmentOnDate(selectedDate)}
            className="gap-2 text-xs font-bold rounded-2xl shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* BARRA DE RESUMO & ESTATÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block">Hoje</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {todayAppointments.length} agendados
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block">Visitas Técnicas</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {monthStats.visits} no mês
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block">Instalações Externas</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {monthStats.installations} no mês
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block">Finalizados</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {monthStats.completed} concluídos
            </span>
          </div>
        </div>
      </div>

      {/* CONTROLES DO CALENDÁRIO: NAVEGAÇÃO DE MÊS & FILTROS */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navegador de Mês */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/[0.06] p-1 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mês Anterior"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#18191E] hover:text-zinc-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-[#18191E] transition-all cursor-pointer"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Próximo Mês"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#18191E] hover:text-zinc-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight capitalize">
            {monthTitle}
          </h2>
        </div>

        {/* Filtros de Tipo e Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF650F]"
          >
            <option value="ALL">Todos os Tipos de Serviço</option>
            <option value="TECHNICAL_VISIT_MEASUREMENT">Visita Técnica & Medição</option>
            <option value="EXTERNAL_INSTALLATION">Instalação Externa Fachada</option>
            <option value="INTERNAL_PRODUCTION_RUN">Produção Interna CNC</option>
            <option value="DELIVERY_PICKUP">Entrega / Retirada</option>
            <option value="OTHER">Outros</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF650F]"
          >
            <option value="ALL">Todos os Status</option>
            <option value="SCHEDULED">Agendado</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluído</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: VISUALIZAÇÃO EM GRADE DO MÊS / SEMANA / LISTA */}
      {viewMode === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* GRADE COMPLETA DO MÊS (8 COLUNAS) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
            {/* Cabeçalho dos Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-black/[0.06] dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02]">
              {weekDays.map((d, idx) => (
                <div
                  key={d}
                  className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
                    idx === 0 || idx === 6
                      ? "text-orange-600/70 dark:text-orange-400/70"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Células de Dias do Calendário */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-black/[0.04] dark:divide-white/[0.05] bg-zinc-100/40 dark:bg-black/20 flex-1">
              {calendarDays.map((cell, idx) => {
                const dayAppointments = filteredAppointments.filter((a) =>
                  isSameDay(new Date(a.scheduledAt), cell.date)
                );
                const isCellToday = isSameDay(cell.date, today);
                const isCellSelected = isSameDay(cell.date, selectedDate);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    onDoubleClick={() => handleOpenNewAppointmentOnDate(cell.date)}
                    className={`min-h-[92px] sm:min-h-[115px] p-2 sm:p-2.5 transition-colors relative cursor-pointer flex flex-col justify-between group ${
                      !cell.isCurrentMonth
                        ? "bg-zinc-50/40 dark:bg-black/40 text-zinc-300 dark:text-zinc-600"
                        : "bg-white dark:bg-[#18191E] hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.05]"
                    } ${isCellSelected ? "ring-2 ring-inset ring-[#FF650F] z-10" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCellToday
                            ? "bg-[#FF650F] text-white shadow-xs font-black"
                            : cell.isCurrentMonth
                            ? "text-zinc-800 dark:text-zinc-200"
                            : "text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {/* Botão rápido para criar agendamento neste dia */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNewAppointmentOnDate(cell.date);
                        }}
                        title="Agendar neste dia"
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-orange-500/10 text-[#FF650F] hover:bg-[#FF650F] hover:text-white flex items-center justify-center transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Chips de Compromissos do Dia */}
                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayAppointments.slice(0, 3).map((app) => {
                        const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
                        const timeStr = new Date(app.scheduledAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={app.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(app);
                              setIsDetailsOpen(true);
                            }}
                            title={`${app.title} (${timeStr})`}
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border truncate flex items-center gap-1 transition-transform hover:scale-[1.02] cursor-pointer shadow-2xs ${cfg.pill}`}
                          >
                            <span className="font-mono text-[9px] font-bold shrink-0">{timeStr}</span>
                            <span className="truncate">{app.title}</span>
                          </div>
                        );
                      })}

                      {dayAppointments.length > 3 && (
                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block text-right pr-1">
                          +{dayAppointments.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA LATERAL DIREITA: DETALHES DO DIA SELECIONADO (4 COLUNAS) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF650F] block">
                    {weekDaysFull[selectedDate.getDay()]}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {formatDate(selectedDate)}
                  </h3>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenNewAppointmentOnDate(selectedDate)}
                  className="rounded-xl text-xs font-bold gap-1 border-orange-500/20 text-[#FF650F] hover:bg-orange-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar</span>
                </Button>
              </div>

              {/* Lista dos Compromissos do Dia */}
              {selectedDayAppointments.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] text-zinc-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Nenhum compromisso marcado
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Clique no botão acima para agendar uma visita ou montagem para esta data.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
                  {selectedDayAppointments.map((app) => {
                    const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
                    const st = statusConfig[app.status] || statusConfig.SCHEDULED;
                    const timeStr = new Date(app.scheduledAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedAppointment(app);
                          setIsDetailsOpen(true);
                        }}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] hover:bg-orange-500/[0.04] dark:hover:bg-orange-500/[0.08] border border-black/[0.05] dark:border-white/[0.06] hover:border-orange-500/30 transition-all cursor-pointer space-y-2 group shadow-2xs relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                            {getAppointmentDisplayShortType(app)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.badge}`}>
                            {st.label}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-[#FF650F] transition-colors leading-snug">
                          {app.title}
                        </h4>

                        {/* Chip do Serviço Vinculado (se houver) */}
                        {app.lead && (
                          <div className="flex items-center gap-1.5 text-[11px] bg-orange-500/10 text-[#FF650F] border border-orange-500/20 px-2 py-0.5 rounded-lg font-semibold truncate">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="font-mono text-[10px]">#{app.lead.budgetCode || "Serviço"}</span>
                            <span className="truncate">{app.lead.title}</span>
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-[#FF650F]" />
                            <span className="font-mono">{timeStr}</span>
                            <span className="text-[11px] text-zinc-400">({app.durationMinutes} min)</span>
                          </div>

                          {app.locationAddress && (
                            <div className="flex items-start gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span className="truncate">{app.locationAddress}</span>
                            </div>
                          )}

                          {app.customer && (
                            <div className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                              Cliente: {app.customer.tradeName || app.customer.fullName || app.customer.companyName || "Cliente"}
                            </div>
                          )}
                        </div>

                        {/* Botões Rápidos */}
                        <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditAppointment(app);
                            }}
                            className="text-[11px] font-bold text-zinc-500 hover:text-[#FF650F] flex items-center gap-1 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {app.status === "SCHEDULED" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(app.id, "IN_PROGRESS");
                                }}
                                className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                              >
                                Iniciar Atendimento
                              </button>
                            )}
                            {app.status === "IN_PROGRESS" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(app.id, "COMPLETED");
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO EM SEMANA (WEEK VIEW) */}
      {viewMode === "week" && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-4 sm:p-6 overflow-x-auto no-scrollbar">
          <div className="min-w-[800px] grid grid-cols-7 gap-3">
            {(() => {
              const startOfWeek = new Date(selectedDate);
              startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

              return Array.from({ length: 7 }).map((_, i) => {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);

                const dayApps = filteredAppointments.filter((a) => isSameDay(new Date(a.scheduledAt), dayDate));
                const isDayToday = isSameDay(dayDate, today);
                const isDaySelected = isSameDay(dayDate, selectedDate);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(dayDate)}
                    className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col space-y-3 min-h-[380px] ${
                      isDaySelected
                        ? "bg-orange-500/[0.05] border-[#FF650F]/40 shadow-xs"
                        : "bg-zinc-50/60 dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.06] hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          {weekDaysFull[dayDate.getDay()]}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-sm font-black w-7 h-7 rounded-full flex items-center justify-center ${
                              isDayToday
                                ? "bg-[#FF650F] text-white"
                                : "text-zinc-900 dark:text-white"
                            }`}
                          >
                            {dayDate.getDate()}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {dayDate.toLocaleDateString("pt-BR", { month: "short" })}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNewAppointmentOnDate(dayDate);
                        }}
                        title="Agendar neste dia"
                        className="w-6 h-6 rounded-lg bg-orange-500/10 text-[#FF650F] hover:bg-[#FF650F] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Lista do dia */}
                    <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                      {dayApps.length === 0 ? (
                        <div className="text-center py-10 text-[11px] text-zinc-400">
                          Sem agendamentos
                        </div>
                      ) : (
                        dayApps.map((app) => {
                          const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
                          const timeStr = new Date(app.scheduledAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(app);
                                setIsDetailsOpen(true);
                              }}
                              className="p-2.5 rounded-xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40 shadow-2xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-[#FF650F] font-mono">{timeStr}</span>
                                <span className={`px-1.5 py-0.2 rounded-full border text-[9px] ${cfg.badge}`}>
                                  {getAppointmentDisplayShortType(app)}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                                {app.title}
                              </h5>
                              {app.lead && (
                                <p className="text-[9px] font-mono font-bold text-[#FF650F] truncate">
                                  #{app.lead.budgetCode} {app.lead.title}
                                </p>
                              )}
                              {app.locationAddress && (
                                <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span>{app.locationAddress}</span>
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO EM LISTA (LIST VIEW) */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <List className="w-4 h-4 text-[#FF650F]" />
              <span>Lista Cronológica de Agendamentos ({filteredAppointments.length})</span>
            </h3>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CalendarIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-500">Nenhum compromisso encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((app) => {
                const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
                const st = statusConfig[app.status] || statusConfig.SCHEDULED;

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppointment(app);
                      setIsDetailsOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-zinc-50/60 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {getAppointmentDisplayType(app)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                      {app.title}
                    </h4>

                    {/* Chip de Serviço Vinculado */}
                    {app.lead && (
                      <div className="flex items-center gap-1.5 text-xs bg-orange-500/10 text-[#FF650F] border border-orange-500/20 px-2.5 py-1 rounded-xl font-semibold">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[11px]">#{app.lead.budgetCode}</span>
                        <span className="truncate">{app.lead.title}</span>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-semibold">
                        <Clock className="w-4 h-4 text-[#FF650F]" />
                        <span>{formatDateTime(app.scheduledAt)}</span>
                        <span className="text-[11px] text-zinc-400">({app.durationMinutes} min)</span>
                      </div>
                      {app.locationAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{app.locationAddress}</span>
                        </div>
                      )}
                      {app.assignedTeam && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="truncate">{app.assignedTeam}</span>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-xs bg-white dark:bg-[#18191E] p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.05] text-zinc-500 line-clamp-2">
                        {app.notes}
                      </p>
                    )}

                    {/* Botões do Card */}
                    <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditAppointment(app);
                        }}
                        className="text-xs font-bold text-zinc-500 hover:text-[#FF650F] flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(app.id);
                        }}
                        className="text-xs font-bold text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETALHES DO AGENDAMENTO SELECIONADO                */}
      {/* ======================================================== */}
      {isDetailsOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo do Modal */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeConfig[selectedAppointment.type]?.badge}`}>
                  {getAppointmentDisplayType(selectedAppointment)}
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
                  {selectedAppointment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações Centrais */}
            <div className="space-y-3 bg-zinc-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.05] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Status Atual:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${statusConfig[selectedAppointment.status]?.badge}`}>
                  {statusConfig[selectedAppointment.status]?.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Data & Horário:</span>
                <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#FF650F]" />
                  {formatDateTime(selectedAppointment.scheduledAt)} ({selectedAppointment.durationMinutes} min)
                </span>
              </div>

              {/* Serviço Vinculado do Kanban */}
              {selectedAppointment.lead && (
                <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span className="text-zinc-400 font-semibold block">Serviço Vinculado (Funil Kanban):</span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-[#FF650F] shrink-0" />
                      {selectedAppointment.lead.budgetCode && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-[#FF650F]">
                          #{selectedAppointment.lead.budgetCode}
                        </span>
                      )}
                      <span className="font-bold text-zinc-900 dark:text-white truncate">
                        {selectedAppointment.lead.title}
                      </span>
                    </div>

                    {selectedAppointment.lead.column && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: selectedAppointment.lead.column.color || "#FF650F" }}
                      >
                        {selectedAppointment.lead.column.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Cliente Vinculado */}
              {selectedAppointment.customer && (
                <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span className="text-zinc-400 font-semibold block">Cliente Vinculado:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {selectedAppointment.customer.tradeName || selectedAppointment.customer.fullName || selectedAppointment.customer.companyName || "Cliente"}
                    </span>
                    {(selectedAppointment.customer.whatsapp || selectedAppointment.customer.phone || selectedAppointment.customer.user?.phone) && (
                      <a
                        href={`https://wa.me/${(selectedAppointment.customer.whatsapp || selectedAppointment.customer.phone || selectedAppointment.customer.user?.phone || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px] font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Equipe / Prestadores */}
              {selectedAppointment.assignedTeam && (
                <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span className="text-zinc-400 font-semibold">Equipe / Responsáveis:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#FF650F]" />
                    {selectedAppointment.assignedTeam}
                  </span>
                </div>
              )}

              {selectedAppointment.locationAddress && (
                <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span className="text-zinc-400 font-semibold block">Local de Execução / Endereço:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {selectedAppointment.locationAddress}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedAppointment.locationAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF650F] hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Ver no Mapa</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span className="text-zinc-400 font-semibold block">Observações Técnicas:</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Ações do Agendamento (CRUD) */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Botão de Editar */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditAppointment(selectedAppointment)}
                  className="rounded-xl text-xs font-bold gap-1 border-orange-500/30 text-[#FF650F] hover:bg-orange-500/10 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </Button>

                {selectedAppointment.status === "SCHEDULED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "IN_PROGRESS")}
                    className="rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Iniciar Atendimento
                  </Button>
                )}
                {selectedAppointment.status === "IN_PROGRESS" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "COMPLETED")}
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Concluir
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NOVO / EDITAR AGENDAMENTO TÉCNICO (CRUD)          */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center">
                  {editingAppointmentId ? (
                    <Pencil className="w-5 h-5" />
                  ) : (
                    <CalendarIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {editingAppointmentId ? "Editar Agendamento Técnico" : "Novo Agendamento Técnico"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {editingAppointmentId
                      ? "Atualize as informações do compromisso técnico e da equipe."
                      : "Defina o compromisso de campo ou montagem no calendário."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSubmitAppointment} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Título do Compromisso */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Agendamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Medição Técnica Fachada ACM ou Montagem Letra Caixa"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Tipo de Operação com Cards Visuais + Outros */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Tipo de Operação *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "TECHNICAL_VISIT_MEASUREMENT", label: "Visita Técnica & Medição", icon: Building2 },
                    { id: "EXTERNAL_INSTALLATION", label: "Instalação Externa Fachada", icon: Users },
                    { id: "INTERNAL_PRODUCTION_RUN", label: "Produção Interna CNC", icon: Wrench },
                    { id: "DELIVERY_PICKUP", label: "Entrega / Retirada", icon: Truck },
                    { id: "OTHER", label: "Outros", icon: Sparkles },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = form.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.id as any })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500/10 border-[#FF650F] text-[#FF650F] font-bold shadow-2xs"
                            : "bg-zinc-50 dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Campo Aberto Quando Escolhe "Outros" */}
                {form.type === "OTHER" && (
                  <div className="mt-2.5 p-3 rounded-xl bg-orange-500/[0.05] border border-orange-500/30 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-[#FF650F] block mb-1">
                      Qual é o outro tipo de operação? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manutenção Preventiva, Troca de Iluminação LED, Adesivação de Veículo..."
                      value={form.customType}
                      onChange={(e) => setForm({ ...form, customType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#141519] border border-orange-500/30 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF650F]"
                    />
                  </div>
                )}
              </div>

              {/* Serviço Vinculado (Card do Funil Kanban) */}
              <div>
                <ServiceSearchAutocomplete
                  selectedService={selectedService}
                  onSelectService={(serv) => {
                    setSelectedService(serv);
                    if (serv) {
                      // Se o serviço tiver cliente vinculado e ainda não selecionou cliente, vincula automaticamente
                      if (serv.customer) {
                        setSelectedClient({
                          id: serv.customer.id,
                          displayName: serv.customer.tradeName || serv.customer.fullName || serv.customer.companyName || "Cliente",
                          companyName: serv.customer.companyName,
                          tradeName: serv.customer.tradeName,
                          fullName: serv.customer.fullName,
                          type: "CUSTOMER",
                          personType: "PJ",
                          documentNumber: null,
                          phone: serv.customer.phone || null,
                          whatsapp: serv.customer.whatsapp || null,
                          email: null,
                          city: serv.customer.city || null,
                          state: null,
                          status: "ACTIVE",
                        });
                      }

                      // Sugere título do agendamento se estiver em branco
                      if (!form.title.trim()) {
                        setForm((prev) => ({
                          ...prev,
                          title: `Execução - ${serv.title}`,
                        }));
                      }

                      // Se o cliente do serviço tiver endereço, preenche no local se estiver vazio
                      if (serv.customer && (serv.customer.street || serv.customer.neighborhood || serv.customer.city)) {
                        const parts = [
                          serv.customer.street,
                          serv.customer.number,
                          serv.customer.neighborhood,
                          serv.customer.city,
                        ].filter(Boolean);
                        if (parts.length > 0 && !form.locationAddress.trim()) {
                          setForm((prev) => ({
                            ...prev,
                            locationAddress: parts.join(", "),
                          }));
                        }
                      }
                    }
                  }}
                  customerIdFilter={selectedClient?.id || null}
                />
              </div>

              {/* Cliente Vinculado (CRM) */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Cliente Vinculado (Opcional)
                </label>
                <ClientSearchAutocomplete
                  selectedClient={selectedClient}
                  onSelectClient={(client) => {
                    setSelectedClient(client);
                    if (client) {
                      if (!form.title.trim()) {
                        setForm((prev) => ({
                          ...prev,
                          title: `Visita Técnica - ${client.displayName}`,
                        }));
                      }
                      if (client.whatsapp || client.phone) {
                        setForm((prev) => ({
                          ...prev,
                          notifyPhone: client.whatsapp || client.phone || "",
                        }));
                      }
                    }
                  }}
                  placeholder="Vincular cliente cadastrado na aba Contatos (opcional)..."
                />
              </div>

              {/* Data, Horário e Duração */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Data do Agendamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Duração Prevista
                  </label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  >
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1 hora e meia</option>
                    <option value="120">2 horas</option>
                    <option value="180">3 horas</option>
                    <option value="240">4 horas (meio período)</option>
                    <option value="480">8 horas (dia inteiro)</option>
                  </select>
                </div>
              </div>

              {/* Endereço / Local */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Endereço do Local / Obra
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rua, número, bairro e cidade..."
                    value={form.locationAddress}
                    onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                  />
                </div>
              </div>

              {/* Equipe de Campo / Prestadores Responsáveis (Múltipla Escolha CRM) */}
              <div>
                <TeamMultiSelect
                  selectedProviderIds={selectedProviderIds}
                  onChangeProviders={(ids, names) => {
                    setSelectedProviderIds(ids);
                    if (names.length > 0 && !customTeamName) {
                      setForm((prev) => ({ ...prev, assignedTeam: names.join(", ") }));
                    }
                  }}
                  customTeamName={customTeamName}
                  onChangeCustomTeamName={(name) => {
                    setCustomTeamName(name);
                    setForm((prev) => ({ ...prev, assignedTeam: name }));
                  }}
                />
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações Técnicas & Recomendações
                </label>
                <textarea
                  rows={2}
                  placeholder="Levar trena laser, escada de 6 metros, verificar ponto elétrico..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.06]">
                {editingAppointmentId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(editingAppointmentId)}
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full px-4 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="rounded-full px-5 text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingAppointmentId ? "Salvar Alterações" : "Confirmar Agendamento"}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
