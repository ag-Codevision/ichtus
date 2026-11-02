"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCMS } from "./cms-provider";
import { Settings, Link as LinkIcon, Edit3, Check, X } from "lucide-react";

interface CMSEditableButtonProps {
  label: string;
  url: string;
  onSave: (newLabel: string, newUrl: string) => void;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CMSEditableButton({
  label,
  url,
  onSave,
  className = "",
  children,
  icon,
}: CMSEditableButtonProps) {
  const { isEditMode, isPreviewMode } = useCMS();
  const [modalOpen, setModalOpen] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const [tempUrl, setTempUrl] = useState(url);

  // Se não estiver em modo de edição, renderiza o link comum
  if (!isEditMode || isPreviewMode) {
    return (
      <Link href={url} className={className}>
        {children || (
          <>
            {label}
            {icon}
          </>
        )}
      </Link>
    );
  }

  const handleConfirm = () => {
    onSave(tempLabel.trim() || label, tempUrl.trim() || url);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setTempLabel(label);
    setTempUrl(url);
    setModalOpen(false);
  };

  return (
    <div className="relative inline-block group/btnedit">
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`${className} cursor-pointer relative group-hover/btnedit:ring-2 group-hover/btnedit:ring-[#FF650F] transition-all`}
        title="Clique para editar o texto e o link deste botão"
      >
        {children || (
          <>
            {label}
            {icon}
          </>
        )}

        {/* Badge Flutuante no Hover */}
        <span className="absolute -top-3 -right-2 bg-[#FF650F] text-white p-1 rounded-full shadow-lg text-[10px] hidden group-hover/btnedit:flex items-center justify-center z-20">
          <Settings className="w-3 h-3" />
        </span>
      </div>

      {/* Modal / Popover de Edição do Botão */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md bg-[#18191D] border border-white/15 rounded-2xl p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <Edit3 className="w-4 h-4 text-[#FF650F]" />
                Editar Botão
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Ex: Solicitar Orçamento"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#FF650F]" />
                  Link de Destino (URL ou Âncora)
                </label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
                  placeholder="Ex: /#contato ou https://wa.me/..."
                />
                <span className="block text-[11px] text-zinc-400 mt-1">
                  Dica: use <code>/#contato</code> ou <code>/#portfolio</code> para rolar na página, ou uma URL completa.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
