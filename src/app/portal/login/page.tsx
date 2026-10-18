"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function PortalLoginPage() {
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
      const res = await fetch("/api/v1/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/portal/dashboard");
      } else {
        setErrorMsg(data.error || "Credenciais inválidas. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro de login:", err);
      setErrorMsg("Falha na conexão com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 dark:text-white px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center py-1 group" aria-label="Glessios - Soluções & Design">
          <Image
            src="/logo-horizontal-escuro.png"
            alt="Glessios - Soluções & Design"
            width={180}
            height={40}
            priority
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform dark:hidden"
          />
          <Image
            src="/logo-web.png"
            alt="Glessios - Soluções & Design"
            width={180}
            height={40}
            priority
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform hidden dark:block"
          />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Website
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full my-auto">
        <Card className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-m3-2 bg-white dark:bg-[#18191E] transition-colors p-2 sm:p-4">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2 text-glessios-orange shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Acesso ao Portal
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Acompanhe ordens de serviço, aprove maquetes de arte e consulte faturas PIX em tempo real.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-glessios-orange" />
                  E-mail Cadastrado
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-glessios-orange" />
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full gap-2 text-xs font-bold shadow-sm mt-2 rounded-full bg-orange-gradient hover:opacity-95 text-white"
              >
                Entrar no Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 text-center border-t border-black/[0.06] dark:border-white/[0.06] pt-4">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Ambiente protegido com criptografia de ponta a ponta
            </span>
            <Link
              href="https://wa.me/5545998243321?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20acessar%20meu%20portal%20Glessios."
              target="_blank"
              className="text-xs text-glessios-orange hover:underline font-semibold"
            >
              Problemas para acessar? Fale pelo WhatsApp
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-4">
        &copy; {new Date().getFullYear()} ICTHUS Soluções & Design. Plataforma Corporativa v1.0.0
      </div>
    </div>
  );
}
