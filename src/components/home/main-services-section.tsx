"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSEditableButton } from "@/components/cms/cms-editable-button";
import { CMSCardActionBar, CMSAddCardButton, CMSDynamicIcon } from "@/components/cms/cms-card-controls";
import { CMSCardEditModal, type GenericCardData } from "@/components/cms/cms-card-edit-modal";
import type { CMSServiceCard } from "@/lib/cms-defaults";

export function MainServicesSection() {
  const { data, updateSection, isEditMode, isPreviewMode } = useCMS();
  const services = data.services;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GenericCardData | null>(null);

  const handleEditCard = (card: CMSServiceCard) => {
    setEditingCard({
      id: card.id,
      title: card.title,
      icon: card.icon,
      category: card.category,
      badgeText: card.badgeText,
      highlight: card.highlight,
      paragraphs: card.paragraphs,
      description: card.paragraphs ? card.paragraphs.join("\n\n") : "",
      features: card.features,
      buttonText: card.buttonText,
      buttonLink: card.buttonLink,
    });
    setModalOpen(true);
  };

  const handleAddCard = () => {
    setEditingCard({
      id: `srv-${Date.now()}`,
      category: "ESPECIAL",
      icon: "Sparkles",
      badgeText: "Novo Serviço",
      title: "Título do Novo Serviço",
      highlight: "Destaque do serviço",
      paragraphs: ["Descreva como este novo serviço atende com excelência os clientes..."],
      description: "Descreva como este novo serviço atende com excelência os clientes...",
      features: ["Atendimento personalizado", "Materiais nobres", "Garantia estendida"],
      buttonText: "Solicitar Orçamento",
      buttonLink: "/#contato",
    });
    setModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    updateSection("services", (prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleSaveCardModal = (saved: GenericCardData) => {
    updateSection("services", (prev) => {
      const existingIdx = prev.cards.findIndex((c) => c.id === saved.id);
      const newCardItem: CMSServiceCard = {
        id: saved.id || `srv-${Date.now()}`,
        category: saved.category || "SERVIÇO",
        icon: saved.icon || "Sparkles",
        badgeText: saved.badgeText || "Especialidade",
        title: saved.title,
        highlight: saved.highlight || "",
        paragraphs: saved.paragraphs && saved.paragraphs.length > 0 ? saved.paragraphs : [saved.description || ""],
        features: saved.features || ["Atendimento especializado", "Garantia técnica"],
        buttonText: saved.buttonText || "Solicitar Orçamento",
        buttonLink: saved.buttonLink || "/#contato",
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
      id="servicos"
      className="py-24 bg-[#F8F9FA] border-b border-zinc-200/90 relative scroll-mt-20 text-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-16 space-y-4">
          <Badge variant="orange-light" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <CMSEditableText
              value={services.badgeText}
              onChange={(val) => updateSection("services", { badgeText: val })}
              placeholder="Tag da seção..."
            />
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            <CMSEditableText
              as="span"
              value={services.title}
              onChange={(val) => updateSection("services", { title: val })}
              placeholder="Título da seção..."
            />
          </h2>

          <p className="text-base text-zinc-600 max-w-2xl leading-relaxed pt-1">
            <CMSEditableText
              as="span"
              multiline
              value={services.subtitle}
              onChange={(val) => updateSection("services", { subtitle: val })}
              placeholder="Subtítulo..."
            />
          </p>
        </M3ScrollReveal>

        {/* Grid de Serviços */}
        <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.cards.map((srv) => (
            <M3ScrollItem key={srv.id} className="h-full">
              <div className="relative h-full group">
                {/* Ações flutuantes do Card */}
                <CMSCardActionBar
                  label="Serviço"
                  onEdit={() => handleEditCard(srv)}
                  onDelete={() => handleDeleteCard(srv.id)}
                />

                <SpotlightCard
                  isDark={false}
                  className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md flex flex-col justify-between h-full"
                >
                  <div className="space-y-6">
                    {/* Topo: Ícone + Categoria + Destaque */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF650F] group-hover:bg-[#FF650F] group-hover:text-white transition-all shadow-sm">
                          <CMSDynamicIcon name={srv.icon} className="w-6 h-6" />
                        </div>
                        <Badge
                          variant="orange-light"
                          className="font-mono text-xs uppercase tracking-wider font-bold"
                        >
                          {srv.category}
                        </Badge>
                      </div>

                      {srv.highlight && (
                        <span className="text-xs font-semibold text-[#FF650F] bg-orange-50 border border-orange-200/60 rounded-xl px-3 py-1.5 hidden sm:inline-block">
                          ★ {srv.highlight}
                        </span>
                      )}
                    </div>

                    {/* Título & Badge Text */}
                    <div>
                      <span className="text-xs uppercase tracking-wider text-zinc-600 font-bold block mb-1">
                        {srv.badgeText}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight">
                        {srv.title}
                      </h3>
                    </div>

                    {/* Parágrafos */}
                    <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
                      {srv.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Lista de Features */}
                    <ul className="space-y-2 pt-2 border-t border-zinc-100">
                      {srv.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                          <CheckCircle2 className="w-4 h-4 text-[#FF650F] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botão de Solicitação do Serviço */}
                  <div className="pt-8">
                    <CMSEditableButton
                      label={srv.buttonText || "Solicitar Orçamento"}
                      url={srv.buttonLink || "/#contato"}
                      onSave={(newLabel, newUrl) => {
                        updateSection("services", (prev) => {
                          const idx = prev.cards.findIndex((c) => c.id === srv.id);
                          if (idx >= 0) {
                            const next = [...prev.cards];
                            next[idx] = { ...next[idx], buttonText: newLabel, buttonLink: newUrl };
                            return { ...prev, cards: next };
                          }
                          return prev;
                        });
                      }}
                      className="w-full block"
                    >
                      <Button
                        variant="primary"
                        className="w-full gap-2 font-bold text-sm shadow-md py-3.5 hover:scale-[1.02] transition-transform"
                      >
                        {srv.buttonText || "Solicitar Orçamento"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CMSEditableButton>
                  </div>
                </SpotlightCard>
              </div>
            </M3ScrollItem>
          ))}

          {/* Botão Adicionar Card */}
          <M3ScrollItem className="h-full">
            <CMSAddCardButton
              onClick={handleAddCard}
              label="+ Adicionar Novo Serviço"
              className="h-full min-h-[350px]"
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
        sectionTitle="Catálogo de Serviços"
        hasIcon={true}
        hasTag={true}
        hasButton={true}
      />
    </section>
  );
}
