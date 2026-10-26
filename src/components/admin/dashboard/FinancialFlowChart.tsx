"use client";

import React from "react";
import Link from "next/link";
import { DollarSign, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialFlowChartProps {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  pipelineValue: number;
  stockValue: number;
}

export function FinancialFlowChart({
  totalInvoiced,
  totalPaid,
  totalPending,
  pipelineValue,
  stockValue,
}: FinancialFlowChartProps) {
  const paidPercent = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
  const pendingPercent = totalInvoiced > 0 ? (totalPending / totalInvoiced) * 100 : 100;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-glessios-orange flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Saúde Financeira
          </h3>
        </div>

        <Link
          href="/admin/financeiro"
          className="text-xs font-semibold text-glessios-orange hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          DRE & Faturas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 py-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Total Emitido
          </span>
          <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white font-mono">
            {formatCurrency(totalInvoiced)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Patrimônio Estoque
          </span>
          <span className="text-sm sm:text-base font-black text-amber-500 font-mono">
            {formatCurrency(stockValue)}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
              Status de Liquidação de Faturas
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {paidPercent.toFixed(0)}% liquidado
            </span>
          </div>

          <div className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${paidPercent}%` }}
              title={`Pago: ${formatCurrency(totalPaid)}`}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${pendingPercent}%` }}
              title={`Pendente: ${formatCurrency(totalPending)}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              {formatCurrency(totalPaid)} Pago
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
              <Clock className="w-3 h-3" />
              {formatCurrency(totalPending)} A Receber
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
            Oportunidades em Negociação
          </span>
          <span className="font-mono font-bold text-glessios-orange text-xs">
            {formatCurrency(pipelineValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
