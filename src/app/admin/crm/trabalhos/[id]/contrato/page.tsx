"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Printer,
  ArrowLeft,
  Share2,
  FileCheck,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
  Scale,
  ExternalLink,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ContratoPrestacaoServicosPage({ params }: Props) {
  const { id } = use(params);
  const { toast } = useToast();
  const [lead, setLead] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [manualWaMeUrl, setManualWaMeUrl] = useState<string | null>(null);

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
      console.error("Erro ao carregar contrato:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDispatchWhatsApp = async () => {
    try {
      setIsSendingWhatsApp(true);
      setStatusMsg("");
      const res = await fetch(`/api/v1/crm/leads/${id}/dispatch-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contract" }),
      });
      const data = await res.json();
      if (data.success) {
        const destPhone = data.recipientPhone ? `+${data.recipientPhone}` : (lead?.contactPhone || "");
        if (data.wacliSuccess) {
          const successMsg = `Contrato disparado com sucesso via WhatsApp para ${data.clientName || "cliente"} (${destPhone})!`;
          setStatusMsg(successMsg);
          toast.success(successMsg, "Envio Automático Concluído", 6500);

          if (data.isSelf) {
            toast.info(
              "Atenção: O número do cliente destinatário é o mesmo que está pareado na plataforma.",
              "Envio para Número Conectado",
              5000
            );
          }
        } else {
          const warnMsg = `O robô não conseguiu entregar via WhatsApp (${data.wacliError || "serviço desconectado"}). Você pode abrir manualmente no WhatsApp Web pelo botão ao lado.`;
          setStatusMsg(warnMsg);
          toast.warning(warnMsg, "Envio Automático Indisponível", 7000);
        }

        if (data.waMeUrl) {
          setManualWaMeUrl(data.waMeUrl);
        }
      } else {
        toast.error(data.error || "Falha ao enviar contrato", "Falha no Envio");
      }
    } catch {
      toast.error("Erro ao conectar com o serviço de envio.", "Falha de Conexão");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0E0F12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF650F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">Gerando Minuta Contratual Dinâmica...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0E0F12] p-4">
        <div className="text-center space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Trabalho não localizado</h2>
          <Link href="/admin/crm">
            <Button variant="outline">Voltar ao CRM</Button>
          </Link>
        </div>
      </div>
    );
  }

  const doc = settings?.documents || {};
  const company = settings?.company || {};
  const client = lead.customer || {};
  const helper = lead.helper || null;

  const budgetCodeFormatted = lead.budgetCode ? `[${lead.budgetCode}]` : "[3000]";
  const clientName = client.companyName || client.tradeName || client.fullName || lead.contactName;
  const clientPhone = lead.contactPhone || client.whatsapp || client.phone || "Não informado";
  const clientDoc = client.documentNumber || "Não informado";
  const clientAddress = client.street
    ? `${client.street}, ${client.number || "S/N"}${client.complement ? ` - ${client.complement}` : ""} - ${
        client.neighborhood || ""
      }, ${client.city || ""}/${client.state || ""}`
    : "Conforme endereço cadastrado";

  const totalValueFormatted = formatCurrency(Number(lead.estimatedValue || 0));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0E0F12] py-8 px-4 sm:px-6 print:p-0 print:bg-white text-zinc-900 dark:text-white">
      {/* BARRA SUPERIOR DE AÇÕES (OCULTA NA IMPRESSÃO) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/admin/crm"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#FF650F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Funil CRM</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-[#18191E]"
          >
            <Printer className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span>Imprimir / Salvar PDF</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDispatchWhatsApp}
            isLoading={isSendingWhatsApp}
            className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Disparar WhatsApp</span>
          </Button>

          {manualWaMeUrl && (
            <a
              href={manualWaMeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp Web</span>
            </a>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="max-w-4xl mx-auto mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* DOCUMENTO CONTRATO EM FORMATO FOLHA A4 */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#18191E] print:bg-white print:text-black rounded-3xl print:rounded-none border border-black/[0.08] dark:border-white/[0.08] print:border-none shadow-xl print:shadow-none p-8 sm:p-12 space-y-8 font-serif">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-6 font-sans">
          <div className="space-y-1">
            {doc.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.logoUrl}
                alt="Logo da Empresa"
                className="h-12 w-auto object-contain mb-2"
              />
            ) : (
              <h2 className="text-xl font-black text-zinc-900 dark:text-white print:text-black">
                {doc.companyTradeName || company.tradeName || "Glessios Comunicação Visual"}
              </h2>
            )}
            <p className="text-xs text-zinc-500 print:text-zinc-600">
              {doc.companyLegalName || company.legalName || "Glessios Comunicação Visual Ltda"} • CNPJ:{" "}
              {doc.cnpj || company.cnpj || "00.000.000/0001-00"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF650F] print:text-black block">
              Contrato de Prestação de Serviços
            </span>
            <span className="text-lg font-black font-mono text-zinc-900 dark:text-white print:text-black block">
              Ref. {budgetCodeFormatted}
            </span>
          </div>
        </div>

        {/* TÍTULO FORMAL */}
        <div className="text-center space-y-2 py-2">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white print:text-black">
            Instrumento Particular de Prestação de Serviços de Comunicação Visual
          </h1>
          <p className="text-xs text-zinc-500 print:text-zinc-600 font-sans">
            Orçamento Vinculado: <span className="font-mono font-bold">{budgetCodeFormatted}</span> • Obra:{" "}
            <span className="font-bold">{lead.title}</span>
          </p>
        </div>

        {/* QUALIFICAÇÃO DAS PARTES */}
        <div className="text-xs leading-relaxed space-y-4 text-justify text-zinc-800 dark:text-zinc-200 print:text-black font-sans">
          <p>
            Pelo presente instrumento particular, de um lado:
          </p>
          <p className="pl-4 border-l-2 border-[#FF650F]">
            <strong>CONTRATADA:</strong>{" "}
            <strong>{doc.companyLegalName || company.legalName || "Glessios Comunicação Visual Ltda"}</strong>, pessoa
            jurídica de direito privado, inscrita no CNPJ sob nº{" "}
            <strong>{doc.cnpj || company.cnpj || "00.000.000/0001-00"}</strong>, com sede em{" "}
            {doc.address || "Curitiba - PR"}, {doc.city || "Curitiba"}/{doc.state || "PR"}, doravante denominada
            simplesmente <strong>CONTRATADA</strong>;
          </p>
          <p>E, de outro lado:</p>
          <p className="pl-4 border-l-2 border-zinc-400">
            <strong>CONTRATANTE:</strong> <strong>{clientName}</strong>, inscrito(a) no CPF/CNPJ sob o nº{" "}
            <strong>{clientDoc}</strong>, com endereço em {clientAddress}, telefone de contato {clientPhone}, doravante
            denominado(a) simplesmente <strong>CONTRATANTE</strong>;
          </p>
          <p>Têm, entre si, justo e acordado o presente contrato, mediante as cláusulas a seguir:</p>
        </div>

        {/* CLÁUSULAS */}
        <div className="text-xs leading-relaxed space-y-5 text-justify text-zinc-800 dark:text-zinc-200 print:text-black font-sans">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
              CLÁUSULA PRIMEIRA – DO OBJETO
            </h4>
            <p>
              O presente contrato tem como objeto o fornecimento, confecção, acabamento e instalação técnica referente
              ao projeto <strong>{lead.title}</strong>, de acordo com o memorial descritivo especificado a seguir:
            </p>
            <div className="mt-2 p-3 rounded-xl bg-zinc-50 dark:bg-[#14151B] print:bg-zinc-50 border border-black/[0.04] dark:border-white/[0.06] font-mono text-[11px] whitespace-pre-wrap">
              {lead.notes || "Execução integral conforme projeto técnico aprovado."}
              {"\n"}• Voltagem no Local: {lead.voltage || "Bivolt (110V/220V)"}
              {"\n"}• Especificação de Pintura: {lead.paintDetails || "Pintura PU / Industrial"}
              {"\n"}• Logística / Frete: {lead.freightDetails || "Incluso com entrega e montagem"}
              {helper && `\n• Auxiliar Técnico Responsável: ${helper.fullName || helper.tradeName}`}
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
              CLÁUSULA SEGUNDA – DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
            </h4>
            <p>
              Pela prestação dos serviços e fornecimento dos materiais avençados, a CONTRATANTE pagará à CONTRATADA o
              valor total de <strong>{totalValueFormatted}</strong>, conforme as condições comerciais pactuadas na
              proposta {budgetCodeFormatted}.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
              CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DAS PARTES
            </h4>
            <p>
              <strong>I – Da CONTRATADA:</strong> Executar os serviços em conformidade com as boas práticas de
              engenharia visual, empregar ferramentas e insumos apropriados ({Array.isArray(lead.tools) && lead.tools.length > 0 ? lead.tools.join(", ") : "padrão de montagem"}), cumprir o cronograma estipulado e zelar pela segurança das instalações.
            </p>
            <p className="mt-1">
              <strong>II – Da CONTRATANTE:</strong> Garantir livre acesso ao local da instalação, disponibilizar o ponto
              de energia elétrica compatível ({lead.voltage || "110V/220V"}) e aprovar os layouts digitais prévios.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
              CLÁUSULA QUARTA – DA GARANTIA
            </h4>
            <p>
              A CONTRATADA oferece garantia de <strong>{doc.defaultWarrantyMonths || 12} meses</strong> sobre os
              serviços e estruturas executadas, contados da entrega definitiva da obra, cessando em casos de intervenção
              indevida de terceiros ou sinistros decorrentes de caso fortuito/força maior.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
              CLÁUSULA QUINTA – DO FORO
            </h4>
            <p>
              Para dirimir quaisquer dúvidas oriundas deste instrumento, as partes elegem o Foro da Comarca de{" "}
              <strong>{doc.contractDefaultJurisdiction || `${doc.city || "Curitiba"}/${doc.state || "PR"}`}</strong>,
              com exclusão de qualquer outro.
            </p>
          </div>

          {doc.contractGeneralClauses && (
            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
              <h4 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black mb-1">
                DISPOSIÇÕES ESPECÍFICAS COMPLEMENTARES
              </h4>
              <p className="whitespace-pre-wrap">{doc.contractGeneralClauses}</p>
            </div>
          )}
        </div>

        {/* ASSINATURAS */}
        <div className="pt-12 font-sans">
          <p className="text-center text-xs text-zinc-500 print:text-zinc-600 mb-10">
            {doc.city || "Curitiba"} - {doc.state || "PR"}, {new Date().toLocaleDateString("pt-BR")}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-center text-xs">
            <div className="space-y-1">
              <div className="border-t border-black/40 dark:border-white/40 print:border-black/60 pt-2" />
              <p className="font-bold text-zinc-900 dark:text-white print:text-black">
                {doc.companyLegalName || "Glessios Comunicação Visual Ltda"}
              </p>
              <p className="text-[11px] text-zinc-500 print:text-zinc-600 font-mono">
                CONTRATADA • CNPJ: {doc.cnpj || "00.000.000/0001-00"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="border-t border-black/40 dark:border-white/40 print:border-black/60 pt-2" />
              <p className="font-bold text-zinc-900 dark:text-white print:text-black">{clientName}</p>
              <p className="text-[11px] text-zinc-500 print:text-zinc-600 font-mono">
                CONTRATANTE • CPF/CNPJ: {clientDoc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
