"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Film,
  ZoomIn,
} from "lucide-react";
import type { ProjectDetailItem, ProjectVideo } from "@/lib/portfolio-data";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";

interface ProjectMediaShowcaseProps {
  project: ProjectDetailItem;
}

/**
 * Componente de Imagem Otimizada com Skeleton Shimmer e Transição de Opacidade
 */
function OptimizedPhotoCard({
  img,
  index,
  projectTitle,
  onClick,
}: {
  img: { url: string; caption: string; category?: string };
  index: number;
  projectTitle: string;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/90 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Skeleton de Carregamento Instantâneo */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse" />
      )}

      <Image
        src={img.url}
        alt={img.caption || projectTitle}
        fill
        unoptimized
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`object-cover transition-all duration-500 group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Overlay Escuro e Detalhes ao passar o mouse */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
        <div className="flex justify-end">
          <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <ZoomIn className="w-5 h-5" />
          </span>
        </div>
        <div>
          {img.category && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm mb-1.5">
              {img.category}
            </span>
          )}
          <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
            {img.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProjectMediaShowcase({ project }: ProjectMediaShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ProjectVideo | null>(
    project.videos && project.videos.length > 0 ? project.videos[0] : null
  );

  const photoCategories: string[] = [
    "Todas",
    ...Array.from(
      new Set(
        project.galleryImages
          .map((img) => img.category)
          .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
      )
    ),
  ];

  const filteredPhotos =
    filterCategory === "Todas"
      ? project.galleryImages
      : project.galleryImages.filter((img) => img.category === filterCategory);

  const handleNextPhoto = () => {
    if (selectedPhotoIdx === null) return;
    setSelectedPhotoIdx((selectedPhotoIdx + 1) % project.galleryImages.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIdx === null) return;
    setSelectedPhotoIdx(
      (selectedPhotoIdx - 1 + project.galleryImages.length) % project.galleryImages.length
    );
  };

  return (
    <section className="space-y-12">
      {/* Seletor de Abas de Mídia: Fotos & Vídeos com M3ScrollReveal */}
      <M3ScrollReveal
        variant="fadeUp"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6"
      >
        <div>
          <Badge variant="orange-light" className="mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
            Acervo Visual da Obra
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Galeria de Fotos & Vídeos
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            Veja em alta definição cada detalhe da execução, iluminação e acabamentos.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200 w-fit">
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-[#FF650F] text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
            }`}
          >
            <Camera className="w-4 h-4" />
            Fotos da Obra ({project.galleryImages.length})
          </button>

          {project.videos && project.videos.length > 0 && (
            <button
              onClick={() => {
                setActiveTab("videos");
                setIsVideoPlaying(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "videos"
                  ? "bg-[#FF650F] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
              }`}
            >
              <Film className="w-4 h-4" />
              Vídeos do Projeto ({project.videos.length})
            </button>
          )}
        </div>
      </M3ScrollReveal>

      {/* ========================================================
          ABA 1: GALERIA DE FOTOS COM STAGGER MOTION
          ======================================================== */}
      {activeTab === "photos" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Subfiltros de Categoria de Foto */}
          {photoCategories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              {photoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterCategory === cat
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid de Fotos com M3ScrollStagger e M3ScrollItem */}
          <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((img, idx) => {
              const originalIndex = project.galleryImages.findIndex((g) => g.url === img.url);
              return (
                <M3ScrollItem key={idx}>
                  <OptimizedPhotoCard
                    img={img}
                    index={idx}
                    projectTitle={project.title}
                    onClick={() => setSelectedPhotoIdx(originalIndex !== -1 ? originalIndex : idx)}
                  />
                </M3ScrollItem>
              );
            })}
          </M3ScrollStagger>
        </div>
      )}

      {/* ========================================================
          ABA 2: GALERIA E SHOWCASE DE VÍDEOS OTIMIZADO
          ======================================================== */}
      {activeTab === "videos" && project.videos && project.videos.length > 0 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {selectedVideo && (
            <div className="relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                {!isVideoPlaying ? (
                  <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsVideoPlaying(true)}>
                    <Image
                      src={selectedVideo.thumbnailUrl}
                      alt={selectedVideo.title}
                      fill
                      unoptimized
                      className="object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-[#FF650F] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-white translate-x-0.5" />
                      </div>
                      <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
                        Clique para Assistir ao Vídeo
                      </span>
                    </div>
                  </div>
                ) : (
                  <video
                    key={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Seu navegador não suporta a tag de vídeo HTML5.
                  </video>
                )}
              </div>

              {/* Informações do Vídeo Atual */}
              <div className="p-6 bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="orange">{selectedVideo.tag}</Badge>
                    <span className="text-xs text-zinc-400 font-mono">Duração: {selectedVideo.duration}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{selectedVideo.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">{selectedVideo.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Outros Vídeos se houver mais de um */}
          {project.videos.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {project.videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideo(vid);
                    setIsVideoPlaying(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                    selectedVideo?.id === vid.id
                      ? "bg-orange-50 border-[#FF650F] text-zinc-900"
                      : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700"
                  }`}
                >
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0">
                    <Image src={vid.thumbnailUrl} alt={vid.title} fill quality={60} className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold line-clamp-1">{vid.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">{vid.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL LIGHTBOX EM TELA CHEIA (FULLSCREEN ZOOM)
          ======================================================== */}
      {selectedPhotoIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Botão Fechar */}
          <button
            onClick={() => setSelectedPhotoIdx(null)}
            className="absolute top-5 right-5 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fechar visualizador"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Botão Anterior */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF650F] text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Botão Próximo */}
          <button
            onClick={handleNextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF650F] text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Imagem Central */}
          <div className="relative max-w-6xl max-h-[85vh] w-full h-[80vh] px-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={project.galleryImages[selectedPhotoIdx].url}
                alt={project.galleryImages[selectedPhotoIdx].caption || project.title}
                fill
                unoptimized
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Legenda e Contador */}
            <div className="mt-4 text-center max-w-2xl px-4">
              <span className="text-xs font-mono text-[#FF650F] block mb-1">
                Foto {selectedPhotoIdx + 1} de {project.galleryImages.length}
                {project.galleryImages[selectedPhotoIdx].category &&
                  ` • ${project.galleryImages[selectedPhotoIdx].category}`}
              </span>
              <p className="text-white text-sm font-medium">
                {project.galleryImages[selectedPhotoIdx].caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
