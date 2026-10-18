"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { PORTFOLIO_PROJECTS, type ProjectDetailItem } from "@/lib/portfolio-data";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";

const CATEGORIES = [
  "Tudo",
  "Design",
  "Letreiros",
  "Placas",
  "Painéis",
  "Quadros",
  "Troféus",
  "Fachadas",
  "Outros",
];

export function PortfolioGallery() {
  const [activeCategory, setActiveCategory] = useState("Tudo");

  const filteredProjects =
    activeCategory === "Tudo"
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 bg-white border-b border-zinc-200/90 relative scroll-mt-20 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção com M3ScrollReveal */}
        <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-12 space-y-4">
          <Badge variant="orange-light" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
            Galeria de Soluções
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            Nosso Portfolio
          </h2>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl leading-relaxed pt-1">
            Cada cliente é único. Não nos contentamos com soluções genéricas: desenvolvemos projetos exclusivos com o que há de mais moderno. Clique em qualquer trabalho para ver a apresentação completa com fotos, vídeos e detalhes técnicos da obra.
          </p>
        </M3ScrollReveal>

        {/* Filtros por Categoria com M3ScrollReveal */}
        <M3ScrollReveal variant="fadeIn" delay={0.1} className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 pb-4 border-b border-zinc-200">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#FF650F] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </M3ScrollReveal>

        {/* Grid de Projetos do Portfólio com M3ScrollStagger e M3ScrollItem */}
        <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project: ProjectDetailItem) => (
            <M3ScrollItem key={project.id} className="h-full">
              <Link href={`/portfolio/${project.slug}`} className="block h-full group">
                <SpotlightCard
                  isDark={false}
                  className="rounded-2xl bg-white border border-zinc-200/90 overflow-hidden transition-all duration-300 group-hover:border-[#FF650F]/50 group-hover:shadow-xl group-hover:-translate-y-1.5 flex flex-col h-full"
                >
                  {/* Imagem de Capa do Projeto */}
                  <div className="relative h-64 w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={project.featuredImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <Badge variant="graphite" className="bg-[#121316]/85 backdrop-blur-md text-white text-[10px]">
                        {project.category}
                      </Badge>
                      <Badge variant="orange" className="bg-[#FF650F] text-white text-[10px] border-none font-bold">
                        {project.year}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
                      <span className="font-mono text-zinc-200 truncate">{project.location}</span>
                      {project.videos && project.videos.length > 0 && (
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-orange-400 flex items-center gap-1">
                          ▶ Vídeo Disponível
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div>
                      <span className="text-xs text-[#FF650F] font-mono tracking-wider uppercase font-semibold">
                        {project.clientName}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF650F] transition-colors mt-1 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                        {project.subtitle || project.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {project.materials.slice(0, 2).map((mat, i) => (
                          <span key={i} className="text-[10px] bg-zinc-100 border border-zinc-200/60 text-zinc-600 px-2.5 py-1 rounded-md font-medium truncate max-w-full">
                            {mat}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#FF650F] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform shrink-0">
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </M3ScrollItem>
          ))}
        </M3ScrollStagger>
      </div>
    </section>
  );
}
