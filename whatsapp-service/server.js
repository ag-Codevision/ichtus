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
 * Resolve o JID canônico e oficial registrado na Meta para o número de destino.
 * No Brasil (DDI 55), celulares possuem 9 dígitos (13 dígitos com DDI e DDD: 55 + DDD + 9xxxxxxxx).
 * O método sock.onWhatsApp() consulta os servidores da Meta e confirma o JID ativo.
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

  const candidates = [];

  // Gera variação com e sem o 9º dígito para o Brasil
  if (digits.startsWith("55")) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);

    if (digits.length === 13 && rest.startsWith("9")) {
      // 1º candidato: formato moderno com 9 (prioritário)
      candidates.push(digits);
      // 2º candidato: formato legado de 12 dígitos sem o 9
      candidates.push(`55${ddd}${rest.slice(1)}`);
    } else if (digits.length === 12) {
      // Se veio sem o 9, testar primeiro COM o 9 (padrão Brasil) e depois sem
      candidates.push(`55${ddd}9${rest}`);
      candidates.push(digits);
    } else {
      candidates.push(digits);
    }
  } else {
    candidates.push(digits);
  }

  console.log(`[WHATSAPP] Validando número na Meta via onWhatsApp. Candidatos:`, candidates);

  try {
    const checkResults = await sock.onWhatsApp(...candidates);
    console.log(`[WHATSAPP] Resultado da verificação da Meta:`, checkResults);

    if (Array.isArray(checkResults) && checkResults.length > 0) {
      // Prioridade 1: se encontrou com o 9º dígito (13 dígitos) e exists=true
      const withNineResult = checkResults.find(
        (r) => r && r.exists && r.jid && r.jid.split("@")[0].replace(/\D/g, "").length === 13
      );
      if (withNineResult) {
        console.log(`[WHATSAPP] ✅ JID canônico oficial identificado na Meta (com 9º dígito): ${withNineResult.jid}`);
        return { jid: withNineResult.jid, exists: true };
      }

      // Prioridade 2: qualquer outro registro ativo retornado pela Meta
      const active = checkResults.find((r) => r && r.exists && r.jid);
      if (active) {
        console.log(`[WHATSAPP] ✅ JID canônico oficial identificado na Meta: ${active.jid}`);
        return { jid: active.jid, exists: true };
      }
    }
  } catch (lookupErr) {
    console.warn(`[WHATSAPP] Aviso ao consultar onWhatsApp (${lookupErr.message}). Prosseguindo com fallback.`);
  }

  // Fallback: garante prioridade do número completo com 9 dígitos
  const preferredDigits = candidates[0] || digits;
  const fallbackJid = preferredDigits.includes("@s.whatsapp.net") ? preferredDigits : `${preferredDigits}@s.whatsapp.net`;
  console.log(`[WHATSAPP] Usando JID fallback: ${fallbackJid}`);
  return { jid: fallbackJid, exists: false };
}

async function startWhatsApp() {
  if (isStarting) return;
  isStarting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      generateHighQualityLinkPreview: false,
      browser: ["Icthus Comunicação Visual", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

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
          sentResult = await sock.sendMessage(jid, {
            image: { url: mediaUrl },
            caption: message,
          });
        } else {
          sentResult = await sock.sendMessage(jid, {
            text: message,
          });
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
