/**
 * Serviço de gerenciamento do Cérebro de Diretrizes do Blog (ICTHUS).
 *
 * Responsabilidades:
 * - CRUD de diretrizes editoriais e técnicas (Globais e por Tema/Assunto).
 * - Resiliência dupla: persiste no PostgreSQL via Prisma e realiza fallback
 *   automático para o arquivo local `src/config/blog-guidelines.json` caso o
 *   banco esteja inacessível (ex.: desenvolvimento local sem túnel SSH).
 * - Seed automático das diretrizes padrão na primeira inicialização.
 * - Motor de correspondência (`matchGuidelinesForArticle`) para injetar apenas
 *   as regras pertinentes no prompt da IA antes da geração do artigo.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PriorityLevel } from "@prisma/client";
import prisma from "@/lib/prisma";

export type BlogGuidelineScope = "GLOBAL" | "TOPIC";
export type BlogGuidelinePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface BlogGuidelineItem {
  id: string;
  title: string;
  scope: BlogGuidelineScope;
  category: string | null;
  triggerKeywords: string[];
  instructions: string;
  priority: BlogGuidelinePriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogGuidelineInput {
  title: string;
  scope?: BlogGuidelineScope | string;
  category?: string | null;
  triggerKeywords?: string[] | string;
  instructions: string;
  priority?: BlogGuidelinePriority | string;
  isActive?: boolean;
}

export interface UpdateBlogGuidelineInput {
  title?: string;
  scope?: BlogGuidelineScope | string;
  category?: string | null;
  triggerKeywords?: string[] | string;
  instructions?: string;
  priority?: BlogGuidelinePriority | string;
  isActive?: boolean;
}

export interface MatchGuidelinesParams {
  topic?: string | null;
  category?: string | null;
  keywords?: string[] | string | null;
}

export class GuidelineNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Diretriz não encontrada.") {
    super(message);
    this.name = "GuidelineNotFoundError";
  }
}

export class GuidelineValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "GuidelineValidationError";
  }
}

const GUIDELINES_FILE_PATH = path.join(process.cwd(), "src", "config", "blog-guidelines.json");

const PRIORITY_ORDER: Record<BlogGuidelinePriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const VALID_SCOPES = new Set<BlogGuidelineScope>(["GLOBAL", "TOPIC"]);
const VALID_PRIORITIES = new Set<BlogGuidelinePriority>(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/**
 * Diretrizes iniciais semeadas automaticamente quando o repositório estiver vazio.
 */
export const DEFAULT_BLOG_GUIDELINES: Array<
  Omit<BlogGuidelineItem, "id" | "createdAt" | "updatedAt">
> = [
  {
    title: "Diretriz Global — Ensino Técnico e Imparcialidade",
    scope: "GLOBAL",
    category: null,
    triggerKeywords: [],
    instructions:
      "Mantenha linha editorial 100% educativa, técnica e instrutiva. Nunca mencione a ICTHUS/Glessios, não faça autopromoção, não use primeira pessoa corporativa e não insira chamadas comerciais. Finalize sempre com síntese técnica e checklist prático.",
    priority: "URGENT",
    isActive: true,
  },
  {
    title: "Diretriz por Tema — Tipografia, Fontes e Legibilidade em Letreiros",
    scope: "TOPIC",
    category: "Letreiros & Iluminação",
    triggerKeywords: [
      "tipografia",
      "fonte",
      "fontes",
      "legibilidade",
      "kerning",
      "tracking",
      "letra caixa",
      "leitura",
    ],
    instructions:
      "Ao abordar tipografia ou letras caixa em comunicação visual, explique obrigatoriamente: 1) Relação entre altura da fonte (x-height) e distância de leitura em metros; 2) Importância do kerning/tracking ampliado para evitar fusão visual (halation) em letreiros iluminados por LED; 3) Espessura mínima de haste (stroke width) para acomodar módulos de LED internos ou usinagem CNC; 4) Contraste cromático entre letra e fachada.",
    priority: "HIGH",
    isActive: true,
  },
  {
    title: "Diretriz por Tema — Fachadas Externas e Revestimento em ACM",
    scope: "TOPIC",
    category: "Fachadas Comerciais",
    triggerKeywords: [
      "fachada",
      "fachadas externas",
      "acm",
      "revestimento externo",
      "intempéries",
      "carga de vento",
      "estrutura metálica",
    ],
    instructions:
      "Ao escrever sobre fachadas externas ou ACM, aborde obrigatoriamente: 1) Especificação técnica do material (ACM 3mm vs 4mm, pintura PVDF Kynar 500 vs Poliéster para incidência solar UV); 2) Dimensionamento de subestrutura metálica (aço galvanizado ou alumínio) e resistência à carga de vento (NBR 6123); 3) Juntas de dilatação térmica, dobra em bandeja (cassete) e vedação neutra contra infiltrações.",
    priority: "HIGH",
    isActive: true,
  },
];

const DB_OFFLINE_COOLDOWN_MS = 10_000;
let dbOfflineUntil = 0;
let seedDbPromise: Promise<void> | null = null;
let seedFilePromise: Promise<void> | null = null;

/**
 * Normaliza texto para comparação insensível a maiúsculas, acentos e espaços extras.
 */
function normalizeText(value?: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normaliza o escopo da diretriz para GLOBAL ou TOPIC.
 */
function normalizeScope(raw?: unknown, fallback: BlogGuidelineScope = "TOPIC"): BlogGuidelineScope {
  if (typeof raw === "string") {
    const upper = raw.trim().toUpperCase() as BlogGuidelineScope;
    if (VALID_SCOPES.has(upper)) {
      return upper;
    }
  }
  return fallback;
}

/**
 * Normaliza a prioridade da diretriz para o enum PriorityLevel.
 */
function normalizePriority(
  raw?: unknown,
  fallback: BlogGuidelinePriority = "MEDIUM"
): BlogGuidelinePriority {
  if (typeof raw === "string") {
    const upper = raw.trim().toUpperCase() as BlogGuidelinePriority;
    if (VALID_PRIORITIES.has(upper)) {
      return upper;
    }
  }
  return fallback;
}

/**
 * Normaliza a lista de palavras-gatilho (aceita array de strings ou texto separado por vírgulas).
 */
function normalizeKeywords(raw?: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw.map((item) => String(item))
    : typeof raw === "string"
    ? raw.split(",")
    : [];

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const item of list) {
    const trimmed = item.trim().replace(/\s+/g, " ");
    if (!trimmed) continue;
    const key = normalizeText(trimmed);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(trimmed);
  }

  return cleaned;
}

/**
 * Normaliza a categoria vinculada (null quando vazia ou quando o escopo for GLOBAL).
 */
function normalizeCategory(raw: unknown, scope: BlogGuidelineScope): string | null {
  if (scope === "GLOBAL") return null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Converte registro do Prisma ou do JSON para o contrato padrão `BlogGuidelineItem`.
 */
function serializeGuideline(record: {
  id: string;
  title: string;
  scope: string;
  category: string | null;
  triggerKeywords: string[];
  instructions: string;
  priority: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}): BlogGuidelineItem {
  const scope = normalizeScope(record.scope, "TOPIC");
  const priority = normalizePriority(record.priority, "MEDIUM");

  return {
    id: record.id,
    title: record.title,
    scope,
    category: scope === "GLOBAL" ? null : record.category ?? null,
    triggerKeywords: scope === "GLOBAL" ? [] : Array.isArray(record.triggerKeywords) ? record.triggerKeywords : [],
    instructions: record.instructions,
    priority,
    isActive: Boolean(record.isActive),
    createdAt:
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : new Date(record.createdAt).toISOString(),
    updatedAt:
      record.updatedAt instanceof Date
        ? record.updatedAt.toISOString()
        : new Date(record.updatedAt).toISOString(),
  };
}

/**
 * Ordena diretrizes por prioridade (URGENT > HIGH > MEDIUM > LOW) e depois por data de criação.
 */
function sortGuidelines(items: BlogGuidelineItem[]): BlogGuidelineItem[] {
  return [...items].sort((a, b) => {
    const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Detecta falhas de conexão/infraestrutura com o PostgreSQL para acionar fallback em JSON.
 */
function isDatabaseConnectionError(error: any): boolean {
  if (!error) return false;
  const name = String(error.name || "");
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();

  if (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientRustPanicError"
  ) {
    return true;
  }

  // Códigos de erro Prisma relacionados a conexão, autenticação ou tabela ainda não migrada
  if (
    [
      "P1000",
      "P1001",
      "P1002",
      "P1003",
      "P1008",
      "P1011",
      "P1017",
      "P2021",
      "P2022",
    ].includes(code)
  ) {
    return true;
  }

  return (
    message.includes("can't reach database server") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("etimedout") ||
    message.includes("econnreset") ||
    message.includes("connection terminated") ||
    message.includes("server closed the connection") ||
    message.includes("does not exist in the current database") ||
    message.includes("getaddrinfo")
  );
}

/**
 * Gera um identificador único para registros no fallback JSON.
 */
function generateGuidelineId(): string {
  return `gl_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Cria o conteúdo inicial para o arquivo fallback JSON a partir das diretrizes padrão.
 */
function buildDefaultFallbackItems(): BlogGuidelineItem[] {
  const baseTime = Date.now();
  return DEFAULT_BLOG_GUIDELINES.map((item, index) => {
    const iso = new Date(baseTime + index).toISOString();
    return {
      id: `guideline-default-${index + 1}`,
      title: item.title,
      scope: item.scope,
      category: item.category,
      triggerKeywords: [...item.triggerKeywords],
      instructions: item.instructions,
      priority: item.priority,
      isActive: item.isActive,
      createdAt: iso,
      updatedAt: iso,
    };
  });
}

/**
 * Grava a lista de diretrizes no arquivo JSON de fallback garantindo criação do diretório.
 */
function writeFallbackFile(items: BlogGuidelineItem[]): void {
  const dir = path.dirname(GUIDELINES_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(GUIDELINES_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
}

/**
 * Garante que o arquivo JSON fallback exista e contenha ao menos as diretrizes padrão quando vazio.
 */
async function ensureFallbackSeeded(): Promise<BlogGuidelineItem[]> {
  if (seedFilePromise) {
    await seedFilePromise;
  }

  let currentItems: BlogGuidelineItem[] = [];
  let fileReadable = false;

  if (fs.existsSync(GUIDELINES_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(GUIDELINES_FILE_PATH, "utf-8").trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentItems = parsed.map(serializeGuideline);
          fileReadable = true;
        }
      }
    } catch (err) {
      console.warn("[Blog Guidelines] Arquivo fallback corrompido ou ilegível, recriando defaults:", err);
    }
  }

  if (fileReadable && currentItems.length > 0) {
    return sortGuidelines(currentItems);
  }

  seedFilePromise = (async () => {
    const defaults = buildDefaultFallbackItems();
    writeFallbackFile(defaults);
    currentItems = defaults;
  })().finally(() => {
    seedFilePromise = null;
  });

  await seedFilePromise;
  return sortGuidelines(currentItems);
}

/**
 * Garante o seed inicial no PostgreSQL caso a tabela `blog_guidelines` esteja vazia.
 */
async function ensureDatabaseSeeded(): Promise<void> {
  if (seedDbPromise) {
    return seedDbPromise;
  }

  seedDbPromise = (async () => {
    const count = await prisma.blogGuideline.count();
    if (count > 0) return;

    await prisma.blogGuideline.createMany({
      data: DEFAULT_BLOG_GUIDELINES.map((item) => ({
        title: item.title,
        scope: item.scope,
        category: item.category,
        triggerKeywords: item.triggerKeywords,
        instructions: item.instructions,
        priority: item.priority as PriorityLevel,
        isActive: item.isActive,
      })),
    });
  })().finally(() => {
    seedDbPromise = null;
  });

  return seedDbPromise;
}

/**
 * Executa uma operação no PostgreSQL e realiza fallback transparente para JSON
 * quando houver falha de conectividade, aplicando cooldown curto para evitar
 * múltiplos timeouts consecutivos quando o banco estiver indisponível localmente.
 */
async function withDatabaseFallback<T>(
  dbAction: () => Promise<T>,
  fallbackAction: () => Promise<T>,
  contextLabel: string
): Promise<T> {
  if (Date.now() < dbOfflineUntil) {
    return fallbackAction();
  }

  try {
    const result = await dbAction();
    dbOfflineUntil = 0;
    return result;
  } catch (error: any) {
    if (error instanceof GuidelineNotFoundError || error instanceof GuidelineValidationError) {
      throw error;
    }
    if (error?.code === "P2025") {
      throw new GuidelineNotFoundError();
    }
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    dbOfflineUntil = Date.now() + DB_OFFLINE_COOLDOWN_MS;
    console.warn(
      `[Blog Guidelines] Banco inacessível (${contextLabel}); utilizando fallback local em src/config/blog-guidelines.json.`
    );
    return fallbackAction();
  }
}

/**
 * Lista todas as diretrizes cadastradas, realizando seed automático na primeira inicialização.
 * Utiliza PostgreSQL como fonte primária e faz fallback automático para JSON local se offline.
 */
export async function listBlogGuidelines(): Promise<BlogGuidelineItem[]> {
  return withDatabaseFallback(
    async () => {
      await ensureDatabaseSeeded();
      const rows = await prisma.blogGuideline.findMany();
      return sortGuidelines(rows.map(serializeGuideline));
    },
    () => ensureFallbackSeeded(),
    "listagem"
  );
}

/**
 * Cria uma nova diretriz editorial/técnica no PostgreSQL (ou no fallback JSON se offline).
 */
export async function createBlogGuideline(
  input: CreateBlogGuidelineInput
): Promise<BlogGuidelineItem> {
  const title = typeof input.title === "string" ? input.title.trim().replace(/\s+/g, " ") : "";
  if (title.length < 2) {
    throw new GuidelineValidationError("Informe um título de diretriz com pelo menos 2 caracteres.");
  }

  const instructions =
    typeof input.instructions === "string" ? input.instructions.trim() : "";
  if (instructions.length < 5) {
    throw new GuidelineValidationError(
      "Informe as instruções da diretriz com pelo menos 5 caracteres."
    );
  }

  const scope = normalizeScope(input.scope, "TOPIC");
  const priority = normalizePriority(input.priority, "MEDIUM");
  const category = normalizeCategory(input.category, scope);
  const triggerKeywords =
    scope === "GLOBAL" ? [] : normalizeKeywords(input.triggerKeywords);
  const isActive = typeof input.isActive === "boolean" ? input.isActive : true;

  return withDatabaseFallback(
    async () => {
      await ensureDatabaseSeeded();
      const created = await prisma.blogGuideline.create({
        data: {
          title,
          scope,
          category,
          triggerKeywords,
          instructions,
          priority: priority as PriorityLevel,
          isActive,
        },
      });
      return serializeGuideline(created);
    },
    async () => {
      const items = await ensureFallbackSeeded();
      const now = new Date().toISOString();
      const created: BlogGuidelineItem = {
        id: generateGuidelineId(),
        title,
        scope,
        category,
        triggerKeywords,
        instructions,
        priority,
        isActive,
        createdAt: now,
        updatedAt: now,
      };
      items.push(created);
      writeFallbackFile(sortGuidelines(items));
      return created;
    },
    "criação"
  );
}

/**
 * Atualiza parcialmente uma diretriz existente por ID.
 */
export async function updateBlogGuideline(
  id: string,
  input: UpdateBlogGuidelineInput
): Promise<BlogGuidelineItem> {
  const cleanId = typeof id === "string" ? id.trim() : "";
  if (!cleanId) {
    throw new GuidelineValidationError("ID da diretriz inválido.");
  }

  // Validação antecipada dos campos enviados
  if (input.title !== undefined) {
    const cleanTitle = typeof input.title === "string" ? input.title.trim().replace(/\s+/g, " ") : "";
    if (cleanTitle.length < 2) {
      throw new GuidelineValidationError("O título da diretriz deve ter pelo menos 2 caracteres.");
    }
  }

  if (input.instructions !== undefined) {
    const cleanInstructions = typeof input.instructions === "string" ? input.instructions.trim() : "";
    if (cleanInstructions.length < 5) {
      throw new GuidelineValidationError("As instruções devem ter pelo menos 5 caracteres.");
    }
  }

  return withDatabaseFallback(
    async () => {
      const existing = await prisma.blogGuideline.findUnique({
        where: { id: cleanId },
      });

      if (!existing) {
        throw new GuidelineNotFoundError();
      }

      const nextScope =
        input.scope !== undefined
          ? normalizeScope(input.scope, normalizeScope(existing.scope))
          : normalizeScope(existing.scope);

      const updateData: {
        title?: string;
        scope?: string;
        category?: string | null;
        triggerKeywords?: string[];
        instructions?: string;
        priority?: PriorityLevel;
        isActive?: boolean;
      } = {};

      if (input.title !== undefined) {
        updateData.title = input.title.trim().replace(/\s+/g, " ");
      }
      if (input.scope !== undefined) {
        updateData.scope = nextScope;
      }
      if (nextScope === "GLOBAL") {
        updateData.category = null;
        updateData.triggerKeywords = [];
      } else {
        if (input.category !== undefined) {
          updateData.category = normalizeCategory(input.category, nextScope);
        }
        if (input.triggerKeywords !== undefined) {
          updateData.triggerKeywords = normalizeKeywords(input.triggerKeywords);
        }
      }
      if (input.instructions !== undefined) {
        updateData.instructions = input.instructions.trim();
      }
      if (input.priority !== undefined) {
        updateData.priority = normalizePriority(
          input.priority,
          normalizePriority(existing.priority)
        ) as PriorityLevel;
      }
      if (typeof input.isActive === "boolean") {
        updateData.isActive = input.isActive;
      }

      const updated = await prisma.blogGuideline.update({
        where: { id: cleanId },
        data: updateData,
      });

      return serializeGuideline(updated);
    },
    async () => {
      const items = await ensureFallbackSeeded();
      const index = items.findIndex((item) => item.id === cleanId);
      if (index === -1) {
        throw new GuidelineNotFoundError();
      }

      const current = items[index];
      const nextScope =
        input.scope !== undefined ? normalizeScope(input.scope, current.scope) : current.scope;

      const updatedItem: BlogGuidelineItem = {
        ...current,
        title:
          input.title !== undefined
            ? input.title.trim().replace(/\s+/g, " ")
            : current.title,
        scope: nextScope,
        category:
          nextScope === "GLOBAL"
            ? null
            : input.category !== undefined
            ? normalizeCategory(input.category, nextScope)
            : current.category,
        triggerKeywords:
          nextScope === "GLOBAL"
            ? []
            : input.triggerKeywords !== undefined
            ? normalizeKeywords(input.triggerKeywords)
            : current.triggerKeywords,
        instructions:
          input.instructions !== undefined ? input.instructions.trim() : current.instructions,
        priority:
          input.priority !== undefined
            ? normalizePriority(input.priority, current.priority)
            : current.priority,
        isActive: typeof input.isActive === "boolean" ? input.isActive : current.isActive,
        updatedAt: new Date().toISOString(),
      };

      items[index] = updatedItem;
      writeFallbackFile(sortGuidelines(items));
      return updatedItem;
    },
    "atualização"
  );
}

/**
 * Remove uma diretriz existente por ID.
 */
export async function deleteBlogGuideline(id: string): Promise<{ deleted: true; id: string }> {
  const cleanId = typeof id === "string" ? id.trim() : "";
  if (!cleanId) {
    throw new GuidelineValidationError("ID da diretriz inválido.");
  }

  return withDatabaseFallback(
    async () => {
      const existing = await prisma.blogGuideline.findUnique({
        where: { id: cleanId },
      });

      if (!existing) {
        throw new GuidelineNotFoundError();
      }

      await prisma.blogGuideline.delete({
        where: { id: cleanId },
      });

      return { deleted: true, id: cleanId };
    },
    async () => {
      const items = await ensureFallbackSeeded();
      const filtered = items.filter((item) => item.id !== cleanId);
      if (filtered.length === items.length) {
        throw new GuidelineNotFoundError();
      }

      writeFallbackFile(sortGuidelines(filtered));
      return { deleted: true, id: cleanId };
    },
    "exclusão"
  );
}

/**
 * Seleciona e ordena as diretrizes ativas aplicáveis a uma pauta/artigo.
 *
 * Regras de acionamento:
 * - Considera apenas diretrizes com `isActive === true`.
 * - Diretrizes `GLOBAL` são sempre selecionadas.
 * - Diretrizes `TOPIC` são selecionadas quando há correspondência de categoria
 *   (igual ou contida, sem acentos/case) OU quando alguma `triggerKeyword`
 *   aparece no texto combinado de `topic`, `category` e `keywords`.
 * - Resultado ordenado por prioridade (`URGENT` > `HIGH` > `MEDIUM` > `LOW`) e `createdAt`.
 */
export async function matchGuidelinesForArticle(
  params?: MatchGuidelinesParams
): Promise<BlogGuidelineItem[]> {
  let guidelines: BlogGuidelineItem[] = [];

  try {
    guidelines = await listBlogGuidelines();
  } catch (err) {
    console.warn(
      "[Blog Guidelines] Falha inesperada ao carregar diretrizes, usando padrões em memória:",
      err
    );
    guidelines = buildDefaultFallbackItems();
  }

  const keywordsList = Array.isArray(params?.keywords)
    ? params.keywords
    : typeof params?.keywords === "string"
    ? params.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const normalizedTopic = normalizeText(params?.topic);
  const normalizedCategory = normalizeText(params?.category);
  const normalizedKeywords = keywordsList.map(normalizeText).filter(Boolean);
  const combinedText = [normalizedTopic, normalizedCategory, ...normalizedKeywords]
    .filter(Boolean)
    .join(" ");

  const matched = guidelines.filter((guideline) => {
    if (!guideline.isActive) return false;
    if (guideline.scope === "GLOBAL") return true;

    const guidelineCategory = normalizeText(guideline.category);
    const matchesCategory = Boolean(
      guidelineCategory &&
        normalizedCategory &&
        (normalizedCategory === guidelineCategory ||
          normalizedCategory.includes(guidelineCategory) ||
          guidelineCategory.includes(normalizedCategory))
    );

    if (matchesCategory) return true;

    if (!combinedText) return false;

    return guideline.triggerKeywords.some((keyword) => {
      const normalizedKw = normalizeText(keyword);
      return Boolean(normalizedKw && combinedText.includes(normalizedKw));
    });
  });

  return sortGuidelines(matched);
}
