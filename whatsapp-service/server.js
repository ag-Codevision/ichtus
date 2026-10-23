const http = require("http");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const pino = require("pino");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

const PORT = process.env.PORT || 3001;
const AUTH_DIR = path.resolve(process.env.AUTH_DIR || path.join(__dirname, "auth_info"));

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let currentQrCode = null;
let isConnected = false;
let connectedPhone = null;
let isStarting = false;

// Store de mensagens em memória para responder a solicitações de retry (Signal E2EE)
const messageStore = new Map();

const logger = pino({ level: process.env.LOG_LEVEL || "warn" });

function formatPhoneNumber(jidOrId) {
  if (!jidOrId) return null;
  const raw = jidOrId.split(":")[0].split("@")[0].replace(/\D/g, "");
  if (raw.length === 13) {
    return `+${raw.slice(0, 2)} (${raw.slice(2, 4)}) ${raw.slice(4, 9)}-${raw.slice(9)}`;
  } else if (raw.length === 12) {
    return `+${raw.slice(0, 2)} (${raw.slice(2, 4)}) ${raw.slice(4, 8)}-${raw.slice(8)}`;
  }
  return `+${raw}`;
}

/**
 * Resolve o JID canônico e oficial para o número de destino.
 * No Brasil (DDI 55), celulares modernos operam obrigatoriamente com 9 dígitos (13 dígitos: 55 + DDD + 9xxxxxxxx).
 * A Meta armazena aliases legados de 12 dígitos, mas o envio DEVE ser feito para o JID moderno de 13 dígitos
 * para que o WhatsApp do celular do cliente decifre o texto sem ficar preso em "Aguardando mensagem".
 */
async function resolveCanonicalJid(targetPhone) {
  if (!sock || !isConnected) {
    throw new Error("O WhatsApp não está conectado no momento.");
  }

  // Remove caracteres não numéricos
  let digits = targetPhone.replace(/\D/g, "");

  // Se o usuário digitou apenas DDD + número (10 ou 11 dígitos), prefixar DDI 55
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = "55" + digits;
  }

  // Se já for um JID com domínio ou grupo
  if (targetPhone.includes("@g.us")) {
    return { jid: targetPhone, exists: true };
  }

  // Celulares no Brasil (DDI 55 + DDD 2 dígitos + 9 dígitos começando com 9 = 13 dígitos)
  if (digits.startsWith("55")) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);

    if (digits.length === 13 && rest.startsWith("9")) {
      const canonicalJid = `${digits}@s.whatsapp.net`;
      const legacyWithoutNine = `55${ddd}${rest.slice(1)}`;
      try {
        const checkResults = await sock.onWhatsApp(digits, legacyWithoutNine);
        console.log(`[WHATSAPP] Verificação de celular na Meta (${digits}):`, checkResults);
        const exists = Array.isArray(checkResults) && checkResults.some((r) => r && r.exists);
        console.log(`[WHATSAPP] ✅ JID de celular brasileiro definido: ${canonicalJid} (ativo: ${exists})`);
        return { jid: canonicalJid, exists };
      } catch (err) {
        console.warn(`[WHATSAPP] Aviso ao verificar onWhatsApp (${err.message}). Prosseguindo com ${canonicalJid}`);
        return { jid: canonicalJid, exists: true };
      }
    } else if (digits.length === 12 && !rest.startsWith("9")) {
      // Pode ser telefone fixo comercial (8 dígitos locais) ou celular antigo informado sem o 9
      // Se for celular (primeiro dígito entre 6 e 9), converte para o formato com 9
      const firstLocalDigit = rest.charAt(0);
      if (parseInt(firstLocalDigit, 10) >= 6) {
        const withNineDigits = `55${ddd}9${rest}`;
        const canonicalJid = `${withNineDigits}@s.whatsapp.net`;
        console.log(`[WHATSAPP] Celular informado sem o 9º dígito. Normalizado para: ${canonicalJid}`);
        return { jid: canonicalJid, exists: true };
      }
    }
  }

  // Fallback padrão para outros números e internacionais
  const standardJid = digits.includes("@s.whatsapp.net") ? digits : `${digits}@s.whatsapp.net`;
  console.log(`[WHATSAPP] Usando JID padrão: ${standardJid}`);
  return { jid: standardJid, exists: true };
}

async function startWhatsApp() {
  if (isStarting) return;
  isStarting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      generateHighQualityLinkPreview: false,
      browser: ["Icthus Comunicação Visual", "Chrome", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      getMessage: async (key) => {
        if (key && key.id && messageStore.has(key.id)) {
          const stored = messageStore.get(key.id);
          console.log(`[WHATSAPP] 🔄 Reenviando mensagem para retry de descriptografia (E2EE): ${key.id}`);
          return stored;
        }
        return undefined;
      },
    });

    sock.ev.on("creds.update", saveCreds);

    // Registra mensagens para responder a retries de descriptografia
    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key?.id && msg.message) {
          messageStore.set(msg.key.id, msg.message);
          if (messageStore.size > 1000) {
            const first = messageStore.keys().next().value;
            messageStore.delete(first);
          }
        }
      }
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQrCode = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: {
              dark: "#0B0C0D",
              light: "#FFFFFF",
            },
          });
          isConnected = false;
          console.log("[WHATSAPP] Novo QR Code real gerado com sucesso para autenticação.");
        } catch (err) {
          console.error("[WHATSAPP] Erro ao converter QR Code para Base64:", err);
        }
      }

      if (connection === "open") {
        isConnected = true;
        currentQrCode = null;
        connectedPhone = formatPhoneNumber(sock.user?.id);
        console.log(`[WHATSAPP] ✅ Conexão estabelecida com sucesso! Telefone: ${connectedPhone}`);
      }

      if (connection === "close") {
        isConnected = false;
        const statusCode = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode
          : (lastDisconnect?.error)?.statusCode;

        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[WHATSAPP] Conexão encerrada. Código: ${statusCode}. Desconectado: ${isLoggedOut}`);

        if (isLoggedOut) {
          console.log("[WHATSAPP] Sessão deslogada. Limpando credenciais locais e reiniciando...");
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(AUTH_DIR, { recursive: true });
          } catch (e) {
            console.error("[WHATSAPP] Erro ao limpar auth_dir:", e);
          }
          connectedPhone = null;
          currentQrCode = null;
          isStarting = false;
          setTimeout(startWhatsApp, 3000);
        } else {
          console.log("[WHATSAPP] Reconectando automaticamente aos servidores do WhatsApp em 3s...");
          isStarting = false;
          setTimeout(startWhatsApp, 3000);
        }
      }
    });
  } catch (error) {
    console.error("[WHATSAPP] Falha crítica ao inicializar WhatsApp Socket:", error);
    isStarting = false;
    setTimeout(startWhatsApp, 5000);
  } finally {
    isStarting = false;
  }
}

// Inicializa o WhatsApp Baileys imediatamente
startWhatsApp();

// Servidor HTTP de Integração
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // 1. Healthcheck
  if (req.method === "GET" && (pathname === "/" || pathname === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        ok: true,
        service: "Icthus WhatsApp Service (Baileys Real)",
        connected: isConnected,
        phone: connectedPhone,
      })
    );
  }

  // 2. Status do WhatsApp e QR Code
  if (req.method === "GET" && pathname === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        success: true,
        connected: isConnected,
        status: isConnected ? "CONNECTED" : "PAIRING_REQUIRED",
        phone: connectedPhone,
        qrCode: isConnected ? null : currentQrCode,
        timestamp: new Date().toISOString(),
      })
    );
  }

  // 3. Disparo Real de Mensagem
  if (req.method === "POST" && pathname === "/api/send") {
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk;
    });

    req.on("end", async () => {
      try {
        const body = JSON.parse(bodyData || "{}");
        const { to, message, mediaUrl } = body;

        if (!to || !message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              success: false,
              error: "Informe o número de destino ('to') e o texto da mensagem ('message').",
            })
          );
        }

        if (!sock || !isConnected) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              success: false,
              error:
                "O WhatsApp da Icthus não está conectado. Escaneie o QR Code no painel de configurações para parear o aparelho.",
            })
          );
        }

        const { jid, exists } = await resolveCanonicalJid(to);

        // Identifica se o destinatário é o mesmo aparelho pareado no sistema
        const connectedDigits = (sock.user?.id || "").split(":")[0].split("@")[0].replace(/\D/g, "");
        const targetDigits = jid.split("@")[0].replace(/\D/g, "");
        const isSelf = Boolean(connectedDigits && targetDigits && (connectedDigits === targetDigits || connectedDigits.endsWith(targetDigits.slice(-8)) || targetDigits.endsWith(connectedDigits.slice(-8))));

        if (isSelf) {
          console.warn(`[WHATSAPP] ⚠️ AVISO: Mensagem sendo enviada para o próprio número pareado (${connectedPhone || targetDigits}).`);
        }

        let sentResult;
        if (mediaUrl) {
          const payload = {
            image: { url: mediaUrl },
            caption: message,
          };
          sentResult = await sock.sendMessage(jid, payload);
          if (sentResult?.key?.id) {
            messageStore.set(sentResult.key.id, {
              imageMessage: { caption: message, url: mediaUrl },
            });
          }
        } else {
          const payload = { text: message };
          sentResult = await sock.sendMessage(jid, payload);
          if (sentResult?.key?.id) {
            messageStore.set(sentResult.key.id, {
              conversation: message,
            });
          }
        }

        console.log(`[WHATSAPP] Mensagem enviada com sucesso para ${jid} (verificado Meta: ${exists}, autoEnvio: ${isSelf}). ID: ${sentResult?.key?.id}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            success: true,
            messageId: sentResult?.key?.id || `wpp-${Date.now()}`,
            resolvedJid: jid,
            verified: exists,
            isSelf,
            mode: "baileys_live",
          })
        );
      } catch (err) {
        console.error("[WHATSAPP] Erro ao enviar mensagem:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            success: false,
            error: err?.message || "Falha ao despachar mensagem pelo WhatsApp.",
          })
        );
      }
    });
    return;
  }

  // 4. Desconectar Sessão
  if (req.method === "POST" && pathname === "/api/disconnect") {
    try {
      console.log("[WHATSAPP] Solicitação manual de desconexão recebida.");
      if (sock) {
        await sock.logout().catch(() => null);
      }
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      } catch (e) {
        console.error("[WHATSAPP] Erro ao limpar pasta auth_info:", e);
      }
      isConnected = false;
      connectedPhone = null;
      currentQrCode = null;
      setTimeout(startWhatsApp, 1500);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: true,
          status: "PAIRING_REQUIRED",
          message: "Sessão desconectada. Novo QR Code será gerado em instantes.",
        })
      );
    } catch (err) {
      console.error("[WHATSAPP] Erro ao desconectar:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: false,
          error: err?.message || "Falha ao desconectar sessão.",
        })
      );
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint não encontrado" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[WHATSAPP SERVICE] Microserviço ativo na porta ${PORT}`);
  console.log(`[WHATSAPP SERVICE] Diretório de autenticação: ${AUTH_DIR}`);
});
