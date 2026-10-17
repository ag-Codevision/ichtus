"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Building,
} from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Ricardo Mendonça",
    role: "Diretor de Expansão",
    company: "Rede Bella Farma",
    content:
      "A equipe do Glessios entregou as fachadas e a sinalização interna de 4 novas filiais rigorosamente no prazo. A qualidade do acabamento das letras caixa e a precisão do ACM superaram todas as nossas expectativas.",
    rating: 5,
    tag: "Fachadas & Sinalização",
  },
  {
    name: "Patrícia Albuquerque",
    role: "Arquiteta Titular",
    company: "Studio P. Arquitetura",
    content:
      "Trabalhar com a Glessios é ter paz de espírito. Eles entendem de projeto, respeitam o desenho do arquiteto e sugerem materiais e otimizações de custos que realmente fazem a diferença.",
    rating: 5,
    tag: "Projetos Especiais & Parceria",
  },
  {
    name: "Eduardo Silveira",
    role: "Fundador & CEO",
    company: "Grupo Nexus Tech",
    content:
      "Desde o redesenho da marca até as placas de inox e letreiros luminosos do nosso novo escritório, tudo foi centralizado em um só lugar. Menos dor de cabeça e resultado impecável.",
    rating: 5,
    tag: "Design & Produção Completa",
  },
];

export function TeamTestimonialsSection() {
  return (
    <div className="bg-[#121316] text-white">
      {/* ====================================================
          SEÇÃO: NOSSA EQUIPE
          ==================================================== */}
      <section id="equipe" className="py-24 border-b border-white/[0.08] relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho com subtítulo abaixo do título */}
          <div className="max-w-3xl mb-16 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Liderança & Compromisso
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Nossa Equipe
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
              Profissionais dedicados a pensar nas soluções mais inteligentes e funcionais para o seu negócio.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#18191D] border border-orange-500/30 relative shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none -z-10" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#FF650F] p-1 shadow-lg">
                    <div className="w-full h-full rounded-2xl bg-[#121316] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl">
                      GG
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-emerald-500 text-white shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Dados da Liderança */}
                <div className="space-y-4 text-center sm:text-left flex-grow">
                  <div>
                    <Badge variant="orange" className="text-[10px] font-mono tracking-wider uppercase mb-2">
                      Direção & Estratégia
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Glessios Gusso
                    </h3>
                    <p className="text-sm font-semibold text-[#FF650F]">
                      Diretor Geral
                    </p>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Com mais de 12 anos de experiência na concepção e gerenciamento de soluções visuais e projetos industriais, Glessios Gusso lidera pessoalmente a garantia de que cada cliente receba atenção exclusiva e soluções sob medida.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#FF650F]" />
                      Atendimento Direto
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#FF650F]" />
                      Porto Alegre & Todo o Brasil
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SEÇÃO: DEPOIMENTOS
          ==================================================== */}
      <section id="depoimentos" className="py-24 border-b border-white/[0.08] relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho com subtítulo abaixo do título */}
          <div className="max-w-3xl mb-16 space-y-4">
            <Badge variant="orange" className="font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              O que dizem nossos clientes
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
              A confiança e o relacionamento que construímos com cada parceiro é o nosso maior patrimônio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Estrelas & Aspas */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-[#FF650F]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FF650F]" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#FF650F]/30" />
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-zinc-400">
                      {t.role} • <span className="text-[#FF650F] font-medium">{t.company}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 rounded bg-white/5">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
