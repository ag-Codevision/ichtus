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

import { SegmentedButton } from "@/components/ui/segmented-button";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "business" | "factory">("all");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho do Dashboard - M3 Expressive Surface */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Painel Integrado • Role ADMIN
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operações em Tempo Real
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Central de Comando Geral
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Gestão estratégica, funil de vendas, finanças e controle direto do chão de fábrica CNC em um só lugar.
          </p>
        </div>

        {/* Filtro Rápido de Visão - M3 Segmented Button com Indicador Elástico */}
        <div className="shrink-0">
          <SegmentedButton<"all" | "business" | "factory">
            value={activeTab}
            onChange={setActiveTab}
            layoutId="admin-dashboard-view-tabs"
            options={[
              { value: "all", label: "Visão Geral" },
              {
                value: "business",
                label: "Gestão",
                icon: <Briefcase className="w-3.5 h-3.5" />,
              },
              {
                value: "factory",
                label: "Fábrica & CNC",
                icon: <Factory className="w-3.5 h-3.5" />,
              },
            ]}
          />
        </div>
      </div>

      {/* Grid de 4 KPIs Consolidados - M3 Expressive Cards com Entrada Escalonada */}
      <M3StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento do Mês */}
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 transition-all group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Faturamento (Mês)
                </span>
                <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-glessios-orange flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">R$ 148.500</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              Margem operacional média de 42.1%
            </p>
          </div>
        </M3StaggerItem>

        {/* KPI 2: Leads Ativos no CRM */}
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 transition-all group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Funil Comercial
                </span>
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Kanban className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">14 Projetos</span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">5 em proposta</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              Taxa de conversão de orçamentos: 64%
            </p>
          </div>
        </M3StaggerItem>

        {/* KPI 3: Obras na Linha Fabril */}
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 transition-all group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Linha de Produção
                </span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">8 Fachadas</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">2 no Router CNC</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              3 em montagem LED • 1 em montagem
            </p>
          </div>
        </M3StaggerItem>

        {/* KPI 4: Nível de Estoque */}
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 hover:shadow-m3-2 transition-all group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Estoque de Insumos
                </span>
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">120 Chapas</span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-0.5" /> 2 alertas
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              ACM Prata 3mm em cota de reposição
            </p>
          </div>
        </M3StaggerItem>
      </M3StaggerContainer>

      {/* Grid Principal: Alternância de Abas com Entrada Escalonada de Cards */}
      <M3TabPanel activeKey={activeTab}>
        <M3StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA 1: GESTÃO & NEGÓCIOS */}
          {(activeTab === "all" || activeTab === "business") && (
            <M3StaggerItem className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-glessios-orange" />
                  Gestão Comercial & Financeira
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/crm"
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Contatos
                  </Link>
                  <Link
                    href="/admin/kanban"
                    className="text-xs font-bold text-glessios-orange hover:opacity-80 flex items-center gap-1 transition-opacity"
                  >
                    Abrir Funil
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card: Funil de Vendas Recente */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] space-y-4 shadow-m3-1">
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Negócios no Funil Comercial
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Contas qualificadas e propostas recentes
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
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
                      statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    },
                    {
                      client: "Rede Farmácias São João",
                      project: "Reforma Estrutural e Letreiro Frontlight 12m",
                      value: "R$ 38.000",
                      status: "Proposta Enviada",
                      statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    },
                    {
                      client: "Clínica Odonto Prime",
                      project: "Totem Dupla Face ACM + Neon LED Interno",
                      value: "R$ 16.300",
                      status: "Briefing / Medição",
                      statusColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-3 hover:border-orange-500/30 transition-colors"
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
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
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
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Link
                    href="/admin/financeiro"
                    className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.05] text-center transition-all group"
                  >
                    <DollarSign className="w-4 h-4 text-glessios-orange mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      DRE Financeiro
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Faturamento & Custos
                    </span>
                  </Link>

                  <Link
                    href="/admin/agendamentos"
                    className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.05] text-center transition-all group"
                  >
                    <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Agendamentos
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Visitas & Instalações
                    </span>
                  </Link>
                </div>
              </div>
            </M3StaggerItem>
          )}

          {/* COLUNA 2: FÁBRICA & OPERAÇÕES CNC */}
          {(activeTab === "all" || activeTab === "factory") && (
            <M3StaggerItem className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-emerald-500" />
                  Fábrica & Chão de Operações CNC
                </h2>
                <Link
                  href="/admin/producao"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1 transition-opacity"
                >
                  Abrir Linha Fabril
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card: Monitoramento das Estações Fabris */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] space-y-4 shadow-m3-1">
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Estações de Trabalho Ativas
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Status das máquinas de corte, impressão e bancadas
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full">
                    4 de 4 Operacionais
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "Router CNC 3 Eixos", status: "Cortando ACM 3mm", color: "text-emerald-600 dark:text-emerald-400", badge: "Online" },
                    { name: "Impressora UV Híbrida", status: "Livre / Aquecida", color: "text-blue-600 dark:text-blue-400", badge: "Disponível" },
                    { name: "Serralheria & Solda TIG", status: "Estrutura Batel", color: "text-emerald-600 dark:text-emerald-400", badge: "Em Montagem" },
                    { name: "Bancada Elétrica LED", status: "Instalação Módulos", color: "text-amber-600 dark:text-amber-400", badge: "Fase 5/8" },
                  ].map((station, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
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
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                    <span>Projeto em Destaque: Fachada Concept Batel</span>
                    <span className="text-glessios-orange font-mono">Fase 5 de 8 (62%)</span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-gradient h-full rounded-full transition-all duration-500"
                      style={{ width: "62%" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>Atual: Montagem de Módulos LED</span>
                    <span>Próximo: Inspeção de Qualidade</span>
                  </div>
                </div>

                {/* Botões de Acesso Rápido da Fábrica */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Link
                    href="/admin/producao"
                    className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.05] text-center transition-all group"
                  >
                    <Layers className="w-4 h-4 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Linha de Produção
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      8 Fases & Provas WACLI
                    </span>
                  </Link>

                  <Link
                    href="/admin/estoque"
                    className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.05] text-center transition-all group"
                  >
                    <Package className="w-4 h-4 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Controle de Estoque
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      ACM, LEDs & Insumos
                    </span>
                  </Link>
                </div>
              </div>
            </M3StaggerItem>
          )}
        </M3StaggerContainer>
      </M3TabPanel>
    </div>
  );
}
