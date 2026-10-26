"use client";

import React from "react";
import { Search, X, Users, Briefcase, Truck, Wrench, Building2, User, ArrowUpDown, Sparkles } from "lucide-react";

export type FilterChipType = "ALL" | "LEAD" | "CUSTOMER" | "SUPPLIER" | "SERVICE_PROVIDER" | "PJ" | "PF";

interface GoogleSearchBarWithChipsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterChipType;
  onFilterChange: (filter: FilterChipType) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  counts: {
    total: number;
    leads?: number;
    customers: number;
    suppliers: number;
    serviceProviders: number;
  };
}

export function GoogleSearchBarWithChips({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  counts,
}: GoogleSearchBarWithChipsProps) {
  const chips: { id: FilterChipType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "ALL", label: "Todos", icon: <Users className="w-3.5 h-3.5" />, count: counts.total },
    { id: "LEAD", label: "Leads", icon: <Sparkles className="w-3.5 h-3.5" />, count: counts.leads },
    { id: "CUSTOMER", label: "Clientes", icon: <Briefcase className="w-3.5 h-3.5" />, count: counts.customers },
    { id: "SUPPLIER", label: "Fornecedores", icon: <Truck className="w-3.5 h-3.5" />, count: counts.suppliers },
    { id: "SERVICE_PROVIDER", label: "Prestadores", icon: <Wrench className="w-3.5 h-3.5" />, count: counts.serviceProviders },
    { id: "PJ", label: "Pessoa Jurídica", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "PF", label: "Pessoa Física", icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Barra de Pesquisa + Seletor de Ordenação estilo Google Material You */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <div className="relative flex-1">
          <div className="group relative flex items-center w-full h-12 sm:h-13 px-4 rounded-full bg-zinc-100 dark:bg-[#1E1F25] hover:bg-zinc-200/80 dark:hover:bg-[#25272F] focus-within:bg-white dark:focus-within:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] focus-within:border-[#FF650F]/50 shadow-sm transition-all duration-200">
            <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-focus-within:text-[#FF650F] transition-colors shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar contatos, CNPJ, WhatsApp, cidade..."
              className="w-full h-full bg-transparent px-3 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {onSortChange && (
          <div className="flex items-center gap-1.5 px-4 h-12 sm:h-13 rounded-full bg-zinc-100 dark:bg-[#1E1F25] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold shrink-0 shadow-sm">
            <ArrowUpDown className="w-4 h-4 text-[#FF650F] shrink-0" />
            <select
              value={sortBy || "default"}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Ordenar contatos"
              className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="default" className="dark:bg-[#1E1F25]">Padrão</option>
              <option value="name_asc" className="dark:bg-[#1E1F25]">Ordem Alfabética (A-Z)</option>
              <option value="name_desc" className="dark:bg-[#1E1F25]">Ordem Alfabética (Z-A)</option>
              <option value="newest" className="dark:bg-[#1E1F25]">Mais Novos Primeiro</option>
              <option value="oldest" className="dark:bg-[#1E1F25]">Mais Antigos Primeiro</option>
              <option value="recent_activity" className="dark:bg-[#1E1F25]">Atualizados Recentemente</option>
            </select>
          </div>
        )}
      </div>

      {/* Carrossel de Filter Chips deslizáveis estilo Google Material You */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {chips.map((chip) => {
            const isSelected = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onFilterChange(chip.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-[#FF650F] text-white shadow-sm shadow-[#FF650F]/20 scale-[1.02]"
                    : "bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.04] dark:border-white/[0.06]"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-zinc-500 dark:text-zinc-400"}>
                  {chip.icon}
                </span>
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`ml-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
