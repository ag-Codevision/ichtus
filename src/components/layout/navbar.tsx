"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      const element = document.querySelector(hash);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#121316]/95 backdrop-blur-md border-b border-white/[0.08] py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          : "bg-[#121316]/75 backdrop-blur-sm py-4 border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group py-1" aria-label="Glessios Soluções Visuais">
          <Image
            src="/logo-web.png"
            alt="Glessios Soluções Visuais"
            width={180}
            height={40}
            priority
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Links Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/#solucoes"
            onClick={(e) => handleNavClick(e, "#solucoes")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Soluções
          </Link>
          <Link
            href="/#sobre"
            onClick={(e) => handleNavClick(e, "#sobre")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Sobre Nós
          </Link>
          <Link
            href="/#portfolio"
            onClick={(e) => handleNavClick(e, "#portfolio")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Portfólio
          </Link>
          <Link
            href="/#atuacao"
            onClick={(e) => handleNavClick(e, "#atuacao")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Áreas de Atuação
          </Link>
          <Link
            href="/#servicos"
            onClick={(e) => handleNavClick(e, "#servicos")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Serviços
          </Link>
          <Link
            href="/#contato"
            onClick={(e) => handleNavClick(e, "#contato")}
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors"
          >
            Contato
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-slate-300 hover:text-[#FF650F] transition-colors flex items-center gap-1.5"
          >
            Blog
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF650F] animate-pulse" />
          </Link>
        </nav>

        {/* Ações */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/portal/login" className="group">
            <Button
              variant="outline-dark"
              size="sm"
              className="gap-2 rounded-full px-4 text-xs font-semibold text-zinc-200 border-white/15 bg-white/[0.04] hover:bg-[#FF650F]/15 hover:border-[#FF650F]/50 hover:text-white transition-all duration-200 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-[#FF650F] transition-transform duration-200 group-hover:scale-110" />
              <span>Portal do Cliente</span>
            </Button>
          </Link>
        </div>


      </div>

      {/* Barra de Progresso de Scroll Cinematográfica Ultrafina */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#FF650F] via-amber-400 to-[#FF650F] transition-all duration-100 ease-out pointer-events-none"
        style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 0.5 ? 1 : 0 }}
      />

    </header>
  );
}
