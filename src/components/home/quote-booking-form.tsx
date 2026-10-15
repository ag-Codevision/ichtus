"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Mail,
  User,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export function QuoteBookingForm() {
  const [formData, setFormData] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    serviceType: "Fachada Comercial em ACM",
    notes: "",
    wantVisit: false,
    visitDate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        title: `${formData.serviceType} — ${formData.contactName}`,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail || null,
        notes: `Tipo de Solução: ${formData.serviceType}\nDetalhes do Projeto: ${formData.notes}`,
        estimatedValue: formData.serviceType.includes("Fachada") ? 8500 : 3800,
      };

      if (formData.wantVisit && formData.visitDate) {
        payload.scheduledVisitDate = new Date(formData.visitDate).toISOString();
      }

      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || "Ocorreu um erro ao enviar sua solicitação.");
      }
    } catch {
      setErrorMessage("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-glessios-graphite border border-glessios-border-orange/50 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-glessios-orange/10 blur-[80px] pointer-events-none -z-10" />

      {isSuccess ? (
        <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Solicitação Enviada com Sucesso!
            </h3>
            <p className="text-sm text-glessios-text-body max-w-md mx-auto leading-relaxed">
              Recebemos suas especificações. Seu projeto já entrou em nossa esteira de engenharia e você receberá uma confirmação no WhatsApp <span className="text-glessios-orange font-semibold">{formData.contactPhone}</span>.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <LinkToWhatsApp phone={formData.contactPhone} name={formData.contactName} />
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  contactName: "",
                  contactPhone: "",
                  contactEmail: "",
                  serviceType: "Fachada Comercial em ACM",
                  notes: "",
                  wantVisit: false,
                  visitDate: "",
                });
              }}
            >
              Enviar Outro Orçamento
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <Badge variant="orange" className="text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Atendimento Técnico Direto
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Solicite seu Orçamento & Estudo 3D
            </h3>
            <p className="text-xs sm:text-sm text-glessios-text-body">
              Preencha os dados abaixo. Retornamos com estudo preliminar e estimativa de investimento em até 24h.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-glessios-text-heading flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-glessios-orange" />
                Seu Nome / Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Ex: João da Silva / Loja Tech"
                className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-glessios-text-heading flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-glessios-orange" />
                WhatsApp para Contato *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="(41) 99999-9999"
                className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-glessios-text-heading flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-glessios-orange" />
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contato@empresa.com.br"
                className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-glessios-text-heading flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-glessios-orange" />
                Tipo de Solução
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
              >
                <option value="Fachada Comercial em ACM">Fachada Comercial em ACM</option>
                <option value="Letreiro Luminoso LED / Neon">Letreiro Luminoso LED / Neon</option>
                <option value="Corte Router CNC / Laser">Corte Router CNC / Laser</option>
                <option value="Totem Publicitário & Pórtico">Totem Publicitário & Pórtico</option>
                <option value="Envelopamento de Frota">Envelopamento de Frota</option>
                <option value="Sinalização Arquitetônica Interna">Sinalização Arquitetônica Interna</option>
              </select>
            </div>
          </div>

          {/* Opção de Agendamento de Visita Técnica */}
          <div className="p-4 rounded-xl bg-glessios-charcoal border border-glessios-border-dark space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.wantVisit}
                onChange={(e) => setFormData({ ...formData, wantVisit: e.target.checked })}
                className="w-4 h-4 rounded text-glessios-orange focus:ring-glessios-orange bg-glessios-graphite border-glessios-border-dark"
              />
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-glessios-orange" />
                Desejo agendar visita técnica prévia de medição no local
              </span>
            </label>

            {formData.wantVisit && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="text-[11px] uppercase tracking-wider text-glessios-text-body block mb-1">
                  Data e Horário Preferencial:
                </label>
                <input
                  type="datetime-local"
                  required={formData.wantVisit}
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-glessios-graphite border border-glessios-border-dark text-white text-xs focus:outline-none focus:border-glessios-orange"
                />
              </div>
            )}
          </div>

          {/* Descrição e Medidas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-glessios-text-heading flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-glessios-orange" />
              Medidas Aproximadas ou Detalhes da Ideia
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Fachada de 6x3 metros, cor grafite com letras caixa em acrílico iluminadas..."
              className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm placeholder:text-glessios-text-body/40 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full gap-2 text-base font-bold shadow-orange-glow"
          >
            Enviar Solicitação para Engenharia
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      )}
    </div>
  );
}

function LinkToWhatsApp({ phone, name }: { phone: string; name: string }) {
  const cleanPhone = phone.replace(/\D/g, "");
  const target = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const text = encodeURIComponent(
    `Olá! Sou ${name}, acabei de solicitar um orçamento para fachada pelo site e gostaria de conversar.`
  );

  return (
    <a
      href={`https://wa.me/5541999999999?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
    >
      Conversar Agora pelo WhatsApp
      <ArrowRight className="w-4 h-4" />
    </a>
  );
}
