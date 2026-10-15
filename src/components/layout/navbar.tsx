"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X, Sparkles, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rola suavemente até o elemento quando a rota carrega com hash (ex: vindo de /blog)
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
    setMobileMenuOpen(false);
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
          ? "bg-glessios-black/90 backdrop-blur-md border-b border-glessios-border-dark py-3.5 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group py-1" aria-label="ICTHUS Soluções e Design">
          <Image
            src="/logo-web.png"
            alt="ICTHUS Soluções e Design"
            width={200}
            height={44}
            priority
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#solucoes"
            onClick={(e) => handleNavClick(e, "#solucoes")}
            className="text-sm font-medium text-glessios-text-body hover:text-white transition-colors"
          >
            Soluções
          </Link>
          <Link
            href="/#portfolio"
            onClick={(e) => handleNavClick(e, "#portfolio")}
            className="text-sm font-medium text-glessios-text-body hover:text-white transition-colors"
          >
            Portfólio
          </Link>
          <Link
            href="/#sobre"
            onClick={(e) => handleNavClick(e, "#sobre")}
            className="text-sm font-medium text-glessios-text-body hover:text-white transition-colors"
          >
            Sobre Nós
          </Link>
          <Link
            href="/#processo"
            onClick={(e) => handleNavClick(e, "#processo")}
            className="text-sm font-medium text-glessios-text-body hover:text-white transition-colors"
          >
            Processo Fabril
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-glessios-text-body hover:text-white transition-colors flex items-center gap-1.5"
          >
            Blog & IA
            <span className="h-1.5 w-1.5 rounded-full bg-glessios-orange animate-pulse" />
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/portal/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4 text-glessios-orange" />
              Portal do Cliente
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile menu trigger & ThemeToggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-glessios-text-heading hover:text-glessios-orange p-2"
            aria-label="Abrir menu móvel"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-glessios-charcoal/95 backdrop-blur-xl border-b border-glessios-border-dark px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Link
            href="/#solucoes"
            onClick={(e) => handleNavClick(e, "#solucoes")}
            className="text-base font-medium text-glessios-text-heading py-2"
          >
            Soluções
          </Link>
          <Link
            href="/#portfolio"
            onClick={(e) => handleNavClick(e, "#portfolio")}
            className="text-base font-medium text-glessios-text-heading py-2"
          >
            Portfólio
          </Link>
          <Link
            href="/#sobre"
            onClick={(e) => handleNavClick(e, "#sobre")}
            className="text-base font-medium text-glessios-text-heading py-2"
          >
            Sobre Nós
          </Link>
          <Link
            href="/#processo"
            onClick={(e) => handleNavClick(e, "#processo")}
            className="text-base font-medium text-glessios-text-heading py-2"
          >
            Processo Fabril
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-glessios-text-heading py-2 flex items-center justify-between"
          >
            Blog de Tendências
            <span className="text-xs bg-glessios-orange/20 text-glessios-orange px-2 py-0.5 rounded-full">
              IA Ativa
            </span>
          </Link>

          <div className="pt-4 border-t border-glessios-border-dark flex flex-col gap-3">
            <Link href="/portal/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center">
                Portal do Cliente
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
