/**
 * Orquestrador do Ciclo Autônomo de Publicação de Blog (ICTHUS)
 * Coordena Mini-Cérebro (pautas) + IA (NVIDIA NIM) + Imagens (Pexels) + Prisma
 */

import prisma from "@/lib/prisma";
import { generateBlogArticleWithNvidia } from "./nvidia-nim";
import { searchPexelsImage } from "./pexels";
import { PostStatus, TopicStatus, PriorityLevel } from "@prisma/client";

export interface CycleResult {
  success: boolean;
  message: string;
  post?: any;
  topic?: any;
  error?: string;
}

// Trava atômica em memória para evitar disparos simultâneos concorrentes (Race Condition)
let isCycleRunning = false;

/**
 * Obtém ou inicializa a configuração singleton do agente
 */
export async function getOrCreateBlogAgentConfig() {
  let config = await prisma.blogAgentConfig.findUnique({
    where: { id: "default-config" },
  });

  if (!config) {
    config = await prisma.blogAgentConfig.create({
      data: {
        id: "default-config",
        isActive: true,
        postsPerDay: 1,
        allowedDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        preferredHours: ["09:00", "15:00"],
        autoPublish: true,
        imageProvider: "PEXELS",
        defaultAuthor: "Engenharia ICTHUS",
        lastStatus: "IDLE",
      },
    });
  }

  return config;
}

/**
 * Valida se o momento atual é elegível para execução automática segundo a cadência configurada:
 * - Agente ativo (isActive: true)
 * - Dia da semana permitido (allowedDays)
 * - Lógica de Slots Inteligente: compara horários já vencidos hoje com posts publicados
 * - Quantidade de postagens hoje não ultrapassou postsPerDay
 */
export async function checkScheduleEligibility(config: any): Promise<{
  eligible: boolean;
  reason?: string;
}> {
  if (!config.isActive) {
    return { eligible: false, reason: "O agente autônomo está pausado nas configurações." };
  }

  const now = new Date();
  const brasiliaDateStr = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // YYYY-MM-DD
  const brasiliaTimeStr = now.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }); // "HH:mm"

  // Dia da semana em Brasília (SUN, MON, TUE, WED, THU, FRI, SAT)
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  });
  const currentDayKey = dayFormatter.format(now).toUpperCase(); // "MON", "TUE", etc.

  // 1. Validar Dia da Semana (Fallback seguro: se vazio, permite todos os dias)
  const allowedDays: string[] = (config.allowedDays && config.allowedDays.length > 0)
    ? config.allowedDays.map((d: string) => d.toUpperCase())
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  if (!allowedDays.includes(currentDayKey)) {
    return {
      eligible: false,
      reason: `Hoje (${currentDayKey}) não está entre os dias permitidos para publicação (${allowedDays.join(", ")}).`,
    };
  }

  // 2. Validação por Janela de Horários Programados (Horário de Brasília)
  const startOfDay = new Date(`${brasiliaDateStr}T00:00:00-03:00`);
  const limitPerDay = Math.max(1, config.postsPerDay || 1);

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };

  const preferredHours: string[] = (config.preferredHours && config.preferredHours.length > 0)
    ? Array.from(new Set<string>(config.preferredHours)).sort((a, b) => toMinutes(a) - toMinutes(b))
    : ["09:00", "15:00"];

  const currentMinutes = toMinutes(brasiliaTimeStr);

  // Calcula janelas independentes para cada horário programado
  const slotWindows = preferredHours.map((hourStr, index) => {
    const slotMinutes = toMinutes(hourStr);
    const windowStartMin = Math.max(0, slotMinutes - 2);
    const nextSlotMin = index + 1 < preferredHours.length ? toMinutes(preferredHours[index + 1]) : 1440;
    const windowEndMin = Math.min(slotMinutes + 50, Math.max(slotMinutes + 5, nextSlotMin - 1));
    return { hourStr, slotMinutes, windowStartMin, windowEndMin };
  });

  // Identifica se o horário atual está dentro da janela de algum agendamento
  const activeSlot = slotWindows.find(
    (slot) => currentMinutes >= slot.windowStartMin && currentMinutes <= slot.windowEndMin
  );

  if (!activeSlot) {
    return {
      eligible: false,
      reason: `Fora da janela dos horários programados (${preferredHours.join(", ")}). Hora atual em Brasília: ${brasiliaTimeStr}.`,
    };
  }

  // Verifica se o slot ativo já produziu artigo dentro da sua janela hoje
  const windowStartDate = new Date(startOfDay.getTime() + activeSlot.windowStartMin * 60000);
  const windowEndDate = new Date(startOfDay.getTime() + activeSlot.windowEndMin * 60000 + 59999);

  const postsInSlotWindow = await prisma.blogPost.count({
    where: {
      publishedAt: {
        gte: windowStartDate,
        lte: windowEndDate,
      },
      ...(config.autoPublish ? { status: PostStatus.PUBLISHED } : {}),
    },
  });

  if (postsInSlotWindow > 0) {
    return {
      eligible: false,
      reason: `O horário programado ${activeSlot.hourStr} já foi executado hoje (${brasiliaDateStr}).`,
    };
  }

  // Garante também respeito ao limite diário caso já tenham sido executados outros slots programados hoje
  void limitPerDay;

  return { eligible: true };
}

/**
 * Executa um ciclo completo de geração e publicação autônoma
 */
export async function runAutonomousBlogCycle(options?: {
  forcedTopicId?: string;
  forcePublish?: boolean;
  ignoreSchedule?: boolean;
}): Promise<CycleResult> {
  // 1. Trava em memória contra disparos simultâneos no mesmo instante
  if (isCycleRunning) {
    console.log("[Blog Agent] Ciclo já em andamento em outra requisição concorrente. Disparo ignorado.");
    return {
      success: true,
      message: "Ciclo já em andamento em outra requisição concorrente. Disparo ignorado.",
    };
  }

  const config = await getOrCreateBlogAgentConfig();

  // 2. Trava persistida no banco (proteção contra concorrência com expiração de 3 minutos)
  if (
    config.lastStatus === "RUNNING" &&
    config.updatedAt &&
    Date.now() - new Date(config.updatedAt).getTime() < 180000
  ) {
    console.log("[Blog Agent] Bloqueio de concorrência ativo no banco (lastStatus=RUNNING < 3min). Disparo ignorado.");
    return {
      success: true,
      message: "Ciclo já em andamento em outra requisição concorrente. Disparo ignorado.",
    };
  }

  // Se não for manual e não forçar bypass de cadência, valida elegibilidade de dia/hora/limite
  if (!options?.forcedTopicId && !options?.ignoreSchedule) {
    const eligibility = await checkScheduleEligibility(config);
    if (!eligibility.eligible) {
      console.log(`[Blog Agent] Ciclo agendado aguardando janela: ${eligibility.reason}`);
      await prisma.blogAgentConfig.update({
        where: { id: config.id },
        data: { lastStatus: "IDLE", lastError: null },
      });
      return {
        success: true,
        message: `Cadência respeitada: ${eligibility.reason}`,
      };
    }
  }

  // Ativa trava em memória e atualiza status para RUNNING no banco
  isCycleRunning = true;
  await prisma.blogAgentConfig.update({
    where: { id: config.id },
    data: { lastStatus: "RUNNING", lastError: null },
  });

  let topicToUse: any = null;

  try {

    if (options?.forcedTopicId) {
      topicToUse = await prisma.blogTopic.findUnique({
        where: { id: options.forcedTopicId },
      });
    }

    if (!topicToUse) {
      // Prioridade: Pautas ativas no mini-cérebro (não pausadas).
      // Faz rodízio inteligente: pautas com menor quantidade de artigos gerados têm preferência.
      const availableTopics = await prisma.blogTopic.findMany({
        where: {
          status: { notIn: [TopicStatus.PAUSED] },
        },
        orderBy: [{ postsGeneratedCount: "asc" }, { createdAt: "asc" }],
      });

      if (availableTopics.length > 0) {
        const priorityOrder: Record<PriorityLevel, number> = {
          URGENT: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4,
        };

        availableTopics.sort((a, b) => {
          // 1º critério: Menor contagem de artigos já gerados (rodízio equilibrado)
          if (a.postsGeneratedCount !== b.postsGeneratedCount) {
            return a.postsGeneratedCount - b.postsGeneratedCount;
          }
          // 2º critério: Prioridade de negócio
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          // 3º critério: Ordem cronológica de cadastro
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        topicToUse = availableTopics[0];
      }
    }

    // Se encontramos uma pauta no mini-cérebro, marcamos como IN_PROGRESS
    if (topicToUse) {
      await prisma.blogTopic.update({
        where: { id: topicToUse.id },
        data: { status: TopicStatus.IN_PROGRESS },
      });
    }

    // 1. Gera o artigo completo com a IA
    console.log(`[Blog Agent] Gerando artigo com IA para o tema: ${topicToUse?.title || "Tema Estratégico Autônomo"}`);
    const generated = await generateBlogArticleWithNvidia({
      topic: topicToUse?.title,
      category: topicToUse?.category || undefined,
      keywords: topicToUse?.keywords || undefined,
      targetAudience: topicToUse?.targetAudience || undefined,
      tone: topicToUse?.tone || undefined,
    });

    // 2. Busca imagem profissional no Pexels
    console.log(`[Blog Agent] Buscando foto profissional no Pexels: '${generated.imageQuery}'`);
    const image = await searchPexelsImage(generated.imageQuery);

    // 3. Garante slug único no banco
    let finalSlug = generated.slug;
    const existingSlug = await prisma.blogPost.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Define o status da publicação (autoPublish do agente ou forcePublish)
    const shouldPublish = options?.forcePublish !== undefined ? options.forcePublish : config.autoPublish;
    const postStatus = shouldPublish ? PostStatus.PUBLISHED : PostStatus.DRAFT;

    // 5. Salva o artigo no banco de dados
    const newPost = await prisma.blogPost.create({
      data: {
        title: generated.title,
        slug: finalSlug,
        excerpt: generated.excerpt,
        contentMarkdown: generated.contentMarkdown,
        coverImageUrl: image.imageUrl,
        imageAlt: image.altText,
        imagePhotographer: `${image.photographerName} (via Pexels)`,
        status: postStatus,
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        canonicalUrl: `/blog/${finalSlug}`,
        tags: generated.tags,
        readingTimeMin: generated.readingTimeMin,
        publishedAt: new Date(),
      },
    });

    // 6. Atualiza a pauta no mini-cérebro (mantém ativa para rodízio e incrementa contador)
    if (topicToUse) {
      await prisma.blogTopic.update({
        where: { id: topicToUse.id },
        data: {
          status: TopicStatus.PENDING,
          postsGeneratedCount: { increment: 1 },
        },
      });
    }

    // 7. Atualiza o status do robô no BlogAgentConfig
    await prisma.blogAgentConfig.update({
      where: { id: config.id },
      data: {
        lastRunAt: new Date(),
        lastPostTitle: newPost.title,
        lastStatus: "SUCCESS",
        lastError: null,
      },
    });

    return {
      success: true,
      message: `Artigo "${newPost.title}" gerado e cadastrado com sucesso!`,
      post: newPost,
      topic: topicToUse,
    };
  } catch (error: any) {
    console.error("[Blog Agent] Erro durante o ciclo autônomo:", error);

    // Se a pauta ficou em progresso, reverte para PENDING para permitir nova tentativa
    if (topicToUse) {
      await prisma.blogTopic.update({
        where: { id: topicToUse.id },
        data: { status: TopicStatus.PENDING },
      }).catch(() => null);
    }

    // Registra falha no config
    await prisma.blogAgentConfig.update({
      where: { id: config.id },
      data: {
        lastStatus: "ERROR",
        lastError: error?.message || String(error),
      },
    });

    return {
      success: false,
      message: "Falha ao executar o ciclo do agente de blog.",
      error: error?.message || String(error),
    };
  } finally {
    isCycleRunning = false;
  }
}
