import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface WACLiSendOptions {
  to: string; // Número com código do país e DDD, ex: "5541999998888" ou "41999998888"
  message: string;
  mediaUrl?: string;
}

export interface WACLiResult {
  success: boolean;
  messageId?: string;
  mode: "cli" | "http" | "mock_dev";
  error?: string;
}

/**
 * Normaliza o número de telefone para formato internacional padrão (DDI + DDD + Número)
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10 && digits.length <= 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Cliente de Envio via WACLI (WhatsApp CLI / Daemon Service)
 */
export async function sendWhatsAppMessage({
  to,
  message,
  mediaUrl,
}: WACLiSendOptions): Promise<WACLiResult> {
  const targetNumber = normalizePhoneNumber(to);
  const wacliApiUrl = process.env.WACLI_API_URL || "http://localhost:3001";
  const wacliPath = process.env.WACLI_PATH || "wacli";
  const session = process.env.WACLI_SESSION || "glessios-wpp";

  // 1. Tentar envio via serviço HTTP do WACLI (se rodando como daemon local)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`${wacliApiUrl}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session,
        to: targetNumber,
        message,
        mediaUrl,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        messageId: data.id || `wacli-http-${Date.now()}`,
        mode: "http",
      };
    }
  } catch {
    // Falha de conexão com daemon HTTP, prosseguir para tentativa via CLI local
  }

  // 2. Tentar envio direto via linha de comando (CLI)
  try {
    // Sanitização de texto para shell seguro
    const safeMsg = message.replace(/"/g, '\\"');
    const mediaFlag = mediaUrl ? ` --media "${mediaUrl}"` : "";
    const cmd = `${wacliPath} send --session "${session}" --to "${targetNumber}" --text "${safeMsg}"${mediaFlag}`;

    const { stdout, stderr } = await execAsync(cmd, { timeout: 2500 });
    if (!stderr || stderr.trim().length === 0 || stdout.includes("success")) {
      return {
        success: true,
        messageId: `wacli-cli-${Date.now()}`,
        mode: "cli",
      };
    }
  } catch (cliError: any) {
    // Se a CLI não estiver instalada ou não tiver sessão ativa, registrar log estruturado em desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[WACLI DEV MOCK] Mensagem simulada com sucesso para ${targetNumber}:\n${message}`
      );
      return {
        success: true,
        messageId: `mock-dev-${Date.now()}`,
        mode: "mock_dev",
      };
    }

    return {
      success: false,
      mode: "cli",
      error: cliError?.message || "Erro desconhecido ao executar WACLI",
    };
  }

  return {
    success: false,
    mode: "cli",
    error: "Falha ao enviar mensagem através dos adaptadores do WACLI",
  };
}

/**
 * Templates de Mensagens Oficiais da Glessios
 */
export const WhatsAppTemplates = {
  // Notificação de Prova de Arte Pronta para Aprovação
  artworkProofReady: (clientName: string, osCode: string, approvalUrl: string) => `
🎨 *Glessios Comunicação Visual*
Olá, *${clientName}*!

A prova digital da sua fachada / letreiro da ordem *${osCode}* está pronta para sua avaliação!

Confira o mockup 3D, especificações e aprove diretamente pelo link:
👉 ${approvalUrl}

Qualquer ajuste pode ser solicitado diretamente pela plataforma com 1 clique!
  `.trim(),

  // Transição de Status da OS
  osStageUpdated: (clientName: string, osCode: string, newStage: string) => `
⚙️ *Atualização de Produção — Glessios*
Olá, *${clientName}*!

A sua ordem *${osCode}* avançou de etapa:
📍 *Status Atual:* ${newStage}

Acompanhe os detalhes em tempo real no seu Portal do Cliente:
👉 https://glessios.com.br/portal
  `.trim(),

  // Boas-Vindas e Acesso ao Portal do Cliente
  welcomeCustomer: (clientName: string, email: string, portalUrl: string) => `
👋 *Bem-vindo(a) à Glessios Comunicação Visual!*
Olá, *${clientName}*!

Seu projeto já foi iniciado em nosso sistema integrado. Você pode acompanhar cada etapa da fabricação em tempo real pelo seu Portal:

🔗 *Acesso:* ${portalUrl}
📧 *Login:* ${email}

Estamos à disposição para transformar sua marca em um marco visual!
  `.trim(),

  // Envio de Fatura / Cobrança com PIX
  invoicePix: (clientName: string, invoiceCode: string, amount: string, pixCode: string) => `
💳 *Fatura Emitida — Glessios*
Olá, *${clientName}*!

A fatura *${invoiceCode}* no valor de *${amount}* foi gerada.

Para pagamento instantâneo via PIX, utilize o código Copia e Cola abaixo:
\`\`\`
${pixCode}
\`\`\`

O comprovante é processado automaticamente e sua produção é liberada de imediato.
  `.trim(),
};

/**
 * Cliente WACLI canônico
 */
export const wacli = {
  sendMessage: sendWhatsAppMessage,
  templates: WhatsAppTemplates,
};

