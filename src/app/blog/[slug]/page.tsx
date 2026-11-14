import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatDateTime, shouldBypassImageOptimization, resolvePublicBlogImageUrl } from "@/lib/utils";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  UserCheck,
  ChevronRight,
  PhoneCall,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostStatus, BlogPost } from "@prisma/client";
import { ArticleReadingProgress } from "@/components/blog/article-reading-progress";
import { ArticleShareButtons } from "@/components/blog/article-share-buttons";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { BlogCard } from "@/components/blog/blog-card";
import { DEMO_BLOG_POSTS } from "@/lib/demo-blog-posts";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: BlogPost | null = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug },
    });
  } catch {
    // fallback
  }

  if (!post) {
    post = DEMO_BLOG_POSTS.find((p) => p.slug === slug) || null;
  }

  if (!post) {
    return { title: "Artigo Não Encontrado | ICTHUS Soluções e Design" };
  }

  return {
    title: `${post.metaTitle} | ICTHUS Soluções e Design`,
    description: post.metaDescription,
    alternates: {
      canonical: post.canonicalUrl || `https://icthusbrasil.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://icthusbrasil.com/blog/${post.slug}`,
      images: [
        {
          url: resolvePublicBlogImageUrl(post.coverImageUrl),
          alt: post.imageAlt,
        },
      ],
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post: BlogPost | null = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.warn("Aviso ao buscar artigo no banco:", error);
  }

  if (!post) {
    post = DEMO_BLOG_POSTS.find((p) => p.slug === slug) || null;
  }

  if (!post) {
    notFound();
  }

  // Busca de posts anterior, próximo e relacionados (2 cards lado a lado)
  let prevPost: { title: string; slug: string } | null = null;
  let nextPost: { title: string; slug: string } | null = null;
  let relatedPosts: BlogPost[] = [];

  try {
    const [prev, next, related] = await Promise.all([
      prisma.blogPost.findFirst({
        where: {
          status: PostStatus.PUBLISHED,
          publishedAt: { lt: post.publishedAt },
        },
        orderBy: { publishedAt: "desc" },
        select: { title: true, slug: true },
      }),
      prisma.blogPost.findFirst({
        where: {
          status: PostStatus.PUBLISHED,
          publishedAt: { gt: post.publishedAt },
        },
        orderBy: { publishedAt: "asc" },
        select: { title: true, slug: true },
      }),
      prisma.blogPost.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          id: { not: post.id },
        },
        orderBy: { publishedAt: "desc" },
        take: 2,
      }),
    ]);
    prevPost = prev;
    nextPost = next;
    relatedPosts = related;
  } catch {
    // Banco inacessível em ambiente de desenvolvimento local
  }

  // Fallback gracioso para navegação e artigos relacionados
  if (relatedPosts.length === 0) {
    relatedPosts = DEMO_BLOG_POSTS.filter((p) => p.slug !== post!.slug).slice(0, 2);
  }
  if (!prevPost) {
    const prevDemo = DEMO_BLOG_POSTS.find((p) => new Date(p.publishedAt) < new Date(post!.publishedAt));
    if (prevDemo) prevPost = { title: prevDemo.title, slug: prevDemo.slug };
  }
  if (!nextPost) {
    const nextDemo = DEMO_BLOG_POSTS.find((p) => new Date(p.publishedAt) > new Date(post!.publishedAt));
    if (nextDemo) nextPost = { title: nextDemo.title, slug: nextDemo.slug };
  }

  // Schema JSON-LD para SEO no Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: resolvePublicBlogImageUrl(post.coverImageUrl),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "ICTHUS Soluções e Design",
      url: "https://icthusbrasil.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ICTHUS Soluções e Design",
      logo: {
        "@type": "ImageObject",
        url: "https://icthusbrasil.com/logo.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://icthusbrasil.com/blog/${post.slug}`,
    },
  };

  const primaryTag = post.tags?.[0] || "Comunicação Visual";

  return (
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body selection:bg-glessios-orange/30 selection:text-white">
      <Navbar />

      {/* Barra de Progresso de Leitura Fixa no Topo */}
      <ArticleReadingProgress />

      {/* Injeção de Dados Estruturados Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-28 pb-24">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb e Voltar com Animação de Entrada */}
          <div className="animate-blog-in mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-glessios-text-body hover:text-glessios-orange transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para Todos os Artigos</span>
            </Link>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-glessios-text-body/70 font-mono">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-glessios-orange truncate max-w-[200px]">{primaryTag}</span>
            </nav>
          </div>

          {/* Cabeçalho do Artigo com Animação de Entrada */}
          <header className="animate-blog-in animation-delay-75 space-y-6 pb-8 border-b border-glessios-border-dark">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="orange" className="font-bold px-3 py-1">
                {primaryTag}
              </Badge>
              {post.tags?.slice(1, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-glessios-graphite text-glessios-text-body px-3 py-1 rounded-full border border-[#2A2B2F]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs sm:text-sm">
              {/* Autor */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glessios-orange to-glessios-orange-deep flex items-center justify-center font-bold text-white shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-sm">Equipe de Engenharia ICTHUS</span>
                  <span className="text-xs text-glessios-orange font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Curadoria Técnica & Otimização
                  </span>
                </div>
              </div>

              {/* Data e Tempo de Leitura */}
              <div className="flex items-center gap-4 text-glessios-text-body font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-glessios-orange" />
                  {formatDateTime(post.publishedAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-glessios-orange" />
                  {post.readingTimeMin} min de leitura
                </span>
              </div>
            </div>
          </header>

          {/* Imagem de Capa em Alta Resolução com Animação */}
          <div className="animate-blog-in animation-delay-150 my-10 relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-glessios-charcoal border border-glessios-border-dark shadow-2xl">
            <Image
              src={post.coverImageUrl || "/logo.jpg"}
              alt={post.imageAlt || post.title}
              fill
              unoptimized={shouldBypassImageOptimization(post.coverImageUrl)}
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1152px"
              priority
            />
            {post.imagePhotographer && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/75 backdrop-blur-md text-[11px] text-white/90 px-3 py-1.5 rounded-lg border border-white/10">
                Fotografia: {post.imagePhotographer}
              </div>
            )}
          </div>

          {/* Resumo Editorial com Animação */}
          <div className="animate-blog-in animation-delay-225 p-6 sm:p-8 rounded-3xl bg-glessios-graphite/90 border-l-4 border-glessios-orange border border-glessios-border-dark mb-12 text-white font-medium text-base sm:text-xl leading-relaxed shadow-lg">
            {post.excerpt}
          </div>

          {/* Corpo do Artigo com Estrutura Responsiva em Grid com Animação */}
          <div className="animate-blog-in animation-delay-300 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-8 space-y-8">
              <MarkdownContent content={post.contentMarkdown} />

              {/* Box de Compartilhamento Social no Final do Conteúdo */}
              <div className="pt-8 border-t border-[#2A2B2F]">
                <ArticleShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Card de Autoria & Equipe Técnica */}
              <div className="p-6 sm:p-7 rounded-3xl bg-glessios-graphite/80 border border-glessios-border-dark flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-glessios-charcoal border border-[#2A2B2F] flex items-center justify-center text-glessios-orange shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="space-y-1 text-sm">
                  <h4 className="font-bold text-white text-base">Sobre a Equipe Técnica ICTHUS</h4>
                  <p className="text-glessios-text-body leading-relaxed text-xs sm:text-sm">
                    Especialistas em engenharia de comunicação visual, corte router CNC, iluminação indireta em LED e
                    revestimentos de fachadas arquitetônicas em ACM em Curitiba e todo o Brasil.
                  </p>
                </div>
              </div>

              {/* Navegação entre Artigo Anterior e Próximo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="p-4 rounded-2xl bg-glessios-graphite/60 hover:bg-glessios-graphite border border-glessios-border-dark hover:border-glessios-orange/40 transition-all group"
                  >
                    <span className="text-[11px] font-mono text-glessios-text-body flex items-center gap-1 group-hover:text-glessios-orange">
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      Artigo Anterior
                    </span>
                    <h5 className="font-bold text-sm text-white line-clamp-2 mt-1">
                      {prevPost.title}
                    </h5>
                  </Link>
                ) : <div className="hidden sm:block" />}

                {nextPost && (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="p-4 rounded-2xl bg-glessios-graphite/60 hover:bg-glessios-graphite border border-glessios-border-dark hover:border-glessios-orange/40 transition-all text-right group ml-auto w-full"
                  >
                    <span className="text-[11px] font-mono text-glessios-text-body flex items-center justify-end gap-1 group-hover:text-glessios-orange">
                      Próximo Artigo
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <h5 className="font-bold text-sm text-white line-clamp-2 mt-1">
                      {nextPost.title}
                    </h5>
                  </Link>
                )}
              </div>
            </div>

            {/* Barra Lateral Flutuante (Desktop) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Índice de Seções (Table of Contents) */}
              <TableOfContents content={post.contentMarkdown} />

              {/* Botões de Compartilhamento na Barra Lateral (Desktop) */}
              <div className="hidden lg:block">
                <ArticleShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Card de Contato Direto */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glessios-graphite to-glessios-charcoal border border-glessios-border-dark space-y-4">
                <div className="w-10 h-10 rounded-xl bg-glessios-orange/15 text-glessios-orange flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-base">Dúvidas Técnicas?</h4>
                  <p className="text-xs text-glessios-text-body leading-relaxed">
                    Fale diretamente com nossos engenheiros visuais para sanar dúvidas sobre especificações de materiais.
                  </p>
                </div>
                <a
                  href="https://wa.me/5541996556102?text=Olá!%20Li%20o%20artigo%20sobre%20fachadas%20e%20gostaria%20de%20falar%20com%20um%20especialista."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-glessios-orange/40 text-glessios-orange hover:bg-glessios-orange hover:text-white">
                    Conversar via WhatsApp
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </aside>
          </div>

          {/* Seção de Artigos Relacionados em Cards Lado a Lado */}
          {relatedPosts.length > 0 && (
            <section className="animate-blog-in animation-delay-375 mt-20 pt-12 border-t border-glessios-border-dark space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-glessios-orange" />
                  Artigos Recomendados
                </h3>
                <Link
                  href="/blog"
                  className="text-xs font-semibold text-glessios-orange hover:underline flex items-center gap-1"
                >
                  Ver todos os artigos
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Cards Lado a Lado (2 Colunas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((related) => (
                  <BlogCard key={related.id} post={related} />
                ))}
              </div>
            </section>
          )}

          {/* Banner de Conversão ao Fim do Artigo com Animação */}
          <section className="animate-blog-in animation-delay-450 mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-glessios-graphite via-glessios-charcoal to-glessios-black border border-glessios-border-orange/60 shadow-orange-glow flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs uppercase tracking-widest text-glessios-orange font-bold flex items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Consultoria Técnica Gratuita
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Planejando a fachada do seu imóvel comercial?
              </h3>
              <p className="text-sm text-glessios-text-body max-w-xl leading-relaxed">
                Nossos engenheiros visuais elaboram um estudo preliminar 3D e orçamento detalhado para sua empresa.
              </p>
            </div>

            <Link href="/#orcamento" className="w-full sm:w-auto shrink-0">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-lg">
                Solicitar Estudo de Fachada
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
