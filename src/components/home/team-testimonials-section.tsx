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
  Camera,
} from "lucide-react";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSCardActionBar, CMSAddCardButton } from "@/components/cms/cms-card-controls";
import { CMSCardEditModal, type GenericCardData } from "@/components/cms/cms-card-edit-modal";
import { CMSTeamMemberModal } from "@/components/cms/cms-team-member-modal";
import type { CMSTestimonialCard, CMSTeamMember } from "@/lib/cms-defaults";

export function TeamTestimonialsSection() {
  const { data, updateSection, isEditMode, isPreviewMode } = useCMS();
  const team = data.team;
  const testimonials = data.testimonials;

  // Estados dos modais
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GenericCardData | null>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CMSTeamMember | null>(null);

  // Lista normalizada de membros da equipe (cards)
  const members: CMSTeamMember[] = (team.members && team.members.length > 0)
    ? team.members
    : (team.leader
        ? [{
            id: (team.leader as any).id || "leader-gg",
            name: team.leader.name || "Glessios Gusso",
            role: team.leader.role || "Diretor Geral",
            badge: team.leader.badge || "Direção & Estratégia",
            bio: team.leader.bio || "",
            photoUrl: (team.leader as any).photoUrl || "",
            initials: team.leader.initials || "GG",
            highlights: team.leader.highlights || [],
          }]
        : [
            {
              id: "leader-gg",
              name: "Glessios Gusso",
              role: "Diretor Geral",
              badge: "Direção & Estratégia",
              bio: "Com mais de 12 anos de experiência na concepção e gerenciamento de soluções visuais e projetos industriais, Glessios Gusso lidera pessoalmente a garantia de que cada cliente receba atenção exclusiva e soluções sob medida.",
              photoUrl: "",
              initials: "GG",
              highlights: [
                { id: "hl-1", icon: "ShieldCheck", text: "Atendimento Direto" },
                { id: "hl-2", icon: "Building", text: "Porto Alegre & Todo o Brasil" },
              ],
            },
          ]);

  // Handlers para Membros da Equipe (Cards + Upload de Foto)
  const handleEditMember = (member: CMSTeamMember) => {
    setEditingMember(member);
    setTeamModalOpen(true);
  };

  const handleAddMember = () => {
    setEditingMember({
      id: `member-${Date.now()}`,
      name: "",
      role: "Especialista em Fachadas & Projetos",
      badge: "Engenharia & Produção",
      bio: "Profissional dedicado a garantir precisão técnica, acabamento refinado e acompanhamento de ponta a ponta.",
      photoUrl: "",
      initials: "EQ",
      highlights: [
        { id: "hl-1", icon: "ShieldCheck", text: "Suporte Técnico" },
        { id: "hl-2", icon: "Building", text: "Fábrica Própria" },
      ],
    });
    setTeamModalOpen(true);
  };

  const handleDeleteMember = (memberId: string) => {
    updateSection("team", (prev) => {
      const curMembers = prev.members || (prev.leader ? [prev.leader] : []);
      const next = curMembers.filter((m) => m.id !== memberId);
      return { ...prev, members: next };
    });
  };

  const handleSaveMember = (saved: CMSTeamMember) => {
    updateSection("team", (prev) => {
      const curMembers = prev.members || (prev.leader ? [prev.leader] : []);
      const idx = curMembers.findIndex((m) => m.id === saved.id);
      let nextMembers: CMSTeamMember[];
      if (idx >= 0) {
        nextMembers = [...curMembers];
        nextMembers[idx] = saved;
      } else {
        nextMembers = [...curMembers, saved];
      }
      return {
        ...prev,
        members: nextMembers,
        leader: nextMembers[0] || prev.leader,
      };
    });
  };

  // Handlers para Depoimentos
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
          SEÇÃO: NOSSA EQUIPE (TRATADA COMO CARDS COM UPLOAD DE FOTO)
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

          {/* Grid de Membros da Equipe (Cards) */}
          <div className={members.length === 1 ? "max-w-4xl mx-auto space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
            {members.map((member) => (
              <div key={member.id} className="relative group">
                {/* Ações flutuantes do Card no modo de edição */}
                <CMSCardActionBar
                  label="Profissional"
                  onEdit={() => handleEditMember(member)}
                  onDelete={() => handleDeleteMember(member.id)}
                />

                <div className="p-8 sm:p-10 rounded-3xl bg-[#18191D] border border-orange-500/30 hover:border-orange-500/60 relative shadow-2xl overflow-hidden transition-all duration-300 h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none -z-10" />

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                    {/* Moldura da Foto com Borda Laranja e Badge Verde idêntico à Imagem 2 */}
                    <div className="relative shrink-0">
                      <div
                        onClick={() => isEditMode && !isPreviewMode && handleEditMember(member)}
                        className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#121316] p-1 border-2 border-[#FF650F] shadow-lg relative overflow-hidden flex items-center justify-center ${
                          isEditMode && !isPreviewMode ? "cursor-pointer hover:border-white transition-colors" : ""
                        }`}
                      >
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name || "Foto da equipe"}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-[#121316] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl select-none tracking-wider">
                            {member.initials || "GG"}
                          </div>
                        )}

                        {/* Overlay no modo de edição para trocar a foto com facilidade */}
                        {isEditMode && !isPreviewMode && (
                          <div className="absolute inset-0 bg-black/65 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-white rounded-xl">
                            <Camera className="w-5 h-5 text-[#FF650F]" />
                            <span>Trocar Foto</span>
                          </div>
                        )}
                      </div>

                      {/* Selo Verde de Verificado */}
                      <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-[#18191D]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Dados do Profissional */}
                    <div className="space-y-3.5 text-center sm:text-left flex-grow">
                      <div>
                        <Badge variant="orange" className="text-[10px] font-mono tracking-wider uppercase mb-2">
                          {member.badge}
                        </Badge>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm font-semibold text-[#FF650F]">
                          {member.role}
                        </p>
                      </div>

                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {member.bio}
                      </p>

                      {member.highlights && member.highlights.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-300">
                          {member.highlights.map((hl, i) => (
                            <span key={hl.id || i} className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-[#FF650F]" />
                              {hl.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Botão de Adicionar Card no modo de edição */}
            {isEditMode && !isPreviewMode && (
              <div className={members.length === 1 ? "max-w-4xl mx-auto" : "h-full"}>
                <CMSAddCardButton
                  onClick={handleAddMember}
                  label="+ Adicionar Profissional da Equipe (com Upload de Foto)"
                  className="min-h-[160px] h-full"
                />
              </div>
            )}
          </div>
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

      {/* Modal de Edição de Card de Membro da Equipe com Upload de Foto */}
      <CMSTeamMemberModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        member={editingMember}
        onSave={handleSaveMember}
      />

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
