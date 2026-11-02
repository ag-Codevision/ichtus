"use client";

import React, { useState } from "react";
import { useCMS } from "./cms-provider";
import { Edit2, Trash2, Plus, Sparkles } from "lucide-react";
import { AVAILABLE_ICONS } from "./cms-card-edit-modal";

/**
 * Renderizador dinâmico de ícones Lucide com fallback seguro
 */
export function CMSDynamicIcon({
  name,
  className = "w-6 h-6",
}: {
  name?: string;
  className?: string;
}) {
  const IconComponent = (name && AVAILABLE_ICONS[name]) || Sparkles;
  return <IconComponent className={className} />;
}

/**
 * Barra de Ações flutuante sobre um Card individual (Editar / Excluir)
 */
export function CMSCardActionBar({
  onEdit,
  onDelete,
  label = "Card",
}: {
  onEdit: () => void;
  onDelete: () => void;
  label?: string;
}) {
  const { isEditMode, isPreviewMode } = useCMS();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isEditMode || isPreviewMode) {
    return null;
  }

  return (
    <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 animate-fadeIn">
      {confirmDelete ? (
        <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/50 p-1 rounded-xl shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-rose-200 px-1.5">Excluir?</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setConfirmDelete(false);
            }}
            className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-colors"
          >
            Sim
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(false);
            }}
            className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] transition-colors"
          >
            Não
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-[#121316]/90 border border-white/20 p-1 rounded-xl shadow-xl backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg bg-[#FF650F] hover:bg-orange-600 text-white transition-colors"
            title={`Editar este ${label}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors"
            title={`Excluir este ${label}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Botão para Adicionar Novo Card no final de qualquer grade de cards
 */
export function CMSAddCardButton({
  onClick,
  label = "Adicionar Novo Card",
  className = "",
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  const { isEditMode, isPreviewMode } = useCMS();

  if (!isEditMode || isPreviewMode) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[220px] w-full rounded-2xl border-2 border-dashed border-[#FF650F]/50 hover:border-[#FF650F] bg-[#FF650F]/5 hover:bg-[#FF650F]/10 flex flex-col items-center justify-center p-6 text-center transition-all group/add cursor-pointer shadow-sm hover:shadow-lg ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FF650F]/20 border border-[#FF650F]/40 flex items-center justify-center text-[#FF650F] mb-3 group-hover/add:scale-110 transition-transform">
        <Plus className="w-6 h-6" />
      </div>
      <span className="text-sm font-bold text-white group-hover/add:text-[#FF650F] transition-colors">
        {label}
      </span>
      <span className="text-xs text-zinc-400 mt-1">
        Clique para preencher os dados e incluir nesta seção
      </span>
    </button>
  );
}
