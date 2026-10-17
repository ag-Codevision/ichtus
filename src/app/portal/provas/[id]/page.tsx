"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  ZoomIn,
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
      // Como não temos endpoint dedicado de GET para prova avulsa, buscamos os dados via API
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
      <div className="min-h-screen flex items-center justify-center bg-glessios-black text-glessios-text-body text-sm">
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
    <div className="min-h-screen flex flex-col bg-glessios-black text-glessios-text-body">
      {/* Header Simples do Portal */}
      <header className="bg-glessios-graphite border-b border-glessios-border-dark py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-gradient flex items-center justify-center font-extrabold text-white text-base shadow-orange-glow">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-tight">GLESSIOS</span>
              <span className="text-[9px] uppercase tracking-widest text-glessios-orange font-mono">
                Portal de Aprovação Digital
              </span>
            </div>
          </Link>

          <Badge variant="orange" className="text-xs font-mono font-bold">
            {currentProof.serviceOrder.code} — Versão {currentProof.version}
          </Badge>
        </div>
      </header>

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Banner de Feedback se acabou de aprovar */}
        {decisionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {decisionSuccess}
          </div>
        )}

        {/* Informações da Ordem de Serviço */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-glessios-border-dark">
          <div className="space-y-1">
            <span className="text-xs text-glessios-orange uppercase tracking-wider font-semibold">
              Ordem de Serviço {currentProof.serviceOrder.code}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentProof.title}
            </h1>
            <p className="text-xs text-glessios-text-body">
              Cliente: <strong className="text-white">{currentProof.serviceOrder.customer.user.name}</strong>
              {currentProof.serviceOrder.customer.tradeName && ` (${currentProof.serviceOrder.customer.tradeName})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isApproved ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ARTE APROVADA — EM CORTE CNC
              </span>
            ) : isRevision ? (
              <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                REVISÃO SOLICITADA AO DESIGNER
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                AGUARDANDO SUA AVALIAÇÃO
              </span>
            )}
          </div>
        </div>

        {/* Visualizador da Prova de Arte em Alta Definição */}
        <div className="rounded-3xl bg-glessios-graphite border border-glessios-border-dark overflow-hidden shadow-2xl space-y-4">
          <div className="p-4 bg-glessios-charcoal border-b border-glessios-border-dark flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-glessios-orange" />
              Mockup Renderizado em Escala Real (Fidelidade Cromática CMYK/RGB)
            </span>
            <span className="text-glessios-text-body font-mono">1920 x 1080px</span>
          </div>

          <div className="relative h-80 sm:h-[500px] w-full bg-black">
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
              <h3 className="text-sm uppercase tracking-wider font-bold text-white mb-3">
                Especificação dos Itens do Projeto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentProof.serviceOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-xs flex items-center justify-between"
                  >
                    <span className="text-white font-medium">{it.description}</span>
                    <span className="text-glessios-orange font-mono font-bold">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Se houver notas de revisão anteriores */}
            {currentProof.customerNotes && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <strong className="block font-bold">Observações de Ajuste Solicitadas:</strong>
                <p>{currentProof.customerNotes}</p>
              </div>
            )}

            {/* Painel de Decisão do Cliente */}
            {!isApproved && (
              <div className="pt-6 border-t border-glessios-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-white font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Validação Final de Cores e Medidas
                  </span>
                  <p className="text-[11px] text-glessios-text-body max-w-md">
                    Ao aprovar, a ordem é liberada automaticamente para usinagem na Router CNC e corte laser.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsRevisionModalOpen(true)}
                    disabled={isDeciding}
                    className="w-full sm:w-auto text-xs"
                  >
                    Solicitar Ajustes
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleDecision("APPROVED")}
                    isLoading={isDeciding}
                    className="w-full sm:w-auto text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg text-white"
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

      {/* Modal para Solicitar Ajustes de Arte */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-glessios-graphite border border-glessios-border-orange/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-glessios-orange" />
              Descreva as Alterações Desejadas
            </h3>
            <p className="text-xs text-glessios-text-body">
              Seja o mais específico possível quanto a cores, proporções, tipografia ou posicionamento para que o designer faça o ajuste com precisão.
            </p>

            <textarea
              rows={4}
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Ex: Favor ajustar o espaçamento entre as letras e testar o fundo no tom grafite escovado..."
              className="w-full px-4 py-3 rounded-xl bg-glessios-charcoal border border-glessios-border-dark text-white text-xs placeholder:text-glessios-text-body/40 focus:outline-none focus:border-glessios-orange"
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRevisionModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!revisionNotes.trim() || isDeciding}
                isLoading={isDeciding}
                onClick={() => handleDecision("REVISION_REQUESTED", revisionNotes)}
              >
                Enviar Solicitação de Ajuste
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-glessios-graphite border-t border-glessios-border-dark py-4 text-center text-xs text-glessios-text-body">
        © {new Date().getFullYear()} Glessios Comunicação Visual • Engenharia & Manufatura Premium
      </footer>
    </div>
  );
}
