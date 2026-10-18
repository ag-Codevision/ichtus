"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Eye, EyeOff, Check, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  userId,
  userEmail,
}: ChangePasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessMessage(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("A confirmação da nova senha não coincide.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/portal/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || "Senha alterada com sucesso!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Não foi possível alterar a senha.");
      }
    } catch {
      setErrorMessage("Erro ao comunicar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-[#1A1B20] border-t sm:border border-black/10 dark:border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-250 sm:zoom-in-95"
      >
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Cabeçalho */}
        <div className="shrink-0 px-5 sm:px-6 pt-3 sm:pt-5 pb-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Segurança Icthus
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#FF650F]" />
              Alterar Minha Senha
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {userEmail && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Conta de acesso: <strong className="text-zinc-800 dark:text-zinc-200">{userEmail}</strong>
            </p>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Senha Atual */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Senha Atual ou Padrão (Icthus@123)
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Nova Senha de Sua Preferência
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Confirmar Nova Senha
            </label>
            <input
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs rounded-full px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="text-xs font-bold px-5 rounded-full gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Nova Senha
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
