"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, X, ExternalLink, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  location: string;
  year: string;
  description: string;
  materials: string[];
  featuredImage: string;
  galleryImages: string[];
}

const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Fachada Estruturada em ACM & Letreiro LED — Tech Tower",
    category: "Fachadas em ACM",
    clientName: "Tech Tower Empreendimentos",
    location: "Curitiba, PR",
    year: "2026",
    description:
      "Execução de 180m² de fachada em placas de ACM 4mm grafite escovado com usinagem em chanfro 45°, letras bloco em aço inox 304 escovado e retroiluminação indireta com fitas LED 6500K IP68.",
    materials: ["ACM Grafite 4mm", "Aço Inox 304", "LED 6500K Halo", "Estrutura Galvanizada"],
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-2",
    title: "Letreiro Caixa Acrílico Cristal & Neon Glow — Boutique Lumina",
    category: "Letreiros Luminosos",
    clientName: "Grupo Lumina Óticas",
    location: "Batel — Curitiba, PR",
    year: "2026",
    description:
      "Letras caixa de alto relevo usinadas a laser em acrílico cast 10mm cristal, laterais termoformadas e sistema ótico interno com difusores para eliminação de pontos quentes de LED.",
    materials: ["Acrílico Cristal 10mm", "LED Branco Quente 3000K", "Módulos Injetados", "Acabamento Automotivo"],
    featuredImage: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-3",
    title: "Pórtico Monolítico & Totem Iluminado — Auto Premium",
    category: "Fachadas em ACM",
    clientName: "Auto Premium Veículos",
    location: "São José dos Pinhais, PR",
    year: "2026",
    description:
      "Pórtico autoportante de entrada com 8 metros de altura, revestido com ACM preto fosco e vermelho corporativo, complementado por totem tridimensional de 6 metros com lona tensionada backlight.",
    materials: ["ACM Preto Fosco", "Lona Backlight 500g", "Estrutura Treliçada ART", "Fontes Blindadas 400W"],
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-4",
    title: "Painel Ripado 3D em Router CNC — Clínica Alpha Med",
    category: "Router CNC & Laser",
    clientName: "Alpha Medicina Integrada",
    location: "Ecoville — Curitiba, PR",
    year: "2026",
    description:
      "Recepção corporativa com painel ripado usinado em CNC em compensado naval impermeabilizado e logotipo vazado em acrílico ouro espelhado com fita de LED COB embutida.",
    materials: ["Usinagem CNC Precisão", "Acrílico Dourado Espelhado", "LED COB Alta Fidelidade", "Compensado Naval"],
    featuredImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const CATEGORIES = [
  "Todas",
  "Fachadas em ACM",
  "Letreiros Luminosos",
  "Router CNC & Laser",
];

export function PortfolioGallery() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const filteredProjects =
    activeCategory === "Todas"
      ? SAMPLE_PROJECTS
      : SAMPLE_PROJECTS.filter((p) => p.category === activeCategory);

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    setActiveImageIdx(0);
  };

  return (
    <section id="portfolio" className="py-24 bg-glessios-black border-b border-glessios-border-dark relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Obras & Projetos Executados
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-glessios-text-heading">
              Artesania industrial sob medida
            </h2>
          </div>
          <p className="text-sm md:text-base text-glessios-text-body max-w-md">
            Cada projeto combina cálculo estrutural, materiais nobres e acabamento minucioso para máxima imponência e longevidade da sua marca.
          </p>
        </div>

        {/* Filtros por Categoria com microinterações */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-glessios-border-dark">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-orange-gradient text-white shadow-orange-glow border border-glessios-border-orange"
                  : "bg-glessios-graphite text-glessios-text-body hover:text-white hover:bg-glessios-graphite-hover border border-glessios-border-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Projetos do Portfólio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleOpenModal(project)}
              className="group cursor-pointer rounded-2xl bg-glessios-graphite border border-glessios-border-dark overflow-hidden transition-all duration-300 hover:border-glessios-orange/50 hover:shadow-card-hover hover:-translate-y-1.5 flex flex-col"
            >
              {/* Imagem do Projeto com Overlay de Gradiente */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-glessios-charcoal">
                <Image
                  src={project.featuredImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-glessios-graphite via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="graphite" className="bg-glessios-black/75 backdrop-blur-md text-white text-[10px]">
                    {project.category}
                  </Badge>
                  <Badge variant="orange" className="bg-glessios-orange/90 text-white text-[10px] border-none font-bold">
                    {project.year}
                  </Badge>
                </div>
              </div>

              {/* Informações e Tags do Projeto */}
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div>
                  <span className="text-xs text-glessios-orange font-mono tracking-wider uppercase">
                    {project.clientName} — {project.location}
                  </span>
                  <h3 className="text-xl font-bold text-glessios-text-heading group-hover:text-white transition-colors mt-1">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-glessios-text-body mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-glessios-border-dark flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.materials.slice(0, 2).map((mat, i) => (
                      <span key={i} className="text-[10px] bg-white/[0.05] text-glessios-text-body px-2.5 py-1 rounded-md">
                        {mat}
                      </span>
                    ))}
                    {project.materials.length > 2 && (
                      <span className="text-[10px] text-glessios-orange self-center font-medium">
                        +{project.materials.length - 2} materiais
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-glessios-orange flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver Detalhes
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Lightbox Interativo do Projeto */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-glessios-graphite border border-glessios-border-orange/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Botão de Fechar */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-glessios-black/80 text-white hover:text-glessios-orange border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagem Principal Ampliada */}
            <div className="relative h-72 sm:h-96 w-full bg-black shrink-0">
              <Image
                src={selectedProject.galleryImages[activeImageIdx] || selectedProject.featuredImage}
                alt={selectedProject.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-glessios-graphite via-transparent to-transparent opacity-80" />
            </div>

            {/* Miniaturas de Fotos Adicionais */}
            {selectedProject.galleryImages.length > 1 && (
              <div className="flex gap-2 px-6 -mt-8 z-10 overflow-x-auto pb-2">
                {selectedProject.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx ? "border-glessios-orange scale-105 shadow-orange-glow" : "border-white/20 opacity-70"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* Detalhamento Técnico e Materiais */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="orange">{selectedProject.category}</Badge>
                  <span className="text-xs text-glessios-text-body font-mono">
                    {selectedProject.clientName} • {selectedProject.location}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-glessios-orange">
                  Memorial Descritivo do Projeto
                </h4>
                <p className="text-sm text-glessios-text-body leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-glessios-text-heading mb-3">
                  Especificação Técnica de Materiais Utilizados
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.materials.map((mat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-xs text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 text-glessios-orange shrink-0" />
                      {mat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ação de Conversão Direta no Modal */}
              <div className="pt-4 border-t border-glessios-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-glessios-text-body text-center sm:text-left">
                  Deseja uma solução com este padrão para seu estabelecimento?
                </span>
                <Link
                  href={`#orcamento`}
                  onClick={() => setSelectedProject(null)}
                  className="w-full sm:w-auto"
                >
                  <Button variant="primary" size="md" className="w-full sm:w-auto gap-2">
                    Solicitar Projeto Semelhante
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
