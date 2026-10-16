"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Sparkles,
  Compass,
  Layers,
  Box,
  Kanban,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const FOUR_PILLARS = [
  {
    title: "Consultoria",
    icon: Compass,
    description: "Orientação especializada para otimizar custos, tempo e a imagem do seu negócio.",
    targetHash: "#servicos",
  },
  {
    title: "Projetos",
    icon: Layers,
    description: "Concepção técnica e estrutural de sinalização, fachadas e identidade corporativa.",
    targetHash: "#portfolio",
  },
  {
    title: "Produtos",
    icon: Box,
    description: "Letreiros, placas, painéis, troféus e itens acabados com máxima qualidade.",
    targetHash: "#portfolio",
  },
  {
    title: "Gerenciamento",
    icon: Kanban,
    description: "Acompanhamento integral do cronograma, fabricação, montagem e pós-entrega.",
    targetHash: "#atuacao",
  },
];

export function SolutionsIntroSection() {
  return (
    <section id="solucoes" className="py-24 bg-[#F8F9FA] text-zinc-900 border-b border-zinc-200/90 relative scroll-mt-20 overflow-hidden">
      {/* Sutil difusão âmbar decorativa de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Cabeçalho Editorial com a copy aprovada */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="orange-light" className="py-1.5 px-4 font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
            NOSSO TRABALHO É PENSAR EM SOLUÇÕES, DEIXE-NOS TE AJUDAR
          </Badge>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            NÓS TEMOS A SOLUÇÃO QUE VOCÊ PROCURA
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            <p>
              Estamos sempre tentando manter nosso pacote de serviços atualizado, com novidades e com o que há de mais moderno em soluções, nos mantemos constantemente inspirados para atender a cada cliente com a exclusividade e atenção merecida. Cada cliente é único e não nos contentamos com soluções genéricas.
            </p>
            <p className="font-semibold text-zinc-900">
              Venha para nosso mundo e descubra tudo o que podemos fazer por você ou por sua empresa.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/#sobre">
              <Button variant="secondary" size="lg" className="gap-2 text-base font-medium">
                SAIBA MAIS
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/#contato">
              <Button variant="primary" size="lg" className="gap-2 text-base font-bold shadow-lg">
                COMEÇAR
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Os 4 Pilares com Spotlight Interativo nos Cards Brancos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {FOUR_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Link key={idx} href={p.targetHash} className="h-full">
                <SpotlightCard
                  isDark={false}
                  className="p-8 rounded-3xl bg-white border border-zinc-200/90 flex flex-col justify-between group hover:border-[#FF650F]/50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 h-full"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF650F] group-hover:bg-[#FF650F] group-hover:text-white transition-all mb-6 shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-zinc-900 mb-2 group-hover:text-[#FF650F] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#FF650F] group-hover:translate-x-1 transition-transform">
                    <span>Explorar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
