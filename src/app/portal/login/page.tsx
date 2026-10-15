"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function PortalLoginPage() {
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

  const handleDemoLogin = async () => {
    setEmail("renata@conceptbatel.com.br");
    setPassword("Glessios@2026");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "renata@conceptbatel.com.br", password: "Glessios@2026" }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/portal/dashboard");
      } else {
        setErrorMsg(data.error || "Falha no acesso de demonstração.");
      }
    } catch (err) {
      setErrorMsg("Erro ao conectar com a API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-glessios-black text-glessios-text-body p-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 py-1 group" aria-label="Glessios - Soluções & Design">
          <Image
            src="/logo-web.png"
            alt="Glessios - Soluções & Design"
            width={180}
            height={40}
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="text-xs text-glessios-text-body hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Website
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full my-auto">
        <Card className="border-glessios-border-orange/40 shadow-2xl bg-glessios-graphite">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-glessios-orange/15 border border-glessios-border-orange flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-glessios-orange" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-white">
              Acesso ao Portal
            </CardTitle>
            <CardDescription className="text-xs text-glessios-text-body">
              Acompanhe ordens de serviço, aprove maquetes de arte e consulte faturas PIX em tempo real.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-glessios-orange" />
                  E-mail Cadastrado
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm placeholder:text-glessios-text-body/50 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-glessios-orange" />
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-sm placeholder:text-glessios-text-body/50 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full gap-2 text-sm font-bold shadow-orange-glow mt-2"
              >
                Entrar no Portal
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-glessios-orange" />
                  Acessar com Conta Demo (Loja Concept Batel)
                </button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 text-center border-t border-glessios-border-dark pt-4">
            <span className="text-[11px] text-glessios-text-body flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Ambiente protegido com criptografia de ponta a ponta
            </span>
            <Link
              href="https://wa.me/5545998243321?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20acessar%20meu%20portal%20Glessios."
              target="_blank"
              className="text-xs text-glessios-orange hover:underline font-medium"
            >
              Problemas para acessar? Fale pelo WhatsApp
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center text-xs text-glessios-text-body/70 py-4">
        © {new Date().getFullYear()} Glessios Comunicação Visual. Plataforma Corporativa v1.0.0
      </div>
    </div>
  );
}
