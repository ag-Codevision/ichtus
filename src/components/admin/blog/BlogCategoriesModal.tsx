"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Layers,
  Loader2,
  AlertCircle,
  FolderPlus,
} from "lucide-react";

export interface BlogCategoryItem {
  id: string;
  name: string;
  color: string | null;
  order: number;
  topicsCount: number;
}

export interface BlogCategoryChangeEvent {
  action: "create" | "update" | "delete";
  category?: BlogCategoryItem;
  previousName?: string;
  deletedName?: string;
}

interface BlogCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BlogCategoryItem[];
  onCategoriesChanged: (event?: BlogCategoryChangeEvent) => Promise<void> | void;
}

const PRESET_COLORS = [
  "#FF650F",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#6366F1",
  "#64748B",
];

/**
 * Modal completo para CRUD (Criar, Listar, Editar e Excluir) de categorias do Mini-Cérebro.
 */
export function BlogCategoriesModal({
  isOpen,
  onClose,
  categories,
  onCategoriesChanged,
}: BlogCategoriesModalProps) {
  // Criação
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#FF650F");
  const [isCreating, setIsCreating] = useState(false);

  // Edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#FF650F");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  // Exclusão com confirmação inline
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Erro inline dentro do modal
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setEditingId(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2) {
      setErrorMsg("Informe pelo menos 2 caracteres para a categoria.");
      return;
    }

    setErrorMsg(null);
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, color: newColor }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Não foi possível criar a categoria.");
      }

      setNewName("");
      await onCategoriesChanged({
        action: "create",
        category: json.data,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao criar categoria.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (cat: BlogCategoryItem) => {
    setErrorMsg(null);
    setConfirmDeleteId(null);
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingColor(cat.color || "#FF650F");
  };

  const handleSaveEdit = async (cat: BlogCategoryItem) => {
    const cleanName = editingName.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2) {
      setErrorMsg("O nome da categoria deve ter pelo menos 2 caracteres.");
      return;
    }

    setErrorMsg(null);
    setSavingEditId(cat.id);
    try {
      const res = await fetch(`/api/v1/blog/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          color: editingColor,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Não foi possível atualizar a categoria.");
      }

      setEditingId(null);
      await onCategoriesChanged({
        action: "update",
        category: json.data,
        previousName: json.previousName || cat.name,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao atualizar categoria.");
    } finally {
      setSavingEditId(null);
    }
  };

  const handleConfirmDelete = async (cat: BlogCategoryItem) => {
    setErrorMsg(null);
    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/v1/blog/categories/${cat.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Não foi possível excluir a categoria.");
      }

      setConfirmDeleteId(null);
      await onCategoriesChanged({
        action: "delete",
        deletedName: json.deletedName || cat.name,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao excluir categoria.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#18191D] border border-white/15 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF650F]/15 border border-[#FF650F]/25 flex items-center justify-center text-[#FF650F] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white truncate">
                Categorias do Mini-Cérebro
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                Crie, edite, personalize cores e organize as categorias das pautas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Erro inline */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Formulário: Nova Categoria */}
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <FolderPlus className="w-3.5 h-3.5 text-[#FF650F]" />
              <span>Nova Categoria</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={80}
                placeholder="Ex: Fachadas em LED, ACM Estrutural..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FF650F] focus:outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={isCreating || !newName.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 shrink-0"
              >
                {isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Adicionar</span>
              </button>
            </div>

            {/* Seletor de Cor */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] text-zinc-400 font-medium">Cor da tag:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      newColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#18191D] scale-110"
                        : "opacity-75 hover:opacity-100 hover:scale-105"
                    }`}
                    title={`Selecionar cor ${color}`}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Listagem de Categorias (Read / Update / Delete) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Categorias Cadastradas ({categories.length})
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-black/20 border border-dashed border-white/10 space-y-1.5">
                <Layers className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">
                  Nenhuma categoria cadastrada
                </p>
                <p className="text-[11px] text-zinc-500">
                  Adicione uma nova categoria acima para classificar as pautas do Mini-Cérebro.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;
                  const isConfirmingDelete = confirmDeleteId === cat.id;
                  const isBusy = savingEditId === cat.id || deletingId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isConfirmingDelete
                          ? "bg-red-950/20 border-red-500/30"
                          : "bg-white/[0.02] border-white/10 hover:border-white/15"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={80}
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveEdit(cat);
                                } else if (e.key === "Escape") {
                                  setEditingId(null);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-[#FF650F]/60 text-white text-xs font-semibold focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSaveEdit(cat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold disabled:opacity-50"
                              title="Salvar alterações"
                            >
                              {savingEditId === cat.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Salvar</span>
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                              title="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-zinc-400">Cor:</span>
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setEditingColor(color)}
                                  style={{ backgroundColor: color }}
                                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                                    editingColor === color
                                      ? "ring-2 ring-white ring-offset-1 ring-offset-[#18191D] scale-110"
                                      : "opacity-70 hover:opacity-100"
                                  }`}
                                />
                              ))}
                            </div>
                            {cat.topicsCount > 0 && (
                              <span className="text-[10px] text-zinc-400">
                                Atualizará {cat.topicsCount} pauta(s) vinculada(s)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : isConfirmingDelete ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="text-xs text-red-200 space-y-0.5">
                            <p className="font-bold">
                              Excluir &quot;{cat.name}&quot;?
                            </p>
                            <p className="text-[11px] text-red-300/80">
                              {cat.topicsCount > 0
                                ? `${cat.topicsCount} pauta(s) vinculada(s) ficarão sem categoria (Geral).`
                                : "Esta categoria será removida permanentemente."}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleConfirmDelete(cat)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
                            >
                              {deletingId === cat.id && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color || "#FF650F" }}
                            />
                            <span className="text-xs font-bold text-white truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5 shrink-0">
                              {cat.topicsCount}{" "}
                              {cat.topicsCount === 1 ? "pauta" : "pautas"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                              title="Editar categoria"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setErrorMsg(null);
                                setEditingId(null);
                                setConfirmDeleteId(cat.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/20 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-bold transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
