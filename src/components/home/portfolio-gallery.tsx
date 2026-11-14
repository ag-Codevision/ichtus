"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Plus, Trash2, Edit2, Loader2, FolderPlus } from "lucide-react";
import { PORTFOLIO_PROJECTS, type ProjectDetailItem } from "@/lib/portfolio-data";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { M3ScrollReveal, M3ScrollStagger, M3ScrollItem } from "@/components/ui/scroll-reveal";
import { useCMS } from "@/components/cms/cms-provider";
import { CMSEditableText } from "@/components/cms/cms-editable-text";
import { CMSCardActionBar } from "@/components/cms/cms-card-controls";

export function PortfolioGallery() {
  const {
    data,
    updateSection,
    isEditMode,
    isPreviewMode,
    openPortfolioModal,
    portfolioRefreshCounter,
  } = useCMS();

  const portfolioMeta = data.portfolio;
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [projects, setProjects] = useState<ProjectDetailItem[]>(PORTFOLIO_PROJECTS);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Estados para CRUD de Categorias
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // 1. Carrega projetos atualizados do servidor/banco de dados
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/v1/admin/cms/portfolio", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.projects)) {
          setProjects(json.projects);
        }
      }
    } catch (err) {
      console.warn("[Portfolio Gallery] Usando projetos locais:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [portfolioRefreshCounter]);

  // Exclusão de Projeto de Portfólio (limpa do banco de dados)
  const handleDeleteProject = async (project: ProjectDetailItem) => {
    try {
      const res = await fetch(`/api/v1/admin/cms/portfolio/${project.id || project.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id && p.slug !== project.slug));
      } else {
        alert("Erro ao excluir projeto do banco de dados.");
      }
    } catch (err) {
      console.error("[Delete Project Error]:", err);
      alert("Falha de conexão ao excluir projeto.");
    }
  };

  // CRUD de Categorias
  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed || portfolioMeta.categories.includes(trimmed)) return;

    const nextCats = [...portfolioMeta.categories, trimmed];
    updateSection("portfolio", { categories: nextCats });
    setNewCatName("");
    setNewCatModalOpen(false);

    // Salva na API de categorias
    fetch("/api/v1/admin/cms/portfolio/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    }).catch(console.error);
  };

  const handleDeleteCategory = (catName: string) => {
    if (catName === "Tudo") return;
    const nextCats = portfolioMeta.categories.filter((c) => c !== catName);
    updateSection("portfolio", { categories: nextCats });
    if (activeCategory === catName) setActiveCategory("Tudo");

    // Remove na API
    fetch(`/api/v1/admin/cms/portfolio/categories?name=${encodeURIComponent(catName)}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  const filteredProjects =
    activeCategory === "Tudo"
      ? projects
      : projects.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="portfolio" className="py-24 bg-white border-b border-zinc-200/90 relative scroll-mt-20 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <M3ScrollReveal variant="fadeUp" className="max-w-3xl mb-12 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Badge variant="orange-light" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
              <CMSEditableText
                value={portfolioMeta.badgeText}
                onChange={(val) => updateSection("portfolio", { badgeText: val })}
                placeholder="Tag do portfólio..."
              />
            </Badge>

            {/* Botão Adicionar Novo Portfólio (visível no modo de edição) */}
            {isEditMode && !isPreviewMode && (
              <button
                type="button"
                onClick={() => openPortfolioModal(null)}
                className="px-4 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Portfólio
              </button>
            )}
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            <CMSEditableText
              as="span"
              value={portfolioMeta.title}
              onChange={(val) => updateSection("portfolio", { title: val })}
              placeholder="Título do portfólio..."
            />
          </h2>

          <p className="text-sm md:text-base text-zinc-600 max-w-2xl leading-relaxed pt-1">
            <CMSEditableText
              as="span"
              multiline
              value={portfolioMeta.subtitle}
              onChange={(val) => updateSection("portfolio", { subtitle: val })}
              placeholder="Subtítulo descritivo do portfólio..."
            />
          </p>
        </M3ScrollReveal>

        {/* Filtros por Categoria com CRUD Inline */}
        <M3ScrollReveal
          variant="fadeIn"
          delay={0.1}
          className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 pb-4 border-b border-zinc-200"
        >
          {portfolioMeta.categories.map((cat) => (
            <div key={cat} className="relative group/cat inline-flex items-center">
              <button
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#FF650F] text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80"
                }`}
              >
                {cat}
              </button>

              {/* Botão de Excluir Categoria no Modo Edição */}
              {isEditMode && !isPreviewMode && cat !== "Tudo" && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="hidden group-hover/cat:flex absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white text-[9px] shadow hover:bg-rose-700"
                  title={`Excluir categoria ${cat}`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}

          {/* Botão para Adicionar Nova Categoria */}
          {isEditMode && !isPreviewMode && (
            <button
              type="button"
              onClick={() => setNewCatModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-dashed border-[#FF650F] text-[#FF650F] hover:bg-[#FF650F]/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              + Categoria
            </button>
          )}
        </M3ScrollReveal>

        {/* Modal de Nova Categoria */}
        {newCatModalOpen && (
          <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#16171B] border border-white/15 rounded-2xl p-6 text-white space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#FF650F]" />
                Nova Categoria de Portfólio
              </h3>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Fachadas em LED, Stands..."
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs focus:border-[#FF650F] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewCatModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-1.5 rounded-lg bg-[#FF650F] text-xs font-bold text-white"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Projetos do Portfólio */}
        <M3ScrollStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project: ProjectDetailItem) => (
            <M3ScrollItem key={project.id || project.slug} className="h-full">
              <div className="relative h-full group">
                {/* Ações flutuantes do Card de Portfólio no Modo de Edição */}
                <CMSCardActionBar
                  label="Projeto"
                  onEdit={() => openPortfolioModal(project)}
                  onDelete={() => handleDeleteProject(project)}
                />

                <Link href={`/portfolio/${project.slug}`} className="block h-full group">
                  <SpotlightCard
                    isDark={false}
                    className="rounded-2xl bg-white border border-zinc-200/90 overflow-hidden transition-all duration-300 group-hover:border-[#FF650F]/50 group-hover:shadow-xl group-hover:-translate-y-1.5 flex flex-col h-full"
                  >
                    {/* Imagem de Capa do Projeto */}
                    <div className="relative h-64 w-full overflow-hidden bg-zinc-100">
                      <Image
                        src={project.featuredImage || "/images/portfolio/fachada-acm-tech-tower-thumb.webp"}
                        alt={project.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        decoding="async"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      <div className="absolute top-4 left-4 flex gap-2 z-10">
                        <Badge variant="graphite" className="bg-[#121316]/85 backdrop-blur-md text-white text-[10px]">
                          {project.category}
                        </Badge>
                        {project.year?.trim() && (
                          <Badge variant="orange" className="bg-[#FF650F] text-white text-[10px] border-none font-bold">
                            {project.year}
                          </Badge>
                        )}
                      </div>

                      {project.location?.trim() && (
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
                          <span className="font-mono text-zinc-200 truncate">{project.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                      <div>
                        {project.clientName?.trim() && (
                          <span className="text-[11px] font-bold tracking-wider text-[#FF650F] uppercase font-mono block mb-1">
                            {project.clientName}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF650F] transition-colors leading-snug">
                          {project.title}
                        </h3>
                        {(project.subtitle?.trim() || project.description?.trim()) && (
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                            {project.subtitle || project.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-[#FF650F] transition-colors">
                        <span>Ver Apresentação da Obra</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </div>
            </M3ScrollItem>
          ))}

          {/* Botão de Adicionar Card no Final da Grade */}
          {isEditMode && !isPreviewMode && (
            <M3ScrollItem className="h-full">
              <button
                type="button"
                onClick={() => openPortfolioModal(null)}
                className="h-full min-h-[350px] w-full rounded-2xl border-2 border-dashed border-[#FF650F]/50 hover:border-[#FF650F] bg-orange-500/5 hover:bg-orange-500/10 flex flex-col items-center justify-center p-6 text-center transition-all group/add cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FF650F]/20 text-[#FF650F] flex items-center justify-center mb-3 group-hover/add:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-zinc-900 group-hover/add:text-[#FF650F] transition-colors">
                  + Adicionar Novo Projeto
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  Gera o card e cria a página interna com todas as especificações
                </span>
              </button>
            </M3ScrollItem>
          )}
        </M3ScrollStagger>
      </div>
    </section>
  );
}
