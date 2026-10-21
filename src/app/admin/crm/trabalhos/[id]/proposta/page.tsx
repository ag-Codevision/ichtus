"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Printer,
  ArrowLeft,
  Share2,
  Sparkles,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  Zap,
  Wrench,
  Truck,
  Paintbrush,
  User,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PropostaComercialPage({ params }: Props) {
  const { id } = use(params);
  const [lead, setLead] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

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
      console.error("Erro ao carregar proposta:", err);
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
      const res = await fetch(`/api/v1/crm/leads/${id}/dispatch-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "budget" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Proposta disparada com sucesso via WhatsApp!");
        if (data.waMeUrl) {
          window.open(data.waMeUrl, "_blank");
        }
      } else {
        alert(data.error || "Falha ao disparar mensagem");
      }
    } catch (err: any) {
      alert("Erro ao conectar com o serviço de envio");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0E0F12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF650F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">Montando Proposta Comercial Inteligente...</p>
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
  const clientEmail = lead.contactEmail || client.email || "Não informado";
  const clientDoc = client.documentNumber || "Não informado";

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
            <span>Imprimir / Gerar PDF</span>
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
        </div>
      </div>

      {statusMsg && (
        <div className="max-w-4xl mx-auto mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF650F] flex items-center justify-center text-white font-black text-xl">
                  G
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white print:text-black">
                    {doc.companyTradeName || company.tradeName || "Glessios Comunicação Visual"}
                  </h1>
                  <p className="text-xs text-zinc-500 print:text-zinc-600">
                    Engenharia de Fachadas & Comunicação Visual
                  </p>
                </div>
              </div>
            )}
            <div className="text-[11px] text-zinc-500 print:text-zinc-600 space-y-0.5">
              <p>
                <span className="font-semibold">Razão Social:</span>{" "}
                {doc.companyLegalName || company.legalName || "Glessios Comunicação Visual Ltda"}
              </p>
              <p>
                <span className="font-semibold">CNPJ:</span> {doc.cnpj || company.cnpj || "00.000.000/0001-00"}
                {doc.stateRegistration ? ` | IE: ${doc.stateRegistration}` : ""}
              </p>
              <p>
                {doc.address || company.address || "Curitiba - PR"} -{" "}
                {doc.city || company.city || "Curitiba"}/{doc.state || company.state || "PR"}
              </p>
              <p>
                Tel/WhatsApp: {doc.whatsapp || company.whatsapp || "(41) 99999-9999"} | E-mail:{" "}
                {doc.email || company.email || "contato@glessios.com.br"}
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
                <span className="font-semibold">Validade:</span> {doc.proposalValidityDays || 15} dias corridos
              </p>
            </div>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#14151B] print:bg-zinc-50 border border-black/[0.04] dark:border-white/[0.06] print:border-zinc-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#FF650F]" />
            Dados do Cliente / Solicitante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Cliente / Razão Social:</span>
              <span className="font-bold text-zinc-900 dark:text-white print:text-black">{clientName}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">CPF / CNPJ:</span>
              <span className="font-mono text-zinc-900 dark:text-white print:text-black">{clientDoc}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Pessoa de Contato:</span>
              <span className="font-medium text-zinc-900 dark:text-white print:text-black">
                {lead.contactName}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">WhatsApp / Telefone:</span>
              <span className="font-mono text-zinc-900 dark:text-white print:text-black">{clientPhone}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">E-mail:</span>
              <span className="text-zinc-900 dark:text-white print:text-black">{clientEmail}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Local da Instalação / Obra:</span>
              <span className="text-zinc-900 dark:text-white print:text-black">
                {client.street ? `${client.street}, ${client.number || "S/N"}` : "A definir com o cliente"}
              </span>
            </div>
          </div>
        </div>

        {/* ESCOPO DO PROJETO E SERVIÇO */}
        <div className="space-y-4">
          <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white print:text-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF650F]" />
              Escopo Técnico do Trabalho
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-[#FF650F] print:border print:border-zinc-300">
              {lead.title}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 print:text-black whitespace-pre-wrap leading-relaxed">
            {lead.notes || "Fabricação e montagem de comunicação visual especializada sob medida."}
          </div>
        </div>

        {/* ESPECIFICAÇÕES TÉCNICAS DE CAMPO E INSTALAÇÃO */}
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#14151B] print:bg-zinc-50 border border-black/[0.04] dark:border-white/[0.06] print:border-zinc-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#FF650F]" />
            Especificações de Campo, Recursos & Logística
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-[#18191E] print:bg-white border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Voltagem no Local
              </span>
              <span className="font-bold text-zinc-900 dark:text-white print:text-black mt-1 block">
                {lead.voltage || "Bivolt (110V / 220V)"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#18191E] print:bg-white border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                <Paintbrush className="w-3 h-3 text-blue-500" /> Tinta & Acabamento
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white print:text-black mt-1 block">
                {lead.paintDetails || "Pintura PU / Industrial"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#18191E] print:bg-white border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-500" /> Frete & Transporte
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white print:text-black mt-1 block">
                {lead.freightDetails || "Incluso com entrega no local"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#18191E] print:bg-white border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                <User className="w-3 h-3 text-purple-500" /> Ajudante Auxiliar
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white print:text-black mt-1 block">
                {helper ? helper.fullName || helper.tradeName : "Equipe Interna Especializada"}
              </span>
            </div>
          </div>

          {/* Checklist de Ferramentas / Recursos */}
          {Array.isArray(lead.tools) && lead.tools.length > 0 && (
            <div className="pt-2">
              <span className="text-zinc-400 block text-[11px] mb-2 font-semibold">
                Ferramentas e Insumos Mobilizados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lead.tools.map((tool: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#18191E] print:bg-white border border-black/[0.06] dark:border-white/[0.08] text-[11px] font-medium text-zinc-700 dark:text-zinc-300 print:text-black"
                  >
                    ✓ {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VALORES E CONDIÇÕES COMERCIAIS */}
        <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="text-xs text-zinc-500 print:text-zinc-600 space-y-1 max-w-md">
            <p className="font-bold text-zinc-900 dark:text-white print:text-black">
              Condições Gerais de Faturamento:
            </p>
            <p>• Pagamento via PIX ({doc.pixKey || "Chave informada na fatura"}) ou Boleto Bancário.</p>
            <p>• Garantia estrutural e elétrica de {doc.defaultWarrantyMonths || 12} meses.</p>
            <p>• Prazo de produção iniciado a partir da aprovação final do layout digital.</p>
          </div>

          <div className="text-right p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 print:bg-zinc-100 border border-orange-500/20 print:border-zinc-300 w-full sm:w-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 print:text-zinc-600 block">
              Investimento Total
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#FF650F] print:text-black block mt-1">
              {formatCurrency(Number(lead.estimatedValue || 0))}
            </span>
          </div>
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-6 text-[11px] text-zinc-400 print:text-zinc-500 text-center space-y-1">
          <p>{doc.proposalFooterNotes || "Agradecemos pela oportunidade e confiança em nossos serviços."}</p>
          <p className="font-mono">
            {doc.companyLegalName || "Glessios Comunicação Visual"} • Documento gerado eletronicamente em{" "}
            {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
