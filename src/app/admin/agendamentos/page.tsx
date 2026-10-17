"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Phone,
  Filter,
  X,
  MessageSquare,
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
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    INTERNAL_PRODUCTION_RUN: {
      label: "Produção Interna CNC",
      icon: Wrench,
      badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    EXTERNAL_INSTALLATION: {
      label: "Instalação Externa Fachada",
      icon: Users,
      badge: "bg-orange-gradient text-white border-none font-bold",
    },
    DELIVERY_PICKUP: {
      label: "Entrega / Retirada",
      icon: Truck,
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
  };

  const statusConfig = {
    SCHEDULED: { label: "Agendado", badge: "bg-blue-500/15 text-blue-400" },
    IN_PROGRESS: { label: "Em Rota / Em Andamento", badge: "bg-amber-500/15 text-amber-400" },
    COMPLETED: { label: "Concluído", badge: "bg-emerald-500/15 text-emerald-400" },
    CANCELLED: { label: "Cancelado", badge: "bg-rose-500/15 text-rose-400" },
    RESCHEDULED: { label: "Reagendado", badge: "bg-purple-500/15 text-purple-400" },
  };

  const filtered = appointments.filter((app) => {
    const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchType = typeFilter === "ALL" || app.type === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glessios-border-dark">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-glessios-orange" />
              Agendamentos & Equipes de Campo
            </h1>
            <p className="text-xs text-glessios-text-body">
              Controle de visitas de medição, execução de montagens e cronograma de instalação externa de fachadas.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="gap-2 text-xs font-bold shadow-orange-glow self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento Técnico
          </Button>
        </div>

        {/* Filtros de Tipo e Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-glessios-graphite p-4 rounded-2xl border border-glessios-border-dark">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-glessios-text-body font-semibold">Tipo:</span>
            {["ALL", "TECHNICAL_VISIT_MEASUREMENT", "EXTERNAL_INSTALLATION", "INTERNAL_PRODUCTION_RUN"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-glessios-orange text-white"
                    : "bg-glessios-charcoal text-glessios-text-body hover:text-white border border-glessios-border-dark"
                }`}
              >
                {t === "ALL" ? "Todos" : typeConfig[t as keyof typeof typeConfig]?.label || t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-glessios-text-body font-semibold">Status:</span>
            {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-white text-black font-bold"
                    : "bg-glessios-charcoal text-glessios-text-body hover:text-white border border-glessios-border-dark"
                }`}
              >
                {s === "ALL" ? "Todos" : statusConfig[s as keyof typeof statusConfig]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-glessios-text-body">
            Carregando agenda técnica...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-glessios-graphite border border-glessios-border-dark">
            <Calendar className="w-10 h-10 text-glessios-orange mx-auto mb-3 opacity-60" />
            <h4 className="text-white font-bold text-sm">Nenhum compromisso encontrado</h4>
            <p className="text-xs text-glessios-text-body mt-1">
              Cadastre uma nova visita técnica ou filtre por outro status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((app) => {
              const cfg = typeConfig[app.type] || typeConfig.TECHNICAL_VISIT_MEASUREMENT;
              const Icon = cfg.icon;
              const st = statusConfig[app.status] || statusConfig.SCHEDULED;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl bg-glessios-graphite border border-glessios-border-dark p-6 flex flex-col justify-between space-y-4 hover:border-glessios-orange/40 hover:shadow-card-hover transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase px-2.5 py-1 rounded-md border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-tight">
                      {app.title}
                    </h3>

                    {app.serviceOrder && (
                      <div className="text-xs text-glessios-orange font-mono font-semibold">
                        Vínculo: {app.serviceOrder.code}
                      </div>
                    )}

                    <div className="space-y-2 pt-2 text-xs text-glessios-text-body">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-glessios-orange shrink-0" />
                        <span className="font-semibold text-white">
                          {formatDateTime(app.scheduledAt)}
                        </span>
                        <span className="text-[10px]">({app.durationMinutes} min)</span>
                      </div>

                      {app.locationAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-glessios-orange shrink-0 mt-0.5" />
                          <span>{app.locationAddress}</span>
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
                      <p className="text-xs bg-glessios-charcoal p-3 rounded-xl border border-glessios-border-dark text-glessios-text-body/90 line-clamp-3">
                        {app.notes}
                      </p>
                    )}
                  </div>

                  {/* Ações Rápidas de Mudança de Status */}
                  <div className="pt-4 border-t border-glessios-border-dark flex items-center justify-between gap-2">
                    {app.status === "SCHEDULED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(app.id, "IN_PROGRESS")}
                        className="text-xs w-full justify-center"
                      >
                        Iniciar Atendimento
                      </Button>
                    )}
                    {app.status === "IN_PROGRESS" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(app.id, "COMPLETED")}
                        className="text-xs w-full justify-center bg-emerald-600 hover:bg-emerald-500 border-none text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Concluir
                      </Button>
                    )}
                    {app.status === "COMPLETED" && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
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

      {/* Modal para Agendamento Técnico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-glessios-graphite border border-glessios-border-orange/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-glessios-border-dark">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-glessios-orange" />
                Novo Agendamento Técnico
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-glessios-text-body hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Título do Compromisso *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Medição Técnica — Academia Iron Batel"
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    Tipo de Agendamento
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  >
                    <option value="TECHNICAL_VISIT_MEASUREMENT">Visita Técnica e Medição</option>
                    <option value="EXTERNAL_INSTALLATION">Instalação Externa de Fachada</option>
                    <option value="INTERNAL_PRODUCTION_RUN">Produção Interna CNC</option>
                    <option value="DELIVERY_PICKUP">Entrega / Retirada</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    Equipe Responsável
                  </label>
                  <input
                    type="text"
                    value={form.assignedTeam}
                    onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })}
                    placeholder="Equipe 01 - Fachadas"
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                    WhatsApp para Confirmar
                  </label>
                  <input
                    type="tel"
                    value={form.notifyPhone}
                    onChange={(e) => setForm({ ...form, notifyPhone: e.target.value })}
                    placeholder="(41) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Endereço do Local
                </label>
                <input
                  type="text"
                  value={form.locationAddress}
                  onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                  placeholder="Rua / Avenida, Número, Bairro, Cidade"
                  className="w-full px-4 py-2.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-glessios-text-heading">
                  Orientações para a Equipe de Campo
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Trazer fita métrica laser, EPI de altura, verificar ponto de energia..."
                  className="w-full px-4 py-2 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
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
