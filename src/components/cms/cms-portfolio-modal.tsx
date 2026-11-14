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
  ShieldCheck,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  Star,
  Download,
  AlertCircle,
  CheckCircle2,
  Video,
} from "lucide-react";
import type { ProjectDetailItem, ProjectVideo } from "@/lib/portfolio-data";
import {
  isExternalPlatformVideoUrl,
  isInstagramAnyUrl,
  isValidMediaUrlInput,
  getYouTubeThumbnailUrl,
} from "@/lib/media-utils";

export interface CMSPortfolioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialProject?: Partial<ProjectDetailItem> | null;
  onSaved?: () => void;
}

const DEFAULT_CATEGORIES = [
  "Design",
  "Letreiros",
  "Placas",
  "Painéis",
  "Quadros",
  "Troféus",
  "Fachadas",
  "Outros",
];

function createEmptyProjectForm(defaultCategory: string): Partial<ProjectDetailItem> {
  return {
    title: "",
    slug: "",
    subtitle: "",
    category: defaultCategory,
    clientName: "",
    clientSegment: "",
    location: "",
    year: "",
    executionTime: "",
    dimensions: "",
    warranty: "",
    description: "",
    challenge: "",
    solution: "",
    results: [],
    materials: [],
    technicalSpecs: [],
    featuredImage: "",
    coverImage: "",
    galleryImages: [],
    videos: [],
    tags: [],
  };
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

  const selectedPortfolioProject =
    propInitialProject !== undefined ? propInitialProject : (cms?.selectedPortfolioProject ?? null);

  const [remoteCategories, setRemoteCategories] = useState<string[]>([]);
  const rawCategories = cms?.data?.portfolio?.categories?.length
    ? cms.data.portfolio.categories
    : remoteCategories.length
      ? remoteCategories
      : DEFAULT_CATEGORIES;
  const selectableCategories = rawCategories.filter((c) => c !== "Tudo");

  const [formData, setFormData] = useState<Partial<ProjectDetailItem>>(() =>
    createEmptyProjectForm(selectableCategories[0] || "Fachadas")
  );

  const [activeTab, setActiveTab] = useState<"geral" | "midias" | "conteudo" | "especificacoes">("geral");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isImportingCover, setIsImportingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isImportingGalleryLink, setIsImportingGalleryLink] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isImportingVideoLink, setIsImportingVideoLink] = useState(false);
  const [uploadingVideoThumbId, setUploadingVideoThumbId] = useState<string | null>(null);

  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverDragActive, setCoverDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza categorias caso o modal seja aberto fora do CMSProvider (ex: página interna do projeto)
  useEffect(() => {
    if (!isOpen || cms?.data?.portfolio?.categories?.length) return;
    fetch("/api/v1/admin/cms/portfolio/categories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.categories)) {
          setRemoteCategories(json.categories);
        }
      })
      .catch(() => {});
  }, [isOpen, cms?.data?.portfolio?.categories]);

  // Reseta/popula o formulário ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("geral");
    setError(null);
    setMediaNotice(null);
    setGalleryUrlInput("");
    setVideoUrlInput("");

    if (selectedPortfolioProject) {
      setFormData({
        ...createEmptyProjectForm(selectableCategories[0] || "Fachadas"),
        ...selectedPortfolioProject,
        galleryImages: selectedPortfolioProject.galleryImages || [],
        videos: selectedPortfolioProject.videos || [],
      });
      setCoverUrlInput(selectedPortfolioProject.featuredImage || selectedPortfolioProject.coverImage || "");
    } else {
      setFormData(createEmptyProjectForm(selectableCategories[0] || "Fachadas"));
      setCoverUrlInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPortfolioProject, isOpen]);

  if (!isOpen) return null;

  const uploadSingleFile = async (file: File): Promise<{ url: string; mediaType?: string }> => {
    const dataPayload = new FormData();
    dataPayload.append("file", file);
    const res = await fetch("/api/v1/admin/cms/upload", {
      method: "POST",
      body: dataPayload,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Falha ao enviar ${file.name}.`);
    }
    return { url: json.url, mediaType: json.mediaType };
  };

  const importExternalMedia = async (
    rawUrl: string,
    expectedType: "image" | "video" | "any" = "any"
  ): Promise<{ url: string; mediaType: "image" | "video" }> => {
    const res = await fetch("/api/v1/admin/cms/import-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: rawUrl.trim(), expectedType }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Não foi possível importar a mídia do link.");
    }
    return { url: json.url, mediaType: json.mediaType };
  };

  // ==================== CAPA ====================
  const handleCoverFileUpload = async (file: File) => {
    setIsUploadingCover(true);
    setError(null);
    setMediaNotice(null);
    try {
      const { url } = await uploadSingleFile(file);
      setFormData((prev) => ({
        ...prev,
        featuredImage: url,
        coverImage: url,
      }));
      setCoverUrlInput(url);
      setMediaNotice("Imagem de capa enviada para o servidor com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da imagem de capa.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCoverLinkApply = async (rawValue?: string, forceImport = false) => {
    const targetUrl = (rawValue ?? coverUrlInput).trim();
    if (!targetUrl) {
      setFormData((prev) => ({ ...prev, featuredImage: "", coverImage: "" }));
      return;
    }

    if (!isValidMediaUrlInput(targetUrl)) {
      setError("Informe um link válido começando com https:// ou http://");
      return;
    }

    setError(null);
    setMediaNotice(null);

    // Links do Instagram (post ou CDN) devem ser importados para o servidor para não expirar nem sofrer bloqueio CORP
    if (isInstagramAnyUrl(targetUrl) || forceImport) {
      setIsImportingCover(true);
      setMediaNotice(
        isInstagramAnyUrl(targetUrl)
          ? "Importando imagem do Instagram para o servidor (garante carregamento permanente)..."
          : "Salvando cópia da imagem no servidor..."
      );
      try {
        const imported = await importExternalMedia(targetUrl, "image");
        setFormData((prev) => ({
          ...prev,
          featuredImage: imported.url,
          coverImage: imported.url,
        }));
        setCoverUrlInput(imported.url);
        setMediaNotice("Imagem importada e salva no servidor com sucesso!");
      } catch (err: any) {
        setMediaNotice(null);
        setError(err.message || "Não foi possível importar a imagem deste link.");
      } finally {
        setIsImportingCover(false);
      }
      return;
    }

    // URL externa comum (não-Instagram) pode ser usada diretamente
    setFormData((prev) => ({
      ...prev,
      featuredImage: targetUrl,
      coverImage: targetUrl,
    }));
    setMediaNotice("Link da imagem de capa aplicado!");
  };

  // ==================== GALERIA DE FOTOS ====================
  const handleGalleryFilesUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(f.name));
    if (fileList.length === 0) {
      setError("Selecione arquivos de imagem válidos (.jpg, .png, .webp, .avif, .gif, .svg).");
      return;
    }

    setIsUploadingGallery(true);
    setError(null);
    setMediaNotice(null);

    try {
      const uploadedItems: { url: string; caption: string }[] = [];
      for (const file of fileList) {
        const { url } = await uploadSingleFile(file);
        uploadedItems.push({ url, caption: "" });
      }
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...uploadedItems],
      }));
      setMediaNotice(`${uploadedItems.length} foto(s) adicionada(s) à galeria!`);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar foto(s) para a galeria.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleAddGalleryLink = async (rawValue?: string) => {
    const raw = (rawValue ?? galleryUrlInput).trim();
    if (!raw) return;

    const urls = raw.split(/\s+/).map((u) => u.trim()).filter(Boolean);
    for (const u of urls) {
      if (!isValidMediaUrlInput(u)) {
        setError(`Link inválido: "${u}". Informe links começando com https:// ou http://`);
        return;
      }
    }

    setError(null);
    setMediaNotice(null);

    const hasInstagram = urls.some((u) => isInstagramAnyUrl(u));
    if (hasInstagram) {
      setIsImportingGalleryLink(true);
      setMediaNotice("Importando foto(s) do Instagram para a galeria...");
    }

    try {
      const addedItems: { url: string; caption: string }[] = [];
      for (const url of urls) {
        if (isInstagramAnyUrl(url)) {
          const imported = await importExternalMedia(url, "image");
          addedItems.push({ url: imported.url, caption: "" });
        } else {
          addedItems.push({ url, caption: "" });
        }
      }

      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...addedItems],
      }));
      setGalleryUrlInput("");
      setMediaNotice(
        addedItems.length > 1
          ? `${addedItems.length} fotos adicionadas à galeria!`
          : hasInstagram
            ? "Foto do Instagram importada e adicionada à galeria!"
            : "Link de imagem adicionado à galeria!"
      );
    } catch (err: any) {
      setMediaNotice(null);
      setError(err.message || "Falha ao importar link.");
    } finally {
      setIsImportingGalleryLink(false);
    }
  };

  const handleImportExistingGalleryItem = async (index: number) => {
    const current = formData.galleryImages?.[index];
    if (!current?.url || current.url.startsWith("/")) return;

    setIsImportingGalleryLink(true);
    setError(null);
    try {
      const imported = await importExternalMedia(current.url, "image");
      setFormData((prev) => {
        const next = [...(prev.galleryImages || [])];
        if (next[index]) {
          next[index] = { ...next[index], url: imported.url };
        }
        return { ...prev, galleryImages: next };
      });
      setMediaNotice("Cópia da foto salva no servidor!");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar cópia local da foto.");
    } finally {
      setIsImportingGalleryLink(false);
    }
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const items = [...(prev.galleryImages || [])];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, galleryImages: items };
    });
  };

  const removeGalleryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index),
    }));
  };

  // ==================== GALERIA DE VÍDEOS ====================
  const handleVideoFilesUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|avi)$/i.test(f.name));
    if (fileList.length === 0) {
      setError("Selecione arquivos de vídeo válidos (.mp4, .webm, .mov, .m4v, .avi).");
      return;
    }

    setIsUploadingVideo(true);
    setError(null);
    setMediaNotice(null);

    try {
      const newVideos: ProjectVideo[] = [];
      for (const file of fileList) {
        const { url } = await uploadSingleFile(file);
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
        newVideos.push({
          id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: cleanTitle,
          description: "",
          videoUrl: url,
          thumbnailUrl: "",
          duration: "",
          tag: "",
        });
      }
      setFormData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), ...newVideos],
      }));
      setMediaNotice(`${newVideos.length} vídeo(s) enviado(s) para a galeria!`);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar vídeo(s).");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleAddVideoLink = async (rawValue?: string) => {
    const url = (rawValue ?? videoUrlInput).trim();
    if (!url) return;

    if (!isValidMediaUrlInput(url)) {
      setError("Informe um link de vídeo válido começando com https:// ou http://");
      return;
    }

    setError(null);
    setMediaNotice(null);

    if (isExternalPlatformVideoUrl(url)) {
      const ytThumb = getYouTubeThumbnailUrl(url) || "";
      const newVid: ProjectVideo = {
        id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: "",
        description: "",
        videoUrl: url,
        thumbnailUrl: ytThumb,
        duration: "",
        tag: "",
      };
      setFormData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), newVid],
      }));
      setVideoUrlInput("");
      setMediaNotice("Vídeo externo adicionado à galeria!");
      return;
    }

    if (isInstagramAnyUrl(url)) {
      setIsImportingVideoLink(true);
      setMediaNotice("Importando vídeo do Instagram para o servidor...");
      try {
        const imported = await importExternalMedia(url, "video");
        const newVid: ProjectVideo = {
          id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: "",
          description: "",
          videoUrl: imported.url,
          thumbnailUrl: "",
          duration: "",
          tag: "",
        };
        setFormData((prev) => ({
          ...prev,
          videos: [...(prev.videos || []), newVid],
        }));
        setVideoUrlInput("");
        setMediaNotice("Vídeo do Instagram importado com sucesso!");
      } catch (err: any) {
        setMediaNotice(null);
        setError(err.message || "Não foi possível importar o vídeo deste link.");
      } finally {
        setIsImportingVideoLink(false);
      }
      return;
    }

    const newVid: ProjectVideo = {
      id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: "",
      description: "",
      videoUrl: url,
      thumbnailUrl: "",
      duration: "",
      tag: "",
    };
    setFormData((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), newVid],
    }));
    setVideoUrlInput("");
    setMediaNotice("Link de vídeo adicionado à galeria!");
  };

  const handleVideoFieldChange = (videoId: string, field: keyof ProjectVideo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: (prev.videos || []).map((v) => (v.id === videoId ? { ...v, [field]: value } : v)),
    }));
  };

  const handleVideoThumbUpload = async (videoId: string, file: File) => {
    setUploadingVideoThumbId(videoId);
    setError(null);
    try {
      const { url } = await uploadSingleFile(file);
      handleVideoFieldChange(videoId, "thumbnailUrl", url);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar miniatura do vídeo.");
    } finally {
      setUploadingVideoThumbId(null);
    }
  };

  const removeVideoItem = (videoId: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((v) => v.id !== videoId),
    }));
  };

  // ==================== SALVAMENTO ====================
  const handleSave = async () => {
    setError(null);

    if (!formData.title?.trim()) {
      setActiveTab("geral");
      setError("O título do projeto é obrigatório.");
      return;
    }

    if (!formData.category?.trim()) {
      setActiveTab("geral");
      setError("A categoria do projeto é obrigatória.");
      return;
    }

    let finalCover = (coverUrlInput.trim() || formData.featuredImage || formData.coverImage || "").trim();
    if (!finalCover) {
      setActiveTab("midias");
      setError("A imagem de capa é obrigatória. Envie uma foto ou cole um link de imagem.");
      return;
    }

    setIsSaving(true);

    try {
      // Se a capa informada for do Instagram ainda não importada, importa antes de salvar
      if (isInstagramAnyUrl(finalCover)) {
        const imported = await importExternalMedia(finalCover, "image");
        finalCover = imported.url;
      }

      // Garante que qualquer link pendente nos inputs de galeria não importado/adicionado do Instagram seja tratado
      const galleryList = [...(formData.galleryImages || [])];
      if (galleryUrlInput.trim()) {
        const pendingPhoto = galleryUrlInput.trim();
        if (isInstagramAnyUrl(pendingPhoto)) {
          const imported = await importExternalMedia(pendingPhoto, "image");
          galleryList.push({ url: imported.url, caption: "" });
        } else if (isValidMediaUrlInput(pendingPhoto)) {
          galleryList.push({ url: pendingPhoto, caption: "" });
        }
      }

      // Importa eventuais URLs do Instagram presentes na galeria que ainda não foram convertidas
      for (let i = 0; i < galleryList.length; i++) {
        if (isInstagramAnyUrl(galleryList[i].url)) {
          const imported = await importExternalMedia(galleryList[i].url, "image");
          galleryList[i] = { ...galleryList[i], url: imported.url };
        }
      }

      const videosList = [...(formData.videos || [])];
      if (videoUrlInput.trim() && isValidMediaUrlInput(videoUrlInput.trim())) {
        const pendingVideo = videoUrlInput.trim();
        if (isInstagramAnyUrl(pendingVideo)) {
          const imported = await importExternalMedia(pendingVideo, "video");
          videosList.push({
            id: `vid-${Date.now()}`,
            title: "",
            description: "",
            videoUrl: imported.url,
            thumbnailUrl: "",
            duration: "",
            tag: "",
          });
        } else {
          videosList.push({
            id: `vid-${Date.now()}`,
            title: "",
            description: "",
            videoUrl: pendingVideo,
            thumbnailUrl: getYouTubeThumbnailUrl(pendingVideo) || "",
            duration: "",
            tag: "",
          });
        }
      }

      for (let i = 0; i < videosList.length; i++) {
        if (videosList[i].thumbnailUrl && isInstagramAnyUrl(videosList[i].thumbnailUrl)) {
          const importedThumb = await importExternalMedia(videosList[i].thumbnailUrl, "image");
          videosList[i] = { ...videosList[i], thumbnailUrl: importedThumb.url };
        }
      }

      const payload: Partial<ProjectDetailItem> = {
        ...formData,
        title: formData.title.trim(),
        category: formData.category.trim(),
        featuredImage: finalCover,
        coverImage: finalCover,
        galleryImages: galleryList,
        videos: videosList,
      };

      const isEditing = Boolean(selectedPortfolioProject?.id);
      const url = isEditing
        ? `/api/v1/admin/cms/portfolio/${selectedPortfolioProject!.id}`
        : "/api/v1/admin/cms/portfolio";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const hasTitle = Boolean(formData.title?.trim());
  const hasCategory = Boolean(formData.category?.trim());
  const hasCover = Boolean((formData.featuredImage || formData.coverImage || coverUrlInput).trim());
  const photosCount = formData.galleryImages?.length || 0;
  const videosCount = formData.videos?.length || 0;
  const isBusy =
    isSaving ||
    isUploadingCover ||
    isImportingCover ||
    isUploadingGallery ||
    isImportingGalleryLink ||
    isUploadingVideo ||
    isImportingVideoLink;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-4xl bg-[#16171B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
              <Briefcase className="w-5 h-5 text-[#FF650F]" />
              {selectedPortfolioProject?.id
                ? "Editar Projeto de Portfólio"
                : "Adicionar Novo Portfólio & Página Interna"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Apenas <strong className="text-white">Título</strong>,{" "}
              <strong className="text-white">Categoria</strong> e{" "}
              <strong className="text-white">Imagem de Capa</strong> são obrigatórios. Galeria de fotos, vídeos e demais dados são opcionais.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checklist dos 3 campos obrigatórios */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="text-zinc-400 mr-1">Obrigatórios:</span>
          <button
            type="button"
            onClick={() => setActiveTab("geral")}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-colors ${
              hasTitle
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/35 text-amber-300"
            }`}
          >
            {hasTitle ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            1. Título
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("geral")}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-colors ${
              hasCategory
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/35 text-amber-300"
            }`}
          >
            {hasCategory ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            2. Categoria
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("midias")}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-colors ${
              hasCover
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/35 text-amber-300"
            }`}
          >
            {hasCover ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            3. Imagem de Capa
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
            Capa, Fotos & Vídeos
            {(photosCount > 0 || videosCount > 0) && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30">
                {photosCount + videosCount}
              </span>
            )}
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
            Especificações
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mediaNotice && !error && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mediaNotice}</span>
          </div>
        )}

        {/* Aba 1: Dados Gerais */}
        {activeTab === "geral" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Título da Obra / Projeto <span className="text-[#FF650F]">*</span>
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
                  Categoria do Projeto <span className="text-[#FF650F]">*</span>
                </label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                >
                  <option value="" disabled>
                    Selecione uma categoria...
                  </option>
                  {selectableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {formData.category && !selectableCategories.includes(formData.category) && (
                    <option value={formData.category}>{formData.category}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Ano de Conclusão <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.year || ""}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none font-mono"
                  placeholder="Ex: 2026"
                />
              </div>
            </div>

            {/* Atalho visual para Imagem de Capa & Galeria */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {formData.featuredImage ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.featuredImage}
                      alt="Capa atual"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    {formData.featuredImage
                      ? "Imagem de Capa definida"
                      : "Imagem de Capa obrigatória ainda não definida"}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {photosCount} foto(s) e {videosCount} vídeo(s) na galeria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("midias")}
                className="px-3.5 py-2 rounded-xl bg-[#FF650F]/15 hover:bg-[#FF650F] text-[#FF650F] hover:text-white border border-[#FF650F]/40 text-xs font-bold transition-colors shrink-0"
              >
                {formData.featuredImage ? "Gerenciar Capa & Galerias →" : "Definir Capa & Galerias →"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nome do Cliente / Empresa <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Localização da Obra <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                  placeholder="Ex: Porto Alegre, RS"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Subtítulo Editorial <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
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

        {/* Aba 2: Capa, Fotos & Vídeos */}
        {activeTab === "midias" && (
          <div className="space-y-6 animate-fadeIn">
            {/* ==================== 1. IMAGEM DE CAPA ==================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#FF650F]" />
                  1. Imagem de Capa (Card e Cabeçalho) <span className="text-[#FF650F]">*</span>
                </label>
                {formData.featuredImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, featuredImage: "", coverImage: "" }));
                      setCoverUrlInput("");
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar capa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Upload da Capa */}
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setCoverDragActive(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setCoverDragActive(true);
                  }}
                  onDragLeave={() => setCoverDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCoverDragActive(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleCoverFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => coverFileInputRef.current?.click()}
                  className={`md:col-span-7 border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    coverDragActive
                      ? "border-[#FF650F] bg-[#FF650F]/10"
                      : "border-white/20 hover:border-[#FF650F] bg-zinc-950/60"
                  }`}
                >
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleCoverFileUpload(e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#FF650F]/20 text-[#FF650F] flex items-center justify-center">
                    {isUploadingCover ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white">
                    {isUploadingCover ? "Enviando imagem..." : "Clique ou arraste a foto de capa aqui"}
                  </p>
                  <p className="text-[11px] text-zinc-400">JPG, PNG, WebP ou AVIF</p>
                </div>

                {/* Prévia da Capa */}
                <div className="md:col-span-5 rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[140px] flex items-center justify-center relative">
                  {formData.featuredImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.featuredImage}
                        alt="Prévia da Capa"
                        referrerPolicy="no-referrer"
                        className="w-full h-40 object-cover"
                      />
                    </>
                  ) : (
                    <div className="text-center p-4 text-zinc-500 text-xs">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      Prévia da capa
                    </div>
                  )}
                </div>
              </div>

              {/* Link da Capa (incluindo Instagram) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#FF650F]" />
                  Ou cole o link da imagem (Instagram, CDN ou URL direta):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={coverUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCoverUrlInput(val);
                      setFormData((prev) => ({
                        ...prev,
                        featuredImage: val,
                        coverImage: val,
                      }));
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").trim();
                      if (pasted && isInstagramAnyUrl(pasted)) {
                        e.preventDefault();
                        setCoverUrlInput(pasted);
                        handleCoverLinkApply(pasted, true);
                      }
                    }}
                    className="flex-1 p-2.5 rounded-xl bg-zinc-950 border border-white/20 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                    placeholder="https://www.instagram.com/p/... ou https://scontent...cdninstagram.com/..."
                  />
                  <button
                    type="button"
                    disabled={isImportingCover || !coverUrlInput.trim()}
                    onClick={() => handleCoverLinkApply(coverUrlInput, true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#FF650F] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    title="Baixa a imagem do link para o servidor garantindo que não expire"
                  >
                    {isImportingCover ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {isImportingCover ? "Importando..." : "Importar Link"}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Dica Instagram: cole o link do post público ou clique com o botão direito na foto → &quot;Copiar endereço da imagem&quot; e cole acima. A foto será salva no servidor para nunca expirar.
                </p>
              </div>
            </div>

            {/* ==================== 2. GALERIA DE FOTOS ==================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#FF650F]" />
                    2. Galeria de Fotos <span className="text-[10px] font-normal text-zinc-400">(Opcional • {photosCount} foto(s))</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Envie várias fotos do computador ou adicione links de imagens (inclusive do Instagram).
                  </p>
                </div>
              </div>

              {/* Upload múltiplo */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(true);
                }}
                onDragLeave={() => setGalleryDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(false);
                  if (e.dataTransfer.files?.length) {
                    handleGalleryFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => galleryFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
                  galleryDragActive
                    ? "border-[#FF650F] bg-[#FF650F]/10"
                    : "border-white/15 hover:border-[#FF650F] bg-zinc-950/60"
                }`}
              >
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleGalleryFilesUpload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                {isUploadingGallery ? (
                  <Loader2 className="w-5 h-5 text-[#FF650F] animate-spin shrink-0" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-[#FF650F] shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-white">
                    {isUploadingGallery
                      ? "Enviando fotos para a galeria..."
                      : "Clique ou arraste várias fotos para a galeria"}
                  </p>
                  <p className="text-[11px] text-zinc-400">Seleção múltipla habilitada</p>
                </div>
              </div>

              {/* Adicionar foto por link */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGalleryLink();
                    }
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-950 border border-white/20 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                  placeholder="Cole o link da foto (Instagram ou URL direta) e clique em Adicionar"
                />
                <button
                  type="button"
                  disabled={isImportingGalleryLink || !galleryUrlInput.trim()}
                  onClick={() => handleAddGalleryLink()}
                  className="px-4 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  {isImportingGalleryLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {isImportingGalleryLink ? "Importando..." : "Adicionar Foto"}
                </button>
              </div>

              {/* Grid de fotos da galeria */}
              {photosCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {(formData.galleryImages || []).map((img, idx) => (
                    <div
                      key={`${img.url}-${idx}`}
                      className="group relative rounded-xl overflow-hidden border border-white/15 bg-black flex flex-col"
                    >
                      <div className="relative h-28 w-full bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`Foto ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="p-1.5 bg-zinc-950 flex items-center justify-between gap-1 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryItem(idx, -1)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300"
                            title="Mover para esquerda"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === photosCount - 1}
                            onClick={() => moveGalleryItem(idx, 1)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300"
                            title="Mover para direita"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {img.url.startsWith("http") && (
                            <button
                              type="button"
                              onClick={() => handleImportExistingGalleryItem(idx)}
                              className="p-1 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white"
                              title="Baixar cópia para o servidor"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                featuredImage: img.url,
                                coverImage: img.url,
                              }));
                              setCoverUrlInput(img.url);
                              setMediaNotice("Foto definida como imagem de capa!");
                            }}
                            className="p-1 rounded bg-zinc-800 hover:bg-[#FF650F] text-zinc-300 hover:text-white"
                            title="Usar esta foto como capa"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="p-1 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white"
                            title="Remover foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ==================== 3. GALERIA DE VÍDEOS ==================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#FF650F]" />
                  3. Galeria de Vídeos <span className="text-[10px] font-normal text-zinc-400">(Opcional • {videosCount} vídeo(s))</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Faça upload de vídeos (MP4, WebM, MOV) ou cole links de vídeo (MP4 direto, YouTube, Vimeo ou Reel do Instagram).
                </p>
              </div>

              {/* Upload de vídeos */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setVideoDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setVideoDragActive(true);
                }}
                onDragLeave={() => setVideoDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setVideoDragActive(false);
                  if (e.dataTransfer.files?.length) {
                    handleVideoFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => videoFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
                  videoDragActive
                    ? "border-[#FF650F] bg-[#FF650F]/10"
                    : "border-white/15 hover:border-[#FF650F] bg-zinc-950/60"
                }`}
              >
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleVideoFilesUpload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                {isUploadingVideo ? (
                  <Loader2 className="w-5 h-5 text-[#FF650F] animate-spin shrink-0" />
                ) : (
                  <Video className="w-5 h-5 text-[#FF650F] shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-white">
                    {isUploadingVideo ? "Enviando vídeo(s)..." : "Clique ou arraste vídeos do computador"}
                  </p>
                  <p className="text-[11px] text-zinc-400">MP4, WebM, MOV ou M4V (até 100 MB)</p>
                </div>
              </div>

              {/* Adicionar vídeo por link */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddVideoLink();
                    }
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-950 border border-white/20 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                  placeholder="Link do vídeo (Instagram Reel, YouTube, Vimeo ou .mp4 direto)"
                />
                <button
                  type="button"
                  disabled={isImportingVideoLink || !videoUrlInput.trim()}
                  onClick={() => handleAddVideoLink()}
                  className="px-4 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  {isImportingVideoLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {isImportingVideoLink ? "Importando..." : "Adicionar Vídeo"}
                </button>
              </div>

              {/* Lista de vídeos adicionados */}
              {videosCount > 0 && (
                <div className="space-y-3 pt-2">
                  {(formData.videos || []).map((vid, idx) => (
                    <div
                      key={vid.id || idx}
                      className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-12 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {vid.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={vid.thumbnailUrl}
                                alt={vid.title || `Vídeo ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-5 h-5 text-[#FF650F]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF650F]">
                              Vídeo #{idx + 1}
                            </span>
                            <p className="text-xs font-mono text-zinc-300 truncate">{vid.videoUrl}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeVideoItem(vid.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors shrink-0"
                          title="Remover vídeo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={vid.title || ""}
                          onChange={(e) => handleVideoFieldChange(vid.id, "title", e.target.value)}
                          placeholder="Título do vídeo (opcional)"
                          className="sm:col-span-2 p-2 rounded-lg bg-zinc-900 border border-white/15 text-white text-xs focus:border-[#FF650F] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={vid.duration || ""}
                          onChange={(e) => handleVideoFieldChange(vid.id, "duration", e.target.value)}
                          placeholder="Duração ex: 0:45 (opcional)"
                          className="p-2 rounded-lg bg-zinc-900 border border-white/15 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <input
                          type="text"
                          value={vid.thumbnailUrl || ""}
                          onChange={(e) => handleVideoFieldChange(vid.id, "thumbnailUrl", e.target.value)}
                          placeholder="Link da capa/miniatura do vídeo (opcional — se vazio usa a capa do projeto)"
                          className="flex-1 w-full p-2 rounded-lg bg-zinc-900 border border-white/15 text-white text-xs font-mono focus:border-[#FF650F] focus:outline-none"
                        />
                        <label className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5 shrink-0">
                          {uploadingVideoThumbId === vid.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          <span>Capa do Vídeo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleVideoThumbUpload(vid.id, e.target.files[0]);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba 3: Desafio & Solução (Opcional) */}
        {activeTab === "conteudo" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                O Desafio do Cliente <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                A Solução Técnica Desenvolvida <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Descrição Geral Completa <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
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

        {/* Aba 4: Especificações & Garantia (Opcional) */}
        {activeTab === "especificacoes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Tempo de Execução <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.executionTime || ""}
                onChange={(e) => setFormData({ ...formData, executionTime: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 15 dias úteis"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Dimensões / Metragem <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.dimensions || ""}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 180 m² de fachada + Letreiro 8m"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Garantia Oferecida <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.warranty || ""}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/20 text-white text-sm focus:border-[#FF650F] focus:outline-none"
                placeholder="Ex: 5 anos de garantia estrutural"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Segmento do Cliente <span className="text-[10px] font-normal text-zinc-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.clientSegment || ""}
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
            disabled={isBusy}
            className="px-6 py-2.5 rounded-xl bg-[#FF650F] hover:bg-orange-600 disabled:opacity-60 text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving
              ? "Gravando no Banco..."
              : selectedPortfolioProject?.id
                ? "Salvar Alterações"
                : "Salvar e Criar Página Interna"}
          </button>
        </div>
      </div>
    </div>
  );
}
