"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cookie,
  ShieldCheck,
  Check,
  X,
  SlidersHorizontal,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  CookiePreferences,
  getStoredCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [mounted, setMounted] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Estado dos toggles no modal de preferências
  const [functional, setFunctional] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);

  // Inicialização segura no cliente (evita hydration mismatch)
  React.useEffect(() => {
    setMounted(true);
    const existing = getStoredCookieConsent();

    if (!existing) {
      // Delay suave para não competir com a renderização inicial da página
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setFunctional(existing.functional);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  // Escuta abertura global do modal (ex: via link no rodapé ou página de política)
  React.useEffect(() => {
    const handleOpen = () => {
      const current = getStoredCookieConsent();
      if (current) {
        setFunctional(current.functional);
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setIsModalOpen(true);
    };

    window.addEventListener("icthus:open-cookie-preferences", handleOpen);
    return () => {
      window.removeEventListener("icthus:open-cookie-preferences", handleOpen);
    };
  }, []);

  // Bloqueio de scroll do body quando o modal está aberto
  React.useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Fechar modal com tecla ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  if (!mounted) return null;

  const handleAcceptAll = () => {
    const updated = acceptAllCookies();
    setFunctional(updated.functional);
    setAnalytics(updated.analytics);
    setMarketing(updated.marketing);
    setShowBanner(false);
    setIsModalOpen(false);
  };

  const handleRejectOptional = () => {
    const updated = rejectOptionalCookies();
    setFunctional(updated.functional);
    setAnalytics(updated.analytics);
    setMarketing(updated.marketing);
    setShowBanner(false);
    setIsModalOpen(false);
  };

  const handleSavePreferences = () => {
    const updated = saveCookieConsent({
      functional,
      analytics,
      marketing,
    });
    setFunctional(updated.functional);
    setAnalytics(updated.analytics);
    setMarketing(updated.marketing);
    setShowBanner(false);
    setIsModalOpen(false);
  };

  const openCustomizeModal = () => {
    const current = getStoredCookieConsent();
    if (current) {
      setFunctional(current.functional);
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* ========================================================
          1. BANNER COMPACTO & DISCRETO (FLOATING SLIM CARD)
          ======================================================== */}
      {showBanner && (
        <aside
          aria-label="Aviso de Privacidade e Cookies"
          className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121316]/95 dark:bg-[#121316]/95 backdrop-blur-md border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-zinc-300">
            {/* Linha Superior: Ícone, Texto Conciso e Botão Fechar */}
            <div className="flex items-start gap-2.5">
              <Cookie className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed text-zinc-300">
                <span>
                  Utilizamos cookies essenciais para garantir o funcionamento do site e aprimorar sua experiência conforme a LGPD.
                </span>{" "}
                <Link
                  href="/politica-de-privacidade"
                  className="text-[#FF650F] hover:text-[#FF781B] underline underline-offset-2 font-medium inline-block transition-colors"
                >
                  Saiba mais
                </Link>
              </div>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer"
                title="Fechar e manter apenas necessários"
                aria-label="Fechar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Linha Inferior: Botões Compactos em Linha */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-end gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={openCustomizeModal}
                className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Opções</span>
              </button>

              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                Necessários
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3.5 py-1 text-[11px] font-semibold text-white bg-gradient-to-r from-[#FF5D09] to-[#FA6B17] hover:brightness-110 shadow-sm rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Aceitar</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================
          2. TRIGGER DISCRETO (MINI PILL FLUTUANTE)
          ======================================================== */}
      {!showBanner && (
        <button
          type="button"
          onClick={openCustomizeModal}
          title="Preferências de Privacidade e Cookies (LGPD)"
          aria-label="Gerenciar Cookies"
          className="fixed bottom-3 left-3 z-40 w-8 h-8 rounded-full bg-[#121316]/85 hover:bg-[#1A1C20] backdrop-blur-md border border-white/[0.08] shadow-md flex items-center justify-center text-zinc-400 hover:text-[#FF650F] transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF650F]"
        >
          <Cookie className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ========================================================
          3. MODAL DE PERSONALIZAÇÃO (DETALHADO E ACESSÍVEL)
          ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-xl max-h-[85vh] flex flex-col bg-[#141518] border border-white/[0.1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#111214]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF650F]/15 border border-[#FF650F]/30 flex items-center justify-center text-[#FF650F]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="text-sm font-bold text-white tracking-tight"
                  >
                    Preferências de Privacidade
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Controle de cookies sob a LGPD (Lei 13.709/2018)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lista com Scroll das 4 categorias */}
            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs text-zinc-300">
              <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
                Selecione as categorias de cookies que você autoriza utilizar. Os cookies essenciais garantem segurança e integridade básica e não podem ser desativados.
              </p>

              {/* 1. Necessários */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <h3 className="font-semibold text-white text-xs">
                      Cookies Necessários
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Obrigatório
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Essenciais para autenticação, segurança, persistência de preferências de interface e registro de consentimento.
                </p>
              </div>

              {/* 2. Funcionais */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-3.5 h-3.5 text-[#FF650F]" />
                    <h3 className="font-semibold text-white text-xs">
                      Preferências & Funcionalidade
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF650F]"></div>
                  </label>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Memorizam campos de orçamento e preferências visuais para facilitar interações futuras.
                </p>
              </div>

              {/* 3. Analíticos */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <h3 className="font-semibold text-white text-xs">
                      Analíticos & Desempenho
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF650F]"></div>
                  </label>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Métricas agregadas anônimas para avaliarmos velocidade, usabilidade e navegação das páginas.
                </p>
              </div>

              {/* 4. Marketing */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-3.5 h-3.5 text-amber-400" />
                    <h3 className="font-semibold text-white text-xs">
                      Marketing & Comunicação
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF650F]"></div>
                  </label>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Avaliação da eficiência de campanhas em plataformas parceiras (ex: Google, Meta).
                </p>
              </div>

              {/* Link para Política Completa */}
              <div className="pt-2 text-center">
                <Link
                  href="/politica-de-privacidade"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[11px] text-zinc-400 hover:text-[#FF650F] inline-flex items-center gap-1 transition-colors"
                >
                  Ler Política de Privacidade e Cookies completa
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Footer do Modal com Botões */}
            <div className="px-5 py-3 border-t border-white/[0.08] bg-[#111214] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
              >
                Rejeitar Opcionais
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl transition-colors cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF5D09] to-[#FA6B17] hover:brightness-110 shadow-sm rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Aceitar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
