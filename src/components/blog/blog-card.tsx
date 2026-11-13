import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { formatDateTime } from "@/lib/utils";
import { Clock, ArrowRight, Calendar, UserCheck } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
  isFeatured?: boolean;
}

export function BlogCard({ post, isFeatured = false }: BlogCardProps) {
  const primaryTag = post.tags?.[0] || "Comunicação Visual";
  const secondaryTags = post.tags?.slice(1, 2) || [];

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full select-none">
      <SpotlightCard
        className={`h-full rounded-2xl bg-glessios-graphite/90 backdrop-blur-md border border-glessios-border-dark overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-glessios-orange/60 hover:shadow-orange-glow hover:-translate-y-1 ${
          isFeatured ? "ring-1 ring-glessios-orange/40" : ""
        }`}
      >
        <div>
          {/* Capa do Artigo com Proporção 16:9 Compacta */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/80">
            <Image
              src={post.coverImageUrl}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {/* Gradiente escuro para contraste dos textos */}
            <div className="absolute inset-0 bg-gradient-to-t from-glessios-graphite via-transparent to-black/30 pointer-events-none" />

            {/* Tag Flutuante sobre a Imagem */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
              <Badge
                variant="orange"
                className="bg-glessios-orange text-white border-none font-bold text-[10px] shadow-sm backdrop-blur-sm px-2 py-0.5"
              >
                {primaryTag}
              </Badge>

              {isFeatured && (
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                  Destaque
                </span>
              )}
            </div>

            {/* Metadados na Base da Imagem */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/80 font-mono pointer-events-none">
              <span className="flex items-center gap-1 drop-shadow">
                <Calendar className="w-3 h-3 text-glessios-orange" />
                {formatDateTime(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1 drop-shadow bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                <Clock className="w-3 h-3 text-glessios-orange" />
                {post.readingTimeMin} min
              </span>
            </div>
          </div>

          {/* Conteúdo do Card Compacto */}
          <div className="p-4 sm:p-5 space-y-2.5">
            {/* Tags secundárias */}
            {secondaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {secondaryTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-white/[0.04] text-glessios-text-body px-2 py-0.5 rounded-full border border-[#2A2B2F]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Título Proporcional e Alinhado */}
            <h3 className="text-base font-bold tracking-tight text-glessios-text-heading group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
              {post.title}
            </h3>

            {/* Resumo Editorial (Excerpt) */}
            <p className="text-xs text-glessios-text-body/85 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Rodapé do Card com Autoria e Ação */}
        <div className="px-4 py-3 sm:px-5 border-t border-[#2A2B2F] bg-transparent flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-glessios-text-body">
            <div className="w-5 h-5 rounded-full bg-glessios-charcoal border border-[#2A2B2F] flex items-center justify-center text-[9px] font-bold text-glessios-orange">
              <UserCheck className="w-3 h-3" />
            </div>
            <span className="font-medium text-[10px] text-glessios-text-body/90">
              Equipe ICTHUS
            </span>
          </div>

          <span className="font-semibold text-glessios-orange flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
            Ler artigo
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
}
