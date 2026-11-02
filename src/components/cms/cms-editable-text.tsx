"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Se não estiver em modo de edição ou estiver no modo preview visitante, renderiza normal
  if (!isEditMode || isPreviewMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  const handleSave = () => {
    const trimmed = tempValue.trim();
    onChange(trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative inline-block w-full z-30 my-1 animate-fadeIn">
        {label && (
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#FF650F] mb-1">
            {label}
          </span>
        )}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full p-2.5 rounded-lg bg-zinc-900 text-white border-2 border-[#FF650F] focus:outline-none text-sm leading-relaxed shadow-xl font-normal"
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 rounded-lg bg-zinc-900 text-white border-2 border-[#FF650F] focus:outline-none text-base shadow-xl font-normal"
            placeholder={placeholder}
          />
        )}
        <div className="flex items-center gap-1.5 mt-1.5 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 rounded bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow"
          >
            <Check className="w-3 h-3" />
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Clique para editar este texto"
      className="relative group/edit cursor-pointer inline-block max-w-full"
    >
      <Component className={`${className} transition-all duration-200 group-hover/edit:text-orange-200`}>
        {value || <span className="italic text-zinc-400">{placeholder}</span>}
      </Component>

      {/* Indicador visual elegante de edição */}
      <span className="absolute -top-2.5 -right-3 hidden group-hover/edit:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FF650F] text-white text-[10px] font-bold shadow-lg z-20 pointer-events-none scale-90">
        <Edit2 className="w-2.5 h-2.5" />
        Editar
      </span>
      <span className="absolute inset-0 border border-dashed border-[#FF650F]/70 rounded pointer-events-none opacity-0 group-hover/edit:opacity-100 transition-opacity" />
    </span>
  );
}
