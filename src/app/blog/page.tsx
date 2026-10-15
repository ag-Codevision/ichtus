import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Sparkles, Clock, ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PostStatus, BlogPost } from "@prisma/client";

export const revalidate = 60; // Revalidação ISR a cada 60 segundos

export const metadata = {
  title: "Blog de Tendências em Comunicação Visual & Arquitetura | ICTHUS Soluções e Design",
  description:
    "Artigos aprofundados sobre fachadas comerciais em ACM, letreiros LED indireto, corte router CNC e sinalização corporativa de alto impacto.",
};

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });
  } catch (error) {
    console.warn("Aviso: banco de dados inacessível durante build estático ou inicialização:", error);
  }

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Cabeçalho do Blog */}
          <div className="max-w-3xl mb-14 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Inteligência Artificial & Engenharia Visual
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-glessios-text-heading">
              Tendências, materiais e arquitetura de fachadas.
            </h1>
            <p className="text-base text-glessios-text-body leading-relaxed">
              Análises técnicas e novidades do setor de comunicação visual redigidas com apoio de IA autônoma e curadoria de engenharia da ICTHUS Soluções e Design.
            </p>
          </div>

          {/* Post em Destaque Principal */}
          {featuredPost && (
            <div className="mb-16">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block rounded-3xl bg-glessios-graphite border border-glessios-border-dark overflow-hidden transition-all duration-300 hover:border-glessios-orange/60 hover:shadow-card-hover"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[340px] bg-black">
                    <Image
                      src={featuredPost.coverImageUrl}
                      alt={featuredPost.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="orange" className="bg-glessios-orange text-white border-none font-bold">
                        Destaque da Semana
                      </Badge>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs text-glessios-text-body font-mono">
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-glessios-orange" />
                          {featuredPost.readingTimeMin} min de leitura
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-glessios-text-heading group-hover:text-white transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>

                      <p className="text-sm text-glessios-text-body leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-glessios-border-dark flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {featuredPost.tags.slice(0, 2).map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-white/[0.05] text-glessios-text-body px-2.5 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-glessios-orange flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ler Artigo Completo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Grid de Artigos Recentes */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-glessios-orange" />
              Mais Artigos & Guias Técnicos
            </h3>

            {gridPosts.length === 0 && !featuredPost && (
              <div className="p-12 text-center rounded-2xl bg-glessios-graphite border border-glessios-border-dark">
                <p className="text-sm text-glessios-text-body">
                  Nenhum artigo publicado ainda. O motor de IA gerará a próxima edição automaticamente.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl bg-glessios-graphite border border-glessios-border-dark overflow-hidden transition-all duration-300 hover:border-glessios-orange/50 hover:shadow-card-hover hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="relative h-52 w-full bg-black">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-glessios-text-body font-mono">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>•</span>
                        <span>{post.readingTimeMin} min</span>
                      </div>
                      <h4 className="text-lg font-bold text-glessios-text-heading group-hover:text-white transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-glessios-text-body line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-glessios-border-dark flex items-center justify-between text-xs">
                      <span className="text-glessios-orange font-medium">Ler artigo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-glessios-orange group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
