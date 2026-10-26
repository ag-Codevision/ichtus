"use client";

import React from "react";
import Link from "next/link";
import { Factory, ArrowRight } from "lucide-react";

interface ProductionColumnData {
  id: string;
  name: string;
  color: string;
  order: number;
  count: number;
}

interface FactoryPipelineChartProps {
  productionColumns: ProductionColumnData[];
  totalActiveOS: number;
  ordersByStage: Record<string, number>;
}

const FACTORY_WORKSTATIONS = [
  { name: "Router CNC", role: "Corte ACM", status: "Operando", isOnline: true },
  { name: "Impressora UV", role: "Impressão", status: "Pronta", isOnline: true },
  { name: "Serralheria", role: "Solda TIG", status: "Ativa", isOnline: true },
  { name: "Bancada LED", role: "Elétrica", status: "Ativa", isOnline: true },
];

export function FactoryPipelineChart({
  productionColumns,
  totalActiveOS,
}: FactoryPipelineChartProps) {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Factory className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Fábrica & Chão CNC
          </h3>
        </div>

        <Link
          href="/admin/producao"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          Linha Fabril
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        {FACTORY_WORKSTATIONS.map((st, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04] text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {st.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {st.name}
            </h4>
            <span className="text-[10px] text-zinc-400 block truncate">
              {st.role}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
            Fluxo em Chão de Fábrica
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            {totalActiveOS} {totalActiveOS === 1 ? "OS ativa" : "OS ativas"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {productionColumns.slice(0, 6).map((col) => (
            <div
              key={col.id}
              className="px-2 py-1.5 rounded-xl bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-1"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: col.color || "#FF650F" }}
                />
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 truncate">
                  {col.name}
                </span>
              </div>
              <span className="font-mono font-bold text-[10px] text-zinc-700 dark:text-zinc-300">
                {col.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
