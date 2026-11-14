/**
 * Serviço de gerenciamento e inicialização das categorias do Blog & Mini-Cérebro.
 */

import prisma from "@/lib/prisma";
import { getOrCreateBlogAgentConfig } from "@/lib/blog-ai/orchestrator";

export const DEFAULT_BLOG_CATEGORIES = [
  { name: "Fachadas Comerciais", color: "#FF650F" },
  { name: "Letreiros & Iluminação", color: "#F59E0B" },
  { name: "Engenharia de Materiais", color: "#3B82F6" },
  { name: "Usinagem CNC & Corte", color: "#8B5CF6" },
  { name: "Normas Técnicas & ROI", color: "#10B981" },
] as const;

export const BLOG_CATEGORY_PRESET_COLORS = [
  "#FF650F",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#6366F1",
  "#64748B",
] as const;

export interface BlogCategoryWithCount {
  id: string;
  name: string;
  color: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  topicsCount: number;
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
let initCategoriesPromise: Promise<void> | null = null;

/**
 * Normaliza espaços extras no nome de uma categoria.
 */
export function normalizeBlogCategoryName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Valida se a cor informada está no formato hexadecimal (#RRGGBB).
 */
export function normalizeBlogCategoryColor(raw?: string | null): string {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (HEX_COLOR_REGEX.test(trimmed)) {
      return trimmed.toUpperCase();
    }
  }
  return "#FF650F";
}

/**
 * Inicializa uma única vez as categorias padrão e categorias legadas existentes nas pautas.
 */
export async function ensureDefaultBlogCategories(): Promise<void> {
  if (initCategoriesPromise) {
    return initCategoriesPromise;
  }

  initCategoriesPromise = (async () => {
    const config = await getOrCreateBlogAgentConfig();
    if (config.categoriesInitialized) {
      return;
    }

    const existingCount = await prisma.blogCategory.count();
    if (existingCount === 0) {
      const seenKeys = new Set<string>();
      const itemsToCreate: Array<{ name: string; color: string; order: number }> = [];

      for (const preset of DEFAULT_BLOG_CATEGORIES) {
        const key = preset.name.toLowerCase();
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        itemsToCreate.push({
          name: preset.name,
          color: preset.color,
          order: itemsToCreate.length,
        });
      }

      // Preserva categorias já cadastradas anteriormente em pautas do banco
      const legacyTopics = await prisma.blogTopic.findMany({
        where: { category: { not: null } },
        distinct: ["category"],
        select: { category: true },
      });

      for (const row of legacyTopics) {
        const clean = row.category ? normalizeBlogCategoryName(row.category) : "";
        if (!clean) continue;
        const key = clean.toLowerCase();
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        itemsToCreate.push({
          name: clean,
          color: BLOG_CATEGORY_PRESET_COLORS[itemsToCreate.length % BLOG_CATEGORY_PRESET_COLORS.length],
          order: itemsToCreate.length,
        });
      }

      if (itemsToCreate.length > 0) {
        await prisma.blogCategory.createMany({
          data: itemsToCreate,
          skipDuplicates: true,
        });
      }
    }

    await prisma.blogAgentConfig.update({
      where: { id: config.id },
      data: { categoriesInitialized: true },
    });
  })().finally(() => {
    initCategoriesPromise = null;
  });

  return initCategoriesPromise;
}

/**
 * Lista todas as categorias do blog ordenadas com a contagem de pautas vinculadas.
 */
export async function listBlogCategoriesWithCounts(): Promise<BlogCategoryWithCount[]> {
  await ensureDefaultBlogCategories();

  const [categories, groupedTopics] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.blogTopic.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
  ]);

  const countsByLowerName = new Map<string, number>();
  for (const group of groupedTopics) {
    if (!group.category) continue;
    const key = normalizeBlogCategoryName(group.category).toLowerCase();
    countsByLowerName.set(key, (countsByLowerName.get(key) ?? 0) + group._count._all);
  }

  return categories.map((category) => ({
    ...category,
    topicsCount: countsByLowerName.get(normalizeBlogCategoryName(category.name).toLowerCase()) ?? 0,
  }));
}
