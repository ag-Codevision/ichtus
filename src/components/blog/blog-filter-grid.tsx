"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { BlogPost } from "@prisma/client";
import { BlogCard } from "./blog-card";
import { Search, Sparkles, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BlogFilterGridProps {
  posts: BlogPost[];
}

export function BlogFilterGrid({ posts }: BlogFilterGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("TODOS");

  // Ref e estados para arrasto suave com o mouse (Drag-to-scroll)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Extrair lista de todas as tags únicas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => {
      p.tags?.forEach((t) => tagSet.add(t.trim()));
    });
    return ["TODOS", ...Array.from(tagSet)];
  }, [posts]);

  // Filtragem combinada por busca e tag selecionada
  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesSearch =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags?.some((t) => t.toLowerCase().includes(term));

      const matchesTag =
        selectedTag === "TODOS" ||
        post.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag]);

  // Scroll horizontal através das setas
  const handleScroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const amount = direction === "left" ? -220 : 220;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // Handlers para Arraste com Mouse (Drag to scroll) sem barra
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Suporte à rodinha do mouse para rolagem horizontal
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="space-y-8">
      {/* Barra de Controles: Animação de Entrada Suave de Cima para Baixo */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 sm:p-5 rounded-2xl bg-glessios-graphite/70 backdrop-blur-md border border-glessios-border-dark space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-grow max-w-lg">
            <Search className="w-4 h-4 text-glessios-text-body absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar artigos por ACM, LED, fachadas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-glessios-black/70 border border-glessios-border-dark focus:border-glessios-orange rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-glessios-text-heading placeholder-glessios-text-body/60 outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-glessios-text-body hover:text-white rounded-full"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-glessios-text-body font-mono text-right sm:text-left">
            Mostrando <strong className="text-white">{filteredPosts.length}</strong> de {posts.length} artigos
          </div>
        </div>

        {/* Filtros em Pílulas / Categorias — ROLAGEM HORIZONTAL TOTALMENTE SEM BARRA */}
        {allTags.length > 1 && (
          <div className="relative flex items-center">
            {/* Botão Seta Esquerda */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-glessios-charcoal/90 hover:bg-glessios-orange hover:text-white text-glessios-text-body border border-glessios-border-dark shrink-0 mr-1.5 transition-colors z-10 shadow-sm"
              title="Rolar categorias para esquerda"
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Container com Arraste, Scroll com Wheel e Barra 100% Oculta */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onWheel={handleWheel}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth select-none cursor-grab active:cursor-grabbing w-full py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-glessios-text-body/70 shrink-0 flex items-center gap-1 mr-1 pointer-events-none">
                <SlidersHorizontal className="w-3 h-3 text-glessios-orange" />
                Temas:
              </span>

              {allTags.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!hasMovedRef.current) {
                        setSelectedTag(tag);
                      }
                    }}
                    className={`text-[11px] px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 shrink-0 whitespace-nowrap ${
                      isSelected
                        ? "bg-glessios-orange text-white font-bold shadow-sm shadow-glessios-orange/30 scale-[1.02]"
                        : "bg-glessios-black/60 text-glessios-text-body hover:text-white hover:bg-white/[0.08] border border-glessios-border-dark"
                    }`}
                  >
                    {tag === "TODOS" ? "Todos os Temas" : tag}
                  </button>
                );
              })}
            </div>

            {/* Botão Seta Direita */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-glessios-charcoal/90 hover:bg-glessios-orange hover:text-white text-glessios-text-body border border-glessios-border-dark shrink-0 ml-1.5 transition-colors z-10 shadow-sm"
              title="Rolar categorias para direita"
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Grid com Animação de Entrada em Cascata (Stagger) para cada Card */}
      {filteredPosts.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.09,
                delayChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-stretch"
        >
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.97 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              className="h-full"
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Estado Vazio */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="p-12 text-center rounded-2xl bg-glessios-graphite/60 border border-glessios-border-dark space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-glessios-orange/10 border border-glessios-orange/30 flex items-center justify-center text-glessios-orange">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-white">Nenhum artigo encontrado</h4>
          <p className="text-xs text-glessios-text-body max-w-sm mx-auto">
            Não encontramos artigos para os filtros selecionados.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedTag("TODOS");
              }}
              className="gap-2 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-glessios-orange" />
              Restaurar todos os artigos
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
