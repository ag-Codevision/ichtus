"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useCMS } from "./cms-provider";
import { Edit2, Check, X } from "lucide-react";

interface CMSEditableTextProps {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
}

export function CMSEditableText({
  as: Component = "span",
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "Clique para editar...",
  label,
}: CMSEditableTextProps) {
  const { isEditMode, isPreviewMode } = useCMS();
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // 1. Sincroniza o conteúdo ao entrar no modo de edição e posiciona o cursor
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.innerText = value;
      editableRef.current.focus();

      try {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (err) {
        // Fallback para navegadores legados
      }
    }
  }, [isEditing, value]);

  // 2. Confirmação (Salva a alteração)
  const handleConfirm = useCallback(() => {
    if (!editableRef.current) return;
    const newText = editableRef.current.innerText.trim();
    onChange(newText);
    setIsEditing(false);
  }, [onChange]);

  // 3. Cancelamento (Restaura o texto original sem salvar)
  const handleCancel = useCallback(() => {
    if (editableRef.current) {
      editableRef.current.innerText = value;
    }
    setIsEditing(false);
  }, [value]);

  // 4. Click Outside (Clicar fora descarta alterações e sai da edição automaticamente)
  useEffect(() => {
    if (!isEditing) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, handleCancel]);

  // 5. Teclas de atalho (Enter salva em linha única, Escape cancela)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // =========================================================================
  // ATENÇÃO: Verificação de modo de edição SEMPRE DEPOIS de todos os Hooks
  // Isso evita o erro Minified React error #310 (Rendered more hooks than previous render)
  // =========================================================================
  if (!isEditMode || isPreviewMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block max-w-full group/edit align-baseline"
    >
      <Component
        ref={editableRef as any}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onClick={!isEditing ? () => setIsEditing(true) : undefined}
        title={!isEditing ? "Clique para editar este texto diretamente na página" : undefined}
        className={`${className} ${
          isEditing
            ? "outline-none ring-2 ring-[#FF650F] ring-offset-2 ring-offset-[#121316] rounded-md px-1.5 py-0.5 bg-[#FF650F]/15 cursor-text select-text"
            : "cursor-pointer group-hover/edit:text-orange-200 transition-colors"
        }`}
      >
        {value || <span className="italic text-zinc-400">{placeholder}</span>}
      </Component>

      {/* Indicador visual de hover antes de clicar */}
      {!isEditing && (
        <>
          <span className="absolute -top-2.5 -right-3 hidden group-hover/edit:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FF650F] text-white text-[10px] font-bold shadow-lg z-20 pointer-events-none scale-90">
            <Edit2 className="w-2.5 h-2.5" />
            Editar
          </span>
          <span className="absolute inset-0 border border-dashed border-[#FF650F]/70 rounded pointer-events-none opacity-0 group-hover/edit:opacity-100 transition-opacity" />
        </>
      )}

      {/* Barra de Ações Flutuante (Apenas em Edição): Confirmar ou Cancelar */}
      {isEditing && (
        <span
          className="absolute left-0 top-full mt-2 z-[999] flex items-center gap-2 p-1.5 rounded-xl bg-[#18191D] border border-white/20 shadow-2xl animate-fadeIn whitespace-nowrap text-xs font-sans normal-case select-none"
          onMouseDown={(e) => e.stopPropagation()} // impede que o clique nos botões acione o clique fora
        >
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <X className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cancelar</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF650F] hover:bg-orange-600 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar</span>
          </button>
        </span>
      )}
    </span>
  );
}
