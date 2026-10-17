"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
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
    title: "Fachada Comercial Estruturada em ACM & Letreiro LED",
    category: "Fachadas",
    clientName: "Tech Tower Empreendimentos",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Execução de 180m² de fachada em placas de ACM 4mm grafite escovado com usinagem em chanfro 45°, letras bloco em aço inox 304 escovado e retroiluminação indireta com fitas LED 6500K IP68.",
    materials: ["ACM Grafite 4mm", "Aço Inox 304", "LED 6500K Halo", "Estrutura Galvanizada"],
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-2",
    title: "Letreiro Caixa Acrílico Cristal & Neon Glow",
    category: "Letreiros",
    clientName: "Boutique Lumina",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Letras caixa de alto relevo usinadas a laser em acrílico cast 10mm cristal, laterais termoformadas e sistema ótico interno com difusores para eliminação de pontos quentes de LED.",
    materials: ["Acrílico Cristal 10mm", "LED Branco Quente 3000K", "Módulos Injetados"],
    featuredImage: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-3",
    title: "Identidade Visual & Branding Corporativo",
    category: "Design",
    clientName: "Studio Aurora Criativo",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Desenvolvimento completo de logotipo, guia de marca, paleta cromática e papelaria institucional premium com laminação soft-touch e verniz localizado.",
    materials: ["Manual de Marca", "Papelaria Corporativa", "Vetorização de Precisão"],
    featuredImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-4",
    title: "Placas de Sinalização Arquitetônica em Inox Escovado",
    category: "Placas",
    clientName: "Centro Médico Jardim Botânico",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Sinalização interna de salas e setores em placas de aço inoxidável escovado com gravação química de alta precisão e fixadores em tarugos de alumínio anodizado.",
    materials: ["Aço Inox Escovado", "Gravação Química", "Tarugos Anodizados"],
    featuredImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-5",
    title: "Painel Decorativo Ripado Usinado em Router CNC",
    category: "Painéis",
    clientName: "Alpha Medicina Integrada",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Painel ripado tridimensional usinado em compensado naval impermeabilizado e logotipo vazado em acrílico ouro espelhado com iluminação embutida por fita LED COB.",
    materials: ["Router CNC", "Acrílico Ouro Espelhado", "LED COB 3000K"],
    featuredImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-6",
    title: "Quadros Corporativos de Alta Definição & Acrílico",
    category: "Quadros",
    clientName: "Advocacia Silveira & Associados",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Coleção de quadros decorativos corporativos com impressão UV de alta definição sobre acrílico translúcido e molduras metálicas finas em preto fosco.",
    materials: ["Impressão UV Direta", "Acrílico 5mm", "Moldura Alumínio Fosco"],
    featuredImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-7",
    title: "Troféus Personalizados em Metal e Acrílico Maciço",
    category: "Troféus",
    clientName: "Prêmio Destaque Empresarial RS",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Criação e confecção de 40 troféus comemorativos esculpidos a laser com camadas sobrepostas de acrílico cristal usinado e base em aço escovado com gravação personalizada.",
    materials: ["Acrílico Maciço 15mm", "Base Aço Escovado", "Corte Laser Preciso"],
    featuredImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "proj-8",
    title: "Pórtico Monolítico & Totem Iluminado",
    category: "Outros",
    clientName: "Auto Premium Concessionária",
    location: "Porto Alegre, RS",
    year: "2026",
    description:
      "Pórtico autoportante de entrada com 8 metros de altura, complementado por totem tridimensional de 6 metros com lona tensionada backlight e pintura automotiva.",
    materials: ["ACM Preto Fosco", "Lona Backlight 500g", "Pintura PU"],
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

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

import { SpotlightCard } from "@/components/ui/spotlight-card";

export function PortfolioGallery() {
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const filteredProjects =
    activeCategory === "Tudo"
      ? SAMPLE_PROJECTS
      : SAMPLE_PROJECTS.filter((p) => p.category === activeCategory);

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    setActiveImageIdx(0);
  };

  return (
    <section id="portfolio" className="py-24 bg-white border-b border-zinc-200/90 relative scroll-mt-20 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção com subtítulo abaixo do título */}
        <div className="max-w-3xl mb-12 space-y-4">
          <Badge variant="orange-light" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Galeria de Soluções
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            Nosso Portfolio
          </h2>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl leading-relaxed pt-1">
            Cada cliente é único. Não nos contentamos com soluções genéricas: desenvolvemos projetos exclusivos com o que há de mais moderno.
          </p>
        </div>

        {/* Filtros por Categoria solicitados na nova copy */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 pb-4 border-b border-zinc-200">
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
        </div>

        {/* Grid de Projetos do Portfólio com Spotlight nos Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <SpotlightCard
              key={project.id}
              isDark={false}
              onClick={() => handleOpenModal(project)}
              className="group cursor-pointer rounded-2xl bg-white border border-zinc-200/90 overflow-hidden transition-all duration-300 hover:border-[#FF650F]/50 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Imagem do Projeto */}
              <div className="relative h-60 w-full overflow-hidden bg-zinc-100">
                <Image
                  src={project.featuredImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="graphite" className="bg-[#121316]/85 backdrop-blur-md text-white text-[10px]">
                    {project.category}
                  </Badge>
                  <Badge variant="orange" className="bg-[#FF650F] text-white text-[10px] border-none font-bold">
                    {project.year}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div>
                  <span className="text-xs text-[#FF650F] font-mono tracking-wider uppercase font-semibold">
                    {project.clientName}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF650F] transition-colors mt-1">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.materials.slice(0, 2).map((mat, i) => (
                      <span key={i} className="text-[10px] bg-zinc-100 border border-zinc-200/60 text-zinc-600 px-2.5 py-1 rounded-md font-medium">
                        {mat}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#FF650F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Modal / Lightbox Interativo */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#18191D] border border-orange-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#121316]/80 text-white hover:text-[#FF650F] border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagem Principal */}
            <div className="relative h-72 sm:h-96 w-full bg-black shrink-0">
              <Image
                src={selectedProject.galleryImages[activeImageIdx] || selectedProject.featuredImage}
                alt={selectedProject.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18191D] via-transparent to-transparent opacity-80" />
            </div>

            {/* Detalhes Técnicos */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="orange">{selectedProject.category}</Badge>
                  <span className="text-xs text-zinc-400 font-mono">
                    {selectedProject.clientName} • {selectedProject.location}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  {selectedProject.title}
                </h3>
                <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-2">
                  Materiais & Especificações:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#121316] px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-300 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF650F]" />
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>
                  Fechar
                </Button>
                <Link href="/#contato">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setSelectedProject(null)}
                    className="gap-2"
                  >
                    Solicitar Orçamento Similar
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
