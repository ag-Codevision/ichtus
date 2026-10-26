"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";

export interface ServiceResourceData {
  id: string;
  name: string;
  category?: string | null;
}

interface ResourcesSelectorProps {
  selectedTools: string[];
  onChange: (tools: string[]) => void;
}

export function ResourcesSelector({
  selectedTools,
  onChange,
}: ResourcesSelectorProps) {
  const [resources, setResources] = useState<ServiceResourceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Adicionar novo recurso
  const [isAdding, setIsAdding] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Edição inline de recurso
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/crm/resources");
      const data = await res.json();
      if (data.success && data.resources) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Erro ao carregar recursos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleToggle = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      onChange(selectedTools.filter((t) => t !== toolName));
    } else {
      onChange([...selectedTools, toolName]);
    }
  };

  const handleCreateResource = async () => {
    if (!newResourceName.trim()) return;
    setIsSubmittingNew(true);
    try {
      const res = await fetch("/api/v1/crm/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newResourceName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.resource) {
        setNewResourceName("");
        setIsAdding(false);
        // Adiciona aos selecionados automaticamente
        onChange([...selectedTools, data.resource.name]);
        fetchResources();
      } else {
        alert(data.error || "Erro ao cadastrar recurso.");
      }
    } catch (err) {
      console.error("Erro ao salvar recurso:", err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleSaveEdit = async (id: string, oldName: string) => {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(`/api/v1/crm/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        // Se o recurso estava selecionado com o nome antigo, atualiza para o novo nome
        if (selectedTools.includes(oldName)) {
          onChange(selectedTools.map((t) => (t === oldName ? editingName.trim() : t)));
        }
        setEditingId(null);
        fetchResources();
      }
    } catch (err) {
      console.error("Erro ao editar recurso:", err);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o recurso "${name}" da lista geral?`)) return;
    try {
      const res = await fetch(`/api/v1/crm/resources/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTools.includes(name)) {
          onChange(selectedTools.filter((t) => t !== name));
        }
        fetchResources();
      }
    } catch (err) {
      console.error("Erro ao excluir recurso:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#FF650F]" />
          <span>Recursos & Ferramentas Necessárias ({selectedTools.length} selecionados)</span>
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-[11px] font-bold text-[#FF650F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Recurso</span>
          </button>
        )}
      </div>

      {/* Input para Novo Recurso */}
      {isAdding && (
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2 animate-in fade-in duration-150">
          <input
            type="text"
            placeholder="Nome do recurso (ex: Furadeira, Fita, LED...)"
            value={newResourceName}
            onChange={(e) => setNewResourceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateResource();
              }
            }}
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF650F]"
          />
          <button
            type="button"
            disabled={isSubmittingNew}
            onClick={handleCreateResource}
            className="px-3 py-1.5 rounded-lg bg-[#FF650F] hover:bg-[#e0580c] text-white text-xs font-bold flex items-center gap-1 shrink-0"
          >
            {isSubmittingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Salvar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewResourceName("");
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista de Chips dos Recursos */}
      {isLoading && resources.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Carregando recursos...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
          {resources.map((res) => {
            const isSelected = selectedTools.includes(res.name);
            const isEditing = editingId === res.id;

            if (isEditing) {
              return (
                <div
                  key={res.id}
                  className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-zinc-800 border border-[#FF650F] shadow-sm"
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit(res.id, res.name);
                      }
                    }}
                    autoFocus
                    className="px-2 py-0.5 text-xs rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white w-28 border"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(res.id, res.name)}
                    className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={res.id}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer select-none border ${
                  isSelected
                    ? "bg-[#FF650F] text-white border-[#FF650F] shadow-xs font-bold"
                    : "bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-800 dark:text-zinc-200 border-black/[0.04] dark:border-white/[0.05]"
                }`}
                onClick={() => handleToggle(res.name)}
              >
                <span>{res.name}</span>

                {/* Ações de Edição e Exclusão do Recurso no Hover */}
                <div
                  className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(res.id);
                      setEditingName(res.name);
                    }}
                    title="Editar nome do recurso"
                    className={`p-0.5 rounded transition-colors ${
                      isSelected
                        ? "text-white/80 hover:text-white hover:bg-black/20"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteResource(res.id, res.name)}
                    title="Excluir recurso da lista"
                    className={`p-0.5 rounded transition-colors ${
                      isSelected
                        ? "text-white/80 hover:text-white hover:bg-black/20"
                        : "text-zinc-400 hover:text-red-600"
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
