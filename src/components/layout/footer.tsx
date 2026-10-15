import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-glessios-charcoal border-t border-glessios-border-dark pt-16 pb-12 text-glessios-text-body">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-glessios-border-dark">
          {/* Coluna 1: Marca & Visão */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Link href="/" className="inline-block group py-1" aria-label="ICTHUS Soluções e Design">
              <Image
                src="/logo-web.png"
                alt="ICTHUS Soluções e Design"
                width={200}
                height={44}
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-glessios-text-body max-w-sm leading-relaxed">
              Engenharia visual e manufatura de alto padrão para empresas que exigem destaque. Fachadas estruturadas, letreiros luminosos e sinalização corporativa de impacto.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-glessios-text-body">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Fábrica Operando em Capacidade Plena
              </span>
            </div>
          </div>

          {/* Coluna 2: Soluções */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-glessios-text-heading">
              Soluções
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#solucoes" className="hover:text-glessios-orange transition-colors">
                  Fachadas em ACM
                </Link>
              </li>
              <li>
                <Link href="/#solucoes" className="hover:text-glessios-orange transition-colors">
                  Letreiros Luminosos LED
                </Link>
              </li>
              <li>
                <Link href="/#solucoes" className="hover:text-glessios-orange transition-colors">
                  Corte CNC Router & Laser
                </Link>
              </li>
              <li>
                <Link href="/#solucoes" className="hover:text-glessios-orange transition-colors">
                  Impressão Digital UV
                </Link>
              </li>
              <li>
                <Link href="/#solucoes" className="hover:text-glessios-orange transition-colors">
                  Envelopamento de Frotas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Plataforma & Acessos */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-glessios-text-heading">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/portal/login" className="hover:text-glessios-orange transition-colors flex items-center gap-1">
                  Portal do Cliente
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-glessios-orange transition-colors">
                  Painel de Gestão ERP
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-glessios-orange transition-colors">
                  Blog de Tendências IA
                </Link>
              </li>
              <li>
                <Link href="/#orcamento" className="hover:text-glessios-orange transition-colors">
                  Solicitação de Visita Técnica
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato & Localização */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-glessios-text-heading">
              Contato Direto
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-glessios-orange shrink-0 mt-0.5" />
                <span>Curitiba e Região Metropolitana — PR</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-glessios-orange shrink-0" />
                <span>(41) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-glessios-orange shrink-0" />
                <span>contato@icthus.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Inferior de Direitos & Assinatura */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-glessios-text-body/80 gap-4">
          <p>© {new Date().getFullYear()} ICTHUS Soluções e Design. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/portal/login" className="hover:text-glessios-orange transition-colors">
              Portal do Cliente
            </Link>
            <span className="text-glessios-border-dark">•</span>
            <Link href="/admin/login" className="hover:text-glessios-orange transition-colors">
              Acesso Administrativo
            </Link>
            <span className="text-glessios-border-dark">•</span>
            <span className="text-glessios-orange font-mono">Plataforma v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
