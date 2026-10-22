"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message: string, title?: string, duration?: number) =>
      addToast({ type: "success", title: title || "Sucesso", message, duration }),
    error: (message: string, title?: string, duration?: number) =>
      addToast({ type: "error", title: title || "Erro", message, duration }),
    info: (message: string, title?: string, duration?: number) =>
      addToast({ type: "info", title: title || "Informação", message, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      addToast({ type: "warning", title: title || "Atenção", message, duration }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast Floating Container - Design System ICTHUS / Novacraft */}
      <div
        className="fixed top-5 right-5 z-[150] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const config = {
            success: {
              icon: CheckCircle2,
              iconColor: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/25",
              glow: "shadow-emerald-500/10",
            },
            error: {
              icon: AlertCircle,
              iconColor: "text-red-500",
              bgColor: "bg-red-500/10",
              borderColor: "border-red-500/25",
              glow: "shadow-red-500/10",
            },
            warning: {
              icon: AlertTriangle,
              iconColor: "text-amber-500",
              bgColor: "bg-amber-500/10",
              borderColor: "border-amber-500/25",
              glow: "shadow-amber-500/10",
            },
            info: {
              icon: Info,
              iconColor: "text-[#FF650F]",
              bgColor: "bg-[#FF650F]/10",
              borderColor: "border-[#FF650F]/25",
              glow: "shadow-[#FF650F]/10",
            },
          }[t.type];

          const Icon = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full p-4 rounded-2xl bg-white/95 dark:bg-[#18191E]/95 backdrop-blur-md border ${config.borderColor} shadow-2xl ${config.glow} flex items-start gap-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
            >
              {/* Ícone de Destaque com Container Redondo */}
              <div
                className={`w-9 h-9 rounded-full ${config.bgColor} ${config.iconColor} flex items-center justify-center shrink-0 border ${config.borderColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Conteúdo Textual */}
              <div className="flex-1 min-w-0 pt-0.5">
                {t.title && (
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed break-words font-medium">
                  {t.message}
                </p>
              </div>

              {/* Botão de Fechar */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors shrink-0 -mr-1 -mt-1"
                aria-label="Fechar notificação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de um ToastProvider");
  }
  return context;
}
