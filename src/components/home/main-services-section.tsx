"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Lightbulb,
  Cog,
  UserCheck,
  Wrench,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    id: "design",
    category: "DESIGN",
    icon: Lightbulb,
    badgeText: "Início de Negócio & Reposicionamento",
    title: "Criação de Marcas e Identidade Visual",
    highlight: "Sua marca criada com responsabilidade",
    paragraphs: [
      "Utilize este serviço se você está iniciando um novo negócio e precisa criar uma marca ou uma identidade visual que represente de forma profissional e moderna o conceito do seu negócio.",
      "Sua marca vai te acompanhar por um longo tempo e é importante que seja criada com responsabilidade.",
      "Buscar ajuda especializada desde o começo é inteligente e geralmente evita dores de cabeça no futuro.",
    ],
    features: [
      "Identidade visual completa e manual de uso",
      "Conceito alinhado com o público-alvo",
      "Arquivos prontos para digital, gráfica e sinalização",
    ],
  },
  {
    id: "producao",
    category: "PRODUÇÃO",
    icon: Cog,
    badgeText: "Temos muito a oferecer !",
    title: "Fabricação e Instalação de Peças Físicas",
    highlight: "Temos muito a oferecer !",
    paragraphs: [
      "Utilize este serviço se você já tem sua marca criada e já tem definidas as peças de que precisa.",
      "Desde itens como a fachada externa ou placas internas até os itens de uso diário, como cartão de visita, folders envelopes, brindes, pastas etc.",
      "Parte do trabalho já foi feita, gostaríamos de ajudar criando peças de qualidade e com materiais adequados para que o padrão de seu negócio se mantenha inalterado. Podemos ajudar na produção e na instalação destas peças.",
    ],
    features: [
      "Fachadas externas e placas de sinalização interna",
      "Materiais impressos de rotina, folders e envelopes",
      "Mão de obra e instalação com acabamento fino",
    ],
  },
  {
    id: "consultoria",
    category: "CONSULTORIA",
    icon: UserCheck,
    badgeText: "Melhor custo benefício",
    title: "Otimização de Custos, Tempo e Execução",
    highlight: "Melhor custo benefício",
    paragraphs: [
      "Oferecemos consultoria para te ajudar a encontrar as melhores soluções dentro de sua realidade ou necessidade.",
      "Caso você já tenha a ideia e precise de alguém para avaliar e sugerir os melhores caminhos, podemos analisar e sugerir adequações para que o resultado final seja o melhor possível.",
      "Nosso objetivo é evitar desperdícios e garantir que o projeto seja executado com a técnica correta desde a primeira tentativa.",
    ],
    features: [
      "Engenharia de valor para redução de custos",
      "Indicação de matérias-primas duráveis e certificadas",
      "Auditoria prévia de viabilidade de instalação",
    ],
  },
  {
    id: "desenvolvimento",
    category: "DESENVOLVIMENTO",
    icon: Wrench,
    badgeText: "Soluções estratégicas na medida para o seu negócio",
    title: "Soluções Estratégicas para o seu Negócio",
    highlight: "Soluções estratégicas na medida para o seu negócio",
    paragraphs: [
      "Este serviço é destinado às situações diversas nas quais o cliente gostaria de receber ajuda estratégica para solucionar um determinado problema, seja relacionado à imagem da empresa, seja para melhorar o local físico e proporcionar uma melhor experiência ao cliente que chega ao local, ou mesmo para auxiliar na busca de novos clientes.",
      "O cliente é o maior patrimônio de seu negócio, queremos ajudar na busca de novos clientes bem como a melhorar a experiência de seu cliente junto à sua empresa.",
    ],
    features: [
      "Diagnóstico de imagem e ponto comercial",
      "Melhoria sensorial e física da experiência do cliente",
      "Estratégia para atração e fidelização contínua",
    ],
  },
];

export function MainServicesSection() {
  return (
    <section id="servicos" className="py-24 bg-[#F8F9FA] border-b border-zinc-200/90 relative scroll-mt-20 text-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Cabeçalho com subtítulo abaixo do título */}
        <div className="max-w-3xl mb-16 space-y-4">
          <Badge variant="orange-light" className="font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Principais Serviços
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            Soluções completas para cada fase do seu projeto
          </h2>
          <p className="text-base text-zinc-600 max-w-2xl leading-relaxed pt-1">
            Desde a criação da marca do zero até a produção fabril, consultoria estratégica e aprimoramento da experiência do cliente.
          </p>
        </div>

        {/* Grid de Serviços em 2 colunas lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;

            return (
              <SpotlightCard
                key={srv.id}
                isDark={false}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md flex flex-col justify-between h-full"
              >
                <div className="space-y-6">
                  {/* Topo: Ícone + Categoria + Destaque */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF650F] group-hover:bg-[#FF650F] group-hover:text-white transition-all shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="orange-light" className="font-mono text-xs uppercase tracking-wider font-bold">
                        {srv.category}
                      </Badge>
                    </div>

                    {srv.highlight && (
                      <span className="text-xs font-semibold text-[#FF650F] bg-orange-50 border border-orange-200/60 rounded-xl px-3 py-1.5 hidden sm:inline-block">
                        ★ {srv.highlight}
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 leading-tight">
                      {srv.title}
                    </h3>
                    {srv.highlight && (
                      <span className="text-xs font-semibold text-[#FF650F] bg-orange-50 border border-orange-200/60 rounded-xl px-2.5 py-1 mt-2 inline-block sm:hidden">
                        ★ {srv.highlight}
                      </span>
                    )}
                  </div>

                  {/* Parágrafos descritivos */}
                  <div className="space-y-2.5">
                    {srv.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm text-zinc-600 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Lista de destaques */}
                  <div className="space-y-2 pt-4 border-t border-zinc-100">
                    {srv.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Ação no Rodapé do Card */}
                <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">
                    Atendimento especializado
                  </span>
                  <Link href="/#contato">
                    <Button variant="secondary" size="sm" className="gap-2 group-hover:border-[#FF650F]/50 group-hover:text-[#FF650F]">
                      Solicitar {srv.category}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
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
