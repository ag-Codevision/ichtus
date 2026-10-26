"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon,
  Cloud,
  HardDrive,
  FileSpreadsheet,
  FileCode,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PreviewDocument {
  title: string;
  url: string;
  fileType?: string;
  fileSize?: number | null;
  createdAt?: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PreviewDocument | null;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Identifica a categoria do arquivo a partir da URL e extensão
function getFileCategory(doc: PreviewDocument): "IMAGE" | "PDF" | "VIDEO" | "EXCEL" | "CSV" | "WORD" | "TEXT" | "DRIVE" | "OTHER" {
  const url = (doc.url || "").toLowerCase();
  const title = (doc.title || "").toLowerCase();
  const fileType = (doc.fileType || "").toUpperCase();

  if (fileType === "IMAGE" || /\.(png|jpe?g|webp|gif|svg|bmp|ico)(\?.*)?$/i.test(url) || /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(title)) {
    return "IMAGE";
  }
  if (fileType === "PDF" || /\.pdf(\?.*)?$/i.test(url) || /\.pdf$/i.test(title)) {
    return "PDF";
  }
  if (fileType === "VIDEO" || /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(url) || /\.(mp4|webm|mov|ogg|m4v)$/i.test(title)) {
    return "VIDEO";
  }
  if (/\.csv(\?.*)?$/i.test(url) || /\.csv$/i.test(title)) {
    return "CSV";
  }
  if (/\.(xlsx|xls)(\?.*)?$/i.test(url) || /\.(xlsx|xls)$/i.test(title)) {
    return "EXCEL";
  }
  if (/\.(docx|doc)(\?.*)?$/i.test(url) || /\.(docx|doc)$/i.test(title)) {
    return "WORD";
  }
  if (/\.(txt|json|md|xml|log|csv)(\?.*)?$/i.test(url) || /\.(txt|json|md|xml|log)$/i.test(title)) {
    return "TEXT";
  }
  if (fileType === "GOOGLE_DRIVE" || url.includes("drive.google.com")) {
    return "DRIVE";
  }
  return "OTHER";
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document: doc,
}: DocumentPreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<string[][] | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (!isOpen || !doc) {
      setTextContent(null);
      setCsvRows(null);
      setIframeError(false);
      return;
    }

    const cat = getFileCategory(doc);

    // Se for CSV ou Texto simples, faz fetch para prévia imediata
    if ((cat === "CSV" || cat === "TEXT") && doc.url.startsWith("/")) {
      setIsLoadingText(true);
      fetch(doc.url)
        .then((res) => res.text())
        .then((text) => {
          if (cat === "CSV") {
            const rows = text
              .split(/\r?\n/)
              .filter((r) => r.trim() !== "")
              .map((r) => r.split(","));
            setCsvRows(rows);
          } else {
            setTextContent(text);
          }
        })
        .catch((err) => {
          console.warn("Falha ao ler conteúdo do arquivo de texto:", err);
          setTextContent("Não foi possível carregar a prévia de texto.");
        })
        .finally(() => setIsLoadingText(false));
    }
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const category = getFileCategory(doc);

  // Normalização de URL para Google Drive Preview
  let embedUrl = doc.url;
  if (category === "DRIVE") {
    embedUrl = doc.url.replace(/\/view(\?.*)?$/, "/preview");
  }

  // Visualizadores externos para planilhas e Word
  const isOfficeDoc = category === "EXCEL" || category === "WORD";
  const isExternalUrl = doc.url.startsWith("http://") || doc.url.startsWith("https://");
  const officeViewerUrl = isExternalUrl
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.url)}`
    : `https://docs.google.com/viewer?url=${encodeURIComponent(
        typeof window !== "undefined" ? `${window.location.origin}${doc.url}` : doc.url
      )}&embedded=true`;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[95vh] bg-white dark:bg-[#18191E] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header do Pop-up */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3 shrink-0 bg-zinc-50/50 dark:bg-[#141519]/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center shrink-0">
              {category === "IMAGE" && <ImageIcon className="w-5 h-5" />}
              {category === "PDF" && <FileText className="w-5 h-5" />}
              {category === "VIDEO" && <VideoIcon className="w-5 h-5" />}
              {category === "EXCEL" && <FileSpreadsheet className="w-5 h-5" />}
              {category === "CSV" && <TableIcon className="w-5 h-5" />}
              {category === "WORD" && <FileText className="w-5 h-5" />}
              {category === "TEXT" && <FileCode className="w-5 h-5" />}
              {category === "DRIVE" && <Cloud className="w-5 h-5" />}
              {category === "OTHER" && <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                <span className="uppercase font-bold text-[#FF650F]">{category}</span>
                {doc.fileSize && <span>• {formatBytes(doc.fileSize)}</span>}
              </div>
            </div>
          </div>

          {/* Ações da Janela */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={doc.url}
              download={doc.title}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </a>

            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              title="Abrir arquivo em nova aba"
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Visualização Principal */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-zinc-100/50 dark:bg-[#101114] flex items-center justify-center min-h-[350px] max-h-[80vh]">
          {/* 1. Imagem */}
          {category === "IMAGE" && (
            <div className="w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.url}
                alt={doc.title}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-xl transition-all"
              />
            </div>
          )}

          {/* 2. PDF */}
          {category === "PDF" && (
            <div className="w-full h-[75vh] rounded-2xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 bg-white">
              <iframe
                src={`${doc.url}#view=FitH`}
                title={doc.title}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* 3. Vídeo */}
          {category === "VIDEO" && (
            <div className="w-full max-h-[75vh] flex items-center justify-center">
              <video
                src={doc.url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-2xl shadow-xl bg-black"
              >
                Seu navegador não suporta a reprodução deste vídeo.
              </video>
            </div>
          )}

          {/* 4. Planilha CSV em Tabela Interativa */}
          {category === "CSV" && (
            <div className="w-full max-h-[75vh] overflow-auto bg-white dark:bg-[#18191E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
              {isLoadingText ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF650F]" />
                  <span className="text-xs">Carregando dados da planilha...</span>
                </div>
              ) : csvRows && csvRows.length > 0 ? (
                <table className="w-full text-left text-xs divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                  <thead className="bg-zinc-50 dark:bg-white/[0.04] font-bold">
                    <tr>
                      {csvRows[0].map((cell, idx) => (
                        <th key={idx} className="p-2.5 truncate max-w-[200px]">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                    {csvRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 font-mono text-[11px] truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhum dado legível na planilha.</p>
              )}
            </div>
          )}

          {/* 5. Documentos Office (Excel .xlsx / Word .docx) */}
          {(category === "EXCEL" || category === "WORD") && (
            <div className="w-full h-[75vh] flex flex-col rounded-2xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#18191E]">
              {!iframeError ? (
                <iframe
                  src={officeViewerUrl}
                  title={doc.title}
                  onError={() => setIframeError(true)}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      Documento Office ({category})
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-md mt-1">
                      Para visualizar este arquivo com máxima fidelidade em modo nativo, faça o download ou abra diretamente.
                    </p>
                  </div>
                  <a
                    href={doc.url}
                    download={doc.title}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF650F] text-white text-xs font-bold shadow-md hover:bg-[#e0580c] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Arquivo Completo
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 6. Arquivo de Texto ou Código */}
          {category === "TEXT" && (
            <div className="w-full max-h-[75vh] overflow-auto bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
              {isLoadingText ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF650F]" />
                  <span className="text-xs">Carregando texto...</span>
                </div>
              ) : (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {textContent || "Arquivo sem conteúdo."}
                </pre>
              )}
            </div>
          )}

          {/* 7. Link de Nuvem (Google Drive, etc.) */}
          {category === "DRIVE" && (
            <div className="w-full h-[75vh] rounded-2xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 bg-white">
              <iframe
                src={embedUrl}
                title={doc.title}
                allow="autoplay"
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* 8. Outros formatos */}
          {category === "OTHER" && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {doc.title}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Este formato de arquivo pode ser baixado ou aberto externamente.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={doc.url}
                  download={doc.title}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF650F] text-white text-xs font-bold shadow-md hover:bg-[#e0580c] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar Arquivo
                </a>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Link
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
