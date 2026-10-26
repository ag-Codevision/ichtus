"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  FolderPlus,
  Tag,
  ChevronDown,
  ChevronRight,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServiceSubcategoryData {
  id: string;
  categoryId: string;
  name: string;
  _count?: { leads: number };
}

export interface ServiceCategoryData {
  id: string;
  name: string;
  color?: string | null;
  subcategories: ServiceSubcategoryData[];
  _count?: { leads: number };
}

interface ServiceCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged?: () => void;
  onCategoriesUpdated?: (updatedList?: any) => void;
}

const PRESET_COLORS = [
  "#FF650F", // Laranja Ícthus
  "#3B82F6", // Azul
  "#10B981", // Verde Esmeralda
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#F59E0B", // Âmbar
  "#6366F1", // Índigo
  "#64748B", // Slate
];

export function ServiceCategoriesModal({
  isOpen,
  onClose,
  onCategoriesChanged,
}: ServiceCategoriesModalProps) {
  const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Form de Nova Categoria
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#FF650F");

  // Edição inline de Categoria
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Subcategorias
  const [expandedCatIds, setExpandedCatIds] = useState<{ [catId: string]: boolean }>({});
  const [newSubcatInputs, setNewSubcatInputs] = useState<{ [catId: string]: string }>({});
  const [isAddingSubcat, setIsAddingSubcat] = useState<{ [catId: string]: boolean }>({});

  // Edição inline de Subcategoria
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);
  const [editingSubcatName, setEditingSubcatName] = useState("");

  // Carregar Categorias
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/crm/categories");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        // Expandir por padrão todas as categorias que tiverem subcategorias
        const initialExpanded: { [catId: string]: boolean } = {};
        data.categories.forEach((cat: ServiceCategoryData) => {
          initialExpanded[cat.id] = true;
        });
        setExpandedCatIds(initialExpanded);
      }
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Criar Nova Categoria
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmittingCategory(true);
    try {
      const res = await fetch("/api/v1/crm/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          color: newCatColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName("");
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      } else {
        alert(data.error || "Erro ao criar categoria.");
      }
    } catch (err) {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Salvar Edição de Categoria
  const handleSaveEditCategory = async (catId: string) => {
    if (!editingCatName.trim()) return;
    try {
      const res = await fetch(`/api/v1/crm/categories/${catId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCatId(null);
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
    }
  };

  // Excluir Categoria
  const handleDeleteCategory = async (cat: ServiceCategoryData) => {
    const leadsCount = cat._count?.leads || 0;
    const confirmMsg =
      leadsCount > 0
        ? `Atenção: Existem ${leadsCount} serviços vinculados à categoria "${cat.name}". Excluir a categoria removerá também todas as suas subcategorias. Deseja continuar?`
        : `Deseja realmente excluir a categoria "${cat.name}" e todas as suas subcategorias?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/v1/crm/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
    }
  };

  // Criar Subcategoria
  const handleCreateSubcategory = async (catId: string) => {
    const subName = newSubcatInputs[catId]?.trim();
    if (!subName) return;

    setIsAddingSubcat((prev) => ({ ...prev, [catId]: true }));
    try {
      const res = await fetch(`/api/v1/crm/categories/${catId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subName }),
      });
      const data = await res.json();
      if (data.success) {
        setNewSubcatInputs((prev) => ({ ...prev, [catId]: "" }));
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      } else {
        alert(data.error || "Erro ao adicionar subcategoria.");
      }
    } catch (err) {
      console.error("Erro ao adicionar subcategoria:", err);
    } finally {
      setIsAddingSubcat((prev) => ({ ...prev, [catId]: false }));
    }
  };

  // Salvar Edição de Subcategoria
  const handleSaveEditSubcategory = async (subId: string) => {
    if (!editingSubcatName.trim()) return;
    try {
      const res = await fetch(`/api/v1/crm/categories/subcategories/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingSubcatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingSubcatId(null);
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error("Erro ao atualizar subcategoria:", err);
    }
  };

  // Excluir Subcategoria
  const handleDeleteSubcategory = async (subId: string, subName: string) => {
    if (!confirm(`Deseja remover a subcategoria "${subName}"?`)) return;
    try {
      const res = await fetch(`/api/v1/crm/categories/subcategories/${subId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error("Erro ao excluir subcategoria:", err);
    }
  };

  // Toggle expansão de categoria
  const toggleExpand = (catId: string) => {
    setExpandedCatIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Categorias & Subcategorias
              </h3>
              <p className="text-xs text-zinc-500">
                Cadastre, edite e organize os ramos e tipos de serviços do Funil Kanban
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Formulário: Nova Categoria */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-[#FF650F]" />
              Nova Categoria Principal
            </span>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Fachadas, Comunicação Visual, Envelopamento..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#18191E] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
                />
                <Button
                  size="sm"
                  type="submit"
                  isLoading={isSubmittingCategory}
                  className="rounded-xl px-4 text-xs font-bold bg-[#FF650F] hover:bg-[#e0580c] text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Categoria
                </Button>
              </div>

              {/* Seletor de Cores da Categoria */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-zinc-500">Cor visual:</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCatColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        newCatColor === col
                          ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Lista de Categorias & Subcategorias */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Categorias Cadastradas ({categories.length})
              </h4>
              {isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Carregando...</span>
                </div>
              )}
            </div>

            {categories.length === 0 && !isLoading ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-dashed border-black/10 dark:border-white/10 space-y-2">
                <Layers className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                <p className="text-xs font-semibold text-zinc-500">
                  Nenhuma categoria cadastrada ainda.
                </p>
                <p className="text-[11px] text-zinc-400">
                  Cadastre sua primeira categoria acima (ex: &quot;Fachadas&quot;) para começar a organizar seus serviços.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => {
                  const isExpanded = expandedCatIds[cat.id] ?? true;
                  const isEditingThisCat = editingCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl bg-white dark:bg-[#141519] border border-black/[0.08] dark:border-white/[0.08] shadow-xs overflow-hidden transition-all"
                    >
                      {/* Linha da Categoria */}
                      <div className="p-3.5 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(cat.id)}
                            className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: cat.color || "#FF650F" }}
                          />

                          {isEditingThisCat ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingCatName}
                                onChange={(e) => setEditingCatName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEditCategory(cat.id)}
                                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border text-xs font-bold text-zinc-900 dark:text-white flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditCategory(cat.id)}
                                className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs"
                                title="Salvar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCatId(null)}
                                className="p-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 hover:text-zinc-900 text-xs"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-black text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                                {cat.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 shrink-0">
                                {cat.subcategories.length} subcategorias
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ações da Categoria */}
                        {!isEditingThisCat && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              title="Editar nome da categoria"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              title="Excluir categoria"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo Expandido: Subcategorias */}
                      {isExpanded && (
                        <div className="p-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04] space-y-3 bg-white dark:bg-[#141519]">
                          {/* Subcategorias existentes em chips */}
                          <div className="flex flex-wrap items-center gap-2">
                            {cat.subcategories.map((sub) => {
                              const isEditingThisSub = editingSubcatId === sub.id;

                              if (isEditingThisSub) {
                                return (
                                  <div
                                    key={sub.id}
                                    className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border"
                                  >
                                    <input
                                      type="text"
                                      value={editingSubcatName}
                                      onChange={(e) => setEditingSubcatName(e.target.value)}
                                      autoFocus
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && handleSaveEditSubcategory(sub.id)
                                      }
                                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditSubcategory(sub.id)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSubcatId(null)}
                                      className="p-1 text-zinc-400 hover:bg-black/5 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={sub.id}
                                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-black/[0.04] dark:border-white/[0.04] text-xs text-zinc-800 dark:text-zinc-200 transition-colors"
                                >
                                  <Tag className="w-3 h-3 text-[#FF650F] opacity-70" />
                                  <span className="font-semibold text-xs">{sub.name}</span>
                                  <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSubcatId(sub.id);
                                        setEditingSubcatName(sub.name);
                                      }}
                                      title="Editar subcategoria"
                                      className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                      title="Excluir subcategoria"
                                      className="p-0.5 rounded text-zinc-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {cat.subcategories.length === 0 && (
                              <span className="text-[11px] text-zinc-400 italic">
                                Nenhuma subcategoria cadastrada nesta categoria.
                              </span>
                            )}
                          </div>

                          {/* Formulário rápido para adicionar subcategoria */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder={`+ Nova subcategoria em "${cat.name}" (ex: ACM, Lona, LED...)`}
                              value={newSubcatInputs[cat.id] || ""}
                              onChange={(e) =>
                                setNewSubcatInputs((prev) => ({
                                  ...prev,
                                  [cat.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCreateSubcategory(cat.id);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={isAddingSubcat[cat.id]}
                              onClick={() => handleCreateSubcategory(cat.id)}
                              className="rounded-xl px-3 text-xs font-bold h-8"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Adicionar
                            </Button>
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
        <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 text-xs font-bold"
          >
            Concluir & Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
