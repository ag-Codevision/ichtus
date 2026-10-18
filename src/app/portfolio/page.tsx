import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PortfolioGallery } from "@/components/home/portfolio-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfólio de Obras & Comunicação Visual | Glessios",
  description:
    "Explore nossa galeria de fachadas em ACM, letreiros luminosos, placas de sinalização arquitetônica, corte laser/router e projetos de alto padrão.",
  openGraph: {
    title: "Portfólio de Obras & Comunicação Visual | Glessios",
    description:
      "Explore nossa galeria de fachadas em ACM, letreiros luminosos, placas de sinalização arquitetônica e projetos de alto padrão.",
    url: "https://glessios.com.br/portfolio",
    siteName: "Glessios Comunicação Visual",
    type: "website",
  },
};

export default function PortfolioPage() {
  const whatsappUrl =
    "https://wa.me/5551981192976?text=Ol%C3%A1!%20Acessei%20o%20portf%C3%B3lio%20da%20Glessios%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20minha%20empresa.";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-900 selection:bg-[#FF650F] selection:text-white">
      <Navbar />

      <main className="flex-grow pt-28">
        {/* Hero Editorial do Portfólio */}
        <section className="py-16 bg-[#0E0F11] text-white relative overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="orange" className="py-1.5 px-4 font-semibold text-xs tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              GALERIA DE OBRAS EXECUTADAS
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Nosso Portfólio de Soluções
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Descubra nossos projetos mais marcantes em fachadas de ACM, letreiros em acrílico e inox, sinalização arquitetônica e corte router CNC. Cada projeto é único, memorável e desenvolvido sob medida.
            </p>
          </div>
        </section>

        {/* Galeria Completa e Interativa */}
        <PortfolioGallery />

        {/* CTA de Fechamento */}
        <section className="py-20 bg-zinc-900 text-white relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Pronto para transformar a imagem do seu negócio?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              Nossa equipe de consultoria técnica e projetos está pronta para criar uma proposta personalizada.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" className="gap-2.5 font-bold shadow-xl">
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  Falar com um Especialista
                </Button>
              </a>
              <Link href="/#contato">
                <Button variant="dark-secondary" size="lg" className="gap-2 font-medium">
                  Solicitar Orçamento
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
