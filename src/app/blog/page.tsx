import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { ArrowRight, Building2, PhoneCall } from "lucide-react";
import Link from "next/link";
import { PostStatus, BlogPost } from "@prisma/client";
import { BlogFilterGrid } from "@/components/blog/blog-filter-grid";
import { DEMO_BLOG_POSTS } from "@/lib/demo-blog-posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog de Tendências em Fachadas, ACM e Engenharia Visual | ICTHUS Soluções e Design",
  description:
    "Artigos e guias técnicos aprofundados sobre fachadas comerciais em ACM, letreiros luminosos em LED, usinagem CNC e projetos corporativos de alto padrão.",
};

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 24,
    });
  } catch (error) {
    console.warn("Aviso: banco de dados inacessível durante consulta do blog, carregando dados de demonstração:", error);
  }

  // Se não houver posts no banco, utiliza os artigos técnicos de demonstração
  if (posts.length === 0) {
    posts = DEMO_BLOG_POSTS;
  }

  return (
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body selection:bg-glessios-orange/30 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Grid Interativo com Cards Lado a Lado & Busca (Início Direto) */}
          <section aria-label="Artigos de Comunicação Visual">
            <BlogFilterGrid posts={posts} />
          </section>

          {/* Banner de Conversão e Consultoria Técnica no Rodapé do Blog */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-glessios-graphite via-glessios-charcoal to-glessios-black border border-glessios-border-orange/60 p-8 sm:p-12 shadow-orange-glow">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left max-w-2xl">
                <span className="text-xs font-bold tracking-widest uppercase text-glessios-orange flex items-center justify-center lg:justify-start gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Projeto Arquitetônico Personalizado
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Precisa de uma fachada comercial de alto impacto?
                </h3>
                <p className="text-sm sm:text-base text-glessios-text-body leading-relaxed">
                  Converse com nossos especialistas para desenvolver seu estudo preliminar 3D, especificações de materiais
                  e orçamento sob medida para o seu negócio.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0">
                <Link href="/#orcamento" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-sm font-bold shadow-lg">
                    Solicitar Estudo 3D
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <a
                  href="https://wa.me/5541996556102?text=Olá!%20Li%20os%20artigos%20no%20blog%20da%20ICTHUS%20e%20gostaria%20de%20um%20orçamento%20de%20fachada."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold border-white/20 hover:border-glessios-orange">
                    <PhoneCall className="w-4 h-4 text-glessios-orange" />
                    Falar com Engenheiro
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
