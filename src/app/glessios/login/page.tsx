"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
        setErrorMsg(data.error || "Credenciais inválidas. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro de login admin:", err);
      setErrorMsg("Falha na conexão com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 dark:text-white px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center py-1 group" aria-label="ICTHUS - Soluções & Design">
          <Image
            src="/logo-horizontal-escuro.png"
            alt="ICTHUS - Soluções & Design"
            width={180}
            height={40}
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform dark:hidden"
            priority
          />
          <Image
            src="/logo-web.png"
            alt="ICTHUS - Soluções & Design"
            width={180}
            height={40}
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform hidden dark:block"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Website
          </Link>
        </div>
      </div>

      {/* Card Central - M3 Expressive Surface */}
      <div className="max-w-md mx-auto w-full my-auto">
        <Card className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-m3-2 bg-white dark:bg-[#18191E] transition-colors p-2 sm:p-4">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-glessios-orange mb-4 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Acesso Administrativo & Operacional
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Controle de CRM, Chão de Fábrica, Estoque de Insumos e DRE Financeiro
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs text-center font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@glessios.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Senha de Segurança
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-glessios-orange" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full justify-center gap-2 text-xs font-bold py-2.5 rounded-full shadow-sm bg-orange-gradient hover:opacity-95 text-white transition-all"
              >
                {isLoading ? "Autenticando..." : "Entrar no Painel ERP"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center mt-2">
                <Link
                  href="/portal/login"
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-glessios-orange transition-colors font-medium"
                >
                  É cliente da Glessios? Acesse o Portal do Cliente
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="max-w-7xl mx-auto w-full text-center py-4 text-xs text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} ICTHUS Soluções & Design. Painel Administrativo Seguro.
      </div>
    </div>
  );
}
