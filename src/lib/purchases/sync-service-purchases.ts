import prisma from "@/lib/prisma";
import { MovementType, PurchaseItemStatus } from "@prisma/client";

export interface ServiceMaterialInput {
  id?: string;
  stockItemId?: string | null;
  name: string;
  unit?: string;
  quantity: number | string;
  unitCost?: number | string;
  subtotal?: number | string;
}

/**
 * Sincroniza os materiais e insumos definidos no card de serviço (Lead):
 * 1. O que já existe em estoque dá baixa automática imediata (StockMovement OUTGOING_PRODUCTION_OS).
 * 2. O que não tem em estoque (ou saldo insuficiente) é registrado como item a comprar (ServicePurchaseItem PENDING)
 *    para aparecer na página de Compras agrupado por serviço.
 * 3. Preserva integridade de itens já comprados (PURCHASED).
 */
export async function syncServicePurchases(
  leadId: string,
  materialsInput: any[],
  currentUserId?: string
) {
  try {
    if (!leadId) return { success: false, error: "Lead ID é obrigatório" };

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        purchaseItems: true,
      },
    });

    if (!lead) {
      return { success: false, error: "Serviço/Lead não encontrado" };
    }

    // Busca um usuário responsável para vincular movimentações de estoque
    let effectiveUserId = currentUserId;
    if (!effectiveUserId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });
      effectiveUserId = adminUser?.id || lead.assignedToId || undefined;
    }

    if (!effectiveUserId) {
      const anyUser = await prisma.user.findFirst({ select: { id: true } });
      effectiveUserId = anyUser?.id;
    }

    const materials: ServiceMaterialInput[] = Array.isArray(materialsInput)
      ? materialsInput
      : [];

    // Conjunto de IDs de itens já comprados (não devem ser modificados)
    const existingPurchased = lead.purchaseItems.filter(
      (pi) => pi.status === PurchaseItemStatus.PURCHASED
    );
    const existingPending = lead.purchaseItems.filter(
      (pi) => pi.status === PurchaseItemStatus.PENDING
    );

    // Mapeamos os itens processados nesta rodada
    const processedPendingIds: string[] = [];

    for (const mat of materials) {
      const rawQty = Number(mat.quantity) || 0;
      if (rawQty <= 0) continue;

      const rawUnitCost = Number(mat.unitCost) || 0;
      const matName = mat.name?.trim() || "Item sem nome";
      const matUnit = mat.unit?.trim() || "un";
      const stockItemId = mat.stockItemId?.trim() || null;

      let deficitQty = rawQty;
      let stockItemRecord = null;

      if (stockItemId) {
        stockItemRecord = await prisma.stockItem.findUnique({
          where: { id: stockItemId },
        });
      }

      if (stockItemRecord) {
        const currentStock = Number(stockItemRecord.currentQuantity) || 0;

        if (currentStock >= rawQty) {
          // Estoque cobre 100% da necessidade
          const newStock = Math.max(0, currentStock - rawQty);
          await prisma.stockItem.update({
            where: { id: stockItemRecord.id },
            data: { currentQuantity: newStock },
          });

          // Registra movimentação de saída para a produção da OS
          if (effectiveUserId) {
            await prisma.stockMovement.create({
              data: {
                stockItemId: stockItemRecord.id,
                userId: effectiveUserId,
                type: MovementType.OUTGOING_PRODUCTION_OS,
                quantity: rawQty,
                unitCost: Number(stockItemRecord.averageUnitCost) || rawUnitCost,
                totalCost: rawQty * (Number(stockItemRecord.averageUnitCost) || rawUnitCost),
                notes: `Baixa automática para o serviço: ${lead.title} [${lead.budgetCode || lead.id}]`,
              },
            }).catch((err) => console.warn("[StockMovement] Erro ao registrar baixa:", err));
          }

          deficitQty = 0;
        } else if (currentStock > 0) {
          // Estoque cobre parcialmente: consome todo o estoque e o saldo vai para Compras
          const deductedQty = currentStock;
          deficitQty = rawQty - deductedQty;

          await prisma.stockItem.update({
            where: { id: stockItemRecord.id },
            data: { currentQuantity: 0 },
          });

          if (effectiveUserId) {
            await prisma.stockMovement.create({
              data: {
                stockItemId: stockItemRecord.id,
                userId: effectiveUserId,
                type: MovementType.OUTGOING_PRODUCTION_OS,
                quantity: deductedQty,
                unitCost: Number(stockItemRecord.averageUnitCost) || rawUnitCost,
                totalCost: deductedQty * (Number(stockItemRecord.averageUnitCost) || rawUnitCost),
                notes: `Baixa parcial do saldo em estoque para o serviço: ${lead.title} [${lead.budgetCode || lead.id}]`,
              },
            }).catch((err) => console.warn("[StockMovement] Erro ao registrar baixa parcial:", err));
          }
        } else {
          // Estoque zerado: 100% precisa ser comprado
          deficitQty = rawQty;
        }
      }

      // Se houver déficit para este material, registrar na lista de Compras PENDENTE
      if (deficitQty > 0) {
        // Verifica se já existe um item pendente com o mesmo nome ou stockItemId para este lead
        const matchingPending = existingPending.find(
          (pi) =>
            !processedPendingIds.includes(pi.id) &&
            ((stockItemId && pi.stockItemId === stockItemId) ||
              pi.name.toLowerCase() === matName.toLowerCase())
        );

        const estUnitCost = rawUnitCost || (stockItemRecord ? Number(stockItemRecord.averageUnitCost) : 0);
        const estTotalCost = deficitQty * estUnitCost;

        if (matchingPending) {
          // Atualiza o item existente
          const updated = await prisma.servicePurchaseItem.update({
            where: { id: matchingPending.id },
            data: {
              name: matName,
              unit: matUnit,
              quantity: deficitQty,
              estimatedUnitCost: estUnitCost,
              estimatedTotalCost: estTotalCost,
              stockItemId: stockItemId || null,
            },
          });
          processedPendingIds.push(updated.id);
        } else {
          // Cria novo item pendente de compra
          const created = await prisma.servicePurchaseItem.create({
            data: {
              leadId: lead.id,
              stockItemId: stockItemId || null,
              name: matName,
              unit: matUnit,
              quantity: deficitQty,
              estimatedUnitCost: estUnitCost,
              estimatedTotalCost: estTotalCost,
              status: PurchaseItemStatus.PENDING,
            },
          });
          processedPendingIds.push(created.id);
        }
      }
    }

    // Cancela ou remove itens pendentes que não constam mais nos materiais necessários
    const orphanedPending = existingPending.filter(
      (pi) => !processedPendingIds.includes(pi.id)
    );

    if (orphanedPending.length > 0) {
      await prisma.servicePurchaseItem.deleteMany({
        where: {
          id: { in: orphanedPending.map((p) => p.id) },
          status: PurchaseItemStatus.PENDING,
        },
      });
    }

    return {
      success: true,
      purchasedRetained: existingPurchased.length,
      pendingCount: processedPendingIds.length,
    };
  } catch (error: any) {
    console.error("[Purchases Sync] Erro ao sincronizar materiais e compras:", error);
    return {
      success: false,
      error: error?.message || "Erro desconhecido na sincronização de compras",
    };
  }
}
