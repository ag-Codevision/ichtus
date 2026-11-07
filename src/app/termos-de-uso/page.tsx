import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Termos de Uso | ICTHUS Soluções e Design",
  description:
    "Termos e Condições de Uso dos serviços, orçamentos e plataformas da ICTHUS Soluções e Design.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermosDeUsoPage() {
  const lastUpdate = "7 de Novembro de 2026";
  const version = "1.0";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C0D] text-zinc-200">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#121316] via-[#0E0F11] to-[#0B0C0D] py-14 sm:py-20">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FF650F_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Início
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-[#FF650F]">Institucional & Legal</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-300">Termos de Uso</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF650F]/10 border border-[#FF650F]/30 text-[#FF650F] text-xs font-semibold uppercase tracking-wider mb-5">
              <FileText className="w-4 h-4" />
              Condições Gerais de Uso
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Termos de Uso & Condições Comerciais
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
              Regras e diretrizes para navegação no site, solicitação de orçamentos e contratação das soluções de comunicação visual e fachadas da{" "}
              <strong className="text-zinc-200 font-semibold">ICTHUS Soluções e Design</strong>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-zinc-400 border-t border-white/[0.08] pt-6">
              <div>
                <span className="text-zinc-500">Versão:</span>{" "}
                <span className="font-semibold text-zinc-300">{version}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div>
                <span className="text-zinc-500">Última atualização:</span>{" "}
                <span className="font-semibold text-zinc-300">{lastUpdate}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <article className="prose prose-invert prose-orange max-w-none space-y-10 text-zinc-300 leading-relaxed text-sm sm:text-base">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08]">
                1. Aceitação dos Termos
              </h2>
              <p className="mt-4">
                Ao acessar e navegar por este website ou solicitar orçamentos por meio de nossos canais digitais, o usuário concorda expressamente com os presentes Termos de Uso e com a nossa{" "}
                <Link href="/politica-de-privacidade" className="text-[#FF650F] hover:underline font-semibold">
                  Política de Privacidade
                </Link>
                . Caso não concorde com qualquer disposição aqui estabelecida, recomendamos que não utilize a plataforma.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08]">
                2. Propriedade Intelectual & Imagens de Projetos
              </h2>
              <p className="mt-4">
                Todo o conteúdo deste website — incluindo textos, fotografias de fachadas, ilustrações 3D, vídeos, marcas, logotipos, designs, códigos-fonte e layouts — é de propriedade exclusiva da ICTHUS Soluções e Design Visual Ltda ou de terceiros que nos autorizaram o uso, estando protegido pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pela Lei de Propriedade Industrial (Lei nº 9.279/1996).
              </p>
              <p className="mt-3">
                É estritamente proibida a reprodução, cópia, distribuição, engenharia reversa ou uso comercial não autorizado de qualquer material contido neste site sem consentimento prévio e por escrito.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08]">
                3. Orçamentos, Propostas e Condições de Fornecimento
              </h2>
              <p className="mt-4">
                As propostas comerciais geradas por nossos sistemas ou canais possuem validade pré-determinada informada no documento (geralmente 15 dias corridos). Os valores de fabricação industrial (ACM, router, chapas galvanizadas, fitas de LED de alta eficiência, etc.) podem sofrer variações de insumos no mercado nacional após o término da validade da proposta.
              </p>
              <p className="mt-3">
                A contratação efetiva dos serviços dá-se mediante assinatura de contrato de prestação de serviços específico ou aceite formal de proposta comercial com ordens de produção emitidas pelo setor técnico.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08]">
                4. Responsabilidades do Usuário
              </h2>
              <p className="mt-4">O usuário obriga-se a:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>Fornecer dados cadastrais verídicos, exatos e atualizados em solicitações de orçamento e no Portal do Cliente.</li>
                <li>Zelar pela confidencialidade de suas senhas de acesso caso possua conta de cliente.</li>
                <li>Não utilizar mecanismos automatizados (bots, scrapers) que possam sobrecarregar a infraestrutura do site.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08]">
                5. Foro e Legislação Aplicável
              </h2>
              <p className="mt-4">
                Os presentes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a solução de quaisquer controvérsias decorrentes destes termos, elege-se o Foro da Comarca de Porto Alegre/RS, com renúncia expressa a qualquer outro.
              </p>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
