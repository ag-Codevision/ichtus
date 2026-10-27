"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Sliders,
  Building,
  KeyRound,
  Layers,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Power,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  Info,
  MessageSquare,
  FileText,
  FileCheck,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TabKey = "WHATSAPP" | "PORTAL" | "COMPANY" | "PRODUCTION";

const DYNAMIC_TAGS = [
  { tag: "{cliente}", label: "Nome do Cliente", example: "João Silva", desc: "Nome completo do cliente ou razão social" },
  { tag: "{projeto}", label: "Nome do Projeto", example: "Fachada ACM + Letras Caixa", desc: "Título do serviço/projeto" },
  { tag: "{codigo}", label: "Código Orçamento", example: "[3006 23 10 26]", desc: "Código único de referência" },
  { tag: "{empresa}", label: "Nome da Empresa", example: "Icthus Comunicação Visual", desc: "Nome oficial da sua empresa" },
  { tag: "{valor_total}", label: "Valor Total", example: "R$ 4.850,00", desc: "Valor formatado do orçamento" },
  { tag: "{link_proposta}", label: "Link da Proposta", example: "https://icthusbrasil.com/proposta/exemplo123", desc: "Link público de visualização e aprovação online" },
  { tag: "{link_contrato}", label: "Link do Contrato", example: "https://icthusbrasil.com/contrato/exemplo123", desc: "Link para o contrato de prestação" },
  { tag: "{link_portal}", label: "Portal do Cliente", example: "https://icthusbrasil.com/portal/login", desc: "Link direto para o portal do cliente" },
];

const DEFAULT_PROPOSAL_MESSAGE =
  "Olá, *{cliente}*! Tudo bem? 🤝\n\nSegue em anexo a sua *Proposta Comercial / Orçamento* referente ao projeto *{projeto}* {codigo} da *Icthus Soluções*.\n\n📄 *Visualize também online com aprovação digital:* {link_proposta}\n\nQualquer dúvida ou alteração nos detalhes técnicos, estamos 100% à disposição!\n\n*Icthus Comunicação Visual*";

const DEFAULT_CONTRACT_MESSAGE =
  "Olá, *{cliente}*! Tudo bem? 📋\n\nSegue o link do seu *Contrato de Prestação de Serviços* referente ao projeto *{projeto}* {codigo} da *Icthus Soluções*:\n\n✍️ *Acesse e confira o contrato:* {link_contrato}\n\nFicamos à disposição para qualquer ajuste e para formalizarmos o início da produção!\n\n*Icthus Comunicação Visual*";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("WHATSAPP");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Estados do WhatsApp
  const [wppStatus, setWppStatus] = useState<any>(null);
  const [isCheckingWpp, setIsCheckingWpp] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    "👋 Olá! Esta é uma mensagem de teste oficial enviada pelo sistema Icthus / Glessios."
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Formata o telefone dinamicamente no padrão brasileiro (XX) XXXXX-XXXX
  const formatPhoneInput = (val: string) => {
    let clean = val.replace(/\D/g, "");
    // Se colou com DDI 55 e tem mais de 11 dígitos, remove o 55 para formatar
    if (clean.startsWith("55") && clean.length > 11) {
      clean = clean.slice(2);
    }
    if (clean.length <= 2) {
      return clean.length > 0 ? `(${clean}` : "";
    }
    if (clean.length <= 6) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length <= 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  // Estados Gerais de Configurações
  const [settings, setSettings] = useState<any>({
    whatsapp: {
      provider: "wacli",
      mode: "http",
      apiUrl: "http://localhost:3001",
      sessionName: "glessios-wpp",
      apiKey: "",
      autoSendCredentials: true,
      autoSendProofs: true,
      autoSendOSUpdates: true,
      autoSendPixInvoice: true,
      connectedNumber: "+55 (41) 99824-3990",
      status: "PAIRING_REQUIRED",
      templates: {
        proposalMessage:
          "Olá, *{cliente}*! Tudo bem? 🤝\n\nSegue em anexo a sua *Proposta Comercial / Orçamento* referente ao projeto *{projeto}* {codigo} da *Icthus Soluções*.\n\n📄 *Visualize também online com aprovação digital:* {link_proposta}\n\nQualquer dúvida ou alteração nos detalhes técnicos, estamos 100% à disposição!\n\n*Icthus Comunicação Visual*",
        contractMessage:
          "Olá, *{cliente}*! Tudo bem? 📋\n\nSegue o link do seu *Contrato de Prestação de Serviços* referente ao projeto *{projeto}* {codigo} da *Icthus Soluções*:\n\n✍️ *Acesse e confira o contrato:* {link_contrato}\n\nFicamos à disposição para qualquer ajuste e para formalizarmos o início da produção!\n\n*Icthus Comunicação Visual*",
      },
    },
    company: {
      tradeName: "Icthus Comunicação Visual",
      legalName: "Icthus Soluções & Design Visual Ltda",
      cnpj: "45.123.456/0001-78",
      email: "contato@glessios.com.br",
      phone: "(41) 3345-8900",
      whatsapp: "(41) 99824-3990",
      address: "Rua das Indústrias, 1024 - CIC",
      city: "Curitiba",
      state: "PR",
    },
    portal: {
      defaultPassword: "Icthus@123",
      portalUrl: "https://glessios.com.br/portal/login",
      allowSelfRegistration: false,
      welcomeMessageTemplate:
        "Olá, *{nome}*! Seu perfil de acesso ao Portal do Cliente Icthus foi liberado com sucesso.\n\n🔗 *Acesso:* {url}\n📧 *Login:* {email}\n🔑 *Senha Inicial:* {senha}",
    },
    production: {
      notifyOnNewProof: true,
      notifyOnStageChange: true,
      notifyOnInstallationSchedule: true,
    },
    server: {
      vpsHost: "72.62.141.188",
      cronEnabled: true,
    },
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Estados e Funções dos Modelos de Mensagem do WhatsApp
  const [activeTemplateTab, setActiveTemplateTab] = useState<"PROPOSAL" | "CONTRACT">("PROPOSAL");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const templateTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const getCurrentTemplateMessage = () => {
    if (activeTemplateTab === "PROPOSAL") {
      return settings?.whatsapp?.templates?.proposalMessage ?? DEFAULT_PROPOSAL_MESSAGE;
    }
    return settings?.whatsapp?.templates?.contractMessage ?? DEFAULT_CONTRACT_MESSAGE;
  };

  const setTemplateMessage = (val: string) => {
    setSettings((prev: any) => ({
      ...prev,
      whatsapp: {
        ...(prev.whatsapp || {}),
        templates: {
          ...(prev.whatsapp?.templates || {}),
          [activeTemplateTab === "PROPOSAL" ? "proposalMessage" : "contractMessage"]: val,
        },
      },
    }));
  };

  const handleInsertTag = (tag: string) => {
    const currentVal = getCurrentTemplateMessage();
    const textarea = templateTextareaRef.current;
    if (!textarea) {
      setTemplateMessage(currentVal + " " + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextVal = currentVal.substring(0, start) + tag + currentVal.substring(end);
    setTemplateMessage(nextVal);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + tag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 15);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleRestoreDefault = () => {
    const defaultMsg = activeTemplateTab === "PROPOSAL" ? DEFAULT_PROPOSAL_MESSAGE : DEFAULT_CONTRACT_MESSAGE;
    setTemplateMessage(defaultMsg);
    setFeedback({
      type: "success",
      text: `Modelo de ${activeTemplateTab === "PROPOSAL" ? "Proposta" : "Contrato"} restaurado para o padrão oficial da Icthus!`,
    });
  };

  const renderFormattedPreview = (raw: string) => {
    let text = raw || "";
    DYNAMIC_TAGS.forEach((item) => {
      text = text.replaceAll(item.tag, item.example);
    });

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2.5" />;
      }

      const parts = line.split(/(\*[^*]+\*|https?:\/\/[^\s]+)/g);

      return (
        <div key={idx} className="leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return (
                <strong key={pIdx} className="font-bold text-white">
                  {part.slice(1, -1)}
                </strong>
              );
            }
            if (part.startsWith("http://") || part.startsWith("https://")) {
              return (
                <span key={pIdx} className="text-sky-300 underline break-all font-mono">
                  {part}
                </span>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  // Carrega configurações gerais e status do WhatsApp
  const fetchAllSettings = async () => {
    setIsLoading(true);
    try {
      const [resSettings, resWpp] = await Promise.all([
        fetch("/api/v1/admin/settings").then((r) => r.json()).catch(() => null),
        fetch("/api/v1/admin/settings/whatsapp").then((r) => r.json()).catch(() => null),
      ]);

      if (resSettings?.success && resSettings.settings) {
        setSettings(resSettings.settings);
      }
      if (resWpp?.success) {
        setWppStatus(resWpp);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const refreshWhatsappStatus = async (silent: boolean = false) => {
    if (!silent) setIsCheckingWpp(true);
    setTestFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/settings/whatsapp?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const json = await res.json();
      if (json.success) {
        setWppStatus(json);
        if (!silent) {
          setFeedback({ type: "success", text: "Status do WhatsApp atualizado em tempo real!" });
        }
      }
    } catch {
      if (!silent) {
        setFeedback({ type: "error", text: "Não foi possível sincronizar com o serviço do WhatsApp." });
      }
    } finally {
      if (!silent) setIsCheckingWpp(false);
    }
  };

  // Polling automático ativo: detecta a leitura do QR Code pelo celular sem precisar clicar em nada
  useEffect(() => {
    if (activeTab !== "WHATSAPP") return;

    // Se ainda não conectou, verifica a cada 3 segundos; se conectado, verifica a cada 20 segundos
    const intervalTime = wppStatus?.status === "CONNECTED" ? 20000 : 3000;
    const interval = setInterval(() => {
      refreshWhatsappStatus(true);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [activeTab, wppStatus?.status]);

  const handleDisconnect = async () => {
    setIsCheckingWpp(true);
    try {
      const res = await fetch("/api/v1/admin/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      const json = await res.json();
      if (json.success) {
        // Aguarda 1 segundo para o socket novo emitir o primeiro QR code e atualiza
        setTimeout(() => {
          refreshWhatsappStatus(false);
        }, 1200);
        setFeedback({ type: "success", text: "Sessão desconectada. Gerando novo QR Code para pareamento..." });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao desconectar sessão." });
    } finally {
      setIsCheckingWpp(false);
    }
  };

  const handleResetSession = async () => {
    setIsCheckingWpp(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/admin/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: "Sessão reiniciada! Gerando novo QR Code limpo..." });
        setTimeout(() => {
          refreshWhatsappStatus(false);
        }, 1500);
      } else {
        setFeedback({ type: "error", text: json.error || "Falha ao reiniciar sessão." });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao comunicar com a API do WhatsApp." });
    } finally {
      setIsCheckingWpp(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      setTestFeedback({ type: "error", text: "Informe um número de telefone com DDD." });
      return;
    }
    setIsSendingTest(true);
    setTestFeedback(null);
    try {
      const res = await fetch("/api/v1/admin/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_send",
          to: testPhone,
          message: testMessage,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestFeedback({
          type: "success",
          text: json.message || "Mensagem de teste enviada com sucesso!",
        });
      } else {
        setTestFeedback({
          type: "error",
          text: json.error || "Falha ao enviar mensagem de teste.",
        });
      }
    } catch {
      setTestFeedback({ type: "error", text: "Erro ao comunicar com a API de disparo." });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: "Todas as configurações foram salvas com sucesso!" });
      } else {
        setFeedback({ type: "error", text: json.error || "Erro ao salvar configurações." });
      }
    } catch {
      setFeedback({ type: "error", text: "Falha de comunicação com o servidor." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Topo / Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF650F]/15 border border-[#FF650F]/30 flex items-center justify-center text-[#FF650F]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Configurações & Conexões
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gerencie o gateway de WhatsApp, QR Code de pareamento, Portal do Cliente e parâmetros da empresa
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveGeneralSettings}
            disabled={isSaving}
            className="bg-[#FF650F] hover:bg-[#E55507] text-white font-bold text-xs rounded-xl shadow-md px-4 py-2 flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Banner de Feedback Global */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Abas de Navegação M3 Expressive */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("WHATSAPP")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "WHATSAPP"
              ? "bg-white dark:bg-[#1E1F24] text-[#FF650F] shadow-sm border border-black/5 dark:border-white/10"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>WhatsApp & QR Code</span>
          {wppStatus?.status === "CONNECTED" ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("PORTAL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "PORTAL"
              ? "bg-white dark:bg-[#1E1F24] text-[#FF650F] shadow-sm border border-black/5 dark:border-white/10"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Portal do Cliente</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPANY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "COMPANY"
              ? "bg-white dark:bg-[#1E1F24] text-[#FF650F] shadow-sm border border-black/5 dark:border-white/10"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dados da Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab("PRODUCTION")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "PRODUCTION"
              ? "bg-white dark:bg-[#1E1F24] text-[#FF650F] shadow-sm border border-black/5 dark:border-white/10"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gatilhos de Produção</span>
        </button>
      </div>

      {/* Conteúdo da Aba: WHATSAPP */}
      {activeTab === "WHATSAPP" && (
        <div className="space-y-6">
          {/* Card de Status da Conexão */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                    wppStatus?.status === "CONNECTED"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      Status do Gateway de WhatsApp
                    </h3>
                    {wppStatus?.status === "CONNECTED" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                        Conectado & Pronto
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1" />
                        Pareamento Pendente
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Sessão ativa:{" "}
                    <code className="text-[#FF650F] font-mono font-bold bg-[#FF650F]/10 px-1.5 py-0.5 rounded">
                      {wppStatus?.sessionName || "glessios-wpp"}
                    </code>
                    {wppStatus?.connectedNumber && (
                      <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                        • Número: {wppStatus.connectedNumber}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshWhatsappStatus(false)}
                  disabled={isCheckingWpp}
                  className="rounded-xl text-xs h-9"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCheckingWpp ? "animate-spin" : ""}`} />
                  Verificar Conexão
                </Button>

                {wppStatus?.status === "CONNECTED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isCheckingWpp}
                    className="rounded-xl text-xs h-9 border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Power className="w-3.5 h-3.5 mr-1.5" />
                    Desconectar Aparelho
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Aguardando leitura do QR Code
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel Dividido: QR Code à esquerda e Instruções / Configs à direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bloco 1: QR Code de Pareamento (5 colunas) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#FF650F]" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                    QR Code de Autenticação
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Sessão Oficial
                </Badge>
              </div>

              {/* Área Visual do QR Code com Efeito de Foco */}
              <div className="relative p-4 rounded-3xl bg-zinc-50 dark:bg-black/40 border-2 border-dashed border-[#FF650F]/40 flex flex-col items-center justify-center my-2 group">
                {wppStatus?.status === "CONNECTED" ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                      WhatsApp Pareado com Sucesso!
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px]">
                      Seu número está pronto para disparos automáticos e notificações.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      className="mt-4 rounded-xl text-xs h-8 text-red-500 border-red-500/30"
                    >
                      Trocar Aparelho / Reconectar
                    </Button>
                  </div>
                ) : wppStatus?.qrCode ? (
                  <div className="relative">
                    <img
                      src={wppStatus.qrCode}
                      alt="WhatsApp QR Code de Pareamento"
                      className="w-64 h-64 rounded-2xl shadow-md border border-black/10 dark:border-white/10 bg-white p-2"
                    />
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#FF650F] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : wppStatus?.isDaemonOnline === false ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-4 text-zinc-500">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Serviço Reiniciando ou Desconectado</span>
                    <span className="text-[11px] text-zinc-400 mt-1 mb-3">Clique no botão abaixo para restaurar a sessão limpa e emitir o QR Code.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSession}
                      disabled={isCheckingWpp}
                      className="rounded-xl text-xs h-8 text-[#FF650F] border-[#FF650F]/30 hover:bg-[#FF650F]/10"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCheckingWpp ? "animate-spin" : ""}`} />
                      Resetar e Gerar QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-center text-zinc-400 p-4">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2 text-[#FF650F]" />
                    <span className="text-xs font-medium">Gerando QR Code...</span>
                    <p className="text-[10px] text-zinc-500 mt-1 max-w-[180px]">Se demorar mais de alguns segundos, você pode forçar um novo código.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetSession}
                      disabled={isCheckingWpp}
                      className="mt-2 text-[11px] h-7 text-zinc-500 hover:text-[#FF650F]"
                    >
                      Forçar Novo QR Code
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                O QR Code é atualizado dinamicamente a cada sessão
              </p>

              <div className="w-full mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshWhatsappStatus(false)}
                  disabled={isCheckingWpp}
                  className="rounded-xl text-xs h-8"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isCheckingWpp ? "animate-spin" : ""}`} />
                  Atualizar QR Code
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetSession}
                  disabled={isCheckingWpp}
                  className="rounded-xl text-xs h-8 text-zinc-500 hover:text-red-500"
                  title="Limpa arquivos de sessão e força a geração de um novo QR Code"
                >
                  Resetar Sessão
                </Button>
              </div>
            </div>

            {/* Bloco 2: Instruções Resumidas & Simulador de Envio (7 colunas) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Instruções Resumidas Passo a Passo */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <HelpCircle className="w-4 h-4 text-[#FF650F]" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                    Instruções Rápidas de Pareamento
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FF650F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Abra o WhatsApp</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        No celular da empresa, abra o app oficial (padrão ou Business).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FF650F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Aparelhos Conectados</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Acesse ⋮ Mais Opções (Android) ou Ajustes (iPhone) &gt; Aparelhos Conectados.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FF650F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Escanear QR Code</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Toque em "Conectar um Aparelho" e aponte a câmera para o QR Code ao lado. A leitura é instantânea.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Disparos Prontos</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        A tela atualizará sozinha e o WhatsApp estará conectado sem precisar de confirmação manual.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ferramenta de Teste Imediato de Disparo */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#FF650F]" />
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                      Testar Envio Imediato no WhatsApp
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Validação em Tempo Real</span>
                </div>

                <form onSubmit={handleSendTestMessage} className="space-y-3.5">
                  {wppStatus?.connectedNumber && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        Remetente Pareado (Servidor):
                      </span>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                        {wppStatus.connectedNumber}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Número de Destino (Cliente / Quem irá receber):
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (99) 99999-9999"
                      value={testPhone}
                      onChange={(e) => setTestPhone(formatPhoneInput(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] font-mono font-medium" id="test-phone-input"
                    />
                    {wppStatus?.connectedNumber && testPhone.replace(/\D/g, "").length >= 8 && (
                      wppStatus.connectedNumber.replace(/\D/g, "").endsWith(testPhone.replace(/\D/g, "").slice(-8)) ||
                      testPhone.replace(/\D/g, "").endsWith(wppStatus.connectedNumber.replace(/\D/g, "").slice(-8))
                    ) && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>Você informou o mesmo número que está pareado no sistema como remetente.</span>
                      </div>
                    )}
                    <div className="mt-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF650F]" />
                        Instrução de Formato:
                      </p>
                      <p>
                        <strong>Não precisa digitar +55 nem o sinal de +</strong>. Digite apenas o <strong>DDD + Celular do cliente</strong> (ex: <code className="text-[#FF650F] font-mono font-bold">(99) 99999-9999</code>). O robô Icthus despacha a mensagem de forma autônoma e transparente.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Mensagem de Teste:
                    </label>
                    <textarea
                      rows={2}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      O robô envia diretamente para o número informado acima.
                    </span>

                    <Button
                      type="submit"
                      disabled={isSendingTest}
                      className="bg-[#FF650F] hover:bg-[#E55507] text-white font-bold text-xs rounded-xl h-9 px-4 flex items-center gap-1.5"
                    >
                      {isSendingTest ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Disparar Mensagem de Teste
                    </Button>
                  </div>
                </form>

                {/* Retorno do Teste */}
                {testFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                      testFeedback.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {testFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testFeedback.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Modelos de Mensagens Automáticas do WhatsApp */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-6">
            {/* Cabeçalho da Seção */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF650F]/15 border border-[#FF650F]/30 flex items-center justify-center text-[#FF650F]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      Modelos de Mensagens do WhatsApp
                    </h3>
                    <Badge className="bg-[#FF650F]/15 text-[#FF650F] border border-[#FF650F]/30 text-[10px] font-bold">
                      Personalizável
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Defina o que o cliente recebe no WhatsApp ao enviar propostas ou contratos, com links dinâmicos e tags automáticas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreDefault}
                  className="rounded-xl text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:text-[#FF650F]"
                  title="Restaura o modelo oficial pré-definido da Icthus"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Restaurar Padrão
                </Button>

                <Button
                  onClick={handleSaveGeneralSettings}
                  disabled={isSaving}
                  className="bg-[#FF650F] hover:bg-[#E55507] text-white font-bold text-xs rounded-xl shadow-md h-9 px-4 flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Salvar Modelos
                </Button>
              </div>
            </div>

            {/* Alternador de Abas de Modelos */}
            <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <button
                type="button"
                onClick={() => setActiveTemplateTab("PROPOSAL")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTemplateTab === "PROPOSAL"
                    ? "bg-[#FF650F] text-white shadow-md shadow-[#FF650F]/20"
                    : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📄 Proposta Comercial / Orçamento</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTemplateTab("CONTRACT")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTemplateTab === "CONTRACT"
                    ? "bg-[#FF650F] text-white shadow-md shadow-[#FF650F]/20"
                    : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>✍️ Contrato de Prestação de Serviços</span>
              </button>
            </div>

            {/* Painel de Tags Dinâmicas Clicáveis para Copiar e Inserir */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121316] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                  <Sparkles className="w-4 h-4 text-[#FF650F]" />
                  <span>Tags Dinâmicas Disponíveis:</span>
                  <span className="text-[11px] font-normal text-zinc-500">
                    (Clique no nome da tag para <strong>inserir no texto</strong> ou no botão para <strong>copiar</strong>)
                  </span>
                </div>
                {copiedTag && (
                  <span className="text-xs font-bold text-emerald-500 animate-in fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Tag {copiedTag} copiada para a área de transferência!
                  </span>
                )}
              </div>

              {/* Grid de Pílulas com as Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DYNAMIC_TAGS.map((item) => (
                  <div
                    key={item.tag}
                    className="group relative flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#1A1B20] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#FF650F]/50 transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleInsertTag(item.tag)}
                      className="flex-1 text-left truncate pr-1"
                      title={`Clique para inserir ${item.tag} na mensagem`}
                    >
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-[#FF650F] group-hover:underline">
                          {item.tag}
                        </code>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {item.label}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyTag(item.tag)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#FF650F] transition-colors shrink-0"
                      title={`Copiar ${item.tag}`}
                    >
                      {copiedTag === item.tag ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid com Editor à Esquerda e Simulador WhatsApp à Direita */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Editor de Texto (7 colunas) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span>Corpo da Mensagem ({activeTemplateTab === "PROPOSAL" ? "Orçamento" : "Contrato"}):</span>
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {getCurrentTemplateMessage().length} caracteres
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    ref={templateTextareaRef}
                    rows={12}
                    value={getCurrentTemplateMessage()}
                    onChange={(e) => setTemplateMessage(e.target.value)}
                    placeholder="Escreva a mensagem aqui... Clique nas tags acima para adicionar {cliente}, {link_proposta}, etc."
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] font-sans leading-relaxed resize-y shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>Dicas de formatação:</span>
                    <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded font-bold">*negrito*</code>
                    <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded italic">_itálico_</code>
                    <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded line-through">~tachado~</code>
                  </div>
                </div>
              </div>

              {/* Preview WhatsApp em Tempo Real (5 colunas) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#FF650F]" />
                    Prévia em Tempo Real (WhatsApp do Cliente)
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                    Simulador Oficial
                  </Badge>
                </div>

                {/* Caixa Simuladora de Conversa no WhatsApp */}
                <div className="flex-1 rounded-2xl bg-[#0b141a] border border-[#222e35] p-3 flex flex-col justify-between shadow-lg overflow-hidden min-h-[300px]">
                  {/* Header do Chat WhatsApp */}
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#222e35] text-white">
                    <div className="w-8 h-8 rounded-full bg-[#FF650F] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow">
                      I
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold truncate">Icthus Comunicação Visual</h5>
                      <span className="text-[10px] text-emerald-400 block truncate">Online agora</span>
                    </div>
                  </div>

                  {/* Corpo com Balão de Mensagem */}
                  <div className="py-4 space-y-3 flex-1 flex flex-col justify-end">
                    <div className="max-w-[92%] self-end bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs p-3 shadow-sm text-xs space-y-1">
                      {renderFormattedPreview(getCurrentTemplateMessage())}
                      <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-[#8696a0]">
                        <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-sky-400 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Simulador */}
                  <div className="pt-2 border-t border-[#222e35] text-[10px] text-[#8696a0] flex items-center justify-between">
                    <span>Exibindo com dados de exemplo</span>
                    <span className="font-mono text-[9px] text-[#00a884]">criptografia de ponta a ponta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba: PORTAL DO CLIENTE */}
      {activeTab === "PORTAL" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">
              Portal do Cliente (Icthus) — Acesso & Credenciais
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Defina as regras automáticas de boas-vindas e acesso quando a chave for ligada na Ficha 360° do CRM
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Senha Inicial Padrão:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.portal.defaultPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          portal: { ...settings.portal, defaultPassword: e.target.value },
                        })
                      }
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono font-bold"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(settings.portal.defaultPassword, "pwd")}
                      className="rounded-xl h-10 px-3 text-xs"
                    >
                      {copiedText === "pwd" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Senha atribuída aos novos usuários quando a chave é ativada.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    URL de Acesso ao Portal:
                  </label>
                  <input
                    type="text"
                    value={settings.portal.portalUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        portal: { ...settings.portal, portalUrl: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#FF650F]/5 border border-[#FF650F]/20">
                  <div className="flex items-center gap-2 text-[#FF650F] text-xs font-bold mb-1">
                    <Info className="w-4 h-4" />
                    Como funciona o envio automático:
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Sempre que a chave <strong>"Acesso ao Portal do Cliente (Icthus)"</strong> for ligada na ficha do contato, o sistema cria o usuário com o e-mail cadastrado e dispara a mensagem personalizada via WhatsApp com o link e a senha inicial.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Modelo da Mensagem de WhatsApp (Boas-Vindas):
                </label>
                <textarea
                  rows={8}
                  value={settings.portal.welcomeMessageTemplate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      portal: { ...settings.portal, welcomeMessageTemplate: e.target.value },
                    })
                  }
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF650F] font-sans resize-none"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Tags disponíveis: <code>{"{nome}"}</code>, <code>{"{email}"}</code>, <code>{"{senha}"}</code>, <code>{"{url}"}</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba: DADOS DA EMPRESA */}
      {activeTab === "COMPANY" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">
              Identificação & Comunicação Oficial da Icthus
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Estes dados são exibidos nos rodapés de propostas comerciais em PDF, faturas e mensagens automáticas
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Fantasia:
                </label>
                <input
                  type="text"
                  value={settings.company.tradeName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, tradeName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Razão Social:
                </label>
                <input
                  type="text"
                  value={settings.company.legalName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, legalName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  CNPJ:
                </label>
                <input
                  type="text"
                  value={settings.company.cnpj}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, cnpj: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail Oficial:
                </label>
                <input
                  type="email"
                  value={settings.company.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, email: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  WhatsApp Oficial de Atendimento:
                </label>
                <input
                  type="text"
                  value={settings.company.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Endereço da Fábrica / Escritório:
                </label>
                <input
                  type="text"
                  value={settings.company.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, address: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#101114] border border-black/10 dark:border-white/10 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba: GATILHOS DE PRODUÇÃO */}
      {activeTab === "PRODUCTION" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#16171B] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">
              Automações & Gatilhos no WhatsApp
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Marque quais eventos da esteira fabril disparam mensagens automáticas para os clientes
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] cursor-pointer hover:border-[#FF650F]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.production.notifyOnNewProof}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      production: { ...settings.production, notifyOnNewProof: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#FF650F] rounded focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Disparo de Prova de Arte Digital (Aprovação 1-clique)
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Envia mensagem com o link seguro do portal para o cliente aprovar ou solicitar ajustes do layout 3D.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] cursor-pointer hover:border-[#FF650F]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.production.notifyOnStageChange}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      production: { ...settings.production, notifyOnStageChange: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#FF650F] rounded focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Avanço de Fases da Esteira (Router CNC, Impressão UV, Montagem)
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Notifica o cliente quando a ordem avança entre as 8 fases de fabricação.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] cursor-pointer hover:border-[#FF650F]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.whatsapp.autoSendPixInvoice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, autoSendPixInvoice: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#FF650F] rounded focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Emissão de Fatura com PIX Copia e Cola
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Dispara o código Copia e Cola do PIX assim que uma fatura de produção for emitida.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
