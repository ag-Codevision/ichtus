"use client";

import React, { useState, useRef } from "react";
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Download,
  Star,
  ExternalLink,
  Plus,
  Cloud,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { DocumentPreviewModal, PreviewDocument } from "@/components/admin/crm/DocumentPreviewModal";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  isCover: boolean;
  isExternalLink: boolean;
  createdAt: string;
  [key: string]: any;
}

interface ServiceAttachmentsSectionProps {
  leadId?: string; // Se fornecido, faz upload direto
  existingAttachments?: AttachmentItem[];
  onAttachmentAdded?: (attachment: AttachmentItem) => void;
  onAttachmentDeleted?: (id: string) => void;
  onToggleCover?: (attachment: AttachmentItem) => void;

  // Para o modal de criação (onde o lead ainda não existe na base)
  localFiles?: File[];
  onLocalFilesChange?: (files: File[]) => void;
  cloudLinks?: { fileName: string; fileUrl: string; fileType: string }[];
  onCloudLinksChange?: (links: { fileName: string; fileUrl: string; fileType: string }[]) => void;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ServiceAttachmentsSection({
  leadId,
  existingAttachments = [],
  onAttachmentAdded,
  onAttachmentDeleted,
  onToggleCover,
  localFiles = [],
  onLocalFilesChange,
  cloudLinks = [],
  onCloudLinksChange,
}: ServiceAttachmentsSectionProps) {
  const { toast, addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"LOCAL" | "CLOUD">("LOCAL");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Visualização Pop-up do Documento no Sistema
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (att: AttachmentItem) => {
    setPreviewDoc({
      title: att.fileName,
      url: att.fileUrl,
      fileType: att.fileType,
      fileSize: att.fileSize,
      createdAt: att.createdAt,
    });
    setIsPreviewOpen(true);
  };

  // Estado para adicionar link de nuvem
  const [isAddingCloudLink, setIsAddingCloudLink] = useState(false);
  const [cloudUrl, setCloudUrl] = useState("");
  const [cloudTitle, setCloudTitle] = useState("");
  const [cloudProvider, setCloudProvider] = useState<"GOOGLE_DRIVE" | "ONEDRIVE" | "DROPBOX" | "LINK">("GOOGLE_DRIVE");

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Processa os arquivos selecionados
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Se temos um leadId, faz upload direto para a API
    if (leadId) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append("files", file));
        formData.append("userName", "Equipe Icthus");

        const res = await fetch(`/api/v1/crm/leads/${leadId}/attachments`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erro ao realizar upload dos arquivos.");
        }

        if (Array.isArray(data.attachments)) {
          data.attachments.forEach((att: AttachmentItem) => {
            if (onAttachmentAdded) onAttachmentAdded(att);
          });
        } else if (data.attachment && onAttachmentAdded) {
          onAttachmentAdded(data.attachment);
        }

        toast.success(
          `${newFiles.length} ${newFiles.length === 1 ? "arquivo anexado" : "arquivos anexados"} com sucesso!`
        );
      } catch (err: any) {
        console.error("Erro no upload:", err);
        toast.error(err.message || "Falha ao enviar arquivo(s).");
      } finally {
        setIsUploading(false);
      }
    } else {
      // Se estamos no modal de criação, acumula na lista de arquivos locais
      if (onLocalFilesChange) {
        onLocalFilesChange([...localFiles, ...newFiles]);
        toast.success(
          `${newFiles.length} ${newFiles.length === 1 ? "arquivo selecionado" : "arquivos selecionados"} para upload.`
        );
      }
    }
  };

  // Remover arquivo local pendente no modal de criação
  const handleRemoveLocalFile = (index: number) => {
    if (onLocalFilesChange) {
      onLocalFilesChange(localFiles.filter((_, i) => i !== index));
    }
  };

  // Adicionar link de nuvem
  const handleAddCloudLink = async () => {
    if (!cloudUrl.trim()) {
      toast.error("Informe a URL do link em nuvem.");
      return;
    }

    const title = cloudTitle.trim() || cloudUrl.trim();

    if (leadId) {
      try {
        const res = await fetch(`/api/v1/crm/leads/${leadId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: title,
            fileUrl: cloudUrl.trim(),
            fileType: cloudProvider,
            userName: "Equipe Icthus",
          }),
        });
        const data = await res.json();
        if (data.success && data.attachment && onAttachmentAdded) {
          onAttachmentAdded(data.attachment);
          toast.success("Link em nuvem adicionado com sucesso!");
        }
      } catch (err) {
        toast.error("Erro ao adicionar link em nuvem.");
      }
    } else {
      if (onCloudLinksChange) {
        onCloudLinksChange([
          ...cloudLinks,
          { fileName: title, fileUrl: cloudUrl.trim(), fileType: cloudProvider },
        ]);
        toast.success("Link em nuvem incluído na lista.");
      }
    }

    setCloudUrl("");
    setCloudTitle("");
    setIsAddingCloudLink(false);
  };

  const handleRemoveCloudLink = (index: number) => {
    if (onCloudLinksChange) {
      onCloudLinksChange(cloudLinks.filter((_, i) => i !== index));
    }
  };

  const totalAttachmentsCount =
    (existingAttachments?.length || 0) +
    (localFiles?.length || 0) +
    (cloudLinks?.length || 0);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
      {/* Cabeçalho do Bloco */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05] gap-2">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[#FF650F]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Anexos
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF650F]">
            {totalAttachmentsCount}
          </span>
        </div>

        {/* Abas: Arquivos Locais vs Links em Nuvem */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("LOCAL")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "LOCAL"
                ? "bg-white dark:bg-[#1e2025] text-[#FF650F] shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            Anexo Local (Arrastar Arquivos)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CLOUD")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "CLOUD"
                ? "bg-white dark:bg-[#1e2025] text-[#FF650F] shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            Vincular Nuvem
          </button>
        </div>
      </div>

      {/* ABA 1: UPLOAD LOCAL COM DRAG-AND-DROP GENEROSO */}
      {activeTab === "LOCAL" && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
              isDragging
                ? "border-[#FF650F] bg-[#FF650F]/5 scale-[1.01]"
                : "border-black/10 dark:border-white/10 hover:border-[#FF650F]/50 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF650F]/10 text-[#FF650F] flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                {isDragging
                  ? "Solte os arquivos aqui agora..."
                  : "Arraste e solte quantos arquivos quiser aqui"}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                ou clique para escolher do seu computador. Aceita qualquer formato (PDF, Imagens, DWG, DXF, DOCX, CDR, ZIP) sem restrições severas.
              </p>
            </div>
            {isUploading && (
              <span className="text-xs font-bold text-[#FF650F] animate-pulse">
                Enviando arquivos... aguarde.
              </span>
            )}
          </div>

          {/* Lista de Arquivos Locais Pendentes (no modal de criação) */}
          {localFiles && localFiles.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Arquivos Prontos para Envio ({localFiles.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {localFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalFile(idx)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: LINKS EM NUVEM (GOOGLE DRIVE, ONEDRIVE, DROPBOX) */}
      {activeTab === "CLOUD" && (
        <div className="space-y-3">
          {!isAddingCloudLink ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCloudLink(true)}
              className="rounded-xl text-xs font-bold w-full h-10 border-dashed border-orange-500/30 text-[#FF650F] hover:bg-orange-500/10 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Link de Nuvem (Google Drive, OneDrive, Dropbox, Web)</span>
            </Button>
          ) : (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 space-y-2.5">
              <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-black/20 rounded-lg">
                {(["GOOGLE_DRIVE", "ONEDRIVE", "DROPBOX", "LINK"] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setCloudProvider(prov)}
                    className={`py-1 text-[10px] font-bold rounded ${
                      cloudProvider === prov
                        ? "bg-[#FF650F] text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    {prov === "GOOGLE_DRIVE"
                      ? "Drive"
                      : prov === "ONEDRIVE"
                      ? "OneDrive"
                      : prov === "DROPBOX"
                      ? "Dropbox"
                      : "Web"}
                  </button>
                ))}
              </div>

              <input
                type="url"
                placeholder="Cole o link de compartilhamento..."
                value={cloudUrl}
                onChange={(e) => setCloudUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18191E] border text-xs"
              />
              <input
                type="text"
                placeholder="Título amigável (ex: Pasta de Fotos da Fachada)..."
                value={cloudTitle}
                onChange={(e) => setCloudTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18191E] border text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddingCloudLink(false)}
                  className="rounded-lg text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={handleAddCloudLink}
                  className="rounded-lg text-xs bg-[#FF650F] text-white"
                >
                  Vincular
                </Button>
              </div>
            </div>
          )}

          {/* Links de Nuvem no Modal de Criação */}
          {cloudLinks && cloudLinks.length > 0 && (
            <div className="space-y-1.5">
              {cloudLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-[#FF650F]">
                      {link.fileType}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {link.fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCloudLink(idx)}
                    className="text-zinc-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LISTA DE ANEXOS JÁ PERSISTIDOS NO BANCO (QUANDO EM EDIÇÃO / DETALHES) */}
      {existingAttachments && existingAttachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Anexos Salvos ({existingAttachments.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingAttachments.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3 shadow-xs hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {att.fileType === "IMAGE" ? (
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : att.fileType === "PDF" ? (
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  ) : att.fileType === "GOOGLE_DRIVE" ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <Cloud className="w-5 h-5" />
                    </div>
                  ) : att.fileType === "ONEDRIVE" ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                  ) : att.fileType === "DROPBOX" ? (
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <Cloud className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(att)}
                      title="Visualizar documento em pop-up"
                      className="text-xs font-bold text-zinc-900 dark:text-white hover:text-[#FF650F] truncate block text-left w-full cursor-pointer transition-colors"
                    >
                      {att.fileName}
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                      {att.fileSize && <span>{formatBytes(att.fileSize)}</span>}
                      {att.createdAt && <span>• {formatDate(att.createdAt)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(att)}
                    title="Visualizar em Pop-up"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-[#FF650F] hover:bg-orange-500/10 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {att.fileType === "IMAGE" && onToggleCover && (
                    <button
                      type="button"
                      onClick={() => onToggleCover(att)}
                      title={att.isCover ? "Remover como capa" : "Tornar capa do cartão"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        att.isCover
                          ? "bg-[#FF650F] text-white"
                          : "text-zinc-400 hover:text-[#FF650F] hover:bg-orange-500/10"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                  <a
                    href={att.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {onAttachmentDeleted && (
                    <button
                      type="button"
                      onClick={() => onAttachmentDeleted(att.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Pop-up de Visualização Universal de Documentos */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
      />
    </div>
  );
}
