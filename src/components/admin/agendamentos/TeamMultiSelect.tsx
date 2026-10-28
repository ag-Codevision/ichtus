"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, User, Check, X, ChevronDown, Wrench, Plus, Sparkles } from "lucide-react";

export interface ServiceProviderContact {
  id: string;
  displayName: string;
  tradeName: string | null;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  whatsapp: string | null;
  type: string;
  status: string;
}

interface TeamMultiSelectProps {
  selectedProviderIds: string[];
  onChangeProviders: (ids: string[], providerNames: string[]) => void;
  customTeamName: string;
  onChangeCustomTeamName: (name: string) => void;
}

export function TeamMultiSelect({
  selectedProviderIds,
  onChangeProviders,
  customTeamName,
  onChangeCustomTeamName,
}: TeamMultiSelectProps) {
  const [providers, setProviders] = useState<ServiceProviderContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar prestadores de serviço cadastrados no CRM
  useEffect(() => {
    async function loadProviders() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/v1/crm/contacts?type=SERVICE_PROVIDER&limit=100");
        const data = await res.json();
        if (data.success && data.data) {
          setProviders(data.data);
        }
      } catch (err) {
        console.error("Erro ao carregar prestadores de serviço:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProviders();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Alternar seleção de um prestador
  const toggleProvider = (p: ServiceProviderContact) => {
    let nextIds: string[];
    if (selectedProviderIds.includes(p.id)) {
      nextIds = selectedProviderIds.filter((id) => id !== p.id);
    } else {
      nextIds = [...selectedProviderIds, p.id];
    }

    const nextNames = providers
      .filter((prov) => nextIds.includes(prov.id))
      .map((prov) => prov.displayName || prov.tradeName || prov.fullName || prov.companyName || "Prestador");

    onChangeProviders(nextIds, nextNames);
  };

  const removeProvider = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIds = selectedProviderIds.filter((pId) => pId !== id);
    const nextNames = providers
      .filter((prov) => nextIds.includes(prov.id))
      .map((prov) => prov.displayName || prov.tradeName || prov.fullName || prov.companyName || "Prestador");
    onChangeProviders(nextIds, nextNames);
  };

  // Objetos dos prestadores selecionados
  const selectedProviderObjects = providers.filter((p) => selectedProviderIds.includes(p.id));

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#FF650F]" />
          <span>Equipe de Campo / Prestadores Responsáveis</span>
        </label>
        <span className="text-[10px] text-zinc-400">
          Múltipla escolha (CRM)
        </span>
      </div>

      {/* Tags dos prestadores selecionados */}
      {selectedProviderObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10">
          {selectedProviderObjects.map((prov) => (
            <span
              key={prov.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-[#FF650F] border border-orange-500/20 shadow-2xs"
            >
              <User className="w-3 h-3 shrink-0" />
              <span>{prov.displayName || prov.tradeName || prov.fullName}</span>
              <button
                type="button"
                onClick={(e) => removeProvider(prov.id, e)}
                className="hover:text-red-500 rounded-full p-0.5 ml-0.5 transition-colors cursor-pointer"
                title="Remover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Botão Seletor com Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white hover:border-[#FF650F] transition-all text-left"
        >
          <span className="truncate">
            {selectedProviderObjects.length === 0
              ? "Clique para selecionar prestadores cadastrados no CRM..."
              : `${selectedProviderObjects.length} prestador(es) selecionado(s) para compor a equipe`}
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
        </button>

        {/* Dropdown com Lista de Prestadores */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-[#18191E] rounded-2xl border border-black/10 dark:border-white/10 shadow-xl z-50 divide-y divide-black/5 dark:divide-white/5 no-scrollbar">
            {isLoading ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Carregando prestadores do CRM...
              </div>
            ) : providers.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Nenhum prestador de serviço cadastrado no CRM. (Cadastre na aba Contatos do CRM com tipo Prestador de Serviços).
              </div>
            ) : (
              providers.map((p) => {
                const isSelected = selectedProviderIds.includes(p.id);
                const name = p.displayName || p.tradeName || p.fullName || p.companyName;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProvider(p)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-orange-500/10 text-[#FF650F] font-bold"
                        : "hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#FF650F] border-[#FF650F] text-white" : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{name}</span>
                    </div>

                    {(p.whatsapp || p.phone) && (
                      <span className="text-[10px] text-zinc-400 ml-2 font-mono shrink-0">
                        {p.whatsapp || p.phone}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Campo opcional para nome livre / equipe extra */}
      <div>
        <input
          type="text"
          placeholder="Ou informe um nome customizado para a equipe (ex: Equipe Externa 01 + Terceiros)..."
          value={customTeamName}
          onChange={(e) => onChangeCustomTeamName(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-transparent border border-dashed border-black/10 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-[#FF650F]"
        />
      </div>
    </div>
  );
}
