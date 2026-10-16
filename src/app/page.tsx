import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSculpture } from "@/components/home/hero-sculpture";
import { HeroRotatingWord } from "@/components/home/hero-rotating-word";
import { SolutionsIntroSection } from "@/components/home/solutions-intro-section";
import { AboutMissionSection } from "@/components/home/about-mission-section";
import { PortfolioGallery } from "@/components/home/portfolio-gallery";
import { ActionAreasSection } from "@/components/home/action-areas-section";
import { MainServicesSection } from "@/components/home/main-services-section";
import { TeamTestimonialsSection } from "@/components/home/team-testimonials-section";
import { QuoteBookingForm } from "@/components/home/quote-booking-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#121316] text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* ====================================================
            1. HERO SECTION (COPY DA HERO 100% INALTERADA)
            ==================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#121316] text-white border-b border-white/[0.08]">
          {/* Vídeo Cinematográfico de Fundo */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50 animate-hero-atmosphere"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/9618368/9618368-uhd_2732_1440_25fps.mp4" type="video/mp4" />
          </video>

          {/* Overlays de Fusão e Leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121316]/95 via-[#121316]/75 to-[#121316]/45 pointer-events-none z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121316]/85 via-transparent to-[#121316] pointer-events-none z-[1]" />

          {/* Suave iluminação quente de fundo */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-orange-500/15 blur-[130px] rounded-full pointer-events-none z-[1]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Coluna de Texto & Proposta de Valor com Coreografia de Entrada */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
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
                    <span className="inline-block animate-hero-headline-2">
                      para <HeroRotatingWord />
                    </span>
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-300 font-normal max-w-xl leading-relaxed animate-hero-supporting">
                  Nosso trabalho é pensar em soluções, deixe-nos te ajudar!
                </p>

                {/* CTAs de Conversão com microinterações */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto animate-hero-cta">
                  <Link href="/#contato" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto gap-3 font-bold text-base shadow-lg">
                      Solicitar Orçamento Exclusivo
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/#portfolio" className="w-full sm:w-auto">
                    <Button variant="dark-secondary" size="lg" className="w-full sm:w-auto text-base">
                      Explorar Portfólio
                    </Button>
                  </Link>
                </div>

                {/* Métricas e Selos de Confiança */}
                <div className="pt-8 grid grid-cols-3 gap-6 w-full border-t border-white/10 mt-2 animate-hero-metrics">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">+12 Anos</span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Expertise fabril</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#FF650F] font-mono">+1.800</span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Obras entregues</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">100% ART</span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">Engenharia e NR-35</p>
                  </div>
                </div>
              </div>

              {/* Coluna da Escultura Metálica Interativa */}
              <div className="lg:col-span-5 flex items-center justify-center animate-hero-sculpture">
                <HeroSculpture />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            2. NÓS TEMOS A SOLUÇÃO QUE VOCÊ PROCURA
            ==================================================== */}
        <SolutionsIntroSection />

        {/* ====================================================
            3. SOBRE NÓS, VÍDEO INSTITUCIONAL & MISSÃO/VISÃO/VALORES
            ==================================================== */}
        <AboutMissionSection />

        {/* ====================================================
            4. NOSSO PORTFOLIO
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
            7. NOSSA EQUIPE & DEPOIMENTOS
            ==================================================== */}
        <TeamTestimonialsSection />

        {/* ====================================================
            8. ENTRE EM CONTATO & FORMULÁRIO (ORÇAMENTO)
            ==================================================== */}
        <section id="orcamento" className="py-24 bg-[#0E0F11] border-t border-white/[0.08] relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <QuoteBookingForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
