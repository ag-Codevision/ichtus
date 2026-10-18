"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export interface FeaturePill {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
  badgeText: string;
  title: string;
  subtitle: string;
  showcaseHeadline: string;
  showcaseSubheadline: string;
  showcaseFeatures: FeaturePill[];
  variant?: "portal" | "admin";
}

export function AuthSplitLayout({
  children,
  badgeText,
  title,
  subtitle,
  showcaseHeadline,
  showcaseSubheadline,
  showcaseFeatures,
  variant = "portal",
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-[#FAF7F2] dark:bg-[#0B0C0E] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* =========================================================================
          COLUNA DO FORMULÁRIO (Mobile: 100%, Desktop: 5/12 = ~42%)
          ========================================================================= */}
      <section className="flex-1 lg:col-span-5 xl:col-span-5 flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 sm:py-8 z-10">
        {/* Cabeçalho do Formulário */}
        <header className="w-full max-w-md mx-auto flex items-center justify-between pb-6">
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF650F] rounded-lg"
            aria-label="Ir para a página inicial da Glessios"
          >
            {/* Logo Tema Claro */}
            <Image
              src="/logo-horizontal-escuro.png"
              alt="Glessios - Soluções & Design"
              width={160}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain dark:hidden"
            />
            {/* Logo Tema Escuro */}
            <Image
              src="/logo-web.png"
              alt="Glessios - Soluções & Design"
              width={160}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
            />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1.5 px-2.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF650F]"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Voltar</span>
            </Link>
          </div>
        </header>

        {/* Corpo do Formulário / Card */}
        <main className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-3 bg-orange-500/10 text-[#FF650F] border border-orange-500/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{badgeText}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* O Form injetado */}
          <div className="bg-white dark:bg-[#15161A] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/40 backdrop-blur-sm transition-colors">
            {children}
          </div>
        </main>

        {/* Rodapé do Formulário */}
        <footer className="w-full max-w-md mx-auto pt-6 text-center text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-black/[0.04] dark:border-white/[0.04]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            Ambiente com Criptografia SSL
          </span>
          <span>&copy; {new Date().getFullYear()} Glessios Soluções & Design</span>
        </footer>
      </section>

      {/* =========================================================================
          COLUNA DO SHOWCASE VISUAL COM O LOGO (Desktop: 7/12 = ~58%, Oculto em mobile)
          ========================================================================= */}
      <aside
        className="hidden lg:col-span-7 xl:col-span-7 lg:flex relative overflow-hidden bg-[#0A0B0D] flex-col justify-between p-12 xl:p-16 select-none"
        aria-hidden="true"
      >
        {/* Camada 1: Grid Arquitetônico de Precisão em Background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Camada 2: Iluminação Radial de Estúdio com Laranja Vibrante & Cobre */}
        <div
          className="absolute -top-24 -right-24 w-[550px] h-[550px] rounded-full pointer-events-none blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, #FF650F 0%, #A95024 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none blur-[120px] opacity-25"
          style={{
            background: "radial-gradient(circle, #FF781B 0%, #FF650F 35%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #B83C00 0%, transparent 70%)",
          }}
        />

        {/* Centro do Showcase: Destaque Protagonista do Logo da Marca */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-xl mx-auto py-8">
          {/* Container do Logo com Glow */}
          <div className="relative group cursor-default">
            {/* Glow de fundo atrás do logo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF650F]/35 to-[#FF781B]/10 blur-3xl scale-125 transition-transform duration-700 group-hover:scale-150" />

            <div className="relative px-8 py-7 sm:px-12 sm:py-9 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl shadow-orange-950/40">
              <Image
                src="/logo-web.png"
                alt="ICTHUS Soluções & Design"
                width={380}
                height={85}
                priority
                className="w-64 sm:w-72 xl:w-80 h-auto object-contain brightness-110 drop-shadow-[0_15px_30px_rgba(255,101,15,0.3)] transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Mensagem Editorial de Marca */}
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug mt-8 sm:mt-10">
            {showcaseHeadline}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed max-w-md">
            {showcaseSubheadline}
          </p>
        </div>

        {/* Base do Showcase: Cards em Glassmorphism com os Pilares */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {showcaseFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF781B] mb-2 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight">
                {feat.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal line-clamp-2">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
