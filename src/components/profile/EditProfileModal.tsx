"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Camera,
  Trash2,
  Check,
  User,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UserProfileData {
  id: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
  avatarUrl?: string | null;
  phone?: string | null;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserProfileData | null;
  onProfileUpdated: (updated: UserProfileData) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatarUrl || null);
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAvatarUrl(initialData.avatarUrl || null);
      setPhone(initialData.phone || "");
      setUrlInput(initialData.avatarUrl || "");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Trata upload de imagem local via FileReader com redimensionamento e recorte quadrado no Canvas (gera ~20KB a 35KB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Selecione um arquivo de imagem válido (JPG, PNG ou WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("A foto selecionada deve ter no máximo 10MB.");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 320;
          const width = img.width;
          const height = img.height;

          // Recorte 1:1 centralizado
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          canvas.width = MAX_DIM;
          canvas.height = MAX_DIM;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_DIM, MAX_DIM);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
            setAvatarUrl(compressedDataUrl);
            setUrlInput("");
          } else {
            setAvatarUrl(event.target?.result as string);
          }
        } catch (err) {
          console.error("Falha ao redimensionar imagem:", err);
          setAvatarUrl(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setErrorMsg("Não foi possível carregar o arquivo de imagem.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setAvatarUrl(urlInput.trim());
    setIsUrlMode(false);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome é obrigatório.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatarUrl: avatarUrl || null,
          phone: phone.trim() || null,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Erro HTTP ${res.status}`);
      }

      if (data?.success && data?.user) {
        setSuccessMsg("Perfil atualizado com sucesso!");
        onProfileUpdated(data.user);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(data?.error || "Erro ao salvar alterações.");
      }
    } catch (err: any) {
      console.error("Falha ao salvar perfil:", err);
      setErrorMsg(err.message?.includes("HTTP") ? `Erro no servidor: ${err.message}` : "Erro de conexão ao salvar alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (n[0] || "U").toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                {initialData?.role === "ADMIN" ? "Perfil do Administrador" : "Perfil do Cliente"}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                Privacidade LGPD
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Editar Meu Perfil
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seção da Foto de Perfil */}
          <div className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-sm flex items-center justify-center bg-orange-gradient text-white font-extrabold text-2xl">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(name || "U")}</span>
                )}
              </div>

              {/* Botão de câmera sobreposto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-glessios-orange transition-colors shadow-md border border-white/20"
                title="Carregar nova foto"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Ações da Foto */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5 h-8 px-3 rounded-full border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                <Upload className="w-3.5 h-3.5 text-glessios-orange" />
                Carregar Foto
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsUrlMode(!isUrlMode)}
                className="text-xs gap-1.5 h-8 px-3 rounded-full border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                URL
              </Button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Remover foto de perfil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Campo Opcional para Colar URL da Imagem */}
            {isUrlMode && (
              <div className="w-full flex items-center gap-2 pt-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#141519] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-glessios-orange"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleApplyUrl}
                  className="text-xs h-8 px-3 rounded-xl shrink-0"
                >
                  Aplicar
                </Button>
              </div>
            )}
          </div>

          {/* Campo Nome de Exibição */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-glessios-orange" />
              Nome Completo / Exibição *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Eduardo ou Concept Batel"
              className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange focus:ring-1 focus:ring-glessios-orange transition-all"
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Este é o nome que aparecerá no topo do painel e nas operações.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-black/10 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="text-xs font-bold px-5 py-2 rounded-full bg-orange-gradient hover:opacity-95 text-white shadow-sm"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
