"use client";

import React, { useState, useRef } from "react";
import { useCMS } from "./cms-provider";
import {
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  UploadCloud,
  X,
  Check,
  Loader2,
  Play,
  Film,
} from "lucide-react";

export function CMSHeroMediaModal() {
  const { heroMediaModalOpen, setHeroMediaModalOpen, data, updateSection } = useCMS();
  const currentBg = data.hero.background || {
    type: "video",
    url: "/videos/hero-background.mp4",
  };

  const [activeTab, setActiveTab] = useState<"video" | "image" | "url">(currentBg.type || "video");
  const [mediaUrl, setMediaUrl] = useState(currentBg.url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!heroMediaModalOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(`Enviando ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/admin/cms/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao enviar arquivo.");
      }

      setMediaUrl(json.url);
      setUploadProgress("Arquivo enviado com sucesso!");

      // Detecta tipo pelo MIME ou extensão
      if (file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm")) {
        setActiveTab("video");
      } else {
        setActiveTab("image");
      }
    } catch (err: any) {
      console.error("[Hero Upload Error]:", err);
      setUploadError(err.message || "Erro durante o upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    const finalUrl = mediaUrl.trim();
    if (!finalUrl) {
      setUploadError("Por favor, selecione um arquivo ou insira uma URL.");
      return;
    }

    updateSection("hero", (prev) => ({
      ...prev,
      background: {
        type: activeTab,
        url: finalUrl,
      },
    }));

    setHeroMediaModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => setHeroMediaModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
              <Film className="w-5 h-5 text-[#FF650F]" />
              Gerenciador de Fundo da Hero
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Personalize o plano de fundo da seção principal com vídeo, imagem ou link externo.
            </p>
          </div>
          <button
            onClick={() => setHeroMediaModalOpen(false)}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "video"
                ? "bg-[#FF650F] text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Video className="w-4 h-4" />
            Subir Vídeo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "image"
                ? "bg-[#FF650F] text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Subir Imagem
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "url"
                ? "bg-[#FF650F] text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Colar Link Externo
          </button>
        </div>

        {/* Área de Upload Drag & Drop (para vídeo e imagem) */}
        {activeTab !== "url" && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? "border-[#FF650F] bg-[#FF650F]/10 scale-[1.01]"
                : "border-white/20 bg-zinc-900/50 hover:border-[#FF650F]/60 hover:bg-zinc-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={activeTab === "video" ? "video/*" : "image/*"}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-[#FF650F]/20 border border-[#FF650F]/40 flex items-center justify-center text-[#FF650F]">
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {isUploading ? "Enviando arquivo para a VPS..." : "Arraste e solte o arquivo aqui"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Ou clique para selecionar no seu computador (
                {activeTab === "video" ? "MP4, WebM, MOV até 150MB" : "JPG, PNG, WebP, SVG até 20MB"}
                )
              </p>
            </div>
          </div>
        )}

        {/* Campo de URL / Link (direto ou resultado do upload) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            {activeTab === "url" ? "URL do Vídeo ou Imagem de Fundo" : "Caminho do Arquivo Selecionado"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={
                activeTab === "video"
                  ? "/videos/hero-background.mp4"
                  : activeTab === "image"
                  ? "/images/hero-fundo.webp"
                  : "https://exemplo.com/video.mp4 ou https://exemplo.com/imagem.jpg"
              }
              className="flex-1 p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
            />
          </div>
          {uploadProgress && (
            <p className="text-xs text-emerald-400 font-semibold">{uploadProgress}</p>
          )}
          {uploadError && <p className="text-xs text-rose-400 font-semibold">{uploadError}</p>}
        </div>

        {/* Pré-visualização da Mídia */}
        {mediaUrl && (
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pré-visualização
            </span>
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
              {activeTab === "video" || mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm") ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mediaUrl}
                  alt="Pré-visualização do Fundo"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setHeroMediaModalOpen(false)}
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
            Aplicar ao Fundo da Hero
          </button>
        </div>
      </div>
    </div>
  );
}
