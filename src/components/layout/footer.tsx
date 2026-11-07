"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone, Cookie } from "lucide-react";
import { useOptionalCMS } from "@/components/cms/cms-provider";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/cms-defaults";
import { openCookiePreferences } from "@/lib/cookie-consent";

export function Footer() {
  const cms = useOptionalCMS();
  const contact = cms?.data?.contact_info || DEFAULT_CONTACT_CONTENT;
  const about = cms?.data?.about;

  const whatsappLink = `https://wa.me/${contact.whatsapp?.number || "5551981192976"}?text=${encodeURIComponent(
    contact.whatsapp?.defaultMessage || "Olá! Gostaria de saber mais sobre as soluções da Glessios."
  )}`;

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
              {about?.quoteText || "« Não existem clientes ou trabalhos pequenos, cada cliente é único e especial! »"}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {contact.footerNotice || "Atendimento Ativo — Porto Alegre & Todo o Brasil"}
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

          {/* Coluna 4: Contato Direto Centralizado */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Entre em Contato
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                <span>
                  {contact.address?.street}, {contact.address?.number}
                  {contact.address?.complement ? ` / ${contact.address.complement}` : ""}<br />
                  {contact.address?.neighborhood} / {contact.address?.city} / {contact.address?.state}<br />
                  CEP: {contact.address?.zip} / {contact.address?.country}
                </span>
              </div>

              {/* WhatsApp Principal */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF650F] shrink-0" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF650F] transition-colors">
                  {contact.whatsapp?.formatted || "+55 51 98119.2976"} (w)
                </a>
              </div>

              {/* Telefones Secundários */}
              {contact.phones?.map((phone) => (
                <div key={phone.id} className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FF650F] shrink-0" />
                  <a href={`tel:${phone.number}`} className="hover:text-[#FF650F] transition-colors">
                    {phone.formatted}
                  </a>
                </div>
              ))}

              {/* E-mails Dinâmicos */}
              <div className="flex flex-col gap-1 pt-1">
                {contact.emails?.map((mail) => (
                  <div key={mail.id} className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#FF650F] shrink-0" />
                    <a href={`mailto:${mail.email}`} className="hover:text-[#FF650F] transition-colors">
                      {mail.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 border-t border-white/[0.04] mt-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400">
            <Link
              href="/politica-de-privacidade"
              className="hover:text-[#FF650F] transition-colors"
            >
              Política de Privacidade (LGPD)
            </Link>
            <span className="text-zinc-600">•</span>
            <Link
              href="/termos-de-uso"
              className="hover:text-[#FF650F] transition-colors"
            >
              Termos de Uso
            </Link>
            <span className="text-zinc-600">•</span>
            <button
              type="button"
              onClick={() => openCookiePreferences()}
              className="hover:text-[#FF650F] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Cookie className="w-3.5 h-3.5 text-[#FF650F]" />
              Preferências de Cookies
            </button>
          </div>

          <p className="text-zinc-400 text-center sm:text-right">
            Criado com 💜 por{" "}
            <a
              href="https://agenciacodevision.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-[#FF650F] transition-colors font-semibold underline underline-offset-2"
            >
              Agência Codevision
            </a>{" "}
            © {new Date().getFullYear()} Icthus • Soluções e Design.
          </p>
        </div>
      </div>
    </footer>
  );
}
