"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Play,
  Quote,
  Target,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Award,
  Clock,
  Layers,
  HeartHandshake,
  FileCheck2,
} from "lucide-react";

export function AboutMissionSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section id="sobre" className="py-24 bg-[#121316] text-white border-b border-white/[0.08] relative scroll-mt-20 overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* ====================================================
            BLOCO 1: SOBRE NÓS (Introdução e Pilares)
            ==================================================== */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4 max-w-2xl">
              <Badge variant="orange" className="font-semibold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Quem Somos
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Sobre nós
              </h2>
            </div>
            <p className="text-base text-zinc-400 max-w-md leading-relaxed">
              Dedicados a construir soluções visuais e projetos sob medida que elevam a presença da sua marca com exclusividade, eficiência e pontualidade.
            </p>
          </div>

          {/* 3 Pilares do Sobre Nós */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#18191D] border border-white/[0.08] hover:border-[#FF650F]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:border-[#FF650F]/60 transition-colors">
                <Target className="w-6 h-6 text-[#FF650F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Superar Expectativas</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Encontrar sempre as melhores soluções para cada cliente de forma a suprir e/ou superar suas expectativas.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#18191D] border border-white/[0.08] hover:border-[#FF650F]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:border-[#FF650F]/60 transition-colors">
                <Layers className="w-6 h-6 text-[#FF650F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Tudo em um Só Lugar</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Oferecer o maior número de produtos possível para que o cliente possa encontrar tudo o que precisa em um só lugar e possa manter-se focado em suas atividades.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#18191D] border border-white/[0.08] hover:border-[#FF650F]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:border-[#FF650F]/60 transition-colors">
                <Clock className="w-6 h-6 text-[#FF650F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Melhor Custo-Benefício</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Oferecer serviços de qualidade, com excelência, com melhor custo benefício e dentro do menor tempo possível.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            BLOCO 2: ESPAÇO PARA VÍDEO INSTITUCIONAL
            ==================================================== */}
        <div className="my-16">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0E0F11] aspect-video max-h-[500px] w-full flex items-center justify-center shadow-2xl group">
            {isVideoPlaying ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/95">
                <p className="text-[#FF650F] font-bold text-lg mb-2">Vídeo Institucional</p>
                <p className="text-sm text-zinc-400 max-w-md mb-6">
                  Vídeo institucional demonstrando o parque fabril, precisão dos cortes CNC e instalação de letreiros e fachadas.
                </p>
                <button
                  onClick={() => setIsVideoPlaying(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/20"
                >
                  Fechar Vídeo
                </button>
              </div>
            ) : (
              <>
                {/* Poster de Fundo com Vídeo */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F11] via-[#0E0F11]/60 to-transparent" />

                {/* Conteúdo Central e Botão Play */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-4">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF650F] hover:bg-[#EA580C] flex items-center justify-center shadow-[0_0_30px_rgba(255,101,15,0.4)] group-hover:scale-110 transition-transform duration-300 text-white pl-1 cursor-pointer"
                    aria-label="Assistir Vídeo Institucional"
                  >
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                  </button>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#FF650F] font-mono">
                    Espaço para Vídeo Institucional
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white max-w-xl">
                    Conheça de perto nosso processo criativo e fabril
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                    Descubra como transformamos conceitos e matérias-primas nobres em identidades visuais de grande impacto.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ====================================================
            BLOCO 3: FRASE À ESQUERDA & MISSÃO, VISÃO E VALORES
            ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-20">
          {/* Frase à esquerda em destaque editorial */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8 lg:sticky lg:top-28">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#18191D] border border-orange-500/30 relative shadow-2xl">
              <Quote className="w-12 h-12 text-[#FF650F]/30 mb-6" />
              <blockquote className="text-xl sm:text-2xl font-serif italic text-white leading-relaxed">
                « Não existem clientes ou trabalhos pequenos, Cada cliente é único e especial, e as conexões que se estabelecem são imprevisíveis! »
              </blockquote>
              <div className="mt-6 pt-6 border-t border-white/[0.08] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF650F] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                  G
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Glessios Gusso</h4>
                  <p className="text-xs text-[#FF650F] font-medium">Diretor Geral</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E0F11] border border-white/[0.08] flex items-center gap-4">
              <HeartHandshake className="w-8 h-8 text-[#FF650F] shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                Relacionamento humano e atenção dedicada a cada detalhe do seu projeto, do briefing à entrega instalada.
              </p>
            </div>
          </div>

          {/* Coluna da Direita: Missão, Visão e Valores */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD MISSÃO */}
            <div className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] space-y-4 hover:border-[#FF650F]/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF650F] flex items-center justify-center text-white shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Missão</h3>
              </div>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                  <span>
                    Encontrar sempre as melhores soluções para cada cliente de forma a suprir e/ou superar suas expectativas.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                  <span>
                    Oferecer o maior número de produtos possível para que o cliente possa encontrar tudo o que precisa em um só lugar e possa manter-se focado em suas atividades.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                  <span>
                    Oferecer serviços de qualidade, com excelência, com melhor custo benefício e dentro do menor tempo possível.
                  </span>
                </li>
              </ul>
            </div>

            {/* CARD VISÃO */}
            <div className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] space-y-4 hover:border-[#FF650F]/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center text-[#FF650F]">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Visão</h3>
              </div>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                  <span>
                    Tornar-se uma empresa referência em soluções Criativas, e nos relacionamentos interno e externo.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                  <span>
                    Proporcionar a melhor experiência aos clientes desde o momento de sua chegada e durante todo o processo produtivo e / ou criativo.
                  </span>
                </li>
              </ul>
            </div>

            {/* CARD VALORES */}
            <div className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] space-y-6 hover:border-[#FF650F]/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center text-[#FF650F]">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Valores</h3>
              </div>

              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-[#121316] border border-white/[0.06]">
                  <h4 className="text-sm font-extrabold text-[#FF650F] uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FF650F]" />
                    QUALIDADE :
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Todos os produtos e serviços são feitos com máxima qualidade, desde matérias primas, até o acabamento manual.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121316] border border-white/[0.06]">
                  <h4 className="text-sm font-extrabold text-[#FF650F] uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF650F]" />
                    CONFIANÇA :
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    A confiança é a base de uma parceria sólida. Trabalhamos para que a confiança de nossos clientes em nossos processos e produtos seja sempre crescente.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121316] border border-white/[0.06]">
                  <h4 className="text-sm font-extrabold text-[#FF650F] uppercase tracking-wider mb-1 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#FF650F]" />
                    TRANSPARÊNCIA :
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    O tempo e dinheiro de nossos clientes é tão valioso quanto o nosso, trabalhamos de forma transparente com prazos e não prometemos o que não se pode entregar, a Verdade é um dos produtos que amamos entregar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            BLOCO 4: FRASE ABAIXO DE MISSÃO, VISÃO E VALORES
            ==================================================== */}
        <div className="mt-16 pt-12 border-t border-white/[0.08] text-center max-w-3xl mx-auto">
          <p className="text-lg sm:text-2xl font-serif italic text-white leading-relaxed">
            « Não existem clientes ou trabalhos pequenos, Cada cliente é único e especial, e as conexões que se estabelecem são imprevisíveis! »
          </p>
          <span className="block mt-4 text-sm font-bold text-[#FF650F] font-mono uppercase tracking-widest">
            — Glessios Gusso
          </span>
        </div>
      </div>
    </section>
  );
}
