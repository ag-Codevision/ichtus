"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  X,
  Wrench,
  Truck,
  Building2,
} from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  type: "TECHNICAL_VISIT_MEASUREMENT" | "INTERNAL_PRODUCTION_RUN" | "EXTERNAL_INSTALLATION" | "DELIVERY_PICKUP";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  scheduledAt: string;
  durationMinutes: number;
  locationAddress: string | null;
  assignedTeam: string | null;
  notes: string | null;
  customer?: {
    tradeName: string | null;
    companyName: string | null;
    user: { name: string; phone: string | null };
  } | null;
  serviceOrder?: {
    code: string;
    title: string;
  } | null;
}

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modal de novo agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "TECHNICAL_VISIT_MEASUREMENT",
    scheduledAt: "",
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
      }
    } catch (e) {
      console.error("Falha ao atualizar status:", e);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          durationMinutes: Number(form.durationMinutes),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setForm({
          title: "",
          type: "TECHNICAL_VISIT_MEASUREMENT",
          scheduledAt: "",
          durationMinutes: "60",
          locationAddress: "",
          assignedTeam: "Equipe de Campo 01",
          notes: "",
          notifyPhone: "",
        });
        fetchAppointments();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erro ao registrar agendamento.");
    }
  };

  const typeConfig = {
    TECHNICAL_VISIT_MEASUREMENT: {
      label: "Visita Técnica & Medição",
      icon: Building2,
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    INTERNAL_PRODUCTION_RUN: {
      label: "Produção Interna CNC",
      icon: Wrench,
      badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    EXTERNAL_INSTALLATION: {
      label: "Instalação Externa Fachada",
      icon: Users,
      badge: "bg-orange-500/10 text-glessios-orange border-orange-500/20 font-bold",
    },
    DELIVERY_PICKUP: {
      label: "Entrega / Retirada",
      icon: Truck,
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  };

  const statusConfig = {
    SCHEDULED: { label: "Agendado", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    IN_PROGRESS: { label: "Em Rota / Em Andamento", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    COMPLETED: { label: "Concluído", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    CANCELLED: { label: "Cancelado", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    RESCHEDULED: { label: "Reagendado", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  };

  const filtered = appointments.filter((app) => {
    const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchType = typeFilter === "ALL" || app.type === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho - M3 Expressive Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Operações Externas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-glessios-orange" />
            Agendamentos & Equipes de Campo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Controle de visitas de medição, execução de montagens e cronograma de instalação externa de fachadas.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 text-xs font-bold rounded-full shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento Técnico
        </Button>
      </div>

      {/* Filtros de Tipo e Status - M3 Filter Container */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#18191E] p-4 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mr-1">Tipo:</span>
          {["ALL", "TECHNICAL_VISIT_MEASUREMENT", "EXTERNAL_INSTALLATION", "INTERNAL_PRODUCTION_RUN"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t
                  ? "bg-glessios-orange text-white shadow-sm"
                  : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {t === "ALL" ? "Todos" : typeConfig[t as keyof typeof typeConfig]?.label || t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mr-1">Status:</span>
          {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm font-bold"
                  : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {s === "ALL" ? "Todos" : statusConfig[s as keyof typeof statusConfig]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Agendamentos - M3 Expressive Cards Grid */}
      {isLoading ? (
        <div className="text-center py-24 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
          Carregando agenda técnica...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1">
          <Calendar className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
          <h4 className="text-zinc-900 dark:text-white font-bold text-sm">Nenhum compromisso encontrado</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Cadastre uma nova visita técnica ou filtre por outro status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((app) => {
            const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
            const st = statusConfig[app.status] || statusConfig.SCHEDULED;

            return (
              <div
                key={app.id}
                className="rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] p-6 flex flex-col justify-between space-y-4 shadow-m3-1 hover:shadow-m3-2 hover:border-orange-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                    {app.title}
                  </h3>

                  {app.serviceOrder && (
                    <div className="text-xs text-glessios-orange font-mono font-bold">
                      Vínculo: {app.serviceOrder.code}
                    </div>
                  )}

                  <div className="space-y-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-glessios-orange shrink-0" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {formatDateTime(app.scheduledAt)}
                      </span>
                      <span className="text-[11px] text-zinc-400">({app.durationMinutes} min)</span>
                    </div>

                    {app.locationAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-glessios-orange shrink-0 mt-0.5" />
                        <span className="leading-snug">{app.locationAddress}</span>
                      </div>
                    )}

                    {app.assignedTeam && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-glessios-orange shrink-0" />
                        <span>Equipe: {app.assignedTeam}</span>
                      </div>
                    )}
                  </div>

                  {app.notes && (
                    <p className="text-xs bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] text-zinc-600 dark:text-zinc-400 line-clamp-3">
                      {app.notes}
                    </p>
                  )}
                </div>

                {/* Ações Rápidas de Mudança de Status */}
                <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-2">
                  {app.status === "SCHEDULED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(app.id, "IN_PROGRESS")}
                      className="text-xs w-full justify-center rounded-xl border-black/10 dark:border-white/10"
                    >
                      Iniciar Atendimento
                    </Button>
                  )}
                  {app.status === "IN_PROGRESS" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(app.id, "COMPLETED")}
                      className="text-xs w-full justify-center bg-emerald-600 hover:bg-emerald-500 border-none text-white font-bold rounded-xl"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Concluir
                    </Button>
                  )}
                  {app.status === "COMPLETED" && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mx-auto">
                      <CheckCircle2 className="w-4 h-4" />
                      Serviço Finalizado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agendamento Técnico - M3 Expressive Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <Calendar className="w-4 h-4" />
                </div>
                Novo Agendamento Técnico
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Título do Compromisso *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Medição Técnica — Academia Iron Batel"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Tipo de Agendamento
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all"
                  >
                    <option value="TECHNICAL_VISIT_MEASUREMENT" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Visita Técnica e Medição</option>
                    <option value="EXTERNAL_INSTALLATION" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Instalação Externa de Fachada</option>
                    <option value="INTERNAL_PRODUCTION_RUN" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Produção Interna CNC</option>
                    <option value="DELIVERY_PICKUP" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Entrega / Retirada</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Equipe Responsável
                  </label>
                  <input
                    type="text"
                    value={form.assignedTeam}
                    onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })}
                    placeholder="Equipe 01 - Fachadas"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    WhatsApp para Notificar
                  </label>
                  <input
                    type="tel"
                    value={form.notifyPhone}
                    onChange={(e) => setForm({ ...form, notifyPhone: e.target.value })}
                    placeholder="(41) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Endereço do Local
                </label>
                <input
                  type="text"
                  value={form.locationAddress}
                  onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                  placeholder="Rua / Avenida, Número, Bairro, Cidade"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Orientações para a Equipe de Campo
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Trazer fita métrica laser, EPI de altura, verificar ponto de energia..."
                  className="w-full px-4 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-glessios-orange transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="rounded-xl">
                  Confirmar Agendamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
