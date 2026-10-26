"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StockCategoryData {
  category: string;
  count: number;
  totalQuantity: number;
  totalValue: number;
}

interface StockDonutChartProps {
  categories: StockCategoryData[];
  totalStockValue: number;
  totalItems: number;
  criticalStockCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Chapas: "#FF650F",
  Acrílicos: "#3B82F6",
  Fontes: "#10B981",
  Lonas: "#8B5CF6",
  LEDs: "#F59E0B",
  Adesivos: "#EC4899",
  Ferragens: "#6B7280",
  Geral: "#6366F1",
};

export function StockDonutChart({
  categories,
  totalStockValue,
  totalItems,
  criticalStockCount,
}: StockDonutChartProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const size = 120;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = categories.map((cat) => {
    const percent = totalStockValue > 0 ? (cat.totalValue / totalStockValue) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      ...cat,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color: CATEGORY_COLORS[cat.category] || "#9CA3AF",
    };
  });

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col justify-between transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Package className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Estoque de Insumos
          </h3>
        </div>

        <Link
          href="/admin/estoque"
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          Almoxarifado
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center gap-4 py-3">
        <div className="relative w-[120px] h-[120px] shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="rotate-[-90deg]"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-black/[0.04] dark:text-white/[0.05]"
            />
            {segments.map((seg) => (
              <circle
                key={seg.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={activeCategory === seg.category ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setActiveCategory(seg.category)}
                onMouseLeave={() => setActiveCategory(null)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400">Total</span>
            <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">
              {formatCurrency(totalStockValue)}
            </span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {segments.slice(0, 6).map((seg) => (
            <div
              key={seg.category}
              className="flex items-center justify-between gap-1 p-1 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              onMouseEnter={() => setActiveCategory(seg.category)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {seg.category}
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                {seg.percent.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{totalItems} materiais cadastrados</span>
        {criticalStockCount > 0 ? (
          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {criticalStockCount} em reposição
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Estoque seguro</span>
        )}
      </div>
    </div>
  );
}
