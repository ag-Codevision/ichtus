import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSculpture } from "@/components/home/hero-sculpture";
import { HeroRotatingWord } from "@/components/home/hero-rotating-word";
import { PortfolioGallery } from "@/components/home/portfolio-gallery";
import { QuoteBookingForm } from "@/components/home/quote-booking-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck,
  Activity,
  Award,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-glessios-black">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* ====================================================
            HERO CINEMATOGRÁFICA (Dark Editorial + Laranja Vibrante)
            ==================================================== */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 border-b border-glessios-border-dark">
          {/* Luz Ambiente de Profundidade */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-glessios-orange/15 blur-[150px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Coluna de Texto & Proposta de Valor */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
                <Badge variant="orange" className="py-1.5 px-4 text-xs font-semibold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-glessios-orange animate-pulse" />
                  Você veio ao lugar certo!
                </Badge>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-glessios-text-heading leading-[1.08]">
                  Soluções criativas para{" "}
                  <span className="block mt-1 sm:mt-0 sm:inline-block">
                    <HeroRotatingWord />
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-glessios-text-body font-normal max-w-xl leading-relaxed">
                  Nosso trabalho é pensar em soluções, deixe-nos te ajudar!
                </p>

                {/* CTAs de Conversão com Microinterações */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                  <Link href="/#orcamento" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto gap-3 group text-base font-bold">
                      Solicitar Orçamento Exclusivo
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/#portfolio" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                      Explorar Portfólio
                    </Button>
                  </Link>
                </div>

                {/* Métricas e Selos de Confiança */}
                <div className="pt-8 grid grid-cols-3 gap-6 w-full border-t border-glessios-border-dark mt-4">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">+12 Anos</span>
                    <p className="text-xs text-glessios-text-body mt-0.5">Expertise fabril</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-glessios-orange font-mono">+1.800</span>
                    <p className="text-xs text-glessios-text-body mt-0.5">Obras entregues</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">100% ART</span>
                    <p className="text-xs text-glessios-text-body mt-0.5">Engenharia e NR-35</p>
                  </div>
                </div>
              </div>

              {/* Coluna da Escultura Metálica Interativa */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <HeroSculpture />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SEÇÃO DE SOLUÇÕES FABRIS (Dark Graphite)
            ==================================================== */}
        <section id="solucoes" className="py-24 bg-glessios-charcoal border-b border-glessios-border-dark scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4 max-w-2xl">
                <Badge variant="graphite" className="text-glessios-orange border-glessios-orange/30">
                  Capacidades Industriais
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-glessios-text-heading">
                  Engenharia e acabamento sem concessões
                </h2>
              </div>
              <p className="text-sm md:text-base text-glessios-text-body max-w-md">
                Parque fabril equipado com maquinário de última geração para corte de alta velocidade, solda estrutural e montagens elétricas duráveis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col justify-between group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-glessios-black border border-glessios-border-dark flex items-center justify-center mb-4 group-hover:border-glessios-orange/50 transition-colors">
                    <Building2 className="w-6 h-6 text-glessios-orange" />
                  </div>
                  <CardTitle>Fachadas Comerciais em ACM</CardTitle>
                  <CardDescription className="pt-2">
                    Revestimentos em alumínio composto (ACM) com tratamento UV, dobras perfeitas e durabilidade arquitetônica de longo prazo contra intempéries.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-glessios-text-body pt-4 border-t border-glessios-border-dark">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Chapas 3mm e 4mm com núcleo mineral
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Estrutura de fixação galvanizada oculta
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between group border-glessios-orange/30 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="orange">Alta Procura</Badge>
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-orange-gradient flex items-center justify-center mb-4 shadow-orange-glow">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Letreiros Caixa & Neon LED</CardTitle>
                  <CardDescription className="pt-2">
                    Letras bloco em inox escovado, acrílico cristal usinado e iluminação traseira indireta com módulos LED de alta luminosidade e baixo consumo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-glessios-text-body pt-4 border-t border-glessios-border-dark">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Fontes blindadas IP67 automáticas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Corte tridimensional laser com acabamento de joia
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-glessios-black border border-glessios-border-dark flex items-center justify-center mb-4 group-hover:border-glessios-orange/50 transition-colors">
                    <Layers className="w-6 h-6 text-glessios-orange" />
                  </div>
                  <CardTitle>Router CNC & Impressão UV</CardTitle>
                  <CardDescription className="pt-2">
                    Usinagem de alta precisão em PVC expandido, MDF e acrílico, combinada a tintas UV ecológicas resistentes a desbotamento solar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-glessios-text-body pt-4 border-t border-glessios-border-dark">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Mesa de corte de grande porte (2x3 metros)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-glessios-orange shrink-0" />
                      Fidelidade cromática Pantone e CMYK estrita
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ====================================================
            GALERIA DINÂMICA DE PROJETOS COM LIGHTBOX
            ==================================================== */}
        <PortfolioGallery />

        {/* ====================================================
            CONTRAPONTO CLARO EDITORIAL (Warm Ivory #F7F5F2)
            Diretriz Fundamental do DESIGN.md
            ==================================================== */}
        <section id="sobre" className="py-24 bg-glessios-ivory text-glessios-text-light-heading scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-glessios-orange-deep">
                  Rigor Operacional & Pontualidade
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-glessios-text-light-heading leading-tight">
                  A única comunicação visual com esteira digital transparente.
                </h2>
                <p className="text-base text-glessios-text-light-body leading-relaxed">
                  Sabemos que atrasos em fachadas adiam inaugurações e geram prejuízos. Por isso desenvolvemos a plataforma integrada ICTHUS: você aprova a prévia digital de arte no smartphone, acompanha a usinagem em tempo real e agenda a equipe técnica com previsibilidade.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-glessios-soft-white border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-glessios-orange/10 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5 text-glessios-orange-deep" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-glessios-text-light-heading">
                        Aprovação de Prova de Arte com 1 Clique
                      </h4>
                      <p className="text-xs text-glessios-text-light-body mt-1">
                        Visualize em 3D, compare medidas exatas e aprove sem precisar trocar dezenas de mensagens informais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-glessios-soft-white border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-glessios-orange/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-glessios-orange-deep" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-glessios-text-light-heading">
                        Agendamento de Instalação Confiável
                      </h4>
                      <p className="text-xs text-glessios-text-light-body mt-1">
                        Equipes próprias com ART de engenharia, andaimes certificados e conformidade rigorosa com normas de segurança (NR-35).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/portal/login">
                    <Button variant="ivory" size="lg" className="gap-2">
                      Conhecer o Portal do Cliente
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Bloco Visual de Produção em Tempo Real (Processo Fabril) */}
              <div id="processo" className="relative scroll-mt-28">
                <div className="rounded-3xl bg-glessios-black p-8 text-white shadow-2xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-sm font-semibold tracking-wide uppercase font-mono">
                        Pipeline Fabril em Tempo Real
                      </span>
                    </div>
                    <Badge variant="orange" className="text-[10px]">
                      OS-2026-0042
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-glessios-text-body">Projeto:</span>
                      <span className="font-semibold text-white">Fachada ACM + Caixa Alta LED</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-glessios-text-body">Status da Produção:</span>
                      <span className="text-glessios-orange font-bold font-mono">CORTE ROUTER CNC</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-orange-gradient h-full w-[65%]" />
                    </div>
                    <div className="flex justify-between text-xs text-glessios-text-body">
                      <span>Briefing</span>
                      <span>Arte</span>
                      <span className="text-glessios-orange font-bold">Corte</span>
                      <span>Montagem</span>
                      <span>Instalação</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-glessios-text-body">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Garantia Estrutural de 5 Anos no ACM
                    </div>
                    <Link href="/#orcamento" className="text-xs text-glessios-orange hover:underline font-semibold">
                      Agendar Medição →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SEÇÃO DE ORÇAMENTO E AGENDAMENTO (Formulário Ativo)
            ==================================================== */}
        <section id="orcamento" className="py-24 bg-glessios-black border-t border-glessios-border-dark relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <QuoteBookingForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
