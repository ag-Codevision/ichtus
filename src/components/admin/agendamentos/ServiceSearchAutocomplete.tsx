"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Briefcase, X, ChevronDown, Check, Sparkles } from "lucide-react";

export interface SearchedService {
  id: string;
  title: string;
  budgetCode: string | null;
  contactName: string;
  contactPhone: string;
  customerId: string | null;
  customer: {
    id: string;
    tradeName: string | null;
    companyName: string | null;
    fullName: string | null;
    phone: string | null;
    whatsapp: string | null;
    city: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
  } | null;
  category: { id: string; name: string; color: string } | null;
  column: { id: string; name: string; color: string } | null;
  estimatedValue?: any;
}

interface ServiceSearchAutocompleteProps {
  selectedService: SearchedService | null;
  onSelectService: (service: SearchedService | null) => void;
  customerIdFilter?: string | null;
  placeholder?: string;
}

export function ServiceSearchAutocomplete({
  selectedService,
  onSelectService,
  customerIdFilter,
  placeholder = "Vincular card de serviço do funil Kanban (opcional)...",
}: ServiceSearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedService[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (customerIdFilter) params.set("customerId", customerIdFilter);

        const res = await fetch(`/api/v1/crm/services?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.services) {
          setResults(data.services);
        }
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, customerIdFilter]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (service: SearchedService) => {
    onSelectService(service);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectService(null);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
        Serviço Vinculado (Card do Kanban)
      </label>

      {/* Se já tiver serviço selecionado */}
      {selectedService ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/30 text-zinc-900 dark:text-white transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FF650F] text-white flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                {selectedService.budgetCode && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FF650F]/20 text-[#FF650F] border border-[#FF650F]/30">
                    #{selectedService.budgetCode}
                  </span>
                )}
                <span className="text-xs font-bold truncate">
                  {selectedService.title}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                {selectedService.column && (
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedService.column.color }}
                  />
                )}
                <span>{selectedService.column?.name || "Funil"}</span>
                {selectedService.customer && (
                  <>
                    <span>•</span>
                    <span className="truncate">
                      {selectedService.customer.tradeName || selectedService.customer.fullName || selectedService.customer.companyName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            title="Desvincular serviço"
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Campo de busca */
        <div className="relative">
          <div
            onClick={() => setIsOpen(true)}
            className="flex items-center w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 cursor-pointer focus-within:border-[#FF650F] transition-all"
          >
            <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
            <ChevronDown className="w-4 h-4 text-zinc-400 ml-1 shrink-0" />
          </div>

          {/* Dropdown de Resultados */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-[#18191E] rounded-2xl border border-black/10 dark:border-white/10 shadow-xl z-50 divide-y divide-black/5 dark:divide-white/5 no-scrollbar">
              {isLoading ? (
                <div className="p-3 text-center text-xs text-zinc-400">
                  Buscando serviços do funil...
                </div>
              ) : results.length === 0 ? (
                <div className="p-3 text-center text-xs text-zinc-400">
                  {customerIdFilter
                    ? "Nenhum serviço encontrado para este cliente. Limpe o cliente para ver todos."
                    : "Nenhum serviço encontrado no funil."}
                </div>
              ) : (
                results.map((serv) => (
                  <button
                    key={serv.id}
                    type="button"
                    onClick={() => handleSelect(serv)}
                    className="w-full text-left p-2.5 hover:bg-orange-500/5 dark:hover:bg-white/5 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-[#FF650F] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {serv.budgetCode && (
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-[#FF650F]">
                            #{serv.budgetCode}
                          </span>
                        )}
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {serv.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        {serv.column && (
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: serv.column.color }}
                          />
                        )}
                        <span>{serv.column?.name}</span>
                        {serv.customer && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {serv.customer.tradeName || serv.customer.fullName || serv.customer.companyName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
