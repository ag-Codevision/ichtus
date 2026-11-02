"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Play,
  Target,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Award,
  Clock,
  Layers,
  FileCheck2,
} from "lucide-react";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSCardActionBar, CMSAddCardButton, CMSDynamicIcon } from "@/components/cms/cms-card-controls";
import { CMSCardEditModal, type GenericCardData } from "@/components/cms/cms-card-edit-modal";
import type { CMSAboutPillar } from "@/lib/cms-defaults";

export function AboutMissionSection() {
  const { data, updateSection, isEditMode, isPreviewMode } = useCMS();
  const about = data.about;

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GenericCardData | null>(null);

  const handleEditPillar = (pillar: CMSAboutPillar) => {
    setEditingCard({
      id: pillar.id,
      title: pillar.title,
      icon: pillar.icon,
      description: pillar.description,
    });
    setModalOpen(true);
  };

  const handleAddPillar = () => {
    setEditingCard({
      id: `pil-${Date.now()}`,
      title: "Novo Pilar",
      icon: "Sparkles",
      description: "Descreva este compromisso ou pilar fundamental...",
    });
    setModalOpen(true);
  };

  const handleDeletePillar = (id: string) => {
    updateSection("about", (prev) => ({
      ...prev,
      pillars: prev.pillars.filter((p) => p.id !== id),
    }));
  };

  const handleSavePillarModal = (saved: GenericCardData) => {
    updateSection("about", (prev) => {
      const existingIdx = prev.pillars.findIndex((p) => p.id === saved.id);
      const newPillar: CMSAboutPillar = {
        id: saved.id || `pil-${Date.now()}`,
        title: saved.title,
        icon: saved.icon || "Sparkles",
        description: saved.description || "",
      };

      if (existingIdx >= 0) {
        const next = [...prev.pillars];
        next[existingIdx] = newPillar;
        return { ...prev, pillars: next };
      } else {
        return { ...prev, pillars: [...prev.pillars, newPillar] };
      }
    });
  };

  return (
    <section id="sobre" className="py-24 bg-[#121316] text-white border-b border-white/[0.08] relative scroll-mt-20 overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ====================================================
            BLOCO 1: SOBRE NÓS (Introdução e Pilares)
            ==================================================== */}
        <div className="mb-16">
          <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-12 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <CMSEditableText
                value={about.badgeText}
                onChange={(val) => updateSection("about", { badgeText: val })}
                placeholder="Tag..."
              />
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              <CMSEditableText
                as="span"
                value={about.title}
                onChange={(val) => updateSection("about", { title: val })}
                placeholder="Título..."
              />
            </h2>

            <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
              <CMSEditableText
                as="span"
                multiline
                value={about.subtitle}
                onChange={(val) => updateSection("about", { subtitle: val })}
                placeholder="Subtítulo..."
              />
            </p>
          </M3ScrollReveal>

          {/* Pilares do Sobre Nós com CRUD */}
          <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {about.pillars.map((pillar) => (
              <M3ScrollItem key={pillar.id} className="h-full">
                <div className="relative h-full group">
                  <CMSCardActionBar
                    label="Pilar"
                    onEdit={() => handleEditPillar(pillar)}
                    onDelete={() => handleDeletePillar(pillar.id)}
                  />

                  <div className="p-8 rounded-2xl bg-[#18191D] border border-white/[0.08] hover:border-[#FF650F]/50 transition-all duration-300 group h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#121316] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:border-[#FF650F]/60 transition-colors">
                        <CMSDynamicIcon name={pillar.icon} className="w-6 h-6 text-[#FF650F]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                </div>
              </M3ScrollItem>
            ))}

            <M3ScrollItem className="h-full">
              <CMSAddCardButton
                onClick={handleAddPillar}
                label="+ Adicionar Pilar Sobre Nós"
                className="h-full min-h-[200px]"
              />
            </M3ScrollItem>
          </M3ScrollStagger>
        </div>

        {/* ====================================================
            BLOCO 2: ESPAÇO PARA VÍDEO INSTITUCIONAL
            ==================================================== */}
        <M3ScrollReveal variant="fadeUp" className="my-16">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0E0F11] aspect-video max-h-[500px] w-full flex items-center justify-center shadow-2xl group">
            {isVideoPlaying ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/95">
                <p className="text-[#FF650F] font-bold text-lg mb-2">Vídeo Institucional</p>
                <p className="text-sm text-zinc-400 max-w-md mb-6">
                  {about.video.subtitle || "Vídeo demonstrando o parque fabril e a precisão técnica da ICTHUS."}
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
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                  style={{
                    backgroundImage: `url('${about.video.posterUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"}')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F11] via-[#0E0F11]/60 to-transparent" />

                <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-4">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF650F] hover:bg-[#EA580C] flex items-center justify-center shadow-[0_0_30px_rgba(255,101,15,0.4)] group-hover:scale-110 transition-transform duration-300 text-white pl-1 cursor-pointer"
                    aria-label="Assistir Vídeo Institucional"
                  >
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                  </button>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#FF650F] font-mono">
                    <CMSEditableText
                      value={about.video.badge}
                      onChange={(val) =>
                        updateSection("about", (prev) => ({
                          ...prev,
                          video: { ...prev.video, badge: val },
                        }))
                      }
                    />
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white max-w-xl">
                    <CMSEditableText
                      as="span"
                      value={about.video.title}
                      onChange={(val) =>
                        updateSection("about", (prev) => ({
                          ...prev,
                          video: { ...prev.video, title: val },
                        }))
                      }
                    />
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                    <CMSEditableText
                      as="span"
                      multiline
                      value={about.video.subtitle}
                      onChange={(val) =>
                        updateSection("about", (prev) => ({
                          ...prev,
                          video: { ...prev.video, subtitle: val },
                        }))
                      }
                    />
                  </p>
                </div>
              </>
            )}
          </div>
        </M3ScrollReveal>

        {/* ====================================================
            BLOCO 3: MISSÃO, VISÃO E VALORES (GRID DE 3 COLUNAS)
            ==================================================== */}
        <M3ScrollStagger className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-20">
          {about.missionCards.map((card) => (
            <M3ScrollItem key={card.id} className="h-full">
              <div className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] flex flex-col justify-start space-y-4 hover:border-[#FF650F]/50 transition-colors shadow-xl h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF650F] flex items-center justify-center text-white shadow-md">
                    <CMSDynamicIcon name={card.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed pt-2">
                  <CMSEditableText
                    as="span"
                    multiline
                    value={card.description}
                    onChange={(val) =>
                      updateSection("about", (prev) => {
                        const idx = prev.missionCards.findIndex((m) => m.id === card.id);
                        if (idx >= 0) {
                          const next = [...prev.missionCards];
                          next[idx] = { ...next[idx], description: val };
                          return { ...prev, missionCards: next };
                        }
                        return prev;
                      })
                    }
                  />
                </p>
              </div>
            </M3ScrollItem>
          ))}
        </M3ScrollStagger>

        {/* ====================================================
            BLOCO 4: FRASE INSTITUCIONAL
            ==================================================== */}
        <M3ScrollReveal variant="fadeUp" className="mt-16 pt-12 border-t border-white/[0.08] text-center max-w-3xl mx-auto">
          <p className="text-lg sm:text-2xl font-serif italic text-white leading-relaxed">
            « Não existem clientes ou trabalhos pequenos, Cada cliente é único e especial, e as conexões que se estabelecem são imprevisíveis! »
          </p>
          <span className="block mt-4 text-sm font-bold text-[#FF650F] font-mono uppercase tracking-widest">
            — Glessios Gusso
          </span>
        </M3ScrollReveal>
      </div>

      {/* Modal de Edição de Pilar */}
      <CMSCardEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePillarModal}
        initialCard={editingCard}
        sectionTitle="Pilar Sobre Nós"
        hasIcon={true}
        hasTag={false}
        hasButton={false}
      />
    </section>
  );
}
