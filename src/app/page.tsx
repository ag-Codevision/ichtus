import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { SolutionsIntroSection } from "@/components/home/solutions-intro-section";
import { AboutMissionSection } from "@/components/home/about-mission-section";
import { ActionAreasSection } from "@/components/home/action-areas-section";
import { MainServicesSection } from "@/components/home/main-services-section";
import { CMSProvider } from "@/components/cms/cms-provider";
import { CMSFloatingToolbar } from "@/components/cms/cms-floating-toolbar";
import { CMSHeroMediaModal } from "@/components/cms/cms-hero-media-modal";
import { CMSContactModal } from "@/components/cms/cms-contact-modal";
import { CMSPortfolioModal } from "@/components/cms/cms-portfolio-modal";

// Dynamic imports para seções com carregamento sob demanda
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
    <CMSProvider>
      <div className="min-h-screen flex flex-col bg-[#121316] text-zinc-100 transition-colors relative">
        {/* Barra Flutuante de Controle On-Page (ativa somente para Administrador em modo de edição) */}
        <CMSFloatingToolbar />

        {/* Modais do CMS */}
        <CMSHeroMediaModal />
        <CMSContactModal />
        <CMSPortfolioModal />

        <Navbar />

        <main className="flex-grow pt-20">
          {/* ====================================================
              1. HERO SECTION (100% EDITÁVEL COM 3D PROTEGIDO)
              ==================================================== */}
          <HeroSection />

          {/* ====================================================
              2. NÓS TEMOS A SOLUÇÃO QUE VOCÊ PROCURA (CRUD DE CARDS)
              ==================================================== */}
          <SolutionsIntroSection />

          {/* ====================================================
              3. SOBRE NÓS, VÍDEO & MISSÃO/VISÃO/VALORES
              ==================================================== */}
          <AboutMissionSection />

          {/* ====================================================
              4. NOSSO PORTFÓLIO (CRUD DE PROJETOS E CATEGORIAS)
              ==================================================== */}
          <PortfolioGallery />

          {/* ====================================================
              5. ÁREAS DE ATUAÇÃO (CRUD DE CARDS)
              ==================================================== */}
          <ActionAreasSection />

          {/* ====================================================
              6. PRINCIPAIS SERVIÇOS (CRUD DE CARDS)
              ==================================================== */}
          <MainServicesSection />

          {/* ====================================================
              7. NOSSA EQUIPE & DEPOIMENTOS (CRUD DE CARDS)
              ==================================================== */}
          <TeamTestimonialsSection />

          {/* ====================================================
              8. ENTRE EM CONTATO & FORMULÁRIO (CONTATOS GLOBAIS)
              ==================================================== */}
          <section id="orcamento" className="py-24 bg-[#0E0F11] border-t border-white/[0.08] relative scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <QuoteBookingForm />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </CMSProvider>
  );
}
