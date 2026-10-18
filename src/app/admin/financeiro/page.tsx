"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedButton } from "@/components/ui/segmented-button";
import {
  M3StaggerContainer,
  M3StaggerItem,
  M3TabPanel,
} from "@/components/ui/m3-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  code: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentMethod: string | null;
  pixCopyPasteCode: string | null;
  pixQrCodeBase64: string | null;
  isOverdue: boolean;
  customer: {
    tradeName: string | null;
    companyName: string | null;
    documentNumber?: string | null;
    user: { name: string; phone: string | null; email: string };
  };
  serviceOrder: {
    id: string;
    code: string;
    title: string;
    currentStage: string;
  };
}

interface FinancialTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  entryDate: string;
  bankAccount: string | null;
  invoice?: { code: string; customer: { tradeName: string | null; user: { name: string } } } | null;
}

interface DreData {
  grossRevenue: number;
  revenueBreakdown: {
    invoices: number;
    other: number;
  };
  directMaterialCost: number;
  materialCostByCategory: Record<string, number>;
  grossMargin: number;
  grossMarginPercentage: number;
  totalOperatingExpenses: number;
  expensesByCategory: Record<string, number>;
  netOperatingResult: number;
  netMarginPercentage: number;
}

export default function FinanceiroAdminPage() {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "TRANSACTIONS" | "DRE">("INVOICES");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceKpis, setInvoiceKpis] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [txKpis, setTxKpis] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [dre, setDre] = useState<DreData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de modais
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedInvoiceForPix, setSelectedInvoiceForPix] = useState<Invoice | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(false);

  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [serviceOrdersList, setServiceOrdersList] = useState<Array<{ id: string; code: string; title: string; totalAmount: number }>>([]);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    serviceOrderId: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const [newTxModalOpen, setNewTxModalOpen] = useState(false);
  const [entitiesList, setEntitiesList] = useState<any[]>([]);
  const [newTxForm, setNewTxForm] = useState({
    type: "EXPENSE",
    category: "Fornecedores de Insumos",
    description: "",
    amount: "",
    customerId: "",
    bankAccount: "Conta Corrente Principal",
  });
  const [submittingTx, setSubmittingTx] = useState(false);

  const fetchEntities = async () => {
    try {
      const res = await fetch("/api/v1/crm/contacts/search?limit=60");
      const data = await res.json();
      if (data.success) {
        setEntitiesList(data.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar entidades para financeiro:", err);
    }
  };

  // Busca dados de Faturas
  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/v1/finance/invoices");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
        setInvoiceKpis(data.kpis);
      }
    } catch (err) {
      console.error("Erro ao carregar faturas:", err);
    }
  };

  // Busca dados de Transações
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/v1/finance/transactions");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        setTxKpis(data.kpis);
      }
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    }
  };

  // Busca dados de DRE
  const fetchDre = async () => {
    try {
      const res = await fetch("/api/v1/finance/reports/dre");
      const data = await res.json();
      if (data.success) {
        setDre(data.dre);
      }
    } catch (err) {
      console.error("Erro ao carregar DRE:", err);
    }
  };

  // Busca lista de OS para o modal de faturamento
  const fetchServiceOrders = async () => {
    try {
      const res = await fetch("/api/v1/production/orders");
      const data = await res.json();
      if (data.success) {
        setServiceOrdersList(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar OSs:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchInvoices(), fetchTransactions(), fetchDre(), fetchServiceOrders(), fetchEntities()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Abre modal do PIX
  const openPixModal = (inv: Invoice) => {
    setSelectedInvoiceForPix(inv);
    setCopiedPix(false);
    setPixModalOpen(true);
  };

  // Copia o código PIX
  const copyToClipboard = () => {
    if (selectedInvoiceForPix?.pixCopyPasteCode) {
      navigator.clipboard.writeText(selectedInvoiceForPix.pixCopyPasteCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  // Dá baixa manual ou liquidação PIX na fatura
  const handlePayInvoice = async (invoiceId: string) => {
    if (!confirm("Confirmar o recebimento e liquidação desta fatura?")) return;
    try {
      setPayingInvoice(true);
      const res = await fetch(`/api/v1/finance/invoices/${invoiceId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "PIX" }),
      });
      const data = await res.json();
      if (data.success) {
        setPixModalOpen(false);
        await Promise.all([fetchInvoices(), fetchTransactions(), fetchDre()]);
      } else {
        alert(data.error || "Erro ao liquidar fatura");
      }
    } catch (err) {
      console.error("Erro ao liquidar:", err);
    } finally {
      setPayingInvoice(false);
    }
  };

  // Emissão de nova fatura
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceForm.amount || !newInvoiceForm.dueDate) return;

    try {
      setSubmittingInvoice(true);
      const res = await fetch("/api/v1/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoiceForm),
      });
      const data = await res.json();
      if (data.success) {
        setNewInvoiceModalOpen(false);
        setNewInvoiceForm({ serviceOrderId: "", amount: "", dueDate: "", notes: "" });
        await Promise.all([fetchInvoices(), fetchTransactions(), fetchDre()]);
      } else {
        alert(data.error || "Erro ao emitir fatura");
      }
    } catch (err) {
      console.error("Erro ao emitir fatura:", err);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Lançamento de despesa/receita avulsa
  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxForm.description || !newTxForm.amount) return;

    try {
      setSubmittingTx(true);
      const res = await fetch("/api/v1/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTxForm),
      });
      const data = await res.json();
      if (data.success) {
        setNewTxModalOpen(false);
        setNewTxForm({
          type: "EXPENSE",
          category: "Fornecedores de Insumos",
          description: "",
          amount: "",
          customerId: "",
          bankAccount: "Conta Corrente Principal",
        });
        await Promise.all([fetchTransactions(), fetchDre()]);
      } else {
        alert(data.error || "Erro ao salvar transação");
      }
    } catch (err) {
      console.error("Erro ao registrar transação:", err);
    } finally {
      setSubmittingTx(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho - M3 Expressive Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Gestão Financeira & Faturamento
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Faturamento, Cobranças PIX & DRE Fabril
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Controle de contas a receber das OSs, fluxo de caixa diário e apuração da margem operacional.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => setNewTxModalOpen(true)}
            className="border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-xs gap-1.5 h-10 px-4 rounded-full font-semibold transition-all"
          >
            <ArrowDownRight className="w-4 h-4 text-amber-500" />
            Lançar Despesa / Receita
          </Button>
          <Button
            onClick={() => setNewInvoiceModalOpen(true)}
            className="bg-orange-gradient hover:opacity-95 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Emitir Nova Fatura
          </Button>
        </div>
      </div>

      {/* 4 Cards de Métricas Financeiras - M3 Expressive KPI Grid com Entrada Escalonada */}
      <M3StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Faturamento Realizado
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(invoiceKpis.totalPaid)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Faturas liquidadas
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                A Receber (Pendente)
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {formatCurrency(invoiceKpis.totalPending)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Faturas em aberto das OSs
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center text-glessios-orange shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Contas em Atraso
              </span>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(invoiceKpis.totalOverdue)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Vencimento expirado
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>

        <M3StaggerItem>
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between h-full">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Resultado Líquido Fabril
              </span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(dre?.netOperatingResult || txKpis.netBalance)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Margem operacional apurada
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </M3StaggerItem>
      </M3StaggerContainer>

      {/* Abas de Navegação - M3 Segmented Buttons com Indicador Elástico */}
      <div className="w-fit">
        <SegmentedButton<"INVOICES" | "TRANSACTIONS" | "DRE">
          value={activeTab}
          onChange={setActiveTab}
          layoutId="finance-view-tabs"
          options={[
            {
              value: "INVOICES",
              label: "Faturas & Cobranças",
              icon: <Receipt className="w-4 h-4" />,
              count: invoices.length,
            },
            {
              value: "TRANSACTIONS",
              label: "Extrato & Fluxo",
              icon: <DollarSign className="w-4 h-4" />,
              count: transactions.length,
            },
            {
              value: "DRE",
              label: "DRE Gerencial Fabril",
              icon: <FileSpreadsheet className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      {/* Conteúdo das Abas com Transição Fluida M3 Expressive */}
      <M3TabPanel activeKey={activeTab}>
        {/* Conteúdo da Aba 1: Faturas & Cobranças */}
        {activeTab === "INVOICES" && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-1">
          {loading ? (
            <div className="py-24 text-center text-zinc-500 dark:text-zinc-400 text-xs flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
              Carregando faturas...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Nenhuma fatura emitida</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Emita faturas vinculadas às Ordens de Serviço para gerar cobranças PIX automáticas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-5">Código / Status</th>
                    <th className="py-3.5 px-5">Cliente / Contratante</th>
                    <th className="py-3.5 px-5">Ordem de Serviço (OS)</th>
                    <th className="py-3.5 px-5">Vencimento</th>
                    <th className="py-3.5 px-5 text-right">Valor da Fatura</th>
                    <th className="py-3.5 px-5 text-center">Cobrança & Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                            {inv.code}
                          </span>
                          {inv.status === "PAID" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] w-fit font-semibold">
                              Pago em {inv.paidDate ? formatDate(inv.paidDate) : ""}
                            </Badge>
                          ) : inv.isOverdue ? (
                            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] w-fit font-semibold">
                              Vencido ({formatDate(inv.dueDate)})
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] w-fit font-semibold">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {inv.customer.tradeName || inv.customer.companyName || inv.customer.user.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {inv.customer.user.phone || "Cliente Cadastrado"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-glessios-orange font-bold text-[11px]">
                            {inv.serviceOrder.code}
                          </span>
                          <span className="text-zinc-600 dark:text-zinc-300 text-[11px] truncate max-w-xs font-medium">
                            {inv.serviceOrder.title}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`font-mono text-xs ${inv.isOverdue ? "text-red-600 dark:text-red-400 font-bold" : "text-zinc-900 dark:text-white"}`}>
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-black text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(inv.amount)}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => openPixModal(inv)}
                                className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-glessios-orange border border-orange-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                PIX
                              </button>
                              <button
                                onClick={() => handlePayInvoice(inv.id)}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Baixar
                              </button>
                            </>
                          )}

                          <Link
                            href={`/admin/propostas/${inv.serviceOrder.id}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-xs font-medium transition-all flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Proposta
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Extrato Financeiro */}
      {activeTab === "TRANSACTIONS" && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-1">
          {transactions.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400 text-xs">
              Nenhum lançamento no extrato financeiro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-5">Data / Hora</th>
                    <th className="py-3.5 px-5">Tipo</th>
                    <th className="py-3.5 px-5">Categoria</th>
                    <th className="py-3.5 px-5">Descrição do Lançamento</th>
                    <th className="py-3.5 px-5">Conta Bancária</th>
                    <th className="py-3.5 px-5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-mono text-zinc-500 dark:text-zinc-400">
                        {new Date(tx.entryDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-5">
                        {tx.type === "INCOME" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Receita
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Despesa
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="outline" className="border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 text-[10px]">
                          {tx.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400">
                        {tx.bankAccount || "Caixa Central"}
                      </td>
                      <td className={`py-4 px-5 text-right font-mono font-black text-sm ${
                        tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}>
                        {tx.type === "INCOME" ? "+" : "-"} {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba 3: DRE Gerencial Fabril */}
      {activeTab === "DRE" && dre && (
        <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-m3-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Demonstrativo do Resultado do Exercício (DRE Sintético)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Apuração gerencial de rentabilidade fabril, custo direto de insumos e margem operacional.
              </p>
            </div>
            <Badge className="bg-orange-500/10 text-glessios-orange border border-orange-500/20 text-xs px-3 py-1 font-bold">
              Exercício 2026
            </Badge>
          </div>

          <div className="space-y-4 font-mono text-sm max-w-4xl mx-auto">
            {/* 1. Receita Bruta */}
            <div className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">(+)</span> 1. RECEITA OPERACIONAL BRUTA
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                {formatCurrency(dre.grossRevenue)}
              </span>
            </div>
            <div className="pl-6 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>• Faturas Comerciais Liquidadas:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{formatCurrency(dre.revenueBreakdown.invoices)}</span>
              </div>
              {dre.revenueBreakdown.other > 0 && (
                <div className="flex justify-between">
                  <span>• Outras Receitas Operacionais:</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{formatCurrency(dre.revenueBreakdown.other)}</span>
                </div>
              )}
            </div>

            {/* 2. Custo dos Insumos Fabris (CMV) */}
            <div className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/[0.04] pt-4">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span>(-)</span> 2. CUSTO DOS INSUMOS FABRIS (CMV)
              </span>
              <span className="font-black text-amber-600 dark:text-amber-400 text-base">
                - {formatCurrency(dre.directMaterialCost)}
              </span>
            </div>
            <div className="pl-6 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              {Object.entries(dre.materialCostByCategory).map(([cat, val]) => (
                <div key={cat} className="flex justify-between">
                  <span>• {cat}:</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{formatCurrency(val)}</span>
                </div>
              ))}
            </div>

            {/* 3. Margem de Contribuição Bruta */}
            <div className="flex items-center justify-between py-3.5 bg-black/[0.02] dark:bg-white/[0.03] px-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] font-bold">
              <span className="text-zinc-900 dark:text-white flex items-center gap-2">
                (=) 3. MARGEM DE CONTRIBUIÇÃO BRUTA
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {dre.grossMarginPercentage.toFixed(1)}% da receita
                </span>
                <span className="text-base text-zinc-900 dark:text-white font-black">
                  {formatCurrency(dre.grossMargin)}
                </span>
              </div>
            </div>

            {/* 4. Despesas Operacionais */}
            <div className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/[0.04] pt-4">
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>(-)</span> 4. DESPESAS OPERACIONAIS & MANUTENÇÃO
              </span>
              <span className="font-black text-red-600 dark:text-red-400 text-base">
                - {formatCurrency(dre.totalOperatingExpenses)}
              </span>
            </div>
            <div className="pl-6 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              {Object.entries(dre.expensesByCategory).map(([cat, val]) => (
                <div key={cat} className="flex justify-between">
                  <span>• {cat}:</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{formatCurrency(val)}</span>
                </div>
              ))}
            </div>

            {/* 5. Resultado Líquido Operacional */}
            <div className="flex items-center justify-between py-4 bg-orange-500/10 px-5 rounded-2xl border border-orange-500/20 font-bold mt-6">
              <div>
                <span className="text-base text-zinc-900 dark:text-white font-black block">
                  (=) 5. RESULTADO LÍQUIDO OPERACIONAL
                </span>
                <span className="text-xs text-glessios-orange font-normal">
                  Lucro apurado após insumos e custos fixos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-glessios-orange font-semibold bg-orange-500/20 px-3 py-1 rounded-full">
                  {dre.netMarginPercentage.toFixed(1)}% margem líquida
                </span>
                <span className="text-xl text-zinc-900 dark:text-white font-black">
                  {formatCurrency(dre.netOperatingResult)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </M3TabPanel>

      {/* Modal Interativo de Cobrança PIX - M3 Expressive Dialog */}
      {pixModalOpen && selectedInvoiceForPix && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPixModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-glessios-orange">
              <QrCode className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider">
              {selectedInvoiceForPix.code}
            </span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
              Cobrança Instantânea PIX
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              {selectedInvoiceForPix.customer.tradeName || selectedInvoiceForPix.customer.user.name} • {selectedInvoiceForPix.serviceOrder.title}
            </p>

            {/* QR Code Vetorial em Alta Resolução */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-md mb-4 border border-black/10">
              {selectedInvoiceForPix.pixQrCodeBase64 ? (
                <img
                  src={selectedInvoiceForPix.pixQrCodeBase64}
                  alt="QR Code PIX"
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-zinc-500 text-xs">
                  QR Code Indisponível
                </div>
              )}
            </div>

            <div className="text-2xl font-black text-zinc-900 dark:text-white mb-4 font-mono">
              {formatCurrency(selectedInvoiceForPix.amount)}
            </div>

            {/* Campo Copia e Cola */}
            <div className="bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate text-left flex-1 select-all">
                {selectedInvoiceForPix.pixCopyPasteCode}
              </span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-glessios-orange hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </>
                )}
              </button>
            </div>

            {/* Ações: Simular Pagamento & Disparar WACLI */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setPixModalOpen(false)}
                className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs rounded-xl"
              >
                Fechar
              </Button>
              <Button
                onClick={() => handlePayInvoice(selectedInvoiceForPix.id)}
                disabled={payingInvoice}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl"
              >
                <Check className="w-4 h-4" />
                {payingInvoice ? "Baixando..." : "Confirmar Recebimento"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Emissão de Nova Fatura - M3 Expressive Dialog */}
      {newInvoiceModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNewInvoiceModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNewInvoiceModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <Plus className="w-4 h-4" />
                </div>
                Emitir Fatura Comercial
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Gere faturamento vinculado a uma Ordem de Serviço com chave PIX dinâmica.
              </p>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Vincular à Ordem de Serviço *
                </label>
                <select
                  required
                  value={newInvoiceForm.serviceOrderId}
                  onChange={(e) => {
                    const osId = e.target.value;
                    const found = serviceOrdersList.find((o) => o.id === osId);
                    setNewInvoiceForm({
                      ...newInvoiceForm,
                      serviceOrderId: osId,
                      amount: found ? found.totalAmount.toString() : newInvoiceForm.amount,
                    });
                  }}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                >
                  <option value="" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Selecione uma OS da produção...</option>
                  {serviceOrdersList.map((os) => (
                    <option key={os.id} value={os.id} className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">
                      {os.code} — {os.title} ({formatCurrency(os.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Valor da Fatura (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newInvoiceForm.amount}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:border-glessios-orange focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Observações / Condições
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Parcela 1/2 referente à aprovação da prova de arte"
                  value={newInvoiceForm.notes}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, notes: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewInvoiceModalOpen(false)}
                  className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingInvoice}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold rounded-xl"
                >
                  {submittingInvoice ? "Emitindo..." : "Emitir Fatura & Gerar PIX"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Lançamento Avulso (Despesa ou Receita) - M3 Expressive Dialog */}
      {newTxModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNewTxModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNewTxModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                Lançamento Financeiro Avulso
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Registre compras de insumos, manutenção, folha ou outras movimentações.
              </p>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Tipo de Transação *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewTxForm({ ...newTxForm, type: "EXPENSE" })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newTxForm.type === "EXPENSE"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Despesa / Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTxForm({ ...newTxForm, type: "INCOME" })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newTxForm.type === "INCOME"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Receita Extra
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Categoria *
                </label>
                <select
                  value={newTxForm.category}
                  onChange={(e) => setNewTxForm({ ...newTxForm, category: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                >
                  <option value="Fornecedores de Insumos" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Fornecedores de Insumos (ACM, Lona, LED)</option>
                  <option value="Manutenção de Máquinas" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Manutenção de Máquinas (Router, Laser)</option>
                  <option value="Energia & Utilidades" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Energia Elétrica & Utilidades</option>
                  <option value="Folha de Pagamento" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Folha de Pagamento & Equipe Fabril</option>
                  <option value="Combustível & Frota" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Combustível & Frota de Instalação</option>
                  <option value="Infraestrutura Galpão" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Aluguel & Infraestrutura Galpão</option>
                  <option value="Marketing & Vendas" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Marketing & Tráfego Pago</option>
                  <option value="Outros" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">Outras Despesas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Entidade Vinculada (Cliente / Fornecedor / Prestador)
                </label>
                <select
                  value={newTxForm.customerId}
                  onChange={(e) => setNewTxForm({ ...newTxForm, customerId: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                >
                  <option value="" className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white">
                    -- Não vincular a entidade específica --
                  </option>
                  {entitiesList.map((ent) => (
                    <option
                      key={ent.id}
                      value={ent.id}
                      className="bg-white dark:bg-[#1A1B20] text-zinc-900 dark:text-white"
                    >
                      {ent.displayName} ({ent.type === "SUPPLIER" ? "Fornecedor" : ent.type === "SERVICE_PROVIDER" ? "Prestador" : "Cliente"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de 50m fita LED e perfil alumínio"
                  value={newTxForm.description}
                  onChange={(e) => setNewTxForm({ ...newTxForm, description: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTxForm.amount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, amount: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:border-glessios-orange focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Conta Bancária
                  </label>
                  <input
                    type="text"
                    value={newTxForm.bankAccount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, bankAccount: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-glessios-orange focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewTxModalOpen(false)}
                  className="border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingTx}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold rounded-xl"
                >
                  {submittingTx ? "Registrando..." : "Registrar Transação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) de Nova Fatura no Mobile — Alinhado perfeitamente com o Menu Hamburger */}
      <div className="fixed bottom-[90px] right-6 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setNewInvoiceModalOpen(true)}
          aria-label="Emitir Nova Fatura"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#FF650F] to-[#FFA05E] shadow-[0_6px_20px_rgba(255,101,15,0.4)] active:scale-95 transition-all duration-200 border-2 border-white/20 focus:outline-none"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
