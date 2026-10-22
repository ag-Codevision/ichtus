"use client";

import React, { useEffect } from "react";
import { AlertCircle, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    destructive: {
      icon: Trash2,
      container: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      buttonBg: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
    },
    warning: {
      icon: AlertCircle,
      container: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20",
    },
    primary: {
      icon: HelpCircle,
      container: "bg-orange-500/10 text-[#FF650F] border-orange-500/20",
      buttonBg: "bg-[#FF650F] hover:bg-[#FF781B] text-white shadow-lg shadow-[#FF650F]/20",
    },
  }[variant];

  const IconComponent = iconConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl p-6 sm:p-7 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com Ícone e Título */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconConfig.container}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-4 h-9 text-xs font-semibold border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300"
          >
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-full px-5 h-9 text-xs font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${iconConfig.buttonBg}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
