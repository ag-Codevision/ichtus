import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0E0F11] text-zinc-400 border-t border-white/[0.08] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Coluna 1: Marca & Visão */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Link href="/" className="inline-block group py-1" aria-label="Glessios Soluções Visuais">
              <Image
                src="/logo-web.png"
                alt="Glessios Soluções Visuais"
                width={180}
                height={40}
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
              />
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Nosso trabalho é pensar em soluções, deixe-nos te ajudar. Atendimento exclusivo, com inovação e modernidade para cada cliente.
            </p>
            <p className="text-xs font-serif italic text-zinc-300">
              « Não existem clientes ou trabalhos pequenos, cada cliente é único e especial! »
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Atendimento Ativo — Porto Alegre & Todo o Brasil
              </span>
            </div>
          </div>

          {/* Coluna 2: Soluções */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Soluções
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#portfolio" className="hover:text-[#FF650F] transition-colors">
                  Design & Marcas
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#FF650F] transition-colors">
                  Letreiros Luminosos
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#FF650F] transition-colors">
                  Placas & Painéis
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#FF650F] transition-colors">
                  Quadros & Troféus
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#FF650F] transition-colors">
                  Fachadas Comerciais
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="hover:text-[#FF650F] transition-colors">
                  Consultoria & Gerenciamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Navegação */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#solucoes" className="hover:text-[#FF650F] transition-colors">
                  Nossas Soluções
                </Link>
              </li>
              <li>
                <Link href="/#sobre" className="hover:text-[#FF650F] transition-colors">
                  Sobre Nós & Valores
                </Link>
              </li>
              <li>
                <Link href="/#atuacao" className="hover:text-[#FF650F] transition-colors">
                  Áreas de Atuação
                </Link>
              </li>
              <li>
                <Link href="/#equipe" className="hover:text-[#FF650F] transition-colors">
                  Nossa Equipe
                </Link>
              </li>
              <li>
                <Link href="/#depoimentos" className="hover:text-[#FF650F] transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="/portal/login" className="hover:text-[#FF650F] transition-colors flex items-center gap-1">
                  Portal do Cliente
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato Direto */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Entre em Contato
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                <span>
                  Rua Buenos Aires, 437 / 203<br />
                  Jardim Botânico / Porto Alegre / RS<br />
                  CEP: 90670-130 / Brasil
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF650F] shrink-0" />
                <a href="https://wa.me/5551981192976" className="hover:text-[#FF650F] transition-colors">
                  +55 51 98119.2976 (w)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF650F] shrink-0" />
                <a href="tel:+555135746167" className="hover:text-[#FF650F] transition-colors">
                  55 51 3574.6167
                </a>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF650F] shrink-0" />
                  <a href="mailto:glessios@hotmail.com" className="hover:text-[#FF650F] transition-colors">
                    glessios@hotmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF650F] shrink-0" />
                  <a href="mailto:glessios@gmail.com" className="hover:text-[#FF650F] transition-colors">
                    glessios@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center justify-center text-center gap-3 text-xs text-zinc-500">
          <p className="text-zinc-400">
            Criado com 💜 por{" "}
            <a
              href="https://agenciacodevision.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-[#FF650F] transition-colors font-semibold underline underline-offset-2"
            >
              Agência Codevision
            </a>{" "}
            © {new Date().getFullYear()} Icthus • Soluções e Design. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-500">
            <Link href="/portal/login" className="hover:text-[#FF650F] transition-colors">
              Portal do Cliente
            </Link>
            <span>•</span>
            <Link href="/glessios/login" className="hover:text-[#FF650F] transition-colors">
              Acesso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
