import { exec } from "child_process";
import { promisify } from "util";
import { getSystemSettings } from "@/lib/settings/system-settings";

const execAsync = promisify(exec);

export interface WACLiSendOptions {
  to: string; // Número com código do país e DDD, ex: "5541999998888" ou "41999998888"
  message: string;
  mediaUrl?: string;
}

export interface WACLiResult {
  success: boolean;
  messageId?: string;
  mode: "http" | "cli" | "mock_dev";
  resolvedJid?: string;
  verified?: boolean;
  error?: string;
}

/**
 * Normaliza o número de telefone para formato internacional padrão (DDI + DDD + Número)
 * Aceita números com ou sem +55, com ou sem formatação, máscaras ou espaços.
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
 * Cliente de Envio via WhatsApp (Microserviço Baileys Dedicado)
 */
export async function sendWhatsAppMessage({
  to,
  message,
  mediaUrl,
}: WACLiSendOptions): Promise<WACLiResult> {
  const targetNumber = normalizePhoneNumber(to);
  const sysSettings = getSystemSettings();
  const wacliApiUrl =
    process.env.WACLI_API_URL || sysSettings?.whatsapp?.apiUrl || "http://127.0.0.1:3001";
  const session = sysSettings?.whatsapp?.sessionName || process.env.WACLI_SESSION || "glessios-wpp";

  // 1. Envio prioritário via Microserviço HTTP do WhatsApp (Baileys)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para protocolo WS

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

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      return {
        success: true,
        messageId: data.messageId || data.id || `wpp-${Date.now()}`,
        mode: "http",
        resolvedJid: data.resolvedJid,
        verified: data.verified,
      };
    } else if (data?.error) {
      return {
        success: false,
        mode: "http",
        error: data.error,
      };
    }
  } catch (err: any) {
    console.warn(`[WHATSAPP CLIENT] Falha de comunicação com microserviço (${wacliApiUrl}):`, err?.message || err);
  }

  // 2. Se o microserviço HTTP falhou, verificar se há CLI local instalada
  const wacliPath = process.env.WACLI_PATH;
  if (wacliPath) {
    try {
      const safeMsg = message.replace(/"/g, '\\"');
      const mediaFlag = mediaUrl ? ` --media "${mediaUrl}"` : "";
      const cmd = `${wacliPath} send --session "${session}" --to "${targetNumber}" --text "${safeMsg}"${mediaFlag}`;

      const { stdout, stderr } = await execAsync(cmd, { timeout: 8000 });
      if (!stderr || stderr.trim().length === 0 || stdout.includes("success")) {
        return {
          success: true,
          messageId: `wacli-cli-${Date.now()}`,
          mode: "cli",
        };
      }
    } catch (cliError: any) {
      return {
        success: false,
        mode: "cli",
        error: cliError?.message || "Erro ao executar CLI local do WhatsApp",
      };
    }
  }

  // Retorna erro real sem fingir mock fake
  return {
    success: false,
    mode: "http",
    error:
      "Não foi possível enviar a mensagem. O WhatsApp não está conectado ou o serviço está iniciando. Verifique o QR Code em Configurações.",
  };
}

/**
 * Templates de Mensagens Oficiais da Icthus
 */
export const WhatsAppTemplates = {
  // Notificação de Prova de Arte Pronta para Aprovação
  artworkProofReady: (clientName: string, osCode: string, approvalUrl: string) => `
🎨 *Icthus Comunicação Visual*
Olá, *${clientName}*!

A prova digital do seu projeto / letreiro da ordem *${osCode}* está pronta para sua avaliação!

Confira o mockup 3D, especificações e aprove diretamente pelo link:
👉 ${approvalUrl}

Qualquer ajuste pode ser solicitado diretamente pela plataforma com 1 clique!
  `.trim(),

  // Transição de Status da OS
  osStageUpdated: (clientName: string, osCode: string, newStage: string) => `
⚙️ *Atualização de Produção — Icthus*
Olá, *${clientName}*!

A sua ordem *${osCode}* avançou de etapa:
📍 *Status Atual:* ${newStage}

Acompanhe os detalhes em tempo real no seu Portal do Cliente:
👉 https://icthusbrasil.com/portal
  `.trim(),

  // Boas-Vindas e Acesso ao Portal do Cliente com Credenciais
  welcomeCustomerWithCredentials: (
    clientName: string,
    email: string,
    portalUrl: string,
    initialPassword: string = "Icthus@123"
  ) => `
👋 Olá, *${clientName}*!
Seja muito bem-vindo(a) à *Icthus*!

Seu perfil de acesso ao nosso *Portal do Cliente* foi liberado com sucesso. Por lá você pode acompanhar tudo em tempo real:
📐 Aprovação de layouts e projetos
⚙️ Acompanhamento das etapas de produção
📄 Faturas e pagamentos com liberação instantânea
📅 Agendamentos de medição técnica e instalação

🔗 *Acesso ao Portal:* ${portalUrl}
📧 *Seu Login:* ${email}
🔑 *Sua Senha Inicial:* ${initialPassword}

*(Recomendamos alterar sua senha para uma de sua preferência no menu do seu perfil ao entrar).*

Qualquer dúvida, estamos à disposição por este canal!
  `.trim(),

  // Boas-Vindas genérica
  welcomeCustomer: (clientName: string, email: string, portalUrl: string) => `
👋 *Bem-vindo(a) à Icthus!*
Olá, *${clientName}*!

Seu projeto já foi iniciado em nosso sistema integrado. Você pode acompanhar cada etapa em tempo real pelo seu Portal:

🔗 *Acesso:* ${portalUrl}
📧 *Login:* ${email}

Estamos à disposição para transformar sua marca em um marco visual!
  `.trim(),

  // Envio de Fatura / Cobrança com PIX
  invoicePix: (clientName: string, invoiceCode: string, amount: string, pixCode: string) => `
💳 *Fatura Emitida — Icthus*
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
 * Cliente WhatsApp canônico
 */
export const wacli = {
  sendMessage: sendWhatsAppMessage,
  templates: WhatsAppTemplates,
};
