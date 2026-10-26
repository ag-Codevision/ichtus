"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Kanban, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KanbanColumnData {
  id: string;
  name: string;
  color: string;
  order: number;
  count: number;
  totalValue: number;
}

interface SalesFunnelChartProps {
  columns: KanbanColumnData[];
  totalLeads: number;
  totalPipelineValue: number;
  conversionRate: number;
}

export function SalesFunnelChart({
  columns,
  totalLeads,
  totalPipelineValue,
  conversionRate,
}: SalesFunnelChartProps) {
  const activeColumns = columns.filter((c) => c.count > 0 || c.totalValue > 0);
  const displayColumns = activeColumns.length > 0 ? activeColumns : columns.slice(0, 5);
  const maxVal = Math.max(...displayColumns.map((c) => c.totalValue), 1);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-glessios-orange flex items-center justify-center">
            <Kanban className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Funil Comercial
          </h3>
        </div>

        <Link
          href="/admin/kanban"
          className="text-xs font-semibold text-glessios-orange hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          Kanban
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-b border-black/[0.04] dark:border-white/[0.05] text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Pipeline
          </span>
          <span className="text-sm sm:text-base font-black text-glessios-orange font-mono">
            {formatCurrency(totalPipelineValue)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Oportunidades
          </span>
          <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
            {totalLeads} leads
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Conversão
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
            {conversionRate.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-3">
        {displayColumns.map((col) => {
          const percent =
            totalPipelineValue > 0 && col.totalValue > 0
              ? Math.max((col.totalValue / maxVal) * 100, 15)
              : col.count > 0
              ? 25
              : 8;

          return (
            <div key={col.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color || "#FF650F" }}
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate text-[11px]">
                    {col.name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    ({col.count})
                  </span>
                </div>
                <span className="font-mono font-bold text-[11px] text-zinc-900 dark:text-white">
                  {col.totalValue > 0 ? formatCurrency(col.totalValue) : "R$ 0"}
                </span>
              </div>

              <div className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: col.color || "#FF650F",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
