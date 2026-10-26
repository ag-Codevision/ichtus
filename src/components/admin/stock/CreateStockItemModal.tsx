"use client";

import React, { useState } from "react";
import { X, Plus, Package, Layers, DollarSign, AlertCircle, Hash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface CreatedStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: "M2" | "LINEAR_METER" | "UNIT" | "LITER" | "SHEET" | "ROLL";
  currentQuantity: number;
  minQuantity: number;
  averageUnitCost: number;
  supplier?: string | null;
}

interface CreateStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (newItem: CreatedStockItem) => void;
  defaultCategory?: string;
}

const STOCK_UNITS = [
  { value: "M2", label: "Metro Quadrado (m²)" },
  { value: "LINEAR_METER", label: "Metro Linear (m)" },
  { value: "UNIT", label: "Unidade / Peça (un)" },
  { value: "SHEET", label: "Chapa Inteira (chapa)" },
  { value: "LITER", label: "Litro (L)" },
  { value: "ROLL", label: "Rolo Fechado (rolo)" },
] as const;

const POPULAR_CATEGORIES = [
  "Chapas (ACM / Acrílico / MDF)",
  "Lonas & Banners",
  "Adesivos & Vinis",
  "Ferragens & Estruturas",
  "LEDs & Iluminação",
  "Tintas & Vernizes",
  "Perfis de Alumínio",
  "Fixação (Parafusos / Buchas)",
  "Fitas & Colas",
  "Insumos de Campo",
];

export function CreateStockItemModal({
  isOpen,
  onClose,
  onItemCreated,
  defaultCategory = "Chapas (ACM / Acrílico / MDF)",
}: CreateStockItemModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [unit, setUnit] = useState<"M2" | "LINEAR_METER" | "UNIT" | "LITER" | "SHEET" | "ROLL">("UNIT");
  const [averageUnitCost, setAverageUnitCost] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("0");
  const [minQuantity, setMinQuantity] = useState("1");
  const [sku, setSku] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do insumo.");
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      toast.error("Informe a categoria do insumo.");
      return;
    }

    // Gera SKU automático caso o usuário não informe
    const finalSku =
      sku.trim() ||
      `MAT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/stock/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sku: finalSku,
          category: finalCategory,
          unit,
          averageUnitCost: averageUnitCost ? parseFloat(averageUnitCost) : 0,
          currentQuantity: currentQuantity ? parseFloat(currentQuantity) : 0,
          minQuantity: minQuantity ? parseFloat(minQuantity) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao cadastrar insumo no estoque");
      }

      toast.success(`Insumo "${name}" cadastrado com sucesso no estoque!`);
      onItemCreated(data.data);
      onClose();
    } catch (err: any) {
      console.error("Erro ao cadastrar insumo:", err);
      toast.error(err.message || "Falha ao cadastrar insumo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#15171C] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF650F]/10 text-[#FF650F] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Cadastrar Insumo no Estoque
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Adicione um novo material que ficará disponível em todo o sistema
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* Nome do Material */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Nome do Insumo / Material *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Chapa ACM 3mm Preto Brilho 1220x2440mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
            />
          </div>

          {/* Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Categoria do Material *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] font-bold text-[#FF650F] hover:underline"
              >
                {isCustomCategory ? "Selecionar da lista" : "+ Digitar outra categoria"}
              </button>
            </div>
            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Ex: Fitas Especiais, Borrachas, Cabos..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
              >
                {POPULAR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Unidade & Custo Unitário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
              >
                {STOCK_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Custo Médio Unitário (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={averageUnitCost}
                  onChange={(e) => setAverageUnitCost(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                />
              </div>
            </div>
          </div>

          {/* Quantidades e SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Qtd em Estoque
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Código SKU <span className="text-[10px] text-zinc-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Automático"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
              />
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold bg-[#FF650F] hover:bg-[#e0580c] text-white flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Insumo no Estoque</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
