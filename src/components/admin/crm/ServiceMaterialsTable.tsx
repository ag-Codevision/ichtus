"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Trash2,
  Package,
  Layers,
  DollarSign,
  AlertCircle,
  Search,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  CreateStockItemModal,
  CreatedStockItem,
} from "@/components/admin/stock/CreateStockItemModal";

export interface ServiceMaterialItem {
  id: string;
  stockItemId?: string;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

interface ServiceMaterialsTableProps {
  materials: ServiceMaterialItem[];
  onChange: (updatedMaterials: ServiceMaterialItem[]) => void;
  disabled?: boolean;
}

const UNIT_LABELS: Record<string, string> = {
  M2: "m²",
  LINEAR_METER: "m",
  UNIT: "un",
  SHEET: "chapa",
  LITER: "L",
  ROLL: "rolo",
};

export function ServiceMaterialsTable({
  materials = [],
  onChange,
  disabled = false,
}: ServiceMaterialsTableProps) {
  const [stockList, setStockList] = useState<CreatedStockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Busca lista de materiais disponíveis no estoque
  const fetchStockMaterials = async () => {
    setIsLoadingStock(true);
    try {
      const res = await fetch("/api/v1/stock/materials");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStockList(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar insumos do estoque:", err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  useEffect(() => {
    fetchStockMaterials();
  }, []);

  // Adiciona uma nova linha de insumo
  const handleAddLine = () => {
    const newItem: ServiceMaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stockItemId: "",
      name: "",
      unit: "UNIT",
      quantity: 1,
      unitCost: 0,
      subtotal: 0,
    };
    onChange([...materials, newItem]);
  };

  // Remove uma linha
  const handleRemoveLine = (id: string) => {
    onChange(materials.filter((m) => m.id !== id));
  };

  // Atualiza um campo de uma linha específica
  const handleUpdateItem = (
    id: string,
    field: keyof ServiceMaterialItem,
    value: any
  ) => {
    const updated = materials.map((item) => {
      if (item.id !== id) return item;

      const next = { ...item, [field]: value };

      // Se o usuário selecionou um insumo do estoque
      if (field === "stockItemId") {
        const found = stockList.find((s) => s.id === value);
        if (found) {
          next.name = found.name;
          next.unit = found.unit;
          next.unitCost = Number(found.averageUnitCost) || 0;
          next.subtotal = (Number(next.quantity) || 0) * (Number(next.unitCost) || 0);
        }
      }

      // Recalcula subtotal
      if (field === "quantity" || field === "unitCost") {
        const q = field === "quantity" ? Number(value) || 0 : Number(next.quantity) || 0;
        const c = field === "unitCost" ? Number(value) || 0 : Number(next.unitCost) || 0;
        next.subtotal = q * c;
      }

      return next;
    });

    onChange(updated);
  };

  // Callback de novo insumo cadastrado no modal do estoque
  const handleItemCreated = (newItem: CreatedStockItem) => {
    setStockList((prev) => [newItem, ...prev]);

    // Já adiciona automaticamente como uma nova linha pré-selecionada!
    const line: ServiceMaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stockItemId: newItem.id,
      name: newItem.name,
      unit: newItem.unit,
      quantity: 1,
      unitCost: Number(newItem.averageUnitCost) || 0,
      subtotal: (Number(newItem.averageUnitCost) || 0) * 1,
    };
    onChange([...materials, line]);
  };

  // Calcula o valor total de todos os insumos
  const totalCostOfMaterials = materials.reduce(
    (acc, item) => acc + (Number(item.subtotal) || 0),
    0
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.05] dark:border-white/[0.06] shadow-sm space-y-4">
      {/* Cabeçalho do Bloco */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05] gap-2">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-[#FF650F]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Materiais & Insumos do Serviço
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF650F]">
            {materials.length} {materials.length === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para cadastrar novo insumo no estoque */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[11px] font-bold text-[#FF650F] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Insumo no Estoque</span>
          </button>

          {/* Botão para adicionar linha */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={handleAddLine}
            className="rounded-xl text-xs font-bold h-7 px-2.5 flex items-center gap-1 border-orange-500/20 hover:bg-orange-500/10 text-[#FF650F]"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar Linha</span>
          </Button>
        </div>
      </div>

      {/* Tabela ou Lista em Linha */}
      {materials.length > 0 ? (
        <div className="space-y-2.5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.05] dark:border-white/[0.06] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="pb-2 min-w-[200px]">Insumo / Material</th>
                <th className="pb-2 w-24 text-center">Qtd.</th>
                <th className="pb-2 w-20 text-center">Unidade</th>
                <th className="pb-2 w-28 text-right">Custo Unit. (R$)</th>
                <th className="pb-2 w-28 text-right">Subtotal</th>
                <th className="pb-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {materials.map((item) => (
                <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]">
                  {/* Seletor do Material */}
                  <td className="py-2 pr-2">
                    <select
                      value={item.stockItemId || ""}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(item.id, "stockItemId", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] cursor-pointer"
                    >
                      <option value="">Selecione um insumo cadastrado...</option>
                      {stockList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.category}) — {formatCurrency(Number(st.averageUnitCost) || 0)}/{UNIT_LABELS[st.unit] || st.unit}
                        </option>
                      ))}
                    </select>
                    {/* Se não estiver no estoque ou quiser nome avulso */}
                    {!item.stockItemId && (
                      <input
                        type="text"
                        placeholder="Ou digite o nome do material avulso..."
                        value={item.name}
                        disabled={disabled}
                        onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                        className="mt-1 w-full px-2 py-1 rounded-lg bg-transparent border border-dashed border-black/10 dark:border-white/10 text-[11px] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#FF650F]"
                      />
                    )}
                  </td>

                  {/* Quantidade */}
                  <td className="py-2 px-1 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity || ""}
                      disabled={disabled}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-center text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </td>

                  {/* Unidade */}
                  <td className="py-2 px-1 text-center">
                    <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 font-mono text-[11px] font-bold">
                      {UNIT_LABELS[item.unit] || item.unit || "un"}
                    </span>
                  </td>

                  {/* Custo Unitário */}
                  <td className="py-2 px-1 text-right">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost || ""}
                      disabled={disabled}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#121316] border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-right text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F]"
                    />
                  </td>

                  {/* Subtotal Calculado */}
                  <td className="py-2 pl-1 pr-2 text-right">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(item.subtotal || 0)}
                    </span>
                  </td>

                  {/* Ação de Excluir */}
                  <td className="py-2 text-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveLine(item.id)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-center space-y-2">
          <p className="text-xs text-zinc-400">
            Nenhum insumo ou material vinculado a este serviço ainda.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={handleAddLine}
              className="rounded-xl text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar Insumo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl text-xs font-bold text-[#FF650F] border-orange-500/20"
            >
              <Package className="w-3.5 h-3.5 mr-1" />
              Cadastrar no Estoque
            </Button>
          </div>
        </div>
      )}

      {/* Totalizador de Insumos & Nota de Controle Interno */}
      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/60 dark:bg-white/[0.02] p-3 rounded-xl">
        <div className="flex items-start gap-2 max-w-lg">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
            <strong>Controle Interno da Oficina:</strong> Este valor total de insumos é
            utilizado estritamente para apuração de custos e margem.{" "}
            <span className="text-[#FF650F] font-semibold">
              Ele NÃO é exibido no Documento de Orçamento do cliente
            </span>{" "}
            (o orçamento utiliza exclusivamente o Valor Estimado cadastrado).
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Custo Total dos Insumos
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-zinc-900 dark:text-white">
            {formatCurrency(totalCostOfMaterials)}
          </span>
        </div>
      </div>

      {/* Modal Secundário: Cadastrar Insumo no Estoque */}
      {isCreateModalOpen && (
        <CreateStockItemModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onItemCreated={handleItemCreated}
        />
      )}
    </div>
  );
}
