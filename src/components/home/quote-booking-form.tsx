"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { M3ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  User,
  Sparkles,
  MessageSquare,
  Building2,
  Calendar,
} from "lucide-react";

export function QuoteBookingForm() {
  const [formData, setFormData] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    serviceType: "Design & Identidade Visual",
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
        notes: `Serviço Solicitado: ${formData.serviceType}\nDetalhes: ${formData.notes}`,
        estimatedValue: formData.serviceType.includes("Fachada") ? 8500 : 3500,
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
        setErrorMessage(data.error || "Ocorreu um erro ao enviar sua mensagem.");
      }
    } catch {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente ou chame no WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="contato" className="scroll-mt-24 text-white">
      {/* Título da Seção com M3ScrollReveal */}
      <M3ScrollReveal variant="fadeUp" className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <Badge variant="orange" className="font-semibold tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Fale Conosco
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Entre em contato
        </h2>
        <p className="text-sm sm:text-base text-zinc-400">
          Nosso trabalho é pensar em soluções, deixe-nos te ajudar. Retornamos com rapidez e atenção dedicada.
        </p>
      </M3ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel da Esquerda: Dados de Contato Direto */}
        <M3ScrollReveal variant="fadeUp" delay={0.05} className="lg:col-span-5 space-y-6">
          <SpotlightCard
            isDark={true}
            className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] space-y-6 shadow-xl"
          >
            <h3 className="text-xl font-extrabold text-white pb-3 border-b border-white/[0.08]">
              Canais Diretos de Atendimento
            </h3>

            {/* Telefones & WhatsApp */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF650F] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#FF650F]">
                    WhatsApp (Atendimento Rápido)
                  </span>
                  <a
                    href="https://wa.me/5551981192976"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base sm:text-lg font-extrabold text-white hover:text-[#FF650F] transition-colors"
                  >
                    +55 51 98119.2976 (w)
                  </a>
                  <a
                    href="tel:+555135746167"
                    className="block text-sm text-zinc-400 hover:text-white transition-colors mt-0.5"
                  >
                    55 51 3574.6167
                  </a>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-4 pt-3 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center text-[#FF650F] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                    Endereço
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Rua Buenos Aires, 437 / 203
                  </p>
                  <p className="text-xs text-zinc-400">
                    Jardim Botânico / Porto Alegre / RS
                  </p>
                  <p className="text-xs text-[#FF650F] font-mono mt-0.5">
                    CEP: 90670-130 / Brasil
                  </p>
                </div>
              </div>

              {/* E-mails */}
              <div className="flex items-start gap-4 pt-3 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center text-[#FF650F] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                    E-mails
                  </span>
                  <a
                    href="mailto:glessios@hotmail.com"
                    className="block text-sm font-semibold text-white hover:text-[#FF650F] transition-colors mt-0.5"
                  >
                    glessios@hotmail.com
                  </a>
                  <a
                    href="mailto:glessios@gmail.com"
                    className="block text-sm font-semibold text-white hover:text-[#FF650F] transition-colors"
                  >
                    glessios@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Botão WhatsApp */}
            <div className="pt-2">
              <a
                href="https://wa.me/5551981192976?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20Glessios."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                Conversar pelo WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </SpotlightCard>
        </M3ScrollReveal>

        {/* Painel da Direita: Formulário */}
        <M3ScrollReveal variant="fadeUp" delay={0.1} className="lg:col-span-7">
          <SpotlightCard
            isDark={true}
            className="rounded-3xl bg-[#18191D] border border-white/[0.08] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none -z-10" />

            {isSuccess ? (
              <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Mensagem Enviada com Sucesso!
                  </h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Agradecemos seu contato, <span className="text-white font-semibold">{formData.contactName}</span>. Retornaremos em breve no número <span className="text-[#FF650F] font-semibold">{formData.contactPhone}</span>.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/5551981192976?text=Ol%C3%A1,%20meu%20nome%20%C3%A9%20${encodeURIComponent(formData.contactName)}%20e%20acabei%20de%20enviar%20uma%20mensagem%20pelo%20site.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition-all"
                  >
                    Confirmar no WhatsApp
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Button
                    variant="outline-dark"
                    size="md"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        contactName: "",
                        contactPhone: "",
                        contactEmail: "",
                        serviceType: "Design & Identidade Visual",
                        notes: "",
                        wantVisit: false,
                        visitDate: "",
                      });
                    }}
                  >
                    Enviar Outra Mensagem
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Envie sua mensagem
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Preencha os campos abaixo e entraremos em contato.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contactName" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#FF650F]" />
                      Seu Nome / Empresa *
                    </label>
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Ex: João da Silva / Loja Tech"
                      className="w-full px-4 py-3 rounded-xl bg-[#121316] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contactPhone" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF650F]" />
                      WhatsApp para Contato *
                    </label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="(51) 98119-2976"
                      className="w-full px-4 py-3 rounded-xl bg-[#121316] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contactEmail" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#FF650F]" />
                      E-mail
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#121316] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="serviceType" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#FF650F]" />
                      Área de Interesse
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#121316] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all"
                    >
                      <option value="Design & Identidade Visual">Design & Identidade Visual</option>
                      <option value="Letreiros Luminosos & Caixa Alta">Letreiros Luminosos & Caixa Alta</option>
                      <option value="Fachadas Comerciais em ACM">Fachadas Comerciais em ACM</option>
                      <option value="Placas & Sinalização Arquitetônica">Placas & Sinalização Arquitetônica</option>
                      <option value="Painéis & Router CNC">Painéis & Router CNC</option>
                      <option value="Quadros Decorativos">Quadros Decorativos</option>
                      <option value="Troféus Personalizados">Troféus Personalizados</option>
                      <option value="Consultoria & Otimização de Custos">Consultoria & Otimização de Custos</option>
                      <option value="Gerenciamento de Projetos">Gerenciamento de Projetos</option>
                      <option value="Produtos Web & Presença Digital">Produtos Web & Presença Digital</option>
                      <option value="Outros Serviços">Outros Serviços</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF650F]" />
                    Como podemos te ajudar? (Mensagem)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Descreva seu projeto, ideias ou necessidades..."
                    className="w-full px-4 py-3 rounded-xl bg-[#121316] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#FF650F] focus:ring-1 focus:ring-[#FF650F] transition-all"
                  />
                </div>

                {/* Opção de Reunião ou Medição */}
                <div className="p-3.5 rounded-xl bg-[#121316] border border-white/[0.08] space-y-2">
                  <label htmlFor="wantVisit" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="wantVisit"
                      name="wantVisit"
                      type="checkbox"
                      checked={formData.wantVisit}
                      onChange={(e) => setFormData({ ...formData, wantVisit: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF650F] focus:ring-[#FF650F] bg-[#18191D] border-white/20"
                    />
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF650F]" />
                      Gostaria de agendar uma reunião ou medição no local
                    </span>
                  </label>

                  {formData.wantVisit && (
                    <div className="pt-2">
                      <input
                        type="datetime-local"
                        required={formData.wantVisit}
                        value={formData.visitDate}
                        onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#18191D] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#FF650F]"
                      />
                    </div>
                  )}
                </div>

                {/* Botão Enviar solicitado na copy */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full gap-2 text-base font-bold shadow-lg"
                >
                  Enviar
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            )}
          </SpotlightCard>
        </M3ScrollReveal>
      </div>
    </div>
  );
}
