import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBlogArticleWithNvidia } from "@/lib/blog-ai/nvidia-nim";
import { searchUnsplashImage } from "@/lib/blog-ai/unsplash";
import { revalidatePath } from "next/cache";
import { PostStatus } from "@prisma/client";

/**
 * Endpoint de Geração Autônoma de Artigos de Blog com IA e Banco de Imagens
 * Conforme especificado em SDD.md (seção 4.1) e SPEC.md (RF-02)
 */
export async function POST(req: NextRequest) {
  return handleGeneration(req);
}

// Suporte a GET para permitir acionamento direto por webhooks externos simples como cron-job.org
export async function GET(req: NextRequest) {
  return handleGeneration(req);
}

async function handleGeneration(req: NextRequest) {
  try {
    // 1. Validação de Segurança do Token do Cron
    const authHeader = req.headers.get("authorization");
    const queryToken = req.nextUrl.searchParams.get("token");
    const configuredSecret = process.env.CRON_SECRET || process.env.CRON_SECRET_TOKEN;

    const providedToken = authHeader?.replace(/^Bearer\s+/i, "") || queryToken;

    if (!configuredSecret || providedToken !== configuredSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso não autorizado. Token de segurança inválido.",
        },
        { status: 401 }
      );
    }

    // 2. Extração de parâmetros opcionais
    let forcedTopic: string | undefined;
    let publishImmediately: boolean = true;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        forcedTopic = body.forcedTopic;
        if (typeof body.publishImmediately === "boolean") {
          publishImmediately = body.publishImmediately;
        }
      } catch {
        // Body vazio ou não JSON, prosseguir normalmente com valores default
      }
    } else {
      forcedTopic = req.nextUrl.searchParams.get("topic") || undefined;
    }

    console.log(`[Blog IA Cron] Iniciando geração. Pauta forçada: ${forcedTopic || "Automática"}`);

    // 3. Geração do Artigo via NVIDIA NIM (LLM)
    const articleData = await generateBlogArticleWithNvidia(forcedTopic);

    // 4. Busca da Imagem em Alta Resolução no Unsplash
    console.log(`[Blog IA Cron] Buscando imagem para query: "${articleData.imageQuery}"`);
    const imageInfo = await searchUnsplashImage(articleData.imageQuery);

    // 5. Garantir que o slug é único no banco
    let uniqueSlug = articleData.slug;
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: uniqueSlug },
    });

    if (existingPost) {
      uniqueSlug = `${uniqueSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 6. Inserção no Banco de Dados PostgreSQL
    const savedPost = await prisma.blogPost.create({
      data: {
        title: articleData.title,
        slug: uniqueSlug,
        excerpt: articleData.excerpt,
        contentMarkdown: articleData.contentMarkdown,
        coverImageUrl: imageInfo.imageUrl,
        imageAlt: imageInfo.altText,
        imagePhotographer: imageInfo.photographerName,
        status: publishImmediately ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        canonicalUrl: `https://glessios.com.br/blog/${uniqueSlug}`,
        tags: articleData.tags,
        readingTimeMin: articleData.readingTimeMin,
      },
    });

    console.log(`[Blog IA Cron] Artigo salvo com sucesso! ID: ${savedPost.id} | Slug: ${savedPost.slug}`);

    // 7. Revalidação de Cache no Next.js App Router
    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${uniqueSlug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("[Blog IA Cron] Falha silenciosa ao revalidar caminhos de cache:", e);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Artigo gerado e indexado com sucesso!",
        data: {
          id: savedPost.id,
          title: savedPost.title,
          slug: savedPost.slug,
          coverImageUrl: savedPost.coverImageUrl,
          imageAlt: savedPost.imageAlt,
          photographer: savedPost.imagePhotographer,
          readingTimeMin: savedPost.readingTimeMin,
          status: savedPost.status,
          publishedAt: savedPost.publishedAt,
          seo: {
            metaTitle: savedPost.metaTitle,
            metaDescription: savedPost.metaDescription,
            canonicalUrl: savedPost.canonicalUrl,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Blog IA Cron] Erro crítico:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha durante o processamento do pipeline de IA.",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
