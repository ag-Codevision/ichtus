import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Server,
  Clock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  Printer,
  Building2,
  Phone,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieManageButton } from "./cookie-manage-button";

export const metadata: Metadata = {
  title: "Política de Privacidade & Proteção de Dados LGPD | ICTHUS Soluções e Design",
  description:
    "Conheça a Política de Privacidade e Proteção de Dados da ICTHUS Soluções e Design, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PoliticaPrivacidadePage() {
  const lastUpdate = "7 de Novembro de 2026";
  const version = "1.0";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C0D] text-zinc-200">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        {/* ========================================================
            HERO HEADER INSTITUCIONAL
            ======================================================== */}
        <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#121316] via-[#0E0F11] to-[#0B0C0D] py-14 sm:py-20">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FF650F_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Navegação Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Início
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-[#FF650F]">Institucional & Legal</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-300">Política de Privacidade</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF650F]/10 border border-[#FF650F]/30 text-[#FF650F] text-xs font-semibold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-4 h-4" />
              Conformidade LGPD • Lei nº 13.709/2018
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Política de Privacidade & Proteção de Dados
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
              Transparência, integridade e segurança no tratamento dos seus dados pessoais. Conheça detalhadamente como a{" "}
              <strong className="text-zinc-200 font-semibold">ICTHUS Soluções e Design</strong> coleta, utiliza, armazena e protege suas informações.
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
              <span className="text-zinc-700">•</span>
              <div>
                <span className="text-zinc-500">Vigência:</span>{" "}
                <span className="text-emerald-400 font-semibold">Ativa e Vigente</span>
              </div>
              <div className="ml-auto">
                <CookieManageButton />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CORPO DO DOCUMENTO LEGAL
            ======================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* Caixa de Destaque Rápido */}
          <div className="mb-12 p-6 rounded-2xl bg-[#141518] border border-white/[0.1] shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-[#FF650F]" />
              Resumo dos Nossos Compromissos de Privacidade
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Coletamos apenas dados estritamente necessários para orçamentos e projetos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Jamais vendemos ou alugamos</strong> dados pessoais a terceiros.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cookies opcionais só são ativados com a sua expressa autorização.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Você pode alterar ou revogar consentimentos a qualquer momento.</span>
              </li>
            </ul>
          </div>

          <article className="prose prose-invert prose-orange max-w-none space-y-12 text-zinc-300 leading-relaxed text-sm sm:text-base">
            {/* SEÇÃO 1 */}
            <div id="secao-1" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">1</span>
                Identificação do Controlador de Dados
              </h2>
              <p className="mt-4">
                Para fins da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - &quot;LGPD&quot;), o agente controlador responsável pelas decisões referentes ao tratamento de dados pessoais coletados neste site e em nossos canais de atendimento é:
              </p>
              <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">Razão Social:</span>
                  <strong className="text-white">Icthus Soluções & Design Visual Ltda</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">Nome Fantasia:</span>
                  <strong className="text-white">ICTHUS Soluções e Design / Glessios</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">CNPJ:</span>
                  <span className="text-zinc-200">45.123.456/0001-78</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">Sede Administrativa:</span>
                  <span className="text-zinc-200">Rua Buenos Aires, 437 / 203 - Jardim Botânico, Porto Alegre/RS - CEP: 90670-130</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">Atendimento Geral:</span>
                  <span className="text-zinc-200">+55 (51) 98119-2976 | +55 (51) 3574-6167</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-zinc-400">Canal do Encarregado (DPO):</span>
                  <a href="mailto:dpo@icthusbrasil.com" className="text-[#FF650F] hover:underline font-medium">dpo@icthusbrasil.com</a>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2 */}
            <div id="secao-2" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">2</span>
                Princípios que Regem Nossas Operações
              </h2>
              <p className="mt-4">
                O tratamento de dados pessoais realizado pela ICTHUS fundamenta-se estritamente na boa-fé e nos princípios estabelecidos no artigo 6º da LGPD:
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">Finalidade & Adequação</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tratamento realizado apenas para propósitos legítimos, explícitos e informados ao titular.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">Necessidade (Minimização)</h3>
                  <p className="text-xs text-zinc-400 mt-1">Limitação da coleta ao mínimo indispensável para atingir as finalidades do projeto.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">Segurança & Prevenção</h3>
                  <p className="text-xs text-zinc-400 mt-1">Adoção contínua de medidas técnicas e organizacionais para impedir acessos não autorizados.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">Transparência & Livre Acesso</h3>
                  <p className="text-xs text-zinc-400 mt-1">Garantia aos titulares de consulta facilitada e gratuita sobre seus dados e a forma de tratamento.</p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3 */}
            <div id="secao-3" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">3</span>
                Dados Coletados e Formas de Coleta
              </h2>
              <p className="mt-4">
                Coletamos dados de três naturezas principais conforme a interação do usuário com nosso ecossistema:
              </p>

              <div className="mt-4 space-y-4">
                <div className="p-5 rounded-2xl bg-[#141518] border border-white/[0.08]">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF650F]" />
                    A. Dados Fornecidos Diretamente pelo Usuário
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside">
                    <li><strong>Formulários de Orçamento e Contato:</strong> Nome completo, e-mail corporativo ou pessoal, telefone/WhatsApp, nome da empresa ou marca, segmento de atuação, endereço da obra/instalação e detalhamento do projeto (fachada ACM, letreiro LED, router CNC, sinalização, etc.).</li>
                    <li><strong>Atendimento via WhatsApp e Mensagens:</strong> Histórico de conversas técnicas, arquivos de logotipos em vetor (.ai, .pdf, .cdr), plantas baixas e fotos do local da fachada.</li>
                    <li><strong>Portal do Cliente:</strong> Nome de usuário, credenciais de acesso autenticadas de forma criptografada (hash bcrypt), propostas aceitas e comprovantes fiscais.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#141518] border border-white/[0.08]">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-400" />
                    B. Dados Coletados Automaticamente (Navegação e Sistema)
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside">
                    <li><strong>Registros de Conexão (Logs de Acesso):</strong> Endereço IP de origem, data e hora da conexão, navegador e sistema operacional utilizado (em cumprimento obrigatório ao Artigo 15 do Marco Civil da Internet - Lei 12.965/2014).</li>
                    <li><strong>Preferências de Interface:</strong> Tema de exibição preferido (modo escuro ou modo claro) e histórico de aceite das políticas de cookies.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4 */}
            <div id="secao-4" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">4</span>
                Finalidades e Bases Legais do Tratamento (Art. 7º da LGPD)
              </h2>
              <p className="mt-4">
                Todo e qualquer tratamento de dados na ICTHUS possui enquadramento expresso em uma das hipóteses autorizativas do artigo 7º da LGPD:
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.1] text-zinc-400 bg-white/[0.02]">
                      <th className="py-3 px-4 font-semibold">Finalidade do Tratamento</th>
                      <th className="py-3 px-4 font-semibold">Categorias de Dados</th>
                      <th className="py-3 px-4 font-semibold">Base Legal (LGPD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Elaboração de propostas comerciais e orçamentos de comunicação visual</td>
                      <td className="py-3 px-4">Nome, WhatsApp, E-mail, Empresa, Detalhes da Fachada</td>
                      <td className="py-3 px-4 text-[#FF650F]">Execução de Contrato e Procedimentos Preliminares (Art. 7º, V)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Execução do projeto, fabricação industrial e instalação em campo</td>
                      <td className="py-3 px-4">Endereço da obra, contato do responsável, dados contratuais</td>
                      <td className="py-3 px-4 text-[#FF650F]">Execução de Contrato (Art. 7º, V)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Emissão de Notas Fiscais e obrigações tributárias legais</td>
                      <td className="py-3 px-4">CNPJ/CPF, Razão Social, Endereço Fiscal</td>
                      <td className="py-3 px-4 text-emerald-400">Cumprimento de Obrigação Legal (Art. 7º, II)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Guarda de logs de acesso do site institucional</td>
                      <td className="py-3 px-4">Endereço IP, data e hora de acesso</td>
                      <td className="py-3 px-4 text-emerald-400">Cumprimento de Obrigação Legal (Marco Civil da Internet)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Métricas anônimas de tráfego e melhoria contínua do site</td>
                      <td className="py-3 px-4">Cookies analíticos e dados agregados de navegação</td>
                      <td className="py-3 px-4 text-sky-400">Consentimento do Titular (Art. 7º, I)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEÇÃO 5 */}
            <div id="secao-5" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">5</span>
                Gestão e Política Detalhada de Cookies
              </h2>
              <p className="mt-4">
                Cookies são pequenos arquivos de texto armazenados no navegador do seu dispositivo que desempenham funções indispensáveis para a usabilidade e segurança. Nosso sistema de consentimento permite a você controle pleno sobre quais categorias autoriza:
              </p>

              {/* Tabela de Cookies */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.1] text-zinc-400 bg-white/[0.02]">
                      <th className="py-3 px-4 font-semibold">Identificador</th>
                      <th className="py-3 px-4 font-semibold">Categoria</th>
                      <th className="py-3 px-4 font-semibold">Finalidade Específica</th>
                      <th className="py-3 px-4 font-semibold">Retenção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#FF650F]">icthus_cookie_consent</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs">Necessário</span></td>
                      <td className="py-3 px-4">Registra o consentimento do titular às categorias de cookies sob a LGPD.</td>
                      <td className="py-3 px-4 text-zinc-400">1 ano</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#FF650F]">glessios-theme</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs">Necessário / Funcional</span></td>
                      <td className="py-3 px-4">Memoriza a preferência de tema visual do visitante (modo claro ou escuro).</td>
                      <td className="py-3 px-4 text-zinc-400">Persistente</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#FF650F]">session_token</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs">Necessário</span></td>
                      <td className="py-3 px-4">Autenticação segura de sessões do Portal do Cliente e Painel Administrativo.</td>
                      <td className="py-3 px-4 text-zinc-400">Sessão</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-zinc-400">_ga / _gid (Opcional)</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 text-xs">Analítico</span></td>
                      <td className="py-3 px-4">Métricas estatísticas anônimas sobre páginas visitadas e tempo de permanência.</td>
                      <td className="py-3 px-4 text-zinc-400">24h a 2 anos</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white text-sm">Deseja alterar suas escolhas de cookies?</h4>
                  <p className="text-xs text-zinc-400">Você pode reconfigurar ou revogar seu consentimento a qualquer instante.</p>
                </div>
                <CookieManageButton label="Abrir Gerenciador de Cookies" />
              </div>
            </div>

            {/* SEÇÃO 6 */}
            <div id="secao-6" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">6</span>
                Compartilhamento Responsável com Terceiros
              </h2>
              <p className="mt-4">
                A ICTHUS <strong className="text-white">não comercializa, não aluga e não transfere</strong> bases de dados pessoais com finalidade econômica. O compartilhamento ocorre exclusivamente para viabilizar as atividades operacionais:
              </p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside">
                <li><strong>Provedores de Infraestrutura e Hospedagem:</strong> Servidores em nuvem de alta segurança e redes isoladas com certificações de segurança internacionais.</li>
                <li><strong>Logística e Montagem Técnica:</strong> Transportadoras e equipes de içamento/montagem de fachadas recebem estritamente as informações necessárias para a entrega no local da obra.</li>
                <li><strong>Instituições Financeiras:</strong> Processamento de faturamento e pagamentos via PIX ou boleto bancário.</li>
                <li><strong>Autoridades Governamentais:</strong> Quando houver determinação legal expressa, ordem judicial ou requisição fundamentada de autoridades fiscalizatórias.</li>
              </ul>
            </div>

            {/* SEÇÃO 7 */}
            <div id="secao-7" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">7</span>
                Segurança da Informação e Armazenamento
              </h2>
              <p className="mt-4">
                Adotamos rígidas medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, incidentes de destruição, perda, alteração ou vazamento:
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <Lock className="w-6 h-6 text-[#FF650F] mx-auto mb-2" />
                  <h4 className="font-semibold text-white text-xs sm:text-sm">Criptografia em Trânsito</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Conexões 100% protegidas por protocolo TLS/HTTPS com chave segura.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white text-xs sm:text-sm">Hash Criptográfico</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Senhas e acessos protegidos por funções de derivação criptográfica (bcrypt).</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <Server className="w-6 h-6 text-sky-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white text-xs sm:text-sm">Containers Isolados</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Ambientes Docker com isolamento e banco de dados fechado para acessos externos.</p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 8 */}
            <div id="secao-8" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">8</span>
                Retenção e Descarte Seguro dos Dados
              </h2>
              <p className="mt-4">
                Os dados pessoais são mantidos pelo tempo estritamente necessário para cumprir as finalidades para as quais foram coletados, observando os prazos legais de retenção:
              </p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside">
                <li><strong>Dados Contratuais e Fiscais:</strong> Armazenados por 5 (cinco) anos após o encerramento do contrato e garantia da obra, conforme artigos 173 e 174 do Código Tributário Nacional e artigo 206 do Código Civil.</li>
                <li><strong>Registros de Conexão IP:</strong> Mantidos sob sigilo por 6 (seis) meses, atendendo ao artigo 15 do Marco Civil da Internet.</li>
                <li><strong>Dados Apoiados em Consentimento:</strong> Descartados ou anonimizados imediatamente após solicitação expressa de revogação por parte do titular.</li>
              </ul>
            </div>

            {/* SEÇÃO 9 */}
            <div id="secao-9" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">9</span>
                Direitos dos Titulares de Dados Pessoais (Art. 18 da LGPD)
              </h2>
              <p className="mt-4">
                Como titular dos seus dados pessoais, você possui os seguintes direitos garantidos por lei, exercíveis mediante solicitação gratuita:
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Confirmação & Acesso:</strong>
                    <p className="text-zinc-400 mt-0.5">Saber se realizamos tratamento e obter cópia dos dados existentes.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Correção de Dados:</strong>
                    <p className="text-zinc-400 mt-0.5">Solicitar a retificação de dados incorretos, inexatos ou desatualizados.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Anonimização ou Bloqueio:</strong>
                    <p className="text-zinc-400 mt-0.5">Para dados excessivos ou em desconformidade com a LGPD.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Portabilidade:</strong>
                    <p className="text-zinc-400 mt-0.5">Transferência dos seus dados para outro prestador de serviço mediante requisição expressa.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Eliminação:</strong>
                    <p className="text-zinc-400 mt-0.5">Exclusão dos dados tratados com base no consentimento, ressalvadas as hipóteses de guarda legal.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Revogação do Consentimento:</strong>
                    <p className="text-zinc-400 mt-0.5">Retirar sua concordância para finalidades específicas a qualquer tempo.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 10 */}
            <div id="secao-10" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">10</span>
                Canal Oficial do Encarregado pelo Tratamento de Dados (DPO)
              </h2>
              <p className="mt-4">
                Para exercer qualquer dos seus direitos ou esclarecer dúvidas sobre esta Política, disponibilizamos um canal exclusivo e direto com o nosso Encarregado de Proteção de Dados (DPO):
              </p>

              <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-[#1A1C20] to-[#121316] border border-[#FF650F]/20 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Encarregado de Proteção de Dados (DPO)</h3>
                    <p className="text-xs text-zinc-400 mt-1">Atendimento de solicitações de titulares e interlocução com a ANPD.</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#FF650F] font-mono">
                      <Mail className="w-4 h-4" />
                      <a href="mailto:dpo@icthusbrasil.com" className="hover:underline font-semibold">dpo@icthusbrasil.com</a>
                    </div>
                  </div>
                  <a
                    href="mailto:dpo@icthusbrasil.com?subject=Solicita%C3%A7%C3%A3o%20LGPD%20-%20Exerc%C3%ADcio%20de%20Direito%20do%20Titular"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5D09] to-[#FA6B17] text-white text-xs font-bold hover:brightness-110 shadow-md transition-all shrink-0"
                  >
                    Enviar Solicitação LGPD
                  </a>
                </div>
                <p className="mt-4 text-[11px] text-zinc-500 border-t border-white/[0.06] pt-3">
                  * As requisições serão respondidas no prazo máximo legal de 15 (quinze) dias a contar da data do requerimento (Artigo 19, inciso II da LGPD), mediante confirmação prévia da identidade do solicitante para prevenir fraudes.
                </p>
              </div>
            </div>

            {/* SEÇÃO 11 */}
            <div id="secao-11" className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF650F]/20 text-[#FF650F] text-xs font-bold flex items-center justify-center">11</span>
                Atualizações desta Política & Foro
              </h2>
              <p className="mt-4">
                Esta Política poderá sofrer atualizações periódicas visando a contínua adequação às normas da Autoridade Nacional de Proteção de Dados (ANPD) e aprimoramento de nossas tecnologias. Eventuais alterações relevantes serão devidamente sinalizadas em nosso portal.
              </p>
              <p className="mt-3">
                Este documento é regido e interpretado segundo a legislação da República Federativa do Brasil. Fica eleito o Foro da Comarca de Porto Alegre, Estado do Rio Grande do Sul, para dirimir eventuais controvérsias decorrentes deste documento.
              </p>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
