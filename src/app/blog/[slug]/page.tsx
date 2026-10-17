import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Clock, ArrowLeft, ArrowRight, Share2, Sparkles, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return { title: "Artigo Não Encontrado | ICTHUS Soluções e Design" };
  }

  return {
    title: `${post.metaTitle} | ICTHUS Soluções e Design`,
    description: post.metaDescription,
    alternates: {
      canonical: post.canonicalUrl || `https://glessios.com.br/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://glessios.com.br/blog/${post.slug}`,
      images: [
        {
          url: post.coverImageUrl,
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
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    notFound();
  }

  // Schema JSON-LD para o Google (RNF-03 do SPEC.md)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: post.coverImageUrl,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Glessios Comunicação Visual",
      url: "https://glessios.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "Glessios Comunicação Visual",
      logo: {
        "@type": "ImageObject",
        url: "https://glessios.com.br/logo.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://glessios.com.br/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body">
      <Navbar />

      {/* Injeção de Dados Estruturados Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-28 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb e Voltar */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-glessios-text-body hover:text-glessios-orange transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Todos os Artigos
            </Link>
          </div>

          {/* Cabeçalho do Artigo */}
          <header className="space-y-6 pb-8 border-b border-glessios-border-dark">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="orange">Comunicação Visual</Badge>
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-glessios-graphite text-glessios-text-body px-2.5 py-1 rounded-md border border-glessios-border-dark"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-glessios-text-body/90 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center font-bold text-white text-xs">
                  G
                </div>
                <div>
                  <span className="font-semibold text-white block">Equipe Técnica Glessios</span>
                  <span className="text-[11px] text-glessios-orange">Artigo Otimizado por IA</span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-glessios-orange" />
                  {post.readingTimeMin} min de leitura
                </span>
              </div>
            </div>
          </header>

          {/* Imagem de Capa em Alta Resolução */}
          <div className="my-10 relative h-72 sm:h-[450px] w-full rounded-3xl overflow-hidden bg-glessios-charcoal border border-glessios-border-dark shadow-2xl">
            <Image
              src={post.coverImageUrl}
              alt={post.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
            {post.imagePhotographer && (
              <div className="absolute bottom-3 right-4 bg-black/70 backdrop-blur-sm text-[10px] text-white/80 px-2.5 py-1 rounded-md">
                Foto: {post.imagePhotographer} (Unsplash)
              </div>
            )}
          </div>

          {/* Resumo Editorial (Excerpt) */}
          <div className="p-6 rounded-2xl bg-glessios-graphite border-l-4 border-glessios-orange border border-glessios-border-dark mb-10 text-white font-medium text-base sm:text-lg leading-relaxed">
            {post.excerpt}
          </div>

          {/* Corpo do Artigo em Markdown Renderizado */}
          <div className="prose prose-invert max-w-none space-y-6 text-glessios-text-body text-base leading-relaxed">
            {post.contentMarkdown.split("\n\n").map((block, index) => {
              const trimmed = block.trim();

              // Título H2
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-6 pb-2 border-b border-glessios-border-dark flex items-center gap-3"
                  >
                    <span className="w-2 h-6 bg-glessios-orange rounded-full" />
                    {trimmed.replace(/^## /, "")}
                  </h2>
                );
              }

              // Título H3
              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={index}
                    className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-4"
                  >
                    {trimmed.replace(/^### /, "")}
                  </h3>
                );
              }

              // Lista com marcadores
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n");
                return (
                  <ul key={index} className="space-y-2 pl-4">
                    {items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-glessios-orange shrink-0 mt-2" />
                        <span>{it.replace(/^[-*]\s+/, "")}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              // Parágrafo regular
              return (
                <p key={index} className="text-base text-glessios-text-body leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Banner de Conversão ao Fim do Artigo */}
          <div className="my-16 p-8 sm:p-10 rounded-3xl bg-glessios-graphite border border-glessios-border-orange/60 shadow-orange-glow flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-glessios-orange font-bold">
                Consultoria Técnica Gratuita
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                Planejando a fachada do seu imóvel comercial?
              </h3>
              <p className="text-sm text-glessios-text-body max-w-md">
                Nossos engenheiros visuais elaboram um estudo preliminar 3D e orçamento detalhado para sua empresa.
              </p>
            </div>

            <Link href="/#orcamento" className="w-full sm:w-auto shrink-0">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                Solicitar Estudo de Fachada
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
