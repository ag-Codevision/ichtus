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

  // Inicialização no cliente (evita divergência de hidratação SSR)
  React.useEffect(() => {
    setMounted(true);
    const existing = getStoredCookieConsent();

    if (!existing) {
      // Pequeno timeout para render suave sem bloquear o First Contentful Paint
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setFunctional(existing.functional);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  // Escuta eventos globais para abrir o modal de preferências (ex: vindo do Footer ou botão de privacidade)
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

  // Bloqueia scroll do corpo quando o modal de preferências está aberto
  React.useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Fecha modal com tecla ESC
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

  // Ações de consentimento
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
          1. BANNER FLUTUANTE DE CONSENTIMENTO (INFERIOR)
          ======================================================== */}
      {showBanner && (
        <aside
          aria-label="Aviso de Privacidade e Cookies"
          className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 lg:left-auto lg:right-6 lg:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121316]/95 dark:bg-[#121316]/95 backdrop-blur-xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-zinc-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF650F]/15 border border-[#FF650F]/30 flex items-center justify-center shrink-0 text-[#FF650F]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Privacidade e Gestão de Cookies
                  </h3>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    LGPD
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Utilizamos cookies e tecnologias seguras para garantir o funcionamento do site, aprimorar sua experiência e analisar o tráfego, em estrita conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
                </p>
                <div className="pt-0.5">
                  <Link
                    href="/politica-de-privacidade"
                    className="text-xs text-[#FF650F] hover:text-[#FF781B] underline underline-offset-4 inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    Ler Política de Privacidade e Cookies
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Ações do Banner */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={openCustomizeModal}
                className="order-3 sm:order-1 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                Personalizar
              </button>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="order-2 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-transparent hover:bg-white/[0.06] border border-white/[0.1] rounded-xl transition-colors cursor-pointer"
              >
                Apenas Necessários
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="order-1 sm:order-3 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF5D09] via-[#FF650F] to-[#FA6B17] hover:brightness-110 shadow-[0_4px_16px_rgba(255,101,15,0.3)] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Aceitar Todos
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================
          2. BOTÃO FLUTUANTE DISCRETO (REVOGAÇÃO / GERENCIAMENTO)
          ======================================================== */}
      {!showBanner && (
        <button
          type="button"
          onClick={openCustomizeModal}
          title="Gerenciar Preferências de Cookies (LGPD)"
          aria-label="Gerenciar Preferências de Cookies"
          className="fixed bottom-4 left-4 z-40 group flex items-center gap-2 px-3 py-2 rounded-full bg-[#121316]/90 hover:bg-[#1A1C20] backdrop-blur-md border border-white/[0.12] shadow-lg text-zinc-400 hover:text-white transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
        >
          <Cookie className="w-4 h-4 text-[#FF650F] group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xs font-medium pr-0.5 hidden sm:inline">Cookies</span>
        </button>
      )}

      {/* ========================================================
          3. MODAL DE PERSONALIZAÇÃO DE PREFERÊNCIAS (LGPD)
          ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#141518] border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#111214]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF650F]/15 border border-[#FF650F]/30 flex items-center justify-center text-[#FF650F]">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    Centro de Preferências de Privacidade
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Gerencie o consentimento conforme a LGPD (Lei 13.709/2018)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-zinc-300">
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Na ICTHUS Soluções e Design, respeitamos sua privacidade. Você pode escolher quais categorias de cookies autoriza armazenar durante a navegação. Os cookies estritamente necessários não podem ser desativados por serem vitais para a segurança e funcionalidade essencial.
              </p>

              {/* Categorias de Cookies */}
              <div className="space-y-3.5">
                {/* 1. Necessários */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Cookies Estritamente Necessários
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Sempre Ativo
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    Essenciais para a segurança, roteamento, autenticação segura do portal e retenção deste consentimento. Não coletam dados para fins de publicidade e não podem ser desativados.
                  </p>
                </div>

                {/* 2. Funcionais / Preferências */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Cookie className="w-4 h-4 text-[#FF650F]" />
                      <h3 className="font-semibold text-white text-sm">
                        Cookies de Preferências & Funcionalidade
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={functional}
                        onChange={(e) => setFunctional(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650F]"></div>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    Permitem que o site memorize preferências de navegação (como modo escuro/claro, filtros e formulários pré-preenchidos), tornando sua experiência mais conveniente.
                  </p>
                </div>

                {/* 3. Analíticos */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Info className="w-4 h-4 text-sky-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Cookies Analíticos & Desempenho
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650F]"></div>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    Coletam dados agregados e anônimos sobre visitantes, tempo de permanência e páginas visualizadas para identificarmos pontos de melhoria técnica e de usabilidade na plataforma.
                  </p>
                </div>

                {/* 4. Marketing */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Cookie className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Cookies de Marketing & Comunicação
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650F]"></div>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    Utilizados para avaliar o alcance de campanhas em plataformas parceiras (como Google e redes sociais), apresentando conteúdos pertinentes às soluções visuais para sua empresa.
                  </p>
                </div>
              </div>

              {/* Informação legal de rodapé do modal */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
                <span>Dúvidas sobre o tratamento de dados pessoais?</span>
                <Link
                  href="/politica-de-privacidade"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#FF650F] hover:underline font-semibold flex items-center gap-1"
                >
                  Ver Política Completa
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Rodapé do Modal com Botões */}
            <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#111214] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors cursor-pointer text-center"
              >
                Rejeitar Opcionais
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/[0.1] rounded-xl transition-colors cursor-pointer text-center"
                >
                  Salvar Preferências
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF5D09] via-[#FF650F] to-[#FA6B17] hover:brightness-110 shadow-[0_4px_16px_rgba(255,101,15,0.3)] rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
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
