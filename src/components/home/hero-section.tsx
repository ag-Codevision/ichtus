"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Video, Edit2 } from "lucide-react";
import { HeroSculpture } from "@/components/home/hero-sculpture";
import { HeroRotatingWord } from "@/components/home/hero-rotating-word";
import { HeroParallaxContainer } from "@/components/home/hero-parallax-container";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSEditableButton } from "@/components/cms/cms-editable-button";

export function HeroSection() {
  const { data, updateSection, isEditMode, isPreviewMode, setHeroMediaModalOpen } = useCMS();
  const hero = data.hero;

  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [selectedMetricIdx, setSelectedMetricIdx] = useState<number | null>(null);

  const isVideo =
    hero.background?.type === "video" ||
    hero.background?.url?.endsWith(".mp4") ||
    hero.background?.url?.endsWith(".webm");

  return (
    <HeroParallaxContainer className="overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#121316] text-white border-b border-white/[0.08] relative">
      {/* Botão Flutuante de Configuração do Fundo da Hero no Modo de Edição */}
      {isEditMode && !isPreviewMode && (
        <button
          type="button"
          onClick={() => setHeroMediaModalOpen(true)}
          className="absolute top-6 right-6 z-30 px-3.5 py-2 rounded-xl bg-[#18191D]/90 hover:bg-[#FF650F] text-white border border-[#FF650F]/50 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
          title="Alterar vídeo, imagem ou link do fundo da Hero"
        >
          <Video className="w-4 h-4 text-[#FF650F] group-hover:text-white" />
          Alterar Fundo da Hero (Vídeo/Imagem/Link)
        </button>
      )}

      {/* Mídia de Fundo Dinâmica (Vídeo ou Imagem) */}
      {isVideo ? (
        <video
          key={hero.background?.url}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50 animate-hero-atmosphere"
        >
          <source src={hero.background?.url || "/videos/hero-background.mp4"} type="video/mp4" />
        </video>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={hero.background?.url}
          src={hero.background?.url || "/videos/hero-background.mp4"}
          alt="Fundo Hero"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50 animate-hero-atmosphere"
        />
      )}

      {/* Overlays de Fusão e Leitura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#121316]/95 via-[#121316]/75 to-[#121316]/45 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#121316]/85 via-transparent to-[#121316] pointer-events-none z-[1]" />

      {/* Iluminação ambiente com resposta ao cursor */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-orange-500/15 blur-[130px] rounded-full pointer-events-none z-[1] will-change-transform"
        style={{
          transform: "translate3d(var(--parallax-x-inv, 0px), var(--parallax-y-inv, 0px), 0)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna de Texto & Proposta de Valor */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 relative z-20 pointer-events-auto">
            {/* Tag Editável */}
            <div className="animate-hero-badge">
              <Badge variant="orange" className="py-1 px-3.5 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
                <CMSEditableText
                  value={hero.badgeText}
                  onChange={(val) => updateSection("hero", { badgeText: val })}
                  placeholder="Tag da Hero..."
                />
              </Badge>
            </div>

            {/* Título & Palavras Alternantes Editáveis */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              <span className="block overflow-hidden py-0.5">
                <span className="inline-block animate-hero-headline-1">
                  <CMSEditableText
                    as="span"
                    value={hero.titleLine1}
                    onChange={(val) => updateSection("hero", { titleLine1: val })}
                    placeholder="Primeira linha do título..."
                  />
                </span>
              </span>
              <span className="block py-0.5">
                <span className="inline-flex items-baseline gap-x-3 animate-hero-headline-2">
                  <span className="leading-none">
                    <CMSEditableText
                      as="span"
                      value={hero.titleLine2Prefix}
                      onChange={(val) => updateSection("hero", { titleLine2Prefix: val })}
                      placeholder="para"
                    />
                  </span>
                  <HeroRotatingWord words={hero.rotatingWords} />
                </span>
              </span>
            </h1>

            {/* Subtítulo Editável */}
            <p className="text-base sm:text-lg text-zinc-300 font-normal max-w-xl leading-relaxed animate-hero-supporting">
              <CMSEditableText
                as="span"
                multiline
                value={hero.subtitle}
                onChange={(val) => updateSection("hero", { subtitle: val })}
                placeholder="Subtítulo da Hero..."
              />
            </p>

            {/* CTAs de Conversão com Botões Editáveis */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto animate-hero-cta">
              <CMSEditableButton
                label={hero.primaryButton?.label || "Solicitar Orçamento Exclusivo"}
                url={hero.primaryButton?.url || "/#contato"}
                onSave={(newLabel, newUrl) =>
                  updateSection("hero", {
                    primaryButton: { label: newLabel, url: newUrl },
                  })
                }
                className="w-full sm:w-auto block"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto gap-3 font-bold text-base shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {hero.primaryButton?.label || "Solicitar Orçamento Exclusivo"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CMSEditableButton>

              <CMSEditableButton
                label={hero.secondaryButton?.label || "Explorar Portfólio"}
                url={hero.secondaryButton?.url || "/#portfolio"}
                onSave={(newLabel, newUrl) =>
                  updateSection("hero", {
                    secondaryButton: { label: newLabel, url: newUrl },
                  })
                }
                className="w-full sm:w-auto block"
              >
                <Button
                  variant="dark-secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base hover:scale-105 transition-all duration-300"
                >
                  {hero.secondaryButton?.label || "Explorar Portfólio"}
                </Button>
              </CMSEditableButton>
            </div>

            {/* Métricas Editáveis */}
            <div className="pt-8 grid grid-cols-3 gap-6 w-full border-t border-white/10 mt-2 animate-hero-metrics">
              {hero.metrics.map((met, idx) => (
                <div key={met.id} className="relative group/met">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono block">
                    <CMSEditableText
                      as="span"
                      value={met.title}
                      onChange={(val) => {
                        const next = [...hero.metrics];
                        next[idx] = { ...next[idx], title: val };
                        updateSection("hero", { metrics: next });
                      }}
                    />
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                    <CMSEditableText
                      as="span"
                      value={met.subtitle}
                      onChange={(val) => {
                        const next = [...hero.metrics];
                        next[idx] = { ...next[idx], subtitle: val };
                        updateSection("hero", { metrics: next });
                      }}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da Escultura Metálica Interativa (Objeto 3D Protegido Intocado) */}
          <div
            className="lg:col-span-5 flex items-center justify-center animate-hero-sculpture will-change-transform relative z-10 pointer-events-auto"
            style={{
              transform: "translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0)",
              transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <HeroSculpture />
          </div>
        </div>
      </div>
    </HeroParallaxContainer>
  );
}
