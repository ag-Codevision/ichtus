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
 * - Horário dentro da janela programada (preferredHours) com tolerância de +/- 30 minutos
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

  // 1. Validar Dia da Semana
  const allowedDays: string[] = (config.allowedDays && config.allowedDays.length > 0)
    ? config.allowedDays.map((d: string) => d.toUpperCase())
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  if (!allowedDays.includes(currentDayKey)) {
    return {
      eligible: false,
      reason: `Hoje (${currentDayKey}) não está entre os dias permitidos para publicação (${allowedDays.join(", ")}).`,
    };
  }

  // 2. Validar Limite de Postagens Diárias
  const startOfDay = new Date(`${brasiliaDateStr}T00:00:00-03:00`);
  const postsCountToday = await prisma.blogPost.count({
    where: {
      publishedAt: {
        gte: startOfDay,
      },
    },
  });

  const limitPerDay = config.postsPerDay || 1;
  if (postsCountToday >= limitPerDay) {
    return {
      eligible: false,
      reason: `Limite diário atingido: ${postsCountToday} de ${limitPerDay} post(s) já foram publicados hoje.`,
    };
  }

  // 3. Validar Horários Programados
  const preferredHours: string[] = (config.preferredHours && config.preferredHours.length > 0)
    ? config.preferredHours
    : ["09:00", "15:00"];

  const [currH, currM] = brasiliaTimeStr.split(":").map(Number);
  const currentMinutes = currH * 60 + currM;

  // Tolerância: de 5 minutos antes até 35 minutos após o horário previsto
  const isMatchingSlot = preferredHours.some((hourStr: string) => {
    const [slotH, slotM] = hourStr.split(":").map(Number);
    const slotMinutes = slotH * 60 + slotM;
    const diff = currentMinutes - slotMinutes;
    return diff >= -5 && diff <= 35;
  });

  if (!isMatchingSlot) {
    return {
      eligible: false,
      reason: `Horário atual (${brasiliaTimeStr} Brasília) fora da janela dos horários cadastrados (${preferredHours.join(", ")}).`,
    };
  }

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
  const config = await getOrCreateBlogAgentConfig();

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

  // Atualiza status para RUNNING
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
      // Prioridade: PENDING ordenado por prioridade (URGENT > HIGH > MEDIUM > LOW) e data mais antiga
      // Como enum no Postgres não ordena alfabeticamente pela prioridade lógica, buscamos PENDING
      const pendingTopics = await prisma.blogTopic.findMany({
        where: { status: TopicStatus.PENDING },
        orderBy: { createdAt: "asc" },
      });

      if (pendingTopics.length > 0) {
        // Ordena na memória pela prioridade de negócio
        const priorityOrder: Record<PriorityLevel, number> = {
          URGENT: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4,
        };

        pendingTopics.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        topicToUse = pendingTopics[0];
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

    // 6. Atualiza a pauta no mini-cérebro
    if (topicToUse) {
      await prisma.blogTopic.update({
        where: { id: topicToUse.id },
        data: {
          status: TopicStatus.COMPLETED,
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
  }
}
