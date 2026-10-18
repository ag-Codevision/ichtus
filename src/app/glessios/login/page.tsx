"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Boxes,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function GlessiosLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setErrorMsg(data.error || "Credenciais administrativas inválidas. Acesso restrito.");
      }
    } catch (err) {
      console.error("Erro de login administrativo:", err);
      setErrorMsg("Falha na conexão com o servidor central. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const adminFeatures = [
    {
      icon: <Cpu className="w-4 h-4" aria-hidden="true" />,
      title: "Chão de Fábrica",
      description: "Controle de usinagem CNC, corte a laser e montagem.",
    },
    {
      icon: <Boxes className="w-4 h-4" aria-hidden="true" />,
      title: "Estoque & Insumos",
      description: "Rastreabilidade de chapas ACM, acrílicos e perfis.",
    },
    {
      icon: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
      title: "DRE & Financeiro",
      description: "Margem de contribuição e fluxo de caixa em tempo real.",
    },
  ];

  return (
    <AuthSplitLayout
      variant="admin"
      badgeText="Acesso Restrito • Equipe"
      title="Painel de Controle ERP"
      subtitle="Gestão integrada de CRM, operações industriais, compras e controladoria."
      showcaseHeadline="Inteligência Operacional e Excelência Fabril"
      showcaseSubheadline="Núcleo de comando unificado da Glessios. Conectando o comercial ao chão de fábrica."
      showcaseFeatures={adminFeatures}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mensagem de Erro Estilizada */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Campo E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-email"
            className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            E-mail do Administrador
          </label>
          <div className="relative">
            <Mail
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@glessios.com.br"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] focus:ring-2 focus:ring-[#FF650F]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Senha de Segurança
            </label>
          </div>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-[#FF650F] focus:ring-2 focus:ring-[#FF650F]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF650F]"
              aria-label={showPassword ? "Ocultar senha administrativa" : "Mostrar senha administrativa"}
              title={showPassword ? "Ocultar senha" : "Ver senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-[#FF650F]" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Botão de Ação Principal */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full justify-center gap-2 text-xs font-bold py-3 rounded-full shadow-lg shadow-orange-500/20 bg-gradient-to-r from-[#FF5D09] via-[#FF650F] to-[#FF781B] hover:opacity-95 text-white transition-all transform active:scale-[0.99]"
          >
            {isLoading ? "Autenticando Sessão..." : "Entrar no Painel ERP"}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Links de Apoio */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] text-center">
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#FF650F] dark:hover:text-[#FF781B] font-semibold transition-colors py-1 px-2 rounded-lg"
          >
            <span>É um cliente da Glessios? Acesse o Portal do Cliente</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
