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

// Utilitário para cache em memória compatível com a interface CacheStore do Baileys
function createMemoryCache(maxSize = 2500) {
  const store = new Map();
  return {
    get: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
      if (store.size > maxSize) {
        const first = store.keys().next().value;
        store.delete(first);
      }
    },
    del: (key) => store.delete(key),
    flushAll: () => store.clear(),
  };
}

const msgRetryCounterCache = createMemoryCache(3000);
const userDevicesCache = createMemoryCache(3000);

/**
 * Esvazia os arquivos e pastas internas de auth_info sem remover o diretório em si.
 * Isso evita o erro crítico EBUSY no Linux quando auth_info é ponto de montagem de volume no Docker.
 */

/**
 * Validação preventiva e auto-recuperação da pasta de credenciais.
 * Protege contra quedas, falta temporária de disco (ENOSPC) ou corrupção de creds.json (0 bytes).
 */
function validateAndHealAuthDir() {
  try {
    const credsPath = path.join(AUTH_DIR, "creds.json");
    if (fs.existsSync(credsPath)) {
      const stats = fs.statSync(credsPath);
      if (stats.size === 0) {
        console.warn("[WHATSAPP] ⚠️ Arquivo creds.json possui 0 bytes (corrompido). Executando auto-recuperação preventiva...");
        clearAuthDir();
        return;
      }
      try {
        const content = fs.readFileSync(credsPath, "utf8");
        JSON.parse(content);
      } catch (parseErr) {
        console.warn("[WHATSAPP] ⚠️ Conteúdo de creds.json inválido/ilegível. Executando auto-recuperação preventiva...", parseErr.message);
        clearAuthDir();
        return;
      }
    }
  } catch (err) {
    console.error("[WHATSAPP] Erro na verificação preventiva de integridade da sessão:", err);
  }
}

function clearAuthDir() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      const files = fs.readdirSync(AUTH_DIR);
      for (const file of files) {
        const filePath = path.join(AUTH_DIR, file);
        try {
          fs.rmSync(filePath, { recursive: true, force: true });
        } catch (fileErr) {
          console.warn(`[WHATSAPP] Falha ao remover item de sessão ${file}:`, fileErr.message);
        }
      }
      console.log(`[WHATSAPP] ✅ Pasta auth_info esvaziada com sucesso (${files.length} itens removidos).`);
    }
  } catch (err) {
    console.error("[WHATSAPP] Erro ao esvaziar auth_info:", err);
  }
}

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
 * Resolve o JID canônico e oficial para o número de destino via API da Meta (Baileys).
 * 
 * Regra para celulares no Brasil (DDI 55):
 * O WhatsApp da Meta armazena contas brasileiras sob dois padrões possíveis:
 * 1. Legado (12 dígitos, sem o nono dígito '9', ex: 555183295686@s.whatsapp.net): contas mais antigas.
 * 2. Moderno (13 dígitos, com o nono dígito '9', ex: 5551983295686@s.whatsapp.net): contas mais novas.
 * 
 * CRÍTICO: Se enviarmos para o formato que não corresponde ao registro oficial na Meta,
 * a mensagem é descartada silenciosamente pelos servidores do WhatsApp ou a entrega não ocorre.
 * 
 * Portanto, geramos as variações possíveis (com 9 e sem 9) e consultamos `sock.onWhatsApp(...)`.
 * Usamos EXATAMENTE o JID oficial confirmado pela Meta (`exists: true`).
 */
async function resolveCanonicalJid(targetPhone) {
  if (!sock || !isConnected) {
    throw new Error("O WhatsApp não está conectado no momento.");
  }

  // Remove caracteres não numéricos
  let digits = targetPhone.replace(/\D/g, "");

  // Se já for um JID com domínio ou grupo
  if (targetPhone.includes("@g.us") || targetPhone.includes("@broadcast")) {
    return { jid: targetPhone, exists: true };
  }

  // Se o usuário digitou apenas DDD + número (10 ou 11 dígitos), prefixar DDI 55
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = "55" + digits;
  }

  const candidateNumbers = [];

  // Variações para números brasileiros (+55)
  if (digits.startsWith("55") && digits.length >= 12) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);

    if (rest.length === 9) {
      // Número informado com 9 dígitos locais (13 dígitos no total)
      // Variação 1: formato legado da Meta (sem o 9 inicial) -> 12 dígitos
      const legacyWithoutNine = `55${ddd}${rest.slice(1)}`;
      candidateNumbers.push(legacyWithoutNine);
      // Variação 2: formato moderno (com os 9 dígitos) -> 13 dígitos
      candidateNumbers.push(digits);
    } else if (rest.length === 8) {
      // Número informado com 8 dígitos locais (12 dígitos no total)
      // Se for celular (começando de 6 a 9), pode ter nono dígito na Meta
      if (parseInt(rest[0], 10) >= 6) {
        candidateNumbers.push(`55${ddd}9${rest}`);
      }
      // Variação exata informada (legado ou fixo)
      candidateNumbers.push(digits);
    } else {
      candidateNumbers.push(digits);
    }
  } else {
    candidateNumbers.push(digits);
  }

  console.log(`[WHATSAPP] 🔍 Consultando registro oficial na Meta para variações:`, candidateNumbers);

  try {
    const checkResults = await sock.onWhatsApp(...candidateNumbers);
    console.log(`[WHATSAPP] 📥 Resposta onWhatsApp da Meta:`, JSON.stringify(checkResults));

    if (Array.isArray(checkResults)) {
      // Procura primeiro pelo candidato que a Meta confirmou como ativo (exists: true)
      const activeUser = checkResults.find((r) => r && r.exists && r.jid);
      if (activeUser) {
        console.log(`[WHATSAPP] ✅ JID oficial confirmado pela Meta: ${activeUser.jid}`);
        return { jid: activeUser.jid, exists: true };
      }
    }
  } catch (err) {
    console.warn(`[WHATSAPP] ⚠️ Falha na verificação onWhatsApp (${err.message}). Prosseguindo com fallback.`);
  }

  // Fallback seguro se não houver confirmação na Meta
  const fallbackNum = candidateNumbers[0] || digits;
  const fallbackJid = fallbackNum.includes("@s.whatsapp.net") ? fallbackNum : `${fallbackNum}@s.whatsapp.net`;
  console.log(`[WHATSAPP] ⚠️ JID não confirmado na Meta. Usando fallback: ${fallbackJid}`);
  return { jid: fallbackJid, exists: false };
}

async function startWhatsApp() {
  if (isStarting) return;
  isStarting = true;

  try {
    validateAndHealAuthDir();
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      msgRetryCounterCache,
      userDevicesCache,
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

        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        console.log(`[WHATSAPP] Conexão encerrada. Código: ${statusCode}. Desconectado/Revogado: ${isLoggedOut}`);

        if (isLoggedOut) {
          console.log("[WHATSAPP] Sessão deslogada/revogada. Limpando credenciais locais e reiniciando para novo QR Code...");
          clearAuthDir();
          connectedPhone = null;
          currentQrCode = null;
          isStarting = false;
          setTimeout(startWhatsApp, 1000);
        } else {
          console.log(`[WHATSAPP] Reconectando automaticamente aos servidores do WhatsApp em 3s (código: ${statusCode})...`);
          isStarting = false;
          setTimeout(startWhatsApp, 3000);
        }
      }
    });
  } catch (error) {
    console.error("[WHATSAPP] Falha crítica ao inicializar WhatsApp Socket:", error);
    if (error?.name === "SyntaxError" || error?.message?.includes("JSON") || error?.message?.includes("Unexpected end")) {
      console.warn("[WHATSAPP] ⚠️ Detectado arquivo de sessão corrompido no erro. Limpando credenciais para auto-recuperação...");
      clearAuthDir();
    }
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
        const { to, message, mediaUrl, documentUrl, documentBase64, fileName, mimetype } = body;

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

        // Identifica com precisão se o destinatário é o mesmo aparelho pareado no sistema (DDD + número)
        const connectedDigits = (sock.user?.id || "").split(":")[0].split("@")[0].replace(/\D/g, "");
        const targetDigits = jid.split("@")[0].replace(/\D/g, "");
        const isSelf = Boolean(
          connectedDigits &&
          targetDigits &&
          (connectedDigits === targetDigits ||
            (connectedDigits.length >= 10 && targetDigits.length >= 10 && connectedDigits.slice(-10) === targetDigits.slice(-10)))
        );

        if (isSelf) {
          console.warn(`[WHATSAPP] ⚠️ AVISO: Mensagem sendo enviada para o próprio número pareado (${connectedPhone || targetDigits}).`);
        }

        let sentResult;
        if (documentUrl) {
          let docBuffer;
          if (documentUrl.startsWith("http://") || documentUrl.startsWith("https://")) {
            const fetchRes = await fetch(documentUrl);
            docBuffer = Buffer.from(await fetchRes.arrayBuffer());
          } else if (fs.existsSync(documentUrl)) {
            docBuffer = fs.readFileSync(documentUrl);
          } else {
            const rootRel = path.resolve(process.cwd(), "..", documentUrl.replace(/^\//, ""));
            const currRel = path.resolve(process.cwd(), documentUrl.replace(/^\//, ""));
            const pubRel = path.resolve(process.cwd(), "public", documentUrl.replace(/^\//, ""));
            const parentPubRel = path.resolve(process.cwd(), "..", "public", documentUrl.replace(/^\//, ""));
            if (fs.existsSync(rootRel)) docBuffer = fs.readFileSync(rootRel);
            else if (fs.existsSync(currRel)) docBuffer = fs.readFileSync(currRel);
            else if (fs.existsSync(pubRel)) docBuffer = fs.readFileSync(pubRel);
            else if (fs.existsSync(parentPubRel)) docBuffer = fs.readFileSync(parentPubRel);
            else throw new Error("Documento não encontrado no caminho: " + documentUrl);
          }
          const payload = {
            document: docBuffer,
            mimetype: mimetype || "application/pdf",
            fileName: fileName || "Orcamento_Icthus.pdf",
            caption: message,
          };
          sentResult = await sock.sendMessage(jid, payload);
          if (sentResult?.key?.id) {
            messageStore.set(
              sentResult.key.id,
              sentResult.message || { documentMessage: { caption: message, fileName: fileName || "Orcamento_Icthus.pdf" } }
            );
          }
        } else if (mediaUrl) {
          const payload = {
            image: { url: mediaUrl },
            caption: message,
          };
          sentResult = await sock.sendMessage(jid, payload);
          if (sentResult?.key?.id) {
            // Salva o proto original da mensagem para atender retries do Signal Protocol E2EE
            messageStore.set(
              sentResult.key.id,
              sentResult.message || { imageMessage: { caption: message, url: mediaUrl } }
            );
          }
        } else {
          const payload = { text: message };
          sentResult = await sock.sendMessage(jid, payload);
          if (sentResult?.key?.id) {
            // Salva o proto original da mensagem para atender retries do Signal Protocol E2EE
            messageStore.set(
              sentResult.key.id,
              sentResult.message || { conversation: message }
            );
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
  if (req.method === "POST" && (pathname === "/api/disconnect" || pathname === "/api/reset")) {
    try {
      console.log("[WHATSAPP] Solicitação manual de desconexão recebida.");
      if (sock) {
        try {
          await sock.logout();
        } catch (logoutErr) {
          console.warn("[WHATSAPP] Aviso ao executar logout:", logoutErr.message);
        }
        try {
          sock.end(undefined);
        } catch (_) {}
        sock = null;
      }
      clearAuthDir();
      isConnected = false;
      connectedPhone = null;
      currentQrCode = null;
      isStarting = false;

      // Inicia imediatamente novo socket limpo para gerar o QR code
      setTimeout(startWhatsApp, 800);

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

  // 5. Diagnóstico de número na Meta
  if (req.method === "GET" && pathname === "/api/check-phone") {
    try {
      const phone = parsedUrl.searchParams.get("phone") || "";
      if (!sock || !isConnected) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: "WhatsApp não está conectado no momento." }));
      }
      const canonical = await resolveCanonicalJid(phone);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true, input: phone, ...canonical }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint não encontrado" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[WHATSAPP SERVICE] Microserviço ativo na porta ${PORT}`);
  console.log(`[WHATSAPP SERVICE] Diretório de autenticação: ${AUTH_DIR}`);
});
