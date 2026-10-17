"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function GlessiosLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push("/admin/crm");
      } else {
        setErrorMsg(data.error || "Credenciais inválidas. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro de login admin:", err);
      setErrorMsg("Falha na conexão com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail("admin@glessios.com.br");
    setPassword("Admin@Glessios2026!");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@glessios.com.br", password: "Admin@Glessios2026!" }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/crm");
      } else {
        setErrorMsg(data.error || "Falha no acesso de demonstração.");
      }
    } catch {
      setErrorMsg("Erro ao conectar com a API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8F9FA] dark:bg-glessios-black text-zinc-900 dark:text-glessios-text-body p-6 transition-colors duration-300">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 py-1 group" aria-label="ICTHUS - Soluções & Design">
          <div className="p-1.5 px-3 rounded-xl bg-zinc-900/90 dark:bg-transparent border border-zinc-800/80 dark:border-transparent transition-all">
            <Image
              src="/logo-web.png"
              alt="ICTHUS - Soluções & Design"
              width={180}
              height={40}
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs text-zinc-600 dark:text-glessios-text-body hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Website
          </Link>
        </div>
      </div>

      {/* Card Central */}
      <div className="max-w-md mx-auto w-full my-auto">
        <Card className="border-orange-200/60 dark:border-glessios-border-orange/30 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] dark:shadow-2xl bg-white dark:bg-[#1B1B1D] transition-colors">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-glessios-orange mb-4 shadow-orange-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Acesso Administrativo & Operacional
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-glessios-text-body mt-1 font-medium">
              Controle de CRM, Chão de Fábrica, Estoque de Insumos e DRE Financeiro
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-glessios-text-heading uppercase tracking-wide">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 dark:text-glessios-text-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@glessios.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-glessios-charcoal border border-zinc-200 dark:border-glessios-border-dark text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-glessios-text-heading uppercase tracking-wide">
                    Senha de Segurança
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 dark:text-glessios-text-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-glessios-charcoal border border-zinc-200 dark:border-glessios-border-dark text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-colors"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full justify-center gap-2 text-xs font-bold py-2.5 shadow-orange-glow bg-glessios-orange hover:bg-glessios-orange-hover text-white transition-all"
              >
                {isLoading ? "Autenticando..." : "Entrar no Painel ERP"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="relative w-full text-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-glessios-border-dark" />
                </div>
                <span className="relative bg-white dark:bg-[#1B1B1D] px-2 text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-glessios-text-body">
                  Demonstração Rápida
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoAdminLogin}
                disabled={isLoading}
                className="w-full justify-center gap-2 text-xs border border-orange-300/60 dark:border-glessios-border-orange/50 hover:bg-orange-500/10 text-zinc-800 dark:text-white font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-glessios-orange" />
                Entrar com Conta de Admin Demo (1 Clique)
              </Button>

              <div className="text-center mt-2">
                <Link
                  href="/portal/login"
                  className="text-xs text-zinc-600 dark:text-glessios-text-body hover:text-glessios-orange transition-colors font-medium"
                >
                  É cliente da Glessios? Acesse o Portal do Cliente
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="max-w-7xl mx-auto w-full text-center py-4 text-xs text-zinc-500 dark:text-glessios-text-body">
        &copy; {new Date().getFullYear()} ICTHUS Soluções & Design. Painel Administrativo Seguro.
      </div>
    </div>
  );
}
