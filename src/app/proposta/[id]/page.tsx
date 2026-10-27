"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Printer,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  Calendar,
  Zap,
  Wrench,
  Truck,
  Paintbrush,
  User,
  ExternalLink,
  Download,
  Building,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PropostaPublicaClientePage({ params }: Props) {
  const { id } = use(params);
  const [lead, setLead] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leadRes, settingsRes] = await Promise.all([
        fetch(`/api/v1/crm/leads/${id}`),
        fetch(`/api/v1/settings`),
      ]);

      const leadData = await leadRes.json();
      const settingsData = await settingsRes.json();

      if (leadData.success) {
        setLead(leadData.lead);
      }
      if (settingsData.success) {
        setSettings(settingsData.settings);
      }
    } catch (err) {
      console.error("Erro ao carregar proposta comercial:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0E0F12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF650F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">Carregando Proposta Comercial Icthus...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0E0F12] p-4">
        <div className="text-center space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Proposta não localizada</h2>
          <p className="text-xs text-zinc-500">Este link pode ter expirado ou o código do serviço foi atualizado.</p>
          <Link href="/portal/login">
            <Button variant="outline" className="rounded-xl">Acessar Portal do Cliente</Button>
          </Link>
        </div>
      </div>
    );
  }

  const doc = settings?.documents || {};
  const company = settings?.company || {};
  const client = lead.customer || {};

  const budgetCodeFormatted = lead.budgetCode ? `[${lead.budgetCode}]` : "[3000]";
  const clientName = client.companyName || client.tradeName || client.fullName || lead.contactName;
  const clientPhone = lead.contactPhone || client.whatsapp || client.phone || "Não informado";
  const clientEmail = lead.contactEmail || client.email || "Não informado";
  const clientDoc = client.documentNumber || "Não informado";

  const whatsappLink = `https://wa.me/55${(doc.whatsapp || company.whatsapp || "41998243990").replace(/\D/g, "")}?text=Ol%C3%A1%2C+recebi+a+proposta+comercial+${encodeURIComponent(budgetCodeFormatted)}+do+projeto+${encodeURIComponent(lead.title)}+e+gostaria+de+falar+com+a+equipe+Icthus.`;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0E0F12] py-8 px-4 sm:px-6 print:p-0 print:bg-white text-zinc-900 dark:text-white">
      {/* BARRA SUPERIOR DE AÇÕES PARA O CLIENTE */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            Proposta Comercial Oficial &bull; {doc.companyTradeName || "Icthus Soluções & Design"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-[#18191E] rounded-xl"
          >
            <Printer className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span>Imprimir / Salvar PDF</span>
          </Button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Falar no WhatsApp</span>
          </a>

          <Link
            href="/portal/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#FF650F] text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <span>Portal do Cliente</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF650F]" />
          </Link>
        </div>
      </div>

      {/* DOCUMENTO PROPOSTA EM FORMATO FOLHA A4 */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#18191E] print:bg-white print:text-black rounded-3xl print:rounded-none border border-black/[0.08] dark:border-white/[0.08] print:border-none shadow-xl print:shadow-none p-8 sm:p-12 space-y-8">
        {/* CABEÇALHO DO DOCUMENTO COM LOGOMARCA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
          <div className="space-y-2">
            {doc.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.logoUrl}
                alt="Logo da Empresa"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF650F] flex items-center justify-center text-white font-black text-xl shadow-md">
                  I
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white print:text-black">
                    {doc.companyTradeName || company.tradeName || "Icthus Soluções & Design"}
                  </h1>
                  <p className="text-xs text-zinc-500 print:text-zinc-600">
                    Comunicação Visual, Fachadas & Engenharia de Marca
                  </p>
                </div>
              </div>
            )}
            <div className="text-[11px] text-zinc-500 print:text-zinc-600 space-y-0.5">
              <p>
                <span className="font-semibold">Razão Social:</span>{" "}
                {doc.companyLegalName || company.legalName || "Icthus Comunicação Visual Ltda"}
              </p>
              <p>
                <span className="font-semibold">CNPJ:</span> {doc.cnpj || company.cnpj || "45.123.456/0001-78"}
                {doc.stateRegistration ? ` | IE: ${doc.stateRegistration}` : ""}
              </p>
              <p>
                {doc.address || company.address || "Rua das Indústrias, 1024 - CIC"} -{" "}
                {doc.city || company.city || "Curitiba"}/{doc.state || company.state || "PR"}
              </p>
              <p>
                Tel/WhatsApp: {doc.whatsapp || company.whatsapp || "(41) 99824-3990"} | E-mail:{" "}
                {doc.email || company.email || "contato@icthusbrasil.com"}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-orange-500/5 dark:bg-orange-500/10 print:bg-zinc-100 p-4 rounded-2xl border border-orange-500/20 print:border-zinc-300">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] print:text-black block">
              Proposta Comercial
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-white print:text-black block mt-0.5">
              {budgetCodeFormatted}
            </span>
            <div className="text-[11px] text-zinc-500 print:text-zinc-600 mt-2 space-y-0.5">
              <p>
                <span className="font-semibold">Emissão:</span> {formatDate(lead.createdAt || new Date())}
              </p>
              <p>
                <span className="font-semibold">Validade:</span> {doc.proposalValidityDays || 15} dias
              </p>
            </div>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/[0.02] dark:bg-white/[0.02] print:bg-transparent p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] print:border-zinc-200">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Cliente / Destinatário
            </h3>
            <p className="text-base font-bold text-zinc-900 dark:text-white print:text-black">
              {clientName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-600 mt-0.5">
              CPF/CNPJ: {clientDoc}
            </p>
            {client.city && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                {client.street ? `${client.street}, ${client.number || "s/n"} - ` : ""}
                {client.city}/{client.state || "PR"}
              </p>
            )}
          </div>

          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-600 md:text-right">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Contatos
            </h3>
            <p>Telefone: {clientPhone}</p>
            <p>E-mail: {clientEmail}</p>
            {lead.dueDate && (
              <p className="text-[#FF650F] font-semibold mt-1">
                Previsão de Instalação: {formatDate(lead.dueDate)}
              </p>
            )}
          </div>
        </div>

        {/* TÍTULO E ESPECIFICAÇÕES DO PROJETO */}
        <div className="space-y-4">
          <div className="border-l-4 border-[#FF650F] pl-4">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white print:text-black">
              {lead.title}
            </h2>
            {lead.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-700 mt-1">
                {lead.description}
              </p>
            )}
          </div>

          {/* DADOS TÉCNICOS ADICIONAIS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {lead.voltage && (
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Voltagem</span>
                </div>
                <p className="text-xs font-bold mt-1 text-zinc-900 dark:text-white print:text-black">
                  {lead.voltage}
                </p>
              </div>
            )}

            {lead.structureType && (
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                  <Wrench className="w-3 h-3 text-blue-500" />
                  <span>Estrutura</span>
                </div>
                <p className="text-xs font-bold mt-1 text-zinc-900 dark:text-white print:text-black">
                  {lead.structureType}
                </p>
              </div>
            )}

            {lead.finishing && (
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                  <Paintbrush className="w-3 h-3 text-purple-500" />
                  <span>Acabamento</span>
                </div>
                <p className="text-xs font-bold mt-1 text-zinc-900 dark:text-white print:text-black">
                  {lead.finishing}
                </p>
              </div>
            )}

            {lead.installationAddress && (
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                  <Truck className="w-3 h-3 text-emerald-500" />
                  <span>Instalação</span>
                </div>
                <p className="text-xs font-bold mt-1 text-zinc-900 dark:text-white print:text-black truncate" title={lead.installationAddress}>
                  {lead.installationAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* TABELA DE VALORES */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
            Composição Comercial
          </h3>
          <div className="overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.04] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Item / Discriminação</th>
                  <th className="py-3 px-4 text-center">Unid.</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                <tr>
                  <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-white print:text-black">
                    Fabricação, Montagem e Acabamento: {lead.title}
                    {lead.notes && (
                      <span className="block text-[11px] font-normal text-zinc-500 print:text-zinc-600 mt-1">
                        {lead.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center text-zinc-500">1 serv.</td>
                  <td className="py-4 px-4 text-right font-black font-mono text-zinc-900 dark:text-white print:text-black text-sm">
                    {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMO DE VALOR E CONDIÇÕES */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20">
          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="font-semibold text-zinc-900 dark:text-white">Condições Gerais:</p>
            <p>&bull; Garantia de fábrica: {doc.defaultWarrantyMonths || 12} meses.</p>
            <p>&bull; Validade da proposta: {doc.proposalValidityDays || 15} dias.</p>
            {doc.pixKey && (
              <p>&bull; Chave PIX Oficial ({doc.pixKeyType || "CNPJ"}): <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{doc.pixKey}</span></p>
            )}
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Investimento Total
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#FF650F] block">
              {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Sob Consulta"}
            </span>
          </div>
        </div>

        {/* NOTAS DE RODAPÉ E CHANCELA */}
        <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08] text-[11px] text-zinc-500 space-y-2">
          <p>
            {doc.proposalFooterNotes ||
              "Proposta sujeita a aprovação técnica e cadastral. Instalação e frete inclusos conforme especificações deste orçamento."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-zinc-400">
            <p>&copy; {new Date().getFullYear()} Icthus Comunicação Visual. Todos os direitos reservados.</p>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Documento Oficial com Validação Digital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
