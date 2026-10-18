"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface ServiceOrderProposal {
  id: string;
  code: string;
  title: string;
  description: string | null;
  currentStage: string;
  deadline: string | null;
  installationDate: string | null;
  totalAmount: number;
  discount: number;
  netAmount: number;
  createdAt: string;
  customer: {
    tradeName: string | null;
    companyName: string | null;
    documentNumber?: string | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    user: { name: string; phone: string | null; email: string };
  };
  items: Array<{
    id: string;
    description: string;
    unit: string;
    quantity: number;
    widthMeters: number | null;
    heightMeters: number | null;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function PropostaComercialPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<ServiceOrderProposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/production/orders/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error("Erro ao carregar proposta da OS:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-glessios-dark flex items-center justify-center text-white text-sm">
        Carregando proposta comercial...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-glessios-dark flex flex-col items-center justify-center text-white gap-4 p-6 text-center">
        <h2 className="text-xl font-bold">Ordem de Serviço ou Proposta não encontrada</h2>
        <Button onClick={() => router.back()} variant="outline" className="text-white border-white/20">
          Voltar
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const validityDate = new Date(order.createdAt);
  validityDate.setDate(validityDate.getDate() + 15);

  return (
    <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 font-sans p-4 md:p-8 print:p-0 print:bg-white transition-colors">
      {/* Barra de Ações Superior (Oculta na Impressão) - M3 Expressive Card */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Painel
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={handlePrint}
            className="bg-orange-gradient hover:opacity-95 text-white text-xs font-bold gap-2 px-4 rounded-full shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>

      {/* Documento A4 Executivo */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-zinc-200 print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* Cabeçalho da Empresa */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b-2 border-zinc-900 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-white text-2xl">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-zinc-900">GLESSIOS</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF650F] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  Comunicação Visual
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                Fachadas Comerciais em ACM • Letreiros Luminosos • Router CNC & Laser
              </p>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-zinc-600 space-y-0.5 font-mono">
            <p className="font-bold text-zinc-900 text-sm">Glessios Comunicação Visual Ltda.</p>
            <p>CNPJ: 48.291.802/0001-44</p>
            <p>Rua da Indústria, 850 — Polo Industrial — Cascavel/PR</p>
            <p>WhatsApp: (45) 99824-3321 • contato@glessios.com.br</p>
          </div>
        </header>

        {/* Informações da Proposta & Dados do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 pb-8 border-b border-zinc-200 text-xs">
          {/* Dados do Cliente */}
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF650F] block mb-2">
              Cliente Contratante
            </span>
            <h4 className="text-base font-bold text-zinc-900 mb-1">
              {order.customer.tradeName || order.customer.companyName || order.customer.user.name}
            </h4>
            {order.customer.documentNumber && (
              <p className="font-mono text-zinc-600 mb-1">CPF/CNPJ: {order.customer.documentNumber}</p>
            )}
            <p className="text-zinc-600">
              Responsável: <span className="font-semibold text-zinc-800">{order.customer.user.name}</span>
            </p>
            <p className="text-zinc-600">Telefone: {order.customer.user.phone || "Não informado"}</p>
            {(order.customer.street || order.customer.city) && (
              <p className="text-zinc-600 mt-1">
                Endereço: {order.customer.street ? `${order.customer.street}, ${order.customer.number || "S/N"}` : ""}
                {order.customer.city ? ` — ${order.customer.city}/${order.customer.state || "PR"}` : ""}
              </p>
            )}
          </div>

          {/* Dados da Proposta / Ordem de Serviço */}
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF650F] block mb-2">
                Identificação do Orçamento
              </span>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-lg font-black text-zinc-900">
                  {order.code}
                </span>
                <span className="text-[11px] font-bold bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded">
                  Status: Proposta Aprovada
                </span>
              </div>
              <p className="font-semibold text-zinc-800 mb-2">{order.title}</p>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-zinc-600 border-t border-zinc-200 pt-3">
              <div className="flex justify-between">
                <span>Data de Emissão:</span>
                <span className="font-bold text-zinc-800">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Validade da Proposta:</span>
                <span className="font-bold text-zinc-800">{formatDate(validityDate)} (15 dias)</span>
              </div>
              <div className="flex justify-between">
                <span>Previsão de Instalação:</span>
                <span className="font-bold text-zinc-800">
                  {order.deadline ? formatDate(order.deadline) : "12 dias úteis pós-aprovação"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Memorial Descritivo & Itens de Fabricação */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF650F]" />
            Especificações Técnicas dos Itens Fabricados
          </h3>

          <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden">
            <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px]">
              <tr className="border-b border-zinc-200">
                <th className="py-2.5 px-3">Item / Memorial Técnico</th>
                <th className="py-2.5 px-3 text-center">Dimensões (L x A)</th>
                <th className="py-2.5 px-3 text-center">Qtd</th>
                <th className="py-2.5 px-3 text-right">Valor Unitário</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500">
                    Projeto executivo global conforme memorial arquitetônico aprovado.
                  </td>
                </tr>
              ) : (
                order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-3">
                      <span className="font-bold text-zinc-900 block">{item.description}</span>
                      <span className="text-[10px] text-zinc-500">
                        Usinagem de precisão em Router CNC, dobras estruturais e acabamento refinado
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {item.widthMeters && item.heightMeters
                        ? `${item.widthMeters}m x ${item.heightMeters}m`
                        : "Conforme Projeto"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-600">
                      {formatCurrency(Number(item.unitPrice))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      {formatCurrency(Number(item.totalPrice))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totalizadores e Condições de Pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 pb-8 border-b border-zinc-200">
          {/* Condições Comerciais & Pagamento */}
          <div className="space-y-3 text-xs text-zinc-600">
            <h4 className="font-bold text-zinc-900 uppercase text-xs tracking-wider">
              Condições de Pagamento & Execução
            </h4>
            <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/60 space-y-2">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                <span>
                  <strong>Forma Padrão:</strong> 50% de entrada no aceite da proposta + 50% na conclusão da instalação.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                <span>
                  <strong>PIX Oficial:</strong> Chave CNPJ: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">48.291.802/0001-44</code>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF650F] shrink-0 mt-0.5" />
                <span>
                  <strong>Prazo Fabril:</strong> 12 a 15 dias úteis a partir da aprovação da maquete digital de arte.
                </span>
              </p>
            </div>
          </div>

          {/* Totais do Orçamento */}
          <div className="bg-zinc-100 p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
            <div className="space-y-2 font-mono text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal dos Itens:</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Desconto Comercial Concedido:</span>
                  <span>- {formatCurrency(Number(order.discount))}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-zinc-300 pt-3 mt-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-zinc-500 block">Valor Total do Projeto</span>
                <span className="text-2xl font-black text-zinc-900 font-mono">
                  {formatCurrency(Number(order.netAmount || order.totalAmount))}
                </span>
              </div>
              <span className="text-xs font-bold text-[#FF650F] bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
                Instalação Inclusa
              </span>
            </div>
          </div>
        </div>

        {/* Termo de Garantia Estrutural & Iluminação */}
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-10 text-[11px] text-zinc-600 space-y-1">
          <h5 className="font-bold text-zinc-900 flex items-center gap-1.5 uppercase text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Certificado de Garantia Glessios
          </h5>
          <p>
            • <strong>Estrutura Metálica e ACM:</strong> 24 (vinte e quatro) meses contra delaminação, descoloração precoce e defeitos estruturais.
          </p>
          <p>
            • <strong>Componentes Elétricos & LEDs:</strong> 12 (doze) meses para módulos LED e fontes chaveadas blindadas com proteção IP67/IP68.
          </p>
        </div>

        {/* Campos de Assinatura */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-zinc-200 text-center text-xs">
          <div>
            <div className="border-b border-zinc-400 pb-1 mb-2 h-12" />
            <p className="font-bold text-zinc-900">Glessios Comunicação Visual</p>
            <p className="text-[11px] text-zinc-500">Diretoria Técnica de Projetos</p>
          </div>
          <div>
            <div className="border-b border-zinc-400 pb-1 mb-2 h-12" />
            <p className="font-bold text-zinc-900">
              {order.customer.tradeName || order.customer.user.name}
            </p>
            <p className="text-[11px] text-zinc-500">De Acordo / Assinatura do Contratante</p>
          </div>
        </div>
      </div>
    </div>
  );
}
