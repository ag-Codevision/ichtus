"use client";

import React, { useState, useEffect, useRef } from "react";
import { useOptionalCMS } from "./cms-provider";
import {
  X,
  Check,
  UploadCloud,
  Loader2,
  Briefcase,
  Image as ImageIcon,
  Film,
  Plus,
  Trash2,
  FileText,
  Building,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { ProjectDetailItem } from "@/lib/portfolio-data";


export interface CMSPortfolioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialProject?: Partial<ProjectDetailItem> | null;
  onSaved?: () => void;
}

export function CMSPortfolioModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialProject: propInitialProject,
  onSaved: propOnSaved,
}: CMSPortfolioModalProps = {}) {
  const cms = useOptionalCMS();

  const isOpen = propIsOpen !== undefined ? propIsOpen : (cms?.portfolioModalOpen ?? false);
  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      cms?.setPortfolioModalOpen(false);
    }
  };

  const selectedPortfolioProject = propInitialProject !== undefined ? propInitialProject : (cms?.selectedPortfolioProject ?? null);

  const categories = cms?.data?.portfolio?.categories || [
    "Design",
    "Letreiros",
    "Placas",
    "Painéis",
    "Quadros",
    "Troféus",
    "Fachadas",
    "Outros",
  ];

  const [formData, setFormData] = useState<Partial<ProjectDetailItem>>({
    title: "",
    slug: "",
    subtitle: "",
    category: "Fachadas",
    clientName: "",
    clientSegment: "",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "15 dias úteis",
    dimensions: "100 m²",
    warranty: "5 anos de garantia estrutural",
    description: "",
    challenge: "",
    solution: "",
    results: ["Valorização imediata da imagem da empresa."],
    materials: ["ACM 3mm", "LED 6500K", "Acrílico"],
    featuredImage: "/images/portfolio/fachada-acm-tech-tower-thumb.webp",
    coverImage: "/images/portfolio/fachada-acm-tech-tower-cover.webp",
    galleryImages: [],
    videos: [],
    tags: ["Fachadas"],
  });

  const [activeTab, setActiveTab] = useState<"geral" | "midias" | "conteudo" | "especificacoes">("geral");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedPortfolioProject) {
      setFormData(selectedPortfolioProject);
    } else {
      setFormData({
        title: "",
        slug: "",
        subtitle: "",
        category: categories.find((c) => c !== "Tudo") || "Fachadas",
        clientName: "",
        clientSegment: "Comunicação Visual Corporativa",
        location: "Porto Alegre, RS",
        year: "2026",
        executionTime: "15 dias úteis",
        dimensions: "100 m²",
        warranty: "5 anos de garantia",
        description: "",
        challenge: "",
        solution: "",
        results: ["Valorização imediata da fachada da marca."],
        materials: ["ACM 3mm", "LED"],
        featuredImage: "/images/portfolio/fachada-acm-tech-tower-thumb.webp",
        coverImage: "/images/portfolio/fachada-acm-tech-tower-cover.webp",
        galleryImages: [],
        videos: [],
        tags: ["Fachadas"],
      });
    }
  }, [selectedPortfolioProject, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const dataPayload = new FormData();
      dataPayload.append("file", file);
      const res = await fetch("/api/v1/admin/cms/upload", {
        method: "POST",
        body: dataPayload,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro no upload.");
      }
      setFormData((prev) => ({
        ...prev,
        featuredImage: json.url,
        coverImage: json.url,
      }));
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      setError("O título do projeto é obrigatório.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const isEditing = Boolean(selectedPortfolioProject?.id);
      const url = isEditing
        ? `/api/v1/admin/cms/portfolio/${selectedPortfolioProject!.id}`
        : "/api/v1/admin/cms/portfolio";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao salvar projeto no banco de dados.");
      }

      if (propOnSaved) {
        propOnSaved();
      } else {
        cms?.refreshPortfolio();
        cms?.setPortfolioModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Falha ao gravar no banco de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-4xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
              <Briefcase className="w-5 h-5 text-[#FF650F]" />
              {selectedPortfolioProject?.id ? "Editar Projeto de Portfólio" : "Adicionar Novo Portfólio & Página Interna"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Preencha os dados da capa (card da listagem) e o conteúdo editorial completo da página interna (/portfolio/[slug]).
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("geral")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "geral" ? "bg-[#FF650F] text-white shadow" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Dados Gerais
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("midias")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "midias" ? "bg-[#FF650F] text-white shadow" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Fotos & Mídias
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("conteudo")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "conteudo" ? "bg-[#FF650F] text-white shadow" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Building className="w-4 h-4" />
            Desafio & Solução
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("especificacoes")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === "especificacoes" ? "bg-[#FF650F] text-white shadow" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Especificações & Garantia
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Aba 1: Dados Gerais */}
        {activeTab === "geral" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Título da Obra / Projeto *
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: Fachada Comercial Estruturada em ACM & Letreiro LED"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Categoria do Projeto *
                </label>
                <select
                  value={formData.category || "Fachadas"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                >
                  {categories
                    .filter((c) => c !== "Tudo")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Ano de Conclusão
                </label>
                <input
                  type="text"
                  value={formData.year || "2026"}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
                  placeholder="2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Nome do Cliente / Empresa
                </label>
                <input
                  type="text"
                  value={formData.clientName || ""}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Ex: Tech Tower Empreendimentos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Localização da Obra
                </label>
                <input
                  type="text"
                  value={formData.location || "Porto Alegre, RS"}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Porto Alegre, RS"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Subtítulo Editorial (Resumo da Página Interna)
              </label>
              <textarea
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: Modernização arquitetônica de 180m² com corte chanfrado em Router CNC..."
              />
            </div>
          </div>
        )}

        {/* Aba 2: Fotos & Mídias */}
        {activeTab === "midias" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Imagem de Capa (Card e Cabeçalho do Projeto) *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#FF650F] rounded-2xl p-6 text-center cursor-pointer bg-zinc-900/60 transition-all flex flex-col items-center justify-center gap-2"
              >
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
                <div className="w-12 h-12 rounded-xl bg-[#FF650F]/20 text-[#FF650F] flex items-center justify-center">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <p className="text-xs font-bold text-white">
                  {isUploading ? "Enviando imagem..." : "Clique ou arraste a foto de capa aqui"}
                </p>
                <p className="text-[11px] text-zinc-400">JPG, PNG ou WebP de alta definição</p>
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  value={formData.featuredImage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredImage: e.target.value,
                      coverImage: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                  placeholder="URL direta da imagem"
                />
              </div>
            </div>

            {/* Prévia da Capa */}
            {formData.featuredImage && (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.featuredImage}
                  alt="Prévia de Capa"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Aba 3: Desafio & Solução */}
        {activeTab === "conteudo" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                O Desafio do Cliente
              </label>
              <textarea
                value={formData.challenge || ""}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Qual era a necessidade inicial ou dificuldade arquitetônica que o cliente enfrentava..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                A Solução Técnica Desenvolvida pela ICTHUS
              </label>
              <textarea
                value={formData.solution || ""}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Como a equipe de engenharia e fabricação solucionou com excelência..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Descrição Geral Completa
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Texto editorial complementar do projeto..."
              />
            </div>
          </div>
        )}

        {/* Aba 4: Especificações & Garantia */}
        {activeTab === "especificacoes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Tempo de Execução
              </label>
              <input
                type="text"
                value={formData.executionTime || "15 dias úteis"}
                onChange={(e) => setFormData({ ...formData, executionTime: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 15 dias úteis"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Dimensões / Metragem
              </label>
              <input
                type="text"
                value={formData.dimensions || "100 m²"}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 180 m² de fachada + Letreiro 8m"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Garantia Oferecida
              </label>
              <input
                type="text"
                value={formData.warranty || "5 anos de garantia estrutural"}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 5 anos de garantia estrutural"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Segmento do Cliente
              </label>
              <input
                type="text"
                value={formData.clientSegment || "Comunicação Visual Corporativa"}
                onChange={(e) => setFormData({ ...formData, clientSegment: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: Clínicas & Saúde, Redes de Franquias"
              />
            </div>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleClose()}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? "Gravando no Banco..." : "Salvar e Criar Página Interna"}
          </button>
        </div>
      </div>
    </div>
  );
}
