"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
  X,
  ExternalLink,
  Building,
  Calendar,
  Layers,
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
  const [newTxForm, setNewTxForm] = useState({
    type: "EXPENSE",
    category: "Fornecedores de Insumos",
    description: "",
    amount: "",
    bankAccount: "Conta Corrente Principal",
  });
  const [submittingTx, setSubmittingTx] = useState(false);

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
      await Promise.all([fetchInvoices(), fetchTransactions(), fetchDre(), fetchServiceOrders()]);
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
    <div className="min-h-screen bg-glessios-dark text-glessios-ivory flex flex-col font-sans">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/10 px-2.5 py-0.5 rounded-full border border-glessios-border-orange">
                Gestão Financeira & Faturamento
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Faturamento, Cobranças PIX & DRE Fabril
            </h1>
            <p className="text-sm text-glessios-text-body mt-1">
              Controle de contas a receber das OSs, fluxo de caixa diário e apuração da margem operacional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setNewTxModalOpen(true)}
              className="border-glessios-border-dark bg-glessios-graphite hover:bg-white/[0.05] text-white text-xs gap-1.5 h-10 px-4 rounded-xl"
            >
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
              Lançar Despesa / Receita
            </Button>
            <Button
              onClick={() => setNewInvoiceModalOpen(true)}
              className="bg-orange-gradient hover:opacity-95 text-white font-semibold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-orange-glow"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova Fatura
            </Button>
          </div>
        </div>

        {/* 4 Cards de Métricas Financeiras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Faturamento Realizado
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatCurrency(invoiceKpis.totalPaid)}
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Faturas liquidadas no período
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                A Receber (Pendente)
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {formatCurrency(invoiceKpis.totalPending)}
              </div>
              <span className="text-[11px] text-glessios-text-muted mt-0.5 block">
                Faturas em aberto das OSs
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-glessios-orange">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Contas em Atraso
              </span>
              <div className="text-2xl font-black text-red-400 mt-1">
                {formatCurrency(invoiceKpis.totalOverdue)}
              </div>
              <span className="text-[11px] text-red-500/80 mt-0.5 block">
                Vencimento expirado sem baixa
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-glessios-graphite p-5 rounded-2xl border border-glessios-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-glessios-text-body uppercase tracking-wider">
                Resultado Líquido Fabril
              </span>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {formatCurrency(dre?.netOperatingResult || txKpis.netBalance)}
              </div>
              <span className="text-[11px] text-blue-500/80 mt-0.5 block">
                Margem operacional apurada
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 border-b border-glessios-border-dark mb-6">
          <button
            onClick={() => setActiveTab("INVOICES")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "INVOICES"
                ? "text-glessios-orange"
                : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Faturas & Cobranças ({invoices.length})
            </div>
            {activeTab === "INVOICES" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "TRANSACTIONS"
                ? "text-glessios-orange"
                : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Extrato & Fluxo de Caixa ({transactions.length})
            </div>
            {activeTab === "TRANSACTIONS" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("DRE")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "DRE"
                ? "text-glessios-orange"
                : "text-glessios-text-body hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              DRE Gerencial Fabril
            </div>
            {activeTab === "DRE" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-glessios-orange" />
            )}
          </button>
        </div>

        {/* Conteúdo da Aba 1: Faturas & Cobranças */}
        {activeTab === "INVOICES" && (
          <div className="bg-glessios-graphite rounded-2xl border border-glessios-border-dark overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-glessios-text-muted text-sm">
                Carregando faturas...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-20 text-center">
                <Receipt className="w-12 h-12 text-glessios-text-muted mx-auto mb-3 opacity-30" />
                <h3 className="text-base font-bold text-white">Nenhuma fatura emitida</h3>
                <p className="text-xs text-glessios-text-body mt-1">
                  Emita faturas vinculadas às Ordens de Serviço para gerar cobranças PIX automáticas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-glessios-border-dark bg-white/[0.02] text-glessios-text-body uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Código / Status</th>
                      <th className="py-3 px-4">Cliente / Contratante</th>
                      <th className="py-3 px-4">Ordem de Serviço (OS)</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4 text-right">Valor da Fatura</th>
                      <th className="py-3 px-4 text-center">Cobrança & Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glessios-border-dark">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Código e Status */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs font-bold text-white">
                              {inv.code}
                            </span>
                            {inv.status === "PAID" ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] w-fit">
                                Pago em {inv.paidDate ? formatDate(inv.paidDate) : ""}
                              </Badge>
                            ) : inv.isOverdue ? (
                              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] w-fit">
                                Vencido ({formatDate(inv.dueDate)})
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] w-fit">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">
                              {inv.customer.tradeName || inv.customer.companyName || inv.customer.user.name}
                            </span>
                            <span className="text-[11px] text-glessios-text-muted">
                              {inv.customer.user.phone || inv.customer.user.email}
                            </span>
                          </div>
                        </td>

                        {/* OS Vinculada */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-glessios-orange font-bold text-[11px]">
                              {inv.serviceOrder.code}
                            </span>
                            <span className="text-glessios-text-body text-[11px] truncate max-w-xs">
                              {inv.serviceOrder.title}
                            </span>
                          </div>
                        </td>

                        {/* Vencimento */}
                        <td className="py-3.5 px-4">
                          <span className={`font-mono text-xs ${inv.isOverdue ? "text-red-400 font-bold" : "text-white"}`}>
                            {formatDate(inv.dueDate)}
                          </span>
                        </td>

                        {/* Valor */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                          {formatCurrency(inv.amount)}
                        </td>

                        {/* Cobrança e Ações */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {inv.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => openPixModal(inv)}
                                  className="px-2.5 py-1.5 bg-glessios-orange/15 hover:bg-glessios-orange/25 text-glessios-orange border border-glessios-border-orange rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  PIX
                                </button>
                                <button
                                  onClick={() => handlePayInvoice(inv.id)}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Baixar
                                </button>
                              </>
                            )}

                            <Link
                              href={`/admin/propostas/${inv.serviceOrder.id}`}
                              target="_blank"
                              className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-glessios-text-body hover:text-white border border-white/5 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
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
          <div className="bg-glessios-graphite rounded-2xl border border-glessios-border-dark overflow-hidden">
            {transactions.length === 0 ? (
              <div className="py-20 text-center text-glessios-text-muted text-sm">
                Nenhum lançamento no extrato financeiro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-glessios-border-dark bg-white/[0.02] text-glessios-text-body uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Descrição do Lançamento</th>
                      <th className="py-3 px-4">Conta Bancária</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glessios-border-dark">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono text-glessios-text-muted">
                          {new Date(tx.entryDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {tx.type === "INCOME" ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Receita
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <ArrowDownRight className="w-3.5 h-3.5" /> Despesa
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-white/10 text-glessios-text-body text-[10px]">
                            {tx.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 text-glessios-text-muted">
                          {tx.bankAccount || "Caixa Central"}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                          tx.type === "INCOME" ? "text-emerald-400" : "text-amber-400"
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
          <div className="bg-glessios-graphite rounded-2xl border border-glessios-border-dark p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-glessios-border-dark">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Demonstrativo do Resultado do Exercício (DRE Sintético)
                </h3>
                <p className="text-xs text-glessios-text-body">
                  Apuração gerencial de rentabilidade fabril, custo direto de insumos e margem operacional.
                </p>
              </div>
              <Badge className="bg-glessios-orange/10 text-glessios-orange border border-glessios-border-orange text-xs px-3 py-1">
                Exercício 2026
              </Badge>
            </div>

            <div className="space-y-4 font-mono text-sm max-w-4xl mx-auto">
              {/* 1. Receita Bruta */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">(+)</span> 1. RECEITA OPERACIONAL BRUTA
                </span>
                <span className="font-black text-emerald-400 text-base">
                  {formatCurrency(dre.grossRevenue)}
                </span>
              </div>
              <div className="pl-6 text-xs text-glessios-text-body space-y-1">
                <div className="flex justify-between">
                  <span>• Faturas Comerciais Liquidadas:</span>
                  <span>{formatCurrency(dre.revenueBreakdown.invoices)}</span>
                </div>
                {dre.revenueBreakdown.other > 0 && (
                  <div className="flex justify-between">
                    <span>• Outras Receitas Operacionais:</span>
                    <span>{formatCurrency(dre.revenueBreakdown.other)}</span>
                  </div>
                )}
              </div>

              {/* 2. Custo dos Insumos Fabris (CMV) */}
              <div className="flex items-center justify-between py-2 border-b border-white/5 pt-4">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span>(-)</span> 2. CUSTO DOS INSUMOS FABRIS (CMV)
                </span>
                <span className="font-black text-amber-400 text-base">
                  - {formatCurrency(dre.directMaterialCost)}
                </span>
              </div>
              <div className="pl-6 text-xs text-glessios-text-body space-y-1">
                {Object.entries(dre.materialCostByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between">
                    <span>• {cat}:</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
              </div>

              {/* 3. Margem de Contribuição Bruta */}
              <div className="flex items-center justify-between py-3 bg-white/[0.03] px-4 rounded-xl border border-white/5 font-bold">
                <span className="text-white flex items-center gap-2">
                  (=) 3. MARGEM DE CONTRIBUIÇÃO BRUTA
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {dre.grossMarginPercentage.toFixed(1)}% da receita
                  </span>
                  <span className="text-base text-white font-black">
                    {formatCurrency(dre.grossMargin)}
                  </span>
                </div>
              </div>

              {/* 4. Despesas Operacionais */}
              <div className="flex items-center justify-between py-2 border-b border-white/5 pt-4">
                <span className="font-bold text-red-400 flex items-center gap-2">
                  <span>(-)</span> 4. DESPESAS OPERACIONAIS & MANUTENÇÃO
                </span>
                <span className="font-black text-red-400 text-base">
                  - {formatCurrency(dre.totalOperatingExpenses)}
                </span>
              </div>
              <div className="pl-6 text-xs text-glessios-text-body space-y-1">
                {Object.entries(dre.expensesByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between">
                    <span>• {cat}:</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
              </div>

              {/* 5. Resultado Líquido Operacional */}
              <div className="flex items-center justify-between py-4 bg-orange-gradient/10 px-4 rounded-xl border border-glessios-border-orange font-bold mt-6">
                <div>
                  <span className="text-base text-white font-black block">
                    (=) 5. RESULTADO LÍQUIDO OPERACIONAL
                  </span>
                  <span className="text-xs text-glessios-orange font-normal">
                    Lucro operacional apurado pós-insumos e custos fixos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-glessios-orange font-semibold bg-glessios-orange/20 px-2.5 py-1 rounded-lg border border-glessios-border-orange">
                    {dre.netMarginPercentage.toFixed(1)}% margem líquida
                  </span>
                  <span className="text-xl text-white font-black">
                    {formatCurrency(dre.netOperatingResult)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Interativo de Cobrança PIX */}
      {pixModalOpen && selectedInvoiceForPix && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setPixModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-glessios-orange/15 border border-glessios-border-orange flex items-center justify-center mx-auto mb-3 text-glessios-orange">
              <QrCode className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono text-glessios-orange font-bold uppercase tracking-wider">
              {selectedInvoiceForPix.code}
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              Cobrança Instantânea PIX
            </h3>
            <p className="text-xs text-glessios-text-body mt-1 mb-5">
              {selectedInvoiceForPix.customer.tradeName || selectedInvoiceForPix.customer.user.name} • {selectedInvoiceForPix.serviceOrder.title}
            </p>

            {/* QR Code Vetorial em Alta Resolução */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-4 border-2 border-glessios-orange">
              {selectedInvoiceForPix.pixQrCodeBase64 ? (
                <img
                  src={selectedInvoiceForPix.pixQrCodeBase64}
                  alt="QR Code PIX"
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-black text-xs">
                  QR Code Indisponível
                </div>
              )}
            </div>

            <div className="text-2xl font-black text-white mb-4 font-mono">
              {formatCurrency(selectedInvoiceForPix.amount)}
            </div>

            {/* Campo Copia e Cola */}
            <div className="bg-glessios-charcoal border border-glessios-border-dark rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-[11px] text-glessios-text-muted truncate text-left flex-1 select-all">
                {selectedInvoiceForPix.pixCopyPasteCode}
              </span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-glessios-orange hover:bg-glessios-orange-light text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
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
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setPixModalOpen(false)}
                className="border-glessios-border-dark text-glessios-text-body hover:text-white text-xs"
              >
                Fechar
              </Button>
              <Button
                onClick={() => handlePayInvoice(selectedInvoiceForPix.id)}
                disabled={payingInvoice}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
              >
                <Check className="w-4 h-4" />
                {payingInvoice ? "Baixando..." : "Confirmar Recebimento"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Emissão de Nova Fatura */}
      {newInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setNewInvoiceModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Emitir Nova Fatura Comercial
            </h3>
            <p className="text-xs text-glessios-text-body mb-5">
              Gere faturamento vinculado a uma Ordem de Serviço com chave PIX dinâmica.
            </p>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
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
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                >
                  <option value="">Selecione uma OS da produção...</option>
                  {serviceOrdersList.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.code} — {os.title} ({formatCurrency(os.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Valor da Fatura (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newInvoiceForm.amount}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-glessios-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Observações / Condições
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Parcela 1/2 referente à aprovação da prova de arte"
                  value={newInvoiceForm.notes}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, notes: e.target.value })}
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewInvoiceModalOpen(false)}
                  className="border-glessios-border-dark text-glessios-text-body hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingInvoice}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold"
                >
                  {submittingInvoice ? "Emitindo..." : "Emitir Fatura & Gerar PIX"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Lançamento Avulso (Despesa ou Receita) */}
      {newTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glessios-graphite border border-glessios-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setNewTxModalOpen(false)}
              className="absolute right-4 top-4 text-glessios-text-body hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Lançamento Financeiro Avulso
            </h3>
            <p className="text-xs text-glessios-text-body mb-5">
              Registre compras de insumos, contas de energia, folha ou outras despesas da fábrica.
            </p>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Tipo de Transação *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTxForm({ ...newTxForm, type: "EXPENSE" })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      newTxForm.type === "EXPENSE"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-glessios-charcoal border-glessios-border-dark text-glessios-text-body hover:text-white"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Despesa / Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTxForm({ ...newTxForm, type: "INCOME" })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      newTxForm.type === "INCOME"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-glessios-charcoal border-glessios-border-dark text-glessios-text-body hover:text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Receita Extra
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Categoria *
                </label>
                <select
                  value={newTxForm.category}
                  onChange={(e) => setNewTxForm({ ...newTxForm, category: e.target.value })}
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                >
                  <option value="Fornecedores de Insumos">Fornecedores de Insumos (ACM, Lona, LED)</option>
                  <option value="Manutenção de Máquinas">Manutenção de Máquinas (Router, Laser)</option>
                  <option value="Energia & Utilidades">Energia Elétrica & Utilidades</option>
                  <option value="Folha de Pagamento">Folha de Pagamento & Equipe Fabril</option>
                  <option value="Combustível & Frota">Combustível & Frota de Instalação</option>
                  <option value="Infraestrutura Galpão">Aluguel & Infraestrutura Galpão</option>
                  <option value="Marketing & Vendas">Marketing & Tráfego Pago</option>
                  <option value="Outros">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de 50m fita LED e perfil alumínio"
                  value={newTxForm.description}
                  onChange={(e) => setNewTxForm({ ...newTxForm, description: e.target.value })}
                  className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTxForm.amount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, amount: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-glessios-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-glessios-text-body block mb-1">
                    Conta Bancária
                  </label>
                  <input
                    type="text"
                    value={newTxForm.bankAccount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, bankAccount: e.target.value })}
                    className="w-full bg-glessios-charcoal border border-glessios-border-dark rounded-xl px-3 py-2 text-xs text-white focus:border-glessios-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewTxModalOpen(false)}
                  className="border-glessios-border-dark text-glessios-text-body hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingTx}
                  className="bg-orange-gradient hover:opacity-95 text-white font-bold"
                >
                  {submittingTx ? "Registrando..." : "Registrar Transação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
