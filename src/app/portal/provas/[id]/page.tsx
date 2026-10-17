"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MessageSquare,
  ZoomIn,
  X,
  ArrowLeft,
} from "lucide-react";

interface ProofData {
  id: string;
  version: number;
  title: string;
  fileUrl: string;
  previewUrl: string;
  status: "PENDING_CUSTOMER_REVIEW" | "APPROVED" | "REVISION_REQUESTED";
  customerNotes: string | null;
  reviewedAt: string | null;
  serviceOrder: {
    id: string;
    code: string;
    title: string;
    customer: {
      tradeName: string | null;
      user: { name: string; phone: string | null };
    };
    items: Array<{
      description: string;
      unit: string;
      quantity: number;
    }>;
  };
}

export default function ArtworkProofPage() {
  const params = useParams();
  const proofId = params.id as string;

  const [proof, setProof] = useState<ProofData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);

  // Modal para solicitar ajustes
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const fetchProof = async () => {
    try {
      const res = await fetch(`/api/v1/production/orders`);
      const data = await res.json();
      if (data.success && data.serviceOrders) {
        for (const order of data.serviceOrders) {
          const found = order.artworkProofs?.find((p: any) => p.id === proofId);
          if (found) {
            setProof({
              ...found,
              serviceOrder: order,
            });
            break;
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar prova:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (proofId) fetchProof();
  }, [proofId]);

  const handleDecision = async (decision: "APPROVED" | "REVISION_REQUESTED", notes?: string) => {
    setIsDeciding(true);
    try {
      const res = await fetch(`/api/v1/portal/artworks/${proofId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setDecisionSuccess(data.message);
        setIsRevisionModalOpen(false);
        if (proof) {
          setProof({
            ...proof,
            status: decision,
            customerNotes: notes || null,
            reviewedAt: new Date().toISOString(),
          });
        }
      } else {
        alert(data.error);
      }
    } catch {
      alert("Falha ao registrar sua decisão.");
    } finally {
      setIsDeciding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-500 dark:text-zinc-400 text-xs">
        <div className="w-5 h-5 border-2 border-glessios-orange border-t-transparent rounded-full animate-spin mr-3" />
        Carregando prova digital de arte...
      </div>
    );
  }

  // Fallback de demonstração caso o ID seja novo
  const currentProof = proof || {
    id: proofId,
    version: 1,
    title: "Layout Fachada Estruturada em ACM & Letreiro LED",
    fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
    previewUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
    status: "PENDING_CUSTOMER_REVIEW",
    customerNotes: null,
    reviewedAt: null,
    serviceOrder: {
      id: "os-demo",
      code: "OS-2026-0001",
      title: "Fachada Comercial em ACM 3mm Prata com Letras Caixa Inox LED",
      customer: {
        tradeName: "Loja Concept Batel",
        user: { name: "Renata Vasconcelos", phone: "+5541988887777" },
      },
      items: [
        { description: "Fachada Estruturada ACM 3mm Prata Chanfrado", unit: "m²", quantity: 28 },
        { description: "Letras Caixa Aço Inox 304 com LED 6500K Halo", unit: "un", quantity: 1 },
      ],
    },
  };

  const isApproved = currentProof.status === "APPROVED";
  const isRevision = currentProof.status === "REVISION_REQUESTED";

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF9F6] dark:bg-[#0E0F12] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header do Portal - M3 Expressive Header */}
      <header className="bg-white/80 dark:bg-[#141519]/80 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mr-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Painel
            </Link>
            <div className="w-8 h-8 rounded-xl bg-orange-gradient flex items-center justify-center font-extrabold text-white text-base shadow-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-zinc-900 dark:text-white text-sm tracking-tight">GLESSIOS</span>
              <span className="text-[9px] uppercase tracking-widest text-glessios-orange font-mono font-bold">
                Aprovação Digital de Arte
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-mono font-bold text-glessios-orange bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              {currentProof.serviceOrder.code} • v{currentProof.version}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Banner de Feedback se acabou de aprovar */}
        {decisionSuccess && (
          <div className="p-4 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {decisionSuccess}
          </div>
        )}

        {/* Informações da Ordem de Serviço - M3 Expressive Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-orange-500/10 px-3 py-0.5 rounded-full border border-orange-500/20">
                Ordem {currentProof.serviceOrder.code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {currentProof.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cliente: <strong className="text-zinc-800 dark:text-zinc-200">{currentProof.serviceOrder.customer.user.name}</strong>
              {currentProof.serviceOrder.customer.tradeName && ` (${currentProof.serviceOrder.customer.tradeName})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isApproved ? (
              <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ARTE APROVADA — EM FABRICAÇÃO
              </span>
            ) : isRevision ? (
              <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                REVISÃO SOLICITADA AO DESIGNER
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                AGUARDANDO SUA DECISÃO
              </span>
            )}
          </div>
        </div>

        {/* Visualizador da Prova de Arte em Alta Definição */}
        <div className="rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-m3-2 space-y-4">
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-glessios-orange" />
              Mockup Renderizado em Escala Real (Fidelidade Cromática)
            </span>
            <span className="text-zinc-400 font-mono">1920 x 1080px</span>
          </div>

          <div className="relative h-80 sm:h-[500px] w-full bg-zinc-100 dark:bg-black">
            <Image
              src={currentProof.fileUrl}
              alt={currentProof.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
                Especificação dos Itens do Projeto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentProof.serviceOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-xs flex items-center justify-between"
                  >
                    <span className="text-zinc-900 dark:text-white font-medium">{it.description}</span>
                    <span className="text-glessios-orange font-mono font-bold">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Se houver notas de revisão anteriores */}
            {currentProof.customerNotes && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <strong className="block font-bold">Observações de Ajuste Solicitadas:</strong>
                <p>{currentProof.customerNotes}</p>
              </div>
            )}

            {/* Painel de Decisão do Cliente */}
            {!isApproved && (
              <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-zinc-900 dark:text-white font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Validação de Cores e Medidas
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-md">
                    Ao aprovar, a ordem é liberada automaticamente para usinagem na Router CNC e acabamento de bancada.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsRevisionModalOpen(true)}
                    disabled={isDeciding}
                    className="w-full sm:w-auto text-xs rounded-full border-black/10 dark:border-white/10"
                  >
                    Solicitar Ajustes
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleDecision("APPROVED")}
                    isLoading={isDeciding}
                    className="w-full sm:w-auto text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-sm text-white rounded-full"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar Arte Sem Ressalvas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal para Solicitar Ajustes de Arte - M3 Expressive Dialog */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1B20] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-glessios-orange">
                  <MessageSquare className="w-4 h-4" />
                </div>
                Descreva as Alterações Desejadas
              </h3>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Seja o mais específico possível quanto a cores, proporções, tipografia ou posicionamento para que o designer faça o ajuste com precisão.
            </p>

            <textarea
              rows={4}
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Ex: Favor ajustar o espaçamento entre as letras e testar o fundo no tom grafite escovado..."
              className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:border-glessios-orange transition-all"
            />

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevisionModalOpen(false)}
                className="rounded-xl border-black/10 dark:border-white/10"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!revisionNotes.trim() || isDeciding}
                isLoading={isDeciding}
                onClick={() => handleDecision("REVISION_REQUESTED", revisionNotes)}
                className="rounded-xl"
              >
                Enviar Solicitação de Ajuste
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white/50 dark:bg-[#141519]/50 border-t border-black/[0.06] dark:border-white/[0.06] py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} Glessios Comunicação Visual • Engenharia & Manufatura Premium
      </footer>
    </div>
  );
}
