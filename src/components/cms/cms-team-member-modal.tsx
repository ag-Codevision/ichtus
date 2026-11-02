"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Check,
  UploadCloud,
  Loader2,
  Trash2,
  Plus,
  ShieldCheck,
  Building,
  Sparkles,
  Camera,
  CheckCircle2,
} from "lucide-react";
import type { CMSTeamMember } from "@/lib/cms-defaults";

interface CMSTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: CMSTeamMember | null;
  onSave: (member: CMSTeamMember) => void;
}

export function CMSTeamMemberModal({
  isOpen,
  onClose,
  member,
  onSave,
}: CMSTeamMemberModalProps) {
  const [formData, setFormData] = useState<CMSTeamMember>({
    id: "",
    name: "",
    role: "",
    badge: "Direção & Estratégia",
    bio: "",
    photoUrl: "",
    initials: "GG",
    highlights: [
      { id: "hl-1", icon: "ShieldCheck", text: "Atendimento Direto" },
      { id: "hl-2", icon: "Building", text: "Porto Alegre & Todo o Brasil" },
    ],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        id: `member-${Date.now()}`,
        name: "",
        role: "Especialista em Fachadas",
        badge: "Engenharia & Projetos",
        bio: "",
        photoUrl: "",
        initials: "",
        highlights: [
          { id: "hl-1", icon: "ShieldCheck", text: "Atendimento Direto" },
          { id: "hl-2", icon: "Building", text: "Porto Alegre & Todo o Brasil" },
        ],
      });
    }
    setUploadError(null);
  }, [member, isOpen]);

  // Calcula iniciais automaticamente quando o nome muda e o campo de iniciais estiver vazio
  const handleNameChange = (name: string) => {
    const parts = name.trim().split(" ");
    let autoInitials = "";
    if (parts.length >= 2) {
      autoInitials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      autoInitials = parts[0].slice(0, 2).toUpperCase();
    }
    setFormData((prev) => ({
      ...prev,
      name,
      initials: prev.initials && prev.initials !== "GG" && prev.initials.length > 0 ? prev.initials : autoInitials || "GG",
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, envie um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const dataPayload = new FormData();
      dataPayload.append("file", file);

      const res = await fetch("/api/v1/admin/cms/upload", {
        method: "POST",
        body: dataPayload,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao enviar a foto.");
      }

      setFormData((prev) => ({
        ...prev,
        photoUrl: json.url,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Erro no upload da foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setUploadError("O nome do profissional é obrigatório.");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {member?.id ? "Editar Membro da Equipe" : "Adicionar Membro da Equipe"}
              </h3>
              <p className="text-xs text-zinc-400">
                Personalize foto, cargo, apresentação e destaques do profissional.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
            {uploadError}
          </div>
        )}

        {/* 1. SEÇÃO DE FOTO DO PROFISSIONAL (COM MOLDURA IGUAL À IMAGEM 2) */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Foto do Profissional da Equipe (Upload)
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Moldura de Pré-visualização com Estilo Idêntico à Imagem 2 */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-[#121316] p-1 border-2 border-[#FF650F] shadow-xl relative overflow-hidden flex items-center justify-center">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name || "Foto do profissional"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#121316] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl tracking-wider select-none">
                    {formData.initials || "GG"}
                  </div>
                )}
              </div>
              {/* Badge Verde de Verificado idêntico à Imagem 2 */}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-[#16171B]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Controles de Upload com Drag & Drop */}
            <div className="flex-grow space-y-3 w-full">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#FF650F] bg-orange-500/10"
                    : "border-white/20 hover:border-[#FF650F]/60 bg-zinc-800/40"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-1.5">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#FF650F] animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-[#FF650F]" />
                  )}
                  <p className="text-xs font-semibold text-white">
                    {isUploading ? "Enviando foto..." : "Arraste uma foto aqui ou clique para selecionar"}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Formatos suportados: PNG, JPG, WebP (máx. 10MB)
                  </p>
                </div>
              </div>

              {formData.photoUrl && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 truncate max-w-[220px]">
                    Foto carregada com sucesso
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: "" }))}
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover Foto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. DADOS DO PROFISSIONAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              Nome do Profissional *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              placeholder="Ex: Glessios Gusso"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              Cargo / Função *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              placeholder="Ex: Diretor Geral"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              Tag / Especialidade
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
              placeholder="Ex: DIREÇÃO & ESTRATÉGIA"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              Iniciais (Fallback sem foto)
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.initials || ""}
              onChange={(e) =>
                setFormData({ ...formData, initials: e.target.value.toUpperCase() })
              }
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono tracking-widest"
              placeholder="Ex: GG"
            />
          </div>
        </div>

        {/* 3. BIOGRAFIA E APRESENTAÇÃO */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
            Biografia &amp; Trajetória Profissional
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none leading-relaxed"
            placeholder="Descreva a experiência, liderança e diferenciais do profissional..."
          />
        </div>

        {/* 4. DESTAQUES INFERIORES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">
              Destaques Rápidos (Badges Inferiores)
            </label>
            <button
              type="button"
              onClick={() => {
                const newId = `hl-${Date.now()}`;
                setFormData((prev) => ({
                  ...prev,
                  highlights: [
                    ...(prev.highlights || []),
                    { id: newId, icon: "ShieldCheck", text: "Novo Destaque" },
                  ],
                }));
              }}
              className="text-xs font-bold text-[#FF650F] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Destaque
            </button>
          </div>

          <div className="space-y-2">
            {(formData.highlights || []).map((hl, idx) => (
              <div key={hl.id || idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={hl.text}
                  onChange={(e) => {
                    const next = [...(formData.highlights || [])];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setFormData({ ...formData, highlights: next });
                  }}
                  className="flex-grow p-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                  placeholder="Texto do destaque..."
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = (formData.highlights || []).filter((_, i) => i !== idx);
                    setFormData({ ...formData, highlights: next });
                  }}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
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
            onClick={handleSave}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Check className="w-4 h-4" />
            Salvar Membro da Equipe
          </button>
        </div>
      </div>
    </div>
  );
}
