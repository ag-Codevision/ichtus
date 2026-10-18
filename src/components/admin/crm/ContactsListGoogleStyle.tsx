"use client";

import React from "react";
import { MessageCircle, Phone, Building2, User, MoreVertical, Briefcase, Truck, Wrench, ChevronRight, Trash2, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ContactItem {
  id: string;
  type: "CUSTOMER" | "SERVICE_PROVIDER" | "SUPPLIER";
  personType: "PJ" | "PF";
  status: "ACTIVE" | "INACTIVE" | "LEAD_PROSPECT" | "BLOCKED";
  companyName: string | null;
  tradeName: string | null;
  fullName: string | null;
  documentNumber: string | null;
  contactPerson: string | null;
  contactRole: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    role: string;
  } | null;
  _count?: {
    serviceOrders: number;
    invoices: number;
    leads: number;
    stockItems: number;
    appointments: number;
  };
}

interface ContactsListGoogleStyleProps {
  contacts: ContactItem[];
  isLoading: boolean;
  onSelectContact: (contact: ContactItem) => void;
  onEditContact: (contact: ContactItem) => void;
  onDeleteContact?: (contact: ContactItem) => void;
}

// Gera cor tonal elegante para o avatar no padrão Google
function getGoogleAvatarColor(name: string, type: string) {
  if (type === "SUPPLIER") return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/40";
  if (type === "SERVICE_PROVIDER") return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
  
  // Clientes
  const colors = [
    "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800/40",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40",
  ];
  const charCode = name?.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

export function ContactsListGoogleStyle({
  contacts,
  isLoading,
  onSelectContact,
  onEditContact,
  onDeleteContact,
}: ContactsListGoogleStyleProps) {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3 py-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-full h-18 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] animate-pulse flex items-center px-4 gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-4 rounded bg-black/10 dark:bg-white/10" />
              <div className="w-32 h-3 rounded bg-black/5 dark:bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center mb-3">
          <User className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Nenhum contato encontrado</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          Não localizamos nenhum cliente, fornecedor ou prestador de serviços com os filtros atuais.
        </p>
      </div>
    );
  }

  const typeBadges = {
    CUSTOMER: { label: "Cliente", icon: Briefcase, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    SUPPLIER: { label: "Fornecedor", icon: Truck, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    SERVICE_PROVIDER: { label: "Prestador", icon: Wrench, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  };

  return (
    <div className="w-full flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.06]">
      {contacts.map((contact) => {
        const displayName = contact.tradeName || contact.fullName || contact.companyName || "Sem Nome";
        const subName = contact.personType === "PJ" ? contact.companyName : contact.contactRole;
        const initial = displayName.trim().charAt(0).toUpperCase();
        const avatarColorClass = getGoogleAvatarColor(displayName, contact.type);
        const TypeIcon = typeBadges[contact.type]?.icon || User;

        // Formata link de WhatsApp direto
        const rawWpp = contact.whatsapp?.replace(/\D/g, "");
        const wppUrl = rawWpp ? `https://wa.me/${rawWpp.startsWith("55") ? rawWpp : `55${rawWpp}`}` : null;
        const phoneUrl = contact.phone ? `tel:${contact.phone.replace(/\D/g, "")}` : null;

        return (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] active:bg-black/[0.05] dark:active:bg-white/[0.06] transition-colors rounded-2xl cursor-pointer"
          >
            {/* Lado Esquerdo: Avatar Tonal Google + Nomes */}
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              {/* Avatar Circular Google Material You */}
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border shrink-0 shadow-sm transition-transform group-hover:scale-105 ${avatarColorClass}`}
              >
                {initial}
              </div>

              {/* Informações Textuais */}
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                    {displayName}
                  </h4>
                  {contact.personType === "PJ" ? (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-zinc-500 shrink-0">
                      PJ
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-zinc-500 shrink-0">
                      PF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadges[contact.type]?.color}`}>
                    <TypeIcon className="w-2.5 h-2.5" />
                    {typeBadges[contact.type]?.label}
                  </span>

                  {subName && subName !== displayName && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="truncate">{subName}</span>
                    </>
                  )}

                  {contact.city && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="truncate">{contact.city}{contact.state ? `/${contact.state}` : ""}</span>
                    </>
                  )}

                  {contact.user?.isActive && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <KeyRound className="w-2.5 h-2.5" />
                        Portal Ativo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Lado Direito: Ações Rápidas de Toque Estilo Google */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Botão de WhatsApp Rápido */}
              {wppUrl && (
                <a
                  href={wppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all"
                  title="Abrir WhatsApp"
                  aria-label="Abrir WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                </a>
              )}

              {/* Botão de Chamada Telefônica Rápida */}
              {phoneUrl && (
                <a
                  href={phoneUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all"
                  title="Fazer Ligação"
                  aria-label="Fazer Ligação"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {/* Botão de Excluir Contato */}
              {onDeleteContact && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteContact(contact);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                  title="Excluir Contato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Botão de Ver Ficha */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
