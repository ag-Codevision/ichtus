"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Handshake,
  Truck,
  Palette,
  Compass,
  Kanban,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const ACTION_AREAS = [
  {
    icon: Globe,
    title: "PRODUTOS WEB",
    description:
      "Mantenha-se visível no ambiente digital! Uma boa vitrine digital pode abrir mais portas do que você imagina. Oferecemos diversas soluções para ajudá-los a marcar presença no mundo digital.",
    tag: "Presença Digital",
  },
  {
    icon: Handshake,
    title: "PARCERIAS",
    description:
      "Não se preocupe, se precisar de algum produto ou serviço que não esteja em nosso catálogo, ficaremos felizes em indicar algum de nossos parceiros de confiança.",
    tag: "Rede Homologada",
  },
  {
    icon: Truck,
    title: "PRODUÇÃO E ENTREGA",
    description:
      "Entregamos produtos acabados e com mão de obra incluída, o máximo de comodidade para você e para sua empresa. Tudo em um só lugar, menos dor de cabeça e mais tempo para o que é necessário.",
    tag: "Chave na Mão",
  },
  {
    icon: Palette,
    title: "CRIAÇÃO E DESENVOLVIMENTO",
    description:
      "Se você vai começar um novo negócio ou está precisando modernizar sua marca, conte conosco para criar tudo... desde a nova logo, até as peças necessárias para os materiais de rotina, papelaria, sinalização etc.",
    tag: "Branding & Peças",
  },
  {
    icon: Compass,
    title: "CONSULTORIA",
    description:
      "Oferecemos consultoria em assuntos relacionados à imagem de seu negócio, comunicação visual, padronização de identidade visual, sinalização Interna e Externa. Soluções é nossa especialidade!",
    tag: "Estratégia Visual",
  },
  {
    icon: Kanban,
    title: "GERENCIAMENTO DE PROJETOS",
    description:
      "Nossa equipe pode ajudar a gerenciar seu novo projeto de comunicação visual, novas lojas, novas filiais, franquias, trabalhos que exijam cuidados com os padrões estabelecidos pela franquiadora ou pelo manual da marca.",
    tag: "Expansão & Franquias",
  },
];

import { SpotlightCard } from "@/components/ui/spotlight-card";

export function ActionAreasSection() {
  return (
    <section id="atuacao" className="py-24 bg-[#121316] border-b border-white/[0.08] relative scroll-mt-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho com subtítulo abaixo do título */}
        <div className="max-w-3xl mb-16 space-y-4">
          <Badge variant="orange" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Áreas de atuação
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Como podemos te ajudar?
          </h2>
          <p className="text-base text-zinc-400 max-w-2xl leading-relaxed pt-1">
            Estrutura completa para atender às suas necessidades, desde a concepção de marca e web até a fabricação, logística e instalação final.
          </p>
        </div>

        {/* Grid com os 6 cards de áreas de atuação com Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTION_AREAS.map((area, idx) => {
            const Icon = area.icon;
            return (
              <SpotlightCard
                key={idx}
                isDark={true}
                className="p-8 rounded-3xl bg-[#18191D] border border-white/[0.08] flex flex-col justify-between group hover:border-[#FF650F]/50 hover:shadow-xl transition-all duration-300 h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center group-hover:bg-[#FF650F] transition-all duration-300">
                      <Icon className="w-6 h-6 text-[#FF650F] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider text-[#FF650F] uppercase font-mono px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                      {area.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-[#FF650F] transition-colors">
                    {area.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {area.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                  <Link
                    href="/#orcamento"
                    className="text-xs font-bold text-zinc-300 group-hover:text-[#FF650F] flex items-center gap-1.5 transition-colors"
                  >
                    Consultar esta área
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
