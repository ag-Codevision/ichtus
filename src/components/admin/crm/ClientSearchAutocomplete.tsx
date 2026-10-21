"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Building2,
  Phone,
  MapPin,
  X,
  Plus,
  Check,
  ChevronDown,
  UserCheck,
  Sparkles,
} from "lucide-react";

export interface SearchedClient {
  id: string;
  displayName: string;
  companyName: string | null;
  tradeName: string | null;
  fullName: string | null;
  type: string;
  personType: string;
  documentNumber: string | null;
  contactPerson?: string | null;
  contactRole?: string | null;
  contactPersonPhone?: string | null;
  contactPersonEmail?: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  status: string;
}

interface ClientSearchAutocompleteProps {
  selectedClient: SearchedClient | null;
  onSelectClient: (client: SearchedClient | null) => void;
  onOpenNewContactModal?: () => void;
  required?: boolean;
}

export function ClientSearchAutocomplete({
  selectedClient,
  onSelectClient,
  onOpenNewContactModal,
  required = false,
}: ClientSearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedClient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          limit: "15",
        });
        const res = await fetch(`/api/v1/crm/contacts/search?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
        }
      } catch (err) {
        console.error("Erro ao buscar contatos:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (client: SearchedClient) => {
    onSelectClient(client);
    setIsOpen(false);
    setQuery("");
  };

  const handleClearSelection = () => {
    onSelectClient(null);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <span>Cliente Vinculado</span>
          {required ? (
            <span className="text-[#FF650F]">*</span>
          ) : (
            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
              (ou cadastre como Lead Avulso)
            </span>
          )}
        </label>
        {onOpenNewContactModal && (
          <button
            type="button"
            onClick={onOpenNewContactModal}
            className="text-[11px] font-semibold text-[#FF650F] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Novo Cadastro</span>
          </button>
        )}
      </div>

      {/* Caso já haja cliente selecionado: Exibe card de resumo */}
      {selectedClient ? (
        <div className="p-3 rounded-2xl bg-orange-500/[0.04] dark:bg-orange-500/[0.08] border border-orange-500/20 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF650F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {selectedClient.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {selectedClient.displayName}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-orange-500/10 text-[#FF650F] shrink-0">
                  {selectedClient.type === "CUSTOMER" ? "Cliente" : selectedClient.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {selectedClient.documentNumber && (
                  <span className="font-mono">{selectedClient.documentNumber}</span>
                )}
                {(selectedClient.whatsapp || selectedClient.phone) && (
                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Phone className="w-2.5 h-2.5" />
                    {selectedClient.whatsapp || selectedClient.phone}
                  </span>
                )}
                {selectedClient.city && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {selectedClient.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              title="Desvincular cliente (Tornar Lead Avulso)"
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Caso ainda não haja cliente selecionado: Input de busca inteligente */
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Pesquisar por nome, razão social, CNPJ/CPF, WhatsApp..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] shadow-sm transition-all"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* Dropdown de Sugestões Inteligentes */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[90] max-h-72 bg-white dark:bg-[#18191E] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
          {/* Opção Rápida 1: Lead Avulso (Sem Vínculo) */}
          <button
            type="button"
            onClick={() => {
              onSelectClient(null);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/[0.1] transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 group-hover:text-[#FF650F] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-[#FF650F] block">
                Cadastrar como Lead Avulso
              </span>
              <span className="text-[10px] text-zinc-400">
                Sem vínculo com cadastro existente (preenchimento manual)
              </span>
            </div>
          </button>

          {/* Opção Rápida 2: Cadastrar Novo Contato no CRM */}
          {onOpenNewContactModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewContactModal();
              }}
              className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/[0.1] transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FF650F] block">
                  + Cadastrar Novo Contato no CRM Agora
                </span>
                <span className="text-[10px] text-zinc-400">
                  Abre o formulário completo e vincula a esta oportunidade
                </span>
              </div>
            </button>
          )}

          {/* Estado de Carregamento */}
          {isLoading && (
            <div className="p-4 text-center text-xs text-zinc-400">
              Buscando na base de contatos...
            </div>
          )}

          {/* Lista de Resultados Encontrados */}
          {!isLoading && results.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Clientes Encontrados ({results.length})
              </div>
              {results.map((c) => {
                const isCurrent = selectedClient?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors ${
                      isCurrent ? "bg-orange-500/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {c.displayName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-zinc-500 font-semibold shrink-0">
                            {c.personType || "PJ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 truncate mt-0.5">
                          {c.contactPerson && (
                            <span className="text-[#FF650F] font-semibold">
                              🗣️ {c.contactPerson} {c.contactRole ? `(${c.contactRole})` : ""}
                            </span>
                          )}
                          {c.documentNumber && <span>{c.documentNumber}</span>}
                          {c.whatsapp && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {c.whatsapp}
                            </span>
                          )}
                          {c.city && <span>{c.city}</span>}
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <Check className="w-4 h-4 text-[#FF650F] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sem resultados */}
          {!isLoading && results.length === 0 && query.trim() !== "" && (
            <div className="p-4 text-center text-xs text-zinc-400">
              Nenhum contato encontrado com &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
