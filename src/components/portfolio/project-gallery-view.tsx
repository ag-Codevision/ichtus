"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
import { M3ScrollReveal } from "@/components/ui/scroll-reveal";
import { getExternalVideoEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/media-utils";

interface ProjectMediaShowcaseProps {
  project: ProjectDetailItem;
}

/** Posiciona o primeiro frame útil de vídeos MP4/WebM para renderizar miniatura real. */
function seekVideoPreviewFrame(videoEl: HTMLVideoElement) {
  try {
    if (Number.isFinite(videoEl.duration) && videoEl.duration > 0 && videoEl.currentTime < 0.1) {
      videoEl.currentTime = Math.min(0.5, videoEl.duration * 0.1);
    }
  } catch {
    // Ignora caso o stream não permita seek inicial
  }
}

/**
 * Card de Foto da Galeria da Página Interna (sempre visível após carregamento imediato)
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
  return (
    <div
      onClick={onClick}
      className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/90 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.caption || `${projectTitle} - Foto ${index + 1}`}
        referrerPolicy="no-referrer"
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          {img.caption?.trim() && (
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
              {img.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectMediaShowcase({ project }: ProjectMediaShowcaseProps) {
  const photos = project.galleryImages || [];
  const videos = project.videos || [];
  const hasPhotos = photos.length > 0;
  const hasVideos = videos.length > 0;

  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">("all");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ProjectVideo | null>(
    hasVideos ? videos[0] : null
  );

  useEffect(() => {
    if (videos.length === 0) {
      setSelectedVideo(null);
      return;
    }
    setSelectedVideo((prev) => {
      if (prev && videos.some((v) => v.id === prev.id || v.videoUrl === prev.videoUrl)) {
        return prev;
      }
      return videos[0];
    });
  }, [videos]);

  if (!hasPhotos && !hasVideos) {
    return null;
  }

  const photoCategories: string[] = [
    "Todas",
    ...Array.from(
      new Set(
        photos
          .map((img) => img.category)
          .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
      )
    ),
  ];

  const filteredPhotos =
    filterCategory === "Todas"
      ? photos
      : photos.filter((img) => img.category === filterCategory);

  const handleNextPhoto = () => {
    if (selectedPhotoIdx === null || photos.length === 0) return;
    setSelectedPhotoIdx((selectedPhotoIdx + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIdx === null || photos.length === 0) return;
    setSelectedPhotoIdx((selectedPhotoIdx - 1 + photos.length) % photos.length);
  };

  const resolveVideoThumb = (vid: ProjectVideo) =>
    vid.thumbnailUrl?.trim() || getYouTubeThumbnailUrl(vid.videoUrl) || "";

  const activeEmbedUrl = selectedVideo
    ? getExternalVideoEmbedUrl(selectedVideo.videoUrl, true)
    : null;

  const activeVideoThumb = selectedVideo ? resolveVideoThumb(selectedVideo) : "";
  const activeVideoIsExternalEmbed = selectedVideo
    ? Boolean(getExternalVideoEmbedUrl(selectedVideo.videoUrl))
    : false;

  const showPhotosSection = hasPhotos && (activeTab === "all" || activeTab === "photos");
  const showVideosSection = hasVideos && (activeTab === "all" || activeTab === "videos");

  return (
    <section className="space-y-12">
      {/* Cabeçalho e Filtro de Mídia: Tudo / Fotos / Vídeos */}
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
            {hasPhotos && hasVideos
              ? "Galeria de Fotos & Vídeos"
              : hasPhotos
                ? "Galeria de Fotos"
                : "Galeria de Vídeos"}
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            Veja em alta definição os registros e detalhes deste trabalho.
          </p>
        </div>

        {hasPhotos && hasVideos && (
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#FF650F] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
              }`}
            >
              Tudo ({photos.length + videos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "photos"
                  ? "bg-[#FF650F] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
              }`}
            >
              <Camera className="w-4 h-4" />
              Fotos ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("videos");
                setIsVideoPlaying(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "videos"
                  ? "bg-[#FF650F] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
              }`}
            >
              <Film className="w-4 h-4" />
              Vídeos ({videos.length})
            </button>
          </div>
        )}
      </M3ScrollReveal>

      {/* SEÇÃO 1: GALERIA DE FOTOS */}
      {showPhotosSection && (
        <div className="space-y-6">
          {showVideosSection && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FF650F]" />
                Galeria de Fotos ({photos.length})
              </h3>
            </div>
          )}

          {photoCategories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              {photoCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((img, idx) => {
              const originalIndex = photos.findIndex((g) => g.url === img.url);
              return (
                <OptimizedPhotoCard
                  key={`${img.url}-${idx}`}
                  img={img}
                  index={idx}
                  projectTitle={project.title}
                  onClick={() => setSelectedPhotoIdx(originalIndex !== -1 ? originalIndex : idx)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* SEÇÃO 2: GALERIA E SHOWCASE DE VÍDEOS */}
      {showVideosSection && (
        <div className="space-y-6">
          {showPhotosSection && (
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#FF650F]" />
                Galeria de Vídeos ({videos.length})
              </h3>
            </div>
          )}

          {selectedVideo && (
            <div className="relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                {!isVideoPlaying ? (
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    {activeVideoThumb ? (
                      <Image
                        src={activeVideoThumb}
                        alt={selectedVideo.title || project.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                    ) : !activeVideoIsExternalEmbed ? (
                      <video
                        key={`poster-${selectedVideo.videoUrl}`}
                        src={selectedVideo.videoUrl}
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => seekVideoPreviewFrame(e.currentTarget)}
                        onLoadedData={(e) => seekVideoPreviewFrame(e.currentTarget)}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
                    )}
                    <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-[#FF650F] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-white translate-x-0.5" />
                      </div>
                      <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
                        Clique para Assistir ao Vídeo
                      </span>
                    </div>
                  </div>
                ) : activeEmbedUrl ? (
                  <iframe
                    key={activeEmbedUrl}
                    src={activeEmbedUrl}
                    title={selectedVideo.title || project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    key={selectedVideo.videoUrl}
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  >
                    Seu navegador não suporta a reprodução deste vídeo.
                  </video>
                )}
              </div>

              {(selectedVideo.title?.trim() ||
                selectedVideo.description?.trim() ||
                selectedVideo.tag?.trim() ||
                selectedVideo.duration?.trim()) && (
                <div className="p-6 bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800">
                  <div>
                    {(selectedVideo.tag?.trim() || selectedVideo.duration?.trim()) && (
                      <div className="flex items-center gap-2 mb-1.5">
                        {selectedVideo.tag?.trim() && (
                          <Badge variant="orange">{selectedVideo.tag}</Badge>
                        )}
                        {selectedVideo.duration?.trim() && (
                          <span className="text-xs text-zinc-400 font-mono">
                            Duração: {selectedVideo.duration}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedVideo.title?.trim() && (
                      <h3 className="text-lg sm:text-xl font-bold">{selectedVideo.title}</h3>
                    )}
                    {selectedVideo.description?.trim() && (
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        {selectedVideo.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {videos.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {videos.map((vid, idx) => {
                const thumb = resolveVideoThumb(vid);
                const isExternalEmbed = Boolean(getExternalVideoEmbedUrl(vid.videoUrl));
                const isSelected = selectedVideo?.id === vid.id || selectedVideo?.videoUrl === vid.videoUrl;

                return (
                  <div
                    key={vid.id || idx}
                    onClick={() => {
                      setSelectedVideo(vid);
                      setIsVideoPlaying(true);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                      isSelected
                        ? "bg-orange-50 border-[#FF650F] text-zinc-900 shadow-sm"
                        : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700"
                    }`}
                  >
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={vid.title || `Vídeo ${idx + 1}`}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      ) : !isExternalEmbed ? (
                        <video
                          src={vid.videoUrl}
                          preload="metadata"
                          muted
                          playsInline
                          onLoadedMetadata={(e) => seekVideoPreviewFrame(e.currentTarget)}
                          onLoadedData={(e) => seekVideoPreviewFrame(e.currentTarget)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900" />
                      )}
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold line-clamp-1">
                        {vid.title?.trim() || `Vídeo ${idx + 1}`}
                      </h4>
                      {vid.duration?.trim() && (
                        <span className="text-[10px] text-zinc-500 font-mono">{vid.duration}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX EM TELA CHEIA */}
      {selectedPhotoIdx !== null && photos[selectedPhotoIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setSelectedPhotoIdx(null)}
            className="absolute top-5 right-5 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fechar visualizador"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF650F] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF650F] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative max-w-6xl max-h-[85vh] w-full h-[80vh] px-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[selectedPhotoIdx].url}
                alt={photos[selectedPhotoIdx].caption || project.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="mt-4 text-center max-w-2xl px-4">
              <span className="text-xs font-mono text-[#FF650F] block mb-1">
                Foto {selectedPhotoIdx + 1} de {photos.length}
                {photos[selectedPhotoIdx].category &&
                  ` • ${photos[selectedPhotoIdx].category}`}
              </span>
              {photos[selectedPhotoIdx].caption?.trim() && (
                <p className="text-white text-sm font-medium">
                  {photos[selectedPhotoIdx].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
