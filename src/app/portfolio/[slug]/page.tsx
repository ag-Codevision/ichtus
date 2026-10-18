import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  Clock,
  Ruler,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Layers,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  getProjectBySlugOrId,
  getAllProjects,
  type ProjectDetailItem,
} from "@/lib/portfolio-data";
import { ProjectMediaShowcase } from "@/components/portfolio/project-gallery-view";
import { PortfolioHeroBackground } from "@/components/portfolio/portfolio-hero-background";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlugOrId(slug);

  if (!project) {
    return {
      title: "Projeto de Portfólio Não Encontrado | Glessios Comunicação Visual",
      description: "Conheça os projetos e trabalhos executados pela Glessios Comunicação Visual.",
    };
  }

  return {
    title: `${project.title} | Portfólio Glessios`,
    description: project.subtitle || project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} — Glessios Portfólio`,
      description: project.subtitle || project.description.slice(0, 160),
      url: `https://glessios.com.br/portfolio/${project.slug}`,
      siteName: "Glessios Comunicação Visual",
      images: [
        {
          url: project.coverImage || project.featuredImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      type: "article",
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlugOrId(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getAllProjects();
  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o projeto "${project.title}" no portfólio da Glessios e gostaria de solicitar um orçamento similar para a minha empresa.`
  );
  const whatsappUrl = `https://wa.me/5551981192976?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-900 selection:bg-[#FF650F] selection:text-white">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* ====================================================
            1. HERO DE CAPA CINEMATOGRÁFICO COM COREOGRAFIA DE ENTRADA
            ==================================================== */}
        <section className="relative w-full min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-end justify-center overflow-hidden bg-[#0A0B0D] text-white pb-16 sm:pb-20">
          {/* Imagem de Capa Otimizada com Carregamento Rápido e Placeholder Imediato */}
          <PortfolioHeroBackground
            src={project.coverImage || project.featuredImage}
            alt={project.title}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Navegação Breadcrumb Superior com animação de entrada */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 mb-6 animate-hero-badge">
              <Link
                href="/"
                className="hover:text-[#FF650F] transition-colors flex items-center gap-1 font-medium"
              >
                Início
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              <Link
                href="/#portfolio"
                className="hover:text-[#FF650F] transition-colors flex items-center gap-1 font-medium"
              >
                Portfólio
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[#FF650F] font-semibold truncate max-w-xs sm:max-w-md">
                {project.title}
              </span>
            </div>

            {/* Badges de Categoria e Metadados */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4 animate-hero-badge">
              <Badge variant="orange" className="font-bold py-1 px-3.5 text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                {project.category}
              </Badge>
              <Badge variant="graphite" className="bg-white/10 backdrop-blur-md text-white text-xs border border-white/20">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Ano {project.year}
              </Badge>
              <Badge variant="graphite" className="bg-white/10 backdrop-blur-md text-white text-xs border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {project.location}
              </Badge>
            </div>

            {/* Título Imponente com Efeito Reveal Mask */}
            <div className="overflow-hidden py-1">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-5xl animate-hero-headline-1">
                {project.title}
              </h1>
            </div>

            {/* Subtítulo com Elevação Suave */}
            <p className="text-base sm:text-xl text-zinc-300 font-normal max-w-3xl mt-4 leading-relaxed animate-hero-supporting">
              {project.subtitle}
            </p>

            {/* Barra de Ações Rápidas no Hero com Animação */}
            <div className="pt-8 flex flex-wrap items-center gap-4 animate-hero-cta">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" className="gap-2.5 font-bold shadow-xl">
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  Solicitar Projeto Similar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>

              <Link href="/#portfolio">
                <Button variant="dark-secondary" size="lg" className="gap-2 font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para a Galeria
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================================
            2. GRID DE MÉTRICAS & INDICADORES COM M3 SCROLL STAGGER
            ==================================================== */}
        <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <M3ScrollStagger className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xl">
            <M3ScrollItem>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3.5 h-full">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF650F] flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Cliente & Segmento
                  </span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{project.clientName}</p>
                  <span className="text-xs text-zinc-500 block truncate">{project.clientSegment}</span>
                </div>
              </div>
            </M3ScrollItem>

            <M3ScrollItem>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3.5 h-full">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF650F] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Prazo de Execução
                  </span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{project.executionTime}</p>
                  <span className="text-xs text-zinc-500 block">Fábrica & Montagem</span>
                </div>
              </div>
            </M3ScrollItem>

            <M3ScrollItem>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3.5 h-full">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF650F] flex items-center justify-center shrink-0">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Área & Proporções
                  </span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{project.dimensions}</p>
                  <span className="text-xs text-zinc-500 block">Precisão Milimétrica</span>
                </div>
              </div>
            </M3ScrollItem>

            <M3ScrollItem>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3.5 h-full">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF650F] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Garantia e Laudo
                  </span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{project.warranty}</p>
                  <span className="text-xs text-zinc-500 block">Com ART e NR-35</span>
                </div>
              </div>
            </M3ScrollItem>
          </M3ScrollStagger>
        </section>

        {/* ====================================================
            3. HISTÓRIA DA OBRA: O DESAFIO, A SOLUÇÃO E O IMPACTO
            ==================================================== */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Coluna Esquerda: Descrição & Desafio/Solução com M3ScrollReveal */}
            <div className="lg:col-span-7 space-y-10">
              <M3ScrollReveal variant="fadeUp" className="space-y-3">
                <Badge variant="orange-light" className="mb-2">
                  <Layers className="w-3.5 h-3.5 text-[#FF650F]" />
                  Visão Geral do Projeto
                </Badge>
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Engenharia e Design a Serviço da Marca
                </h2>
                <div className="mt-4 space-y-4 text-base text-zinc-700 leading-relaxed">
                  <p>{project.description}</p>
                </div>
              </M3ScrollReveal>

              {/* Box O Desafio vs A Solução com M3ScrollStagger */}
              <M3ScrollStagger className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <M3ScrollItem>
                  <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm space-y-3 h-full">
                    <span className="text-xs font-mono uppercase tracking-wider text-red-600 font-bold block">
                      01. O Desafio do Cliente
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900">Necessidade Inicial</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{project.challenge}</p>
                  </div>
                </M3ScrollItem>

                <M3ScrollItem>
                  <div className="p-6 rounded-3xl bg-white border border-orange-200/90 shadow-sm space-y-3 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#FF650F] font-bold block">
                      02. A Solução Glessios
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900">Engenharia Visual</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{project.solution}</p>
                  </div>
                </M3ScrollItem>
              </M3ScrollStagger>

              {/* Resultados e Benefícios Atingidos */}
              <M3ScrollReveal variant="scaleUp" className="p-8 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF650F] font-bold block">
                  03. Resultados Aferidos
                </span>
                <h3 className="text-2xl font-extrabold text-white">Impacto Comercial e Arquitetônico</h3>
                <div className="space-y-3 pt-2">
                  {project.results.map((res, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FF650F] shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{res}</p>
                    </div>
                  ))}
                </div>
              </M3ScrollReveal>
            </div>

            {/* Coluna Direita: Materiais & Ficha Técnica */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
              {/* Card de Materiais Nobres Utilizados com M3ScrollReveal */}
              <M3ScrollReveal variant="fadeIn" delay={0.1} className="p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-md space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900">
                    Materiais & Matérias-Primas Nobres
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Selecionados rigorosamente para garantir máxima durabilidade.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="text-xs bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 rounded-xl text-zinc-800 font-semibold flex items-center gap-2 hover:border-[#FF650F]/50 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#FF650F]" />
                      {mat}
                    </span>
                  ))}
                </div>

                {/* Tabela de Especificações */}
                <div className="border-t border-zinc-100 pt-6 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                    Ficha Técnica de Engenharia
                  </h4>
                  <div className="divide-y divide-zinc-100 text-xs sm:text-sm">
                    {project.technicalSpecs.map((spec, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                        <span className="text-zinc-500 font-medium">{spec.label}</span>
                        <span className="text-zinc-900 font-bold text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Contato Rápido para Este Projeto */}
                <div className="pt-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button variant="primary" size="lg" className="w-full gap-2 font-bold shadow-lg">
                      <MessageCircle className="w-4 h-4" />
                      Falar Sobre Este Projeto
                    </Button>
                  </a>
                </div>
              </M3ScrollReveal>

              {/* Depoimento do Cliente se houver */}
              {project.testimonial && (
                <M3ScrollReveal variant="scaleUp" delay={0.2} className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(project.testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-base italic text-zinc-800 font-serif leading-relaxed">
                    “{project.testimonial.quote}”
                  </blockquote>
                  <div className="pt-2 border-t border-orange-200/60">
                    <p className="text-sm font-bold text-zinc-900">{project.testimonial.author}</p>
                    <p className="text-xs text-zinc-600">
                      {project.testimonial.role} • {project.testimonial.company}
                    </p>
                  </div>
                </M3ScrollReveal>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            4. GALERIA COMPLETA DE FOTOS & SHOWCASE DE VÍDEOS
            ==================================================== */}
        <section className="py-20 bg-white border-y border-zinc-200/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectMediaShowcase project={project} />
          </div>
        </section>

        {/* ====================================================
            5. OUTROS PROJETOS REALIZADOS COM M3 SCROLL STAGGER
            ==================================================== */}
        {relatedProjects.length > 0 && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <M3ScrollReveal variant="fadeUp" className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="orange-light" className="mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
                  Portfólio em Destaque
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Explore Outros Trabalhos Realizados
                </h2>
              </div>
              <Link
                href="/#portfolio"
                className="text-sm font-bold text-[#FF650F] hover:text-[#e05508] flex items-center gap-1.5 transition-colors"
              >
                Ver todos os projetos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </M3ScrollReveal>

            <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((rel) => (
                <M3ScrollItem key={rel.id} className="h-full">
                  <Link href={`/portfolio/${rel.slug}`} className="block group h-full">
                    <div className="rounded-2xl overflow-hidden bg-white border border-zinc-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                      <div className="relative h-56 w-full bg-zinc-100 overflow-hidden">
                        <Image
                          src={rel.featuredImage}
                          alt={rel.title}
                          fill
                          unoptimized
                          loading="lazy"
                          decoding="async"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="graphite" className="bg-[#121316]/85 backdrop-blur-md text-white text-[10px]">
                            {rel.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow justify-between space-y-3">
                        <div>
                          <span className="text-[11px] font-mono text-[#FF650F] uppercase font-semibold">
                            {rel.clientName}
                          </span>
                          <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#FF650F] transition-colors mt-1 line-clamp-2">
                            {rel.title}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-[#FF650F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Conhecer Obra
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </M3ScrollItem>
              ))}
            </M3ScrollStagger>
          </section>
        )}

        {/* ====================================================
            6. CTA MEMORÁVEL PARA CONVERSÃO COM M3SCROLLREVEAL
            ==================================================== */}
        <section className="py-24 bg-[#0E0F11] text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

          <M3ScrollReveal variant="fadeUp" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <Badge variant="orange" className="py-1.5 px-4 font-semibold text-xs tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              SEU PROJETO É O PRÓXIMO
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Inspirado por este trabalho? Vamos criar uma solução única para a sua marca.
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Não nos contentamos com soluções genéricas. Desde a concepção do design até o cálculo de engenharia e montagem final, cuidamos de cada detalhe com paixão e excelência.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" className="gap-3 font-bold text-base shadow-2xl px-8">
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  Conversar no WhatsApp Agora
                </Button>
              </a>

              <Link href="/#contato">
                <Button variant="dark-secondary" size="lg" className="gap-2 text-base font-semibold px-8">
                  Solicitar Orçamento Online
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </M3ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
