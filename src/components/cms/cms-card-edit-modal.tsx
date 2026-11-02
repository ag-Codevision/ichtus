"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Check,
  UploadCloud,
  Loader2,
  Compass,
  Layers,
  Box,
  Kanban,
  Globe,
  Handshake,
  Truck,
  Palette,
  Lightbulb,
  Cog,
  UserCheck,
  Wrench,
  ShieldCheck,
  Target,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  Building,
  Star,
  Eye,
  FileCheck2,
} from "lucide-react";

export const AVAILABLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Layers,
  Box,
  Kanban,
  Globe,
  Handshake,
  Truck,
  Palette,
  Lightbulb,
  Cog,
  UserCheck,
  Wrench,
  ShieldCheck,
  Target,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  Building,
  Star,
  Eye,
  FileCheck2,
};

export interface GenericCardData {
  id?: string;
  title: string;
  icon?: string;
  description?: string;
  paragraphs?: string[];
  tag?: string;
  badgeText?: string;
  highlight?: string;
  category?: string;
  targetHash?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  features?: string[];
  name?: string;
  role?: string;
  company?: string;
  content?: string;
  rating?: number;
}

interface CMSCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: GenericCardData) => void;
  initialCard?: GenericCardData | null;
  sectionTitle?: string;
  hasIcon?: boolean;
  hasButton?: boolean;
  hasTag?: boolean;
  hasImage?: boolean;
  hasRating?: boolean;
}

export function CMSCardEditModal({
  isOpen,
  onClose,
  onSave,
  initialCard,
  sectionTitle = "Card",
  hasIcon = true,
  hasButton = true,
  hasTag = true,
  hasImage = false,
  hasRating = false,
}: CMSCardEditModalProps) {
  const [formData, setFormData] = useState<GenericCardData>(
    initialCard || {
      title: "",
      icon: "Sparkles",
      description: "",
      tag: "",
      badgeText: "",
      buttonText: "",
      buttonLink: "",
      imageUrl: "",
    }
  );

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/v1/admin/cms/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFormData((prev) => ({ ...prev, imageUrl: json.url }));
      }
    } catch (err) {
      console.error("[Card Image Upload Error]:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    onSave({
      ...formData,
      id: formData.id || `card-${Date.now()}`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF650F]" />
              {initialCard?.id ? "Editar Card" : "Adicionar Novo Card"} — {sectionTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Configure os elementos visuais, textos e links deste card.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          {/* Seletor de Ícones Lucide */}
          {hasIcon && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Ícone do Card (Escolha o símbolo visual)
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 p-3 rounded-2xl bg-zinc-900 border border-white/10 max-h-36 overflow-y-auto">
                {Object.entries(AVAILABLE_ICONS).map(([name, IconComponent]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: name })}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      formData.icon === name
                        ? "bg-[#FF650F] text-white shadow-md scale-105"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                    title={name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Título ou Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Título do Card *
            </label>
            <input
              type="text"
              value={formData.title || formData.name || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                  name: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              placeholder="Ex: Consultoria Especializada"
            />
          </div>

          {/* Tag ou Categoria ou Badge */}
          {hasTag && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Badge / Destaque Superior
                </label>
                <input
                  type="text"
                  value={formData.tag || formData.badgeText || formData.role || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tag: e.target.value,
                      badgeText: e.target.value,
                      role: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Ex: Chave na Mão, Diretor Geral"
                />
              </div>

              {formData.company !== undefined && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Empresa / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                    placeholder="Ex: Grupo Nexus Tech"
                  />
                </div>
              )}
            </div>
          )}

          {/* Descrição / Conteúdo do Card */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Texto Descritivo / Conteúdo *
            </label>
            <textarea
              value={
                formData.description ||
                formData.content ||
                (formData.paragraphs ? formData.paragraphs.join("\n\n") : "")
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                  content: e.target.value,
                  paragraphs: e.target.value.split("\n\n"),
                })
              }
              rows={4}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none leading-relaxed"
              placeholder="Descreva as soluções, proposta ou o depoimento deste card..."
            />
          </div>

          {/* Botão Interno (Texto e Link) */}
          {hasButton && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900 border border-white/10">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={formData.buttonText || ""}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  placeholder="Ex: Solicitar Orçamento"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Link de Destino
                </label>
                <input
                  type="text"
                  value={formData.buttonLink || formData.targetHash || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      buttonLink: e.target.value,
                      targetHash: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none font-mono"
                  placeholder="Ex: /#contato ou #portfolio"
                />
              </div>
            </div>
          )}

          {/* Imagem de Capa do Card (se aplicável) */}
          {hasImage && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Imagem do Card
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs focus:border-[#FF650F] focus:outline-none font-mono"
                  placeholder="/images/... ou URL"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Check className="w-4 h-4" />
            Salvar Card
          </button>
        </div>
      </div>
    </div>
  );
}
