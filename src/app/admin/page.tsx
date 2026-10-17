"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Kanban,
  Calendar,
  Layers,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Factory,
  Briefcase,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "business" | "factory">("all");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/15 px-2.5 py-0.5 rounded-full border border-glessios-border-orange">
              Painel Integrado • Role ADMIN
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operações em Tempo Real
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Central de Comando Geral
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-glessios-text-body font-medium">
            Gestão estratégica, funil de vendas, finanças e controle direto do chão de fábrica CNC em um só lugar.
          </p>
        </div>

        {/* Filtro Rápido de Visão */}
        <div className="flex items-center bg-zinc-100 dark:bg-glessios-charcoal p-1 rounded-2xl border border-zinc-200 dark:border-glessios-border-dark shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-white dark:bg-glessios-graphite text-zinc-900 dark:text-white shadow-sm border border-zinc-200/60 dark:border-white/10"
                : "text-zinc-600 dark:text-glessios-text-body hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Visão Consolidada
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "business"
                ? "bg-white dark:bg-glessios-graphite text-glessios-orange shadow-sm border border-zinc-200/60 dark:border-white/10"
                : "text-zinc-600 dark:text-glessios-text-body hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Gestão
          </button>
          <button
            onClick={() => setActiveTab("factory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "factory"
                ? "bg-white dark:bg-glessios-graphite text-emerald-500 shadow-sm border border-zinc-200/60 dark:border-white/10"
                : "text-zinc-600 dark:text-glessios-text-body hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            Fábrica & CNC
          </button>
        </div>
      </div>

      {/* Grid de 4 KPIs Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento do Mês */}
        <div className="p-5 rounded-2xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark shadow-sm group hover:border-glessios-orange/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-glessios-text-body uppercase tracking-wider">
              Faturamento (Outubro)
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-glessios-orange flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">R$ 148.500</span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-glessios-text-body mt-1">
            Margem de lucro operacional: 42.1%
          </p>
        </div>

        {/* KPI 2: Leads Ativos no CRM */}
        <div className="p-5 rounded-2xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark shadow-sm group hover:border-glessios-orange/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-glessios-text-body uppercase tracking-wider">
              Funil Comercial
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">14 Projetos</span>
            <span className="text-[11px] font-bold text-blue-500">5 em proposta</span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-glessios-text-body mt-1">
            Taxa de conversão de leads: 64%
          </p>
        </div>

        {/* KPI 3: Obras na Linha Fabril */}
        <div className="p-5 rounded-2xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark shadow-sm group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-glessios-text-body uppercase tracking-wider">
              Linha de Produção
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">8 Fachadas</span>
            <span className="text-[11px] font-bold text-emerald-500">2 no CNC Router</span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-glessios-text-body mt-1">
            3 em montagem LED • 1 em instalação
          </p>
        </div>

        {/* KPI 4: Nível de Estoque */}
        <div className="p-5 rounded-2xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark shadow-sm group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-glessios-text-body uppercase tracking-wider">
              Estoque de Insumos
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">120 Chapas</span>
            <span className="text-[11px] font-bold text-amber-500 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-0.5" /> 2 alertas
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-glessios-text-body mt-1">
            ACM Prata 3mm próximo da cota mínima
          </p>
        </div>
      </div>

      {/* Grid Principal: 2 Colunas Lado a Lado (Gestão Geral vs Fábrica CNC) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: GESTÃO & NEGÓCIOS */}
        {(activeTab === "all" || activeTab === "business") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-glessios-orange" />
                Gestão Comercial & Financeira
              </h2>
              <Link
                href="/admin/crm"
                className="text-xs font-bold text-glessios-orange hover:underline flex items-center gap-1"
              >
                Abrir CRM
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card: Funil de Vendas Recente */}
            <div className="p-5 rounded-3xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Negócios em Andamento no Funil
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-glessios-text-body">
                    Principais contas qualificadas e propostas enviadas
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                  R$ 96.800 em propostas
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    client: "Loja Concept Batel",
                    project: "Fachada ACM Black Piano + Letra Caixa LED 3D",
                    value: "R$ 42.500",
                    status: "Aprovado / Em Produção",
                    statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  },
                  {
                    client: "Rede Farmácias São João",
                    project: "Reforma Estrutural e Letreiro Frontlight 12m",
                    value: "R$ 38.000",
                    status: "Proposta Enviada",
                    statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  },
                  {
                    client: "Clínica Odonto Prime",
                    project: "Totem Dupla Face ACM + Neon LED Interno",
                    value: "R$ 16.300",
                    status: "Briefing / Medição",
                    statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-glessios-charcoal border border-zinc-200/70 dark:border-white/[0.04] flex items-center justify-between gap-3 hover:border-glessios-orange/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.client}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-glessios-text-body truncate mt-0.5">
                        {item.project}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões de Acesso Rápido de Gestão */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/admin/financeiro"
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.04] text-center transition-all group"
                >
                  <DollarSign className="w-4 h-4 text-glessios-orange mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    DRE Financeiro
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-glessios-text-body">
                    Faturamento & Custos
                  </span>
                </Link>

                <Link
                  href="/admin/agendamentos"
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.04] text-center transition-all group"
                >
                  <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Agendamentos
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-glessios-text-body">
                    Visitas & Instalações
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* COLUNA 2: FÁBRICA & OPERAÇÕES CNC */}
        {(activeTab === "all" || activeTab === "factory") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-400" />
                Fábrica & Chão de Operações CNC
              </h2>
              <Link
                href="/admin/producao"
                className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
              >
                Abrir Linha Fabril
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card: Monitoramento das Estações Fabris */}
            <div className="p-5 rounded-3xl bg-white dark:bg-glessios-graphite border border-zinc-200 dark:border-glessios-border-dark space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Estações de Trabalho Ativas
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-glessios-text-body">
                    Status das máquinas de corte, impressão e bancadas
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-glessios-orange bg-glessios-orange/10 px-2.5 py-1 rounded-xl">
                  4 de 4 Operacionais
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: "Router CNC 3 Eixos", status: "Cortando ACM 3mm", color: "text-emerald-500", badge: "Online" },
                  { name: "Impressora UV Híbrida", status: "Livre / Aquecida", color: "text-blue-500", badge: "Disponível" },
                  { name: "Serralheria & Solda TIG", status: "Estrutura Batel", color: "text-emerald-500", badge: "Em Montagem" },
                  { name: "Bancada Elétrica LED", status: "Instalação Módulos", color: "text-amber-500", badge: "Fase 5/8" },
                ].map((station, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-glessios-charcoal border border-zinc-200/70 dark:border-white/[0.04]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-glessios-text-body uppercase">
                        {station.badge}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {station.name}
                    </h4>
                    <p className={`text-[11px] font-medium truncate mt-0.5 ${station.color}`}>
                      {station.status}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status das 8 Fases e Estoque */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-glessios-charcoal border border-zinc-200/70 dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                  <span>Projeto em Destaque: Fachada Concept Batel</span>
                  <span className="text-glessios-orange font-mono">Fase 5 de 8 (62%)</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-gradient h-full rounded-full transition-all duration-500"
                    style={{ width: "62%" }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-glessios-text-body">
                  <span>Atual: Montagem de Módulos LED</span>
                  <span>Próximo: Inspeção de Qualidade</span>
                </div>
              </div>

              {/* Botões de Acesso Rápido da Fábrica */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/admin/producao"
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.04] text-center transition-all group"
                >
                  <Layers className="w-4 h-4 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Linha de Produção
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-glessios-text-body">
                    8 Fases & Provas WACLI
                  </span>
                </Link>

                <Link
                  href="/admin/estoque"
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.04] text-center transition-all group"
                >
                  <Package className="w-4 h-4 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Controle de Estoque
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-glessios-text-body">
                    ACM, LEDs & Insumos
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
