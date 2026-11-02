"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Building,
} from "lucide-react";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSCardActionBar, CMSAddCardButton } from "@/components/cms/cms-card-controls";
import { CMSCardEditModal, type GenericCardData } from "@/components/cms/cms-card-edit-modal";
import type { CMSTestimonialCard } from "@/lib/cms-defaults";

export function TeamTestimonialsSection() {
  const { data, updateSection, isEditMode, isPreviewMode } = useCMS();
  const team = data.team;
  const testimonials = data.testimonials;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GenericCardData | null>(null);

  const handleEditTestimonial = (card: CMSTestimonialCard) => {
    setEditingCard({
      id: card.id,
      title: card.name,
      name: card.name,
      role: card.role,
      company: card.company,
      content: card.content,
      description: card.content,
      tag: card.tag,
      rating: card.rating,
    });
    setModalOpen(true);
  };

  const handleAddTestimonial = () => {
    setEditingCard({
      id: `test-${Date.now()}`,
      title: "Nome do Cliente",
      name: "Nome do Cliente",
      role: "Cargo / Direção",
      company: "Nome da Empresa",
      content: "Excelente trabalho executado pela ICTHUS, acabamento impecável e entrega no prazo...",
      description: "Excelente trabalho executado pela ICTHUS, acabamento impecável e entrega no prazo...",
      tag: "Fachada & Letreiro",
      rating: 5,
    });
    setModalOpen(true);
  };

  const handleDeleteTestimonial = (cardId: string) => {
    updateSection("testimonials", (prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleSaveTestimonialModal = (saved: GenericCardData) => {
    updateSection("testimonials", (prev) => {
      const existingIdx = prev.cards.findIndex((c) => c.id === saved.id);
      const newCardItem: CMSTestimonialCard = {
        id: saved.id || `test-${Date.now()}`,
        name: saved.name || saved.title || "Cliente Satisfeito",
        role: saved.role || "Diretoria",
        company: saved.company || "Empresa Parceira",
        content: saved.content || saved.description || "",
        rating: saved.rating || 5,
        tag: saved.tag || "Comunicação Visual",
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
    <div className="bg-[#121316] text-white">
      {/* ====================================================
          SEÇÃO: NOSSA EQUIPE
          ==================================================== */}
      <section id="equipe" className="py-24 border-b border-white/[0.08] relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-16 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <CMSEditableText
                value={team.badgeText}
                onChange={(val) => updateSection("team", { badgeText: val })}
                placeholder="Tag da equipe..."
              />
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              <CMSEditableText
                as="span"
                value={team.title}
                onChange={(val) => updateSection("team", { title: val })}
                placeholder="Título da equipe..."
              />
            </h2>

            <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
              <CMSEditableText
                as="span"
                multiline
                value={team.subtitle}
                onChange={(val) => updateSection("team", { subtitle: val })}
                placeholder="Subtítulo da equipe..."
              />
            </p>
          </M3ScrollReveal>

          <M3ScrollReveal variant="scaleUp" className="max-w-3xl mx-auto">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#18191D] border border-orange-500/30 relative shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none -z-10" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#FF650F] p-1 shadow-lg">
                    <div className="w-full h-full rounded-2xl bg-[#121316] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl">
                      {team.leader.initials || "GG"}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-emerald-500 text-white shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Dados da Liderança */}
                <div className="space-y-4 text-center sm:text-left flex-grow">
                  <div>
                    <Badge variant="orange" className="text-[10px] font-mono tracking-wider uppercase mb-2">
                      <CMSEditableText
                        value={team.leader.badge}
                        onChange={(val) =>
                          updateSection("team", (prev) => ({
                            ...prev,
                            leader: { ...prev.leader, badge: val },
                          }))
                        }
                      />
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      <CMSEditableText
                        as="span"
                        value={team.leader.name}
                        onChange={(val) =>
                          updateSection("team", (prev) => ({
                            ...prev,
                            leader: { ...prev.leader, name: val },
                          }))
                        }
                      />
                    </h3>
                    <p className="text-sm font-semibold text-[#FF650F]">
                      <CMSEditableText
                        as="span"
                        value={team.leader.role}
                        onChange={(val) =>
                          updateSection("team", (prev) => ({
                            ...prev,
                            leader: { ...prev.leader, role: val },
                          }))
                        }
                      />
                    </p>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    <CMSEditableText
                      as="span"
                      multiline
                      value={team.leader.bio}
                      onChange={(val) =>
                        updateSection("team", (prev) => ({
                          ...prev,
                          leader: { ...prev.leader, bio: val },
                        }))
                      }
                    />
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#FF650F]" />
                      Atendimento Direto
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#FF650F]" />
                      Porto Alegre &amp; Todo o Brasil
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </M3ScrollReveal>
        </div>
      </section>

      {/* ====================================================
          SEÇÃO: DEPOIMENTOS
          ==================================================== */}
      <section id="depoimentos" className="py-24 border-b border-white/[0.08] relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-16 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <CMSEditableText
                value={testimonials.badgeText}
                onChange={(val) => updateSection("testimonials", { badgeText: val })}
                placeholder="Tag..."
              />
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              <CMSEditableText
                as="span"
                value={testimonials.title}
                onChange={(val) => updateSection("testimonials", { title: val })}
                placeholder="Título..."
              />
            </h2>

            <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
              <CMSEditableText
                as="span"
                multiline
                value={testimonials.subtitle}
                onChange={(val) => updateSection("testimonials", { subtitle: val })}
                placeholder="Subtítulo..."
              />
            </p>
          </M3ScrollReveal>

          {/* Grid de Depoimentos com CRUD de Cards */}
          <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.cards.map((t) => (
              <M3ScrollItem key={t.id} className="h-full">
                <div className="relative h-full group">
                  {/* Ações flutuantes do Card */}
                  <CMSCardActionBar
                    label="Depoimento"
                    onEdit={() => handleEditTestimonial(t)}
                    onDelete={() => handleDeleteTestimonial(t.id)}
                  />

                  <div className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg h-full">
                    <div className="space-y-4">
                      {/* Estrelas & Aspas */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 text-[#FF650F]">
                          {[...Array(t.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#FF650F]" />
                          ))}
                        </div>
                        <Quote className="w-6 h-6 text-[#FF650F]/30" />
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed italic">
                        &ldquo;{t.content}&rdquo;
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{t.name}</h4>
                        <p className="text-xs text-zinc-400">
                          {t.role} • <span className="text-[#FF650F] font-medium">{t.company}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 rounded bg-white/5">
                        {t.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </M3ScrollItem>
            ))}

            {/* Botão de Adicionar Card */}
            <M3ScrollItem className="h-full">
              <CMSAddCardButton
                onClick={handleAddTestimonial}
                label="+ Adicionar Depoimento"
                className="h-full min-h-[250px]"
              />
            </M3ScrollItem>
          </M3ScrollStagger>
        </div>
      </section>

      {/* Modal de Edição de Card de Depoimento */}
      <CMSCardEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTestimonialModal}
        initialCard={editingCard}
        sectionTitle="Depoimento de Cliente"
        hasIcon={false}
        hasTag={true}
        hasButton={false}
      />
    </div>
  );
}
