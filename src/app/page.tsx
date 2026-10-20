import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSculpture } from "@/components/home/hero-sculpture";
import { HeroRotatingWord } from "@/components/home/hero-rotating-word";
import { HeroParallaxContainer } from "@/components/home/hero-parallax-container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SolutionsIntroSection } from "@/components/home/solutions-intro-section";
import { AboutMissionSection } from "@/components/home/about-mission-section";
import { ActionAreasSection } from "@/components/home/action-areas-section";
import { MainServicesSection } from "@/components/home/main-services-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

// Dynamic imports para seções abaixo da dobra (Below the Fold) com SSR ativo
// Otimiza o bundle inicial do JavaScript sem causar layout shift
const PortfolioGallery = dynamic(
  () => import("@/components/home/portfolio-gallery").then((mod) => mod.PortfolioGallery),
  { ssr: true }
);

const TeamTestimonialsSection = dynamic(
  () => import("@/components/home/team-testimonials-section").then((mod) => mod.TeamTestimonialsSection),
  { ssr: true }
);

const QuoteBookingForm = dynamic(
  () => import("@/components/home/quote-booking-form").then((mod) => mod.QuoteBookingForm),
  { ssr: true }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#121316] text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* ====================================================
            1. HERO SECTION (EXPERIÊNCIA CINEMATOGRÁFICA INTERATIVA)
            ==================================================== */}
        <HeroParallaxContainer className="overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#121316] text-white border-b border-white/[0.08]">
          {/* Vídeo Cinematográfico de Fundo Otimizado (Preload sob demanda para não bloquear rede inicial) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50 animate-hero-atmosphere"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>

          {/* Overlays de Fusão e Leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121316]/95 via-[#121316]/75 to-[#121316]/45 pointer-events-none z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121316]/85 via-transparent to-[#121316] pointer-events-none z-[1]" />

          {/* Suave iluminação quente com resposta ao cursor */}
          <div
            className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-orange-500/15 blur-[130px] rounded-full pointer-events-none z-[1] will-change-transform"
            style={{
              transform: "translate3d(var(--parallax-x-inv, 0px), var(--parallax-y-inv, 0px), 0)",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Coluna de Texto & Proposta de Valor com Coreografia de Entrada */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 relative z-20 pointer-events-auto">
                <div className="animate-hero-badge">
                  <Badge variant="orange" className="py-1 px-3.5 text-xs font-semibold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF650F]" />
                    Você veio ao lugar certo!
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                  <span className="block overflow-hidden py-0.5">
                    <span className="inline-block animate-hero-headline-1">
                      Soluções criativas
                    </span>
                  </span>
                  <span className="block py-0.5">
                    <span className="inline-flex items-baseline gap-x-3 animate-hero-headline-2">
                      <span className="leading-none">para</span>
                      <HeroRotatingWord />
                    </span>
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-300 font-normal max-w-xl leading-relaxed animate-hero-supporting">
                  Nosso trabalho é pensar em soluções, deixe-nos te ajudar!
                </p>

                {/* CTAs de Conversão com microinterações Magnéticas */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto animate-hero-cta">
                  <MagneticButton strength={0.2} className="w-full sm:w-auto">
                    <Link href="/#contato" className="w-full sm:w-auto block">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto gap-3 font-bold text-base shadow-lg">
                        Solicitar Orçamento Exclusivo
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.12} className="w-full sm:w-auto">
                    <Link href="/#portfolio" className="w-full sm:w-auto block">
                      <Button variant="dark-secondary" size="lg" className="w-full sm:w-auto text-base">
                        Explorar Portfólio
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>

                {/* Métricas e Selos de Confiança com Contadores Dinâmicos */}
                <div className="pt-8 grid grid-cols-3 gap-6 w-full border-t border-white/10 mt-2 animate-hero-metrics">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      <AnimatedCounter to={12} prefix="+" suffix=" Anos" duration={1600} />
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Expertise fabril</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#FF650F] font-mono">
                      <AnimatedCounter to={1800} prefix="+" suffix="" duration={2000} />
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Obras entregues</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      <AnimatedCounter to={100} prefix="" suffix="% ART" duration={1500} />
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Engenharia e NR-35</p>
                  </div>
                </div>
              </div>

              {/* Coluna da Escultura Metálica Interativa com Parallax Suave (60 FPS puros) */}
              <div
                className="lg:col-span-5 flex items-center justify-center animate-hero-sculpture will-change-transform relative z-10 pointer-events-auto"
                style={{
                  transform: "translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0)",
                  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <HeroSculpture />
              </div>
            </div>
          </div>
        </HeroParallaxContainer>

        {/* ====================================================
            2. NÓS TEMOS A SOLUÇÃO QUE VOCÊ PROCURA
            ==================================================== */}
        <SolutionsIntroSection />

        {/* ====================================================
            3. SOBRE NÓS, VÍDEO INSTITUCIONAL & MISSÃO/VISÃO/VALORES
            ==================================================== */}
        <AboutMissionSection />

        {/* ====================================================
            4. NOSSO PORTFOLIO (CARREGAMENTO DINÂMICO OTIMIZADO)
            ==================================================== */}
        <PortfolioGallery />

        {/* ====================================================
            5. ÁREAS DE ATUAÇÃO (COMO PODEMOS TE AJUDAR?)
            ==================================================== */}
        <ActionAreasSection />

        {/* ====================================================
            6. PRINCIPAIS SERVIÇOS (DESIGN, PRODUÇÃO, CONSULTORIA, DESENVOLVIMENTO)
            ==================================================== */}
        <MainServicesSection />

        {/* ====================================================
            7. NOSSA EQUIPE & DEPOIMENTOS (CARREGAMENTO DINÂMICO OTIMIZADO)
            ==================================================== */}
        <TeamTestimonialsSection />

        {/* ====================================================
            8. ENTRE EM CONTATO & FORMULÁRIO (ORÇAMENTO)
            ==================================================== */}
        <section id="orcamento" className="py-24 bg-[#0E0F11] border-t border-white/[0.08] relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuoteBookingForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
