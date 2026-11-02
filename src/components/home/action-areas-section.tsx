"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSCardActionBar, CMSAddCardButton, CMSDynamicIcon } from "@/components/cms/cms-card-controls";
import { CMSCardEditModal, type GenericCardData } from "@/components/cms/cms-card-edit-modal";
import type { CMSActionAreaCard } from "@/lib/cms-defaults";

export function ActionAreasSection() {
  const { data, updateSection, isEditMode, isPreviewMode } = useCMS();
  const actionAreas = data.action_areas;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GenericCardData | null>(null);

  const handleEditCard = (card: CMSActionAreaCard) => {
    setEditingCard({
      id: card.id,
      title: card.title,
      icon: card.icon,
      description: card.description,
      tag: card.tag,
      buttonText: "Consultar esta área",
      buttonLink: "/#contato",
    });
    setModalOpen(true);
  };

  const handleAddCard = () => {
    setEditingCard({
      id: `act-${Date.now()}`,
      title: "NOVA ÁREA",
      icon: "Sparkles",
      description: "Descreva a nova área de atuação e especialidades...",
      tag: "Novo Segmento",
      buttonText: "Consultar esta área",
      buttonLink: "/#contato",
    });
    setModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    updateSection("action_areas", (prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleSaveCardModal = (saved: GenericCardData) => {
    updateSection("action_areas", (prev) => {
      const existingIdx = prev.cards.findIndex((c) => c.id === saved.id);
      const newCardItem: CMSActionAreaCard = {
        id: saved.id || `act-${Date.now()}`,
        title: saved.title,
        icon: saved.icon || "Sparkles",
        description: saved.description || "",
        tag: saved.tag || "Especialidade",
      };

      if (existingIdx >= 0) {
        const nextCards = [...prev.cards];
        nextCards[existingIdx] = newCardItem;
        return { ...prev, cards: nextCards };
      } else {
        return { ...prev, cards: [...prev.cards, newCardItem] };
      }
    });
  };

  return (
    <section
      id="atuacao"
      className="py-24 bg-[#121316] border-b border-white/[0.08] relative scroll-mt-20 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-16 space-y-4">
          <Badge variant="orange" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <CMSEditableText
              value={actionAreas.badgeText}
              onChange={(val) => updateSection("action_areas", { badgeText: val })}
              placeholder="Tag da seção..."
            />
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            <CMSEditableText
              as="span"
              value={actionAreas.title}
              onChange={(val) => updateSection("action_areas", { title: val })}
              placeholder="Título..."
            />
          </h2>

          <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
            <CMSEditableText
              as="span"
              multiline
              value={actionAreas.subtitle}
              onChange={(val) => updateSection("action_areas", { subtitle: val })}
              placeholder="Subtítulo..."
            />
          </p>
        </M3ScrollReveal>

        {/* Grid com os cards de áreas de atuação */}
        <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionAreas.cards.map((area) => (
            <M3ScrollItem key={area.id} className="h-full">
              <div className="relative h-full group">
                {/* Ações flutuantes do Card */}
                <CMSCardActionBar
                  label="Área"
                  onEdit={() => handleEditCard(area)}
                  onDelete={() => handleDeleteCard(area.id)}
                />

                <SpotlightCard
                  isDark={true}
                  className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] flex flex-col justify-between group hover:border-[#FF650F]/50 hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center group-hover:bg-[#FF650F] transition-all duration-300">
                        <CMSDynamicIcon
                          name={area.icon}
                          className="w-6 h-6 text-[#FF650F] group-hover:text-white transition-colors"
                        />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider text-[#FF650F] uppercase font-mono px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                        {area.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-[#FF650F] transition-colors">
                      {area.title}
                    </h3>

                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {area.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                    <Link
                      href="/#contato"
                      onClick={(e) => {
                        if (isEditMode && !isPreviewMode) {
                          e.preventDefault();
                          handleEditCard(area);
                        }
                      }}
                      className="text-xs font-bold text-zinc-300 group-hover:text-[#FF650F] flex items-center gap-1.5 transition-colors"
                    >
                      Consultar esta área
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </SpotlightCard>
              </div>
            </M3ScrollItem>
          ))}

          {/* Botão de Adicionar Card */}
          <M3ScrollItem className="h-full">
            <CMSAddCardButton
              onClick={handleAddCard}
              label="+ Adicionar Área de Atuação"
              className="h-full min-h-[300px]"
            />
          </M3ScrollItem>
        </M3ScrollStagger>
      </div>

      {/* Modal de Edição de Card */}
      <CMSCardEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCardModal}
        initialCard={editingCard}
        sectionTitle="Área de Atuação"
        hasIcon={true}
        hasTag={true}
        hasButton={false}
      />
    </section>
  );
}
