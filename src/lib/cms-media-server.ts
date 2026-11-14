import dns from "dns/promises";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import net from "net";
import { NextRequest } from "next/server";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const FETCH_TIMEOUT_MS = 25_000;

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-m4v": ".m4v",
  "video/x-msvideo": ".avi",
};

const EXT_TO_IMAGE_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const EXT_TO_VIDEO_MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".avi": "video/x-msvideo",
};

export interface ImportedMediaResult {
  url: string;
  fileName: string;
  mediaType: "image" | "video";
  mimeType: string;
  size: number;
}

/**
 * Valida se a requisição pertence a um administrador autenticado.
 */
export function verifyAdminRequest(request: NextRequest): boolean {
  const adminCookie = request.cookies.get("glessios_admin_session")?.value;
  if (!adminCookie) return false;
  try {
    const parsed = JSON.parse(adminCookie);
    return parsed.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * Verifica se um endereço IPv4 ou IPv6 é privado, loopback ou reservado (proteção SSRF).
 */
function isPrivateOrReservedIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();

  if (normalized.startsWith("::ffff:")) {
    return isPrivateOrReservedIp(normalized.slice(7));
  }

  if (net.isIPv4(normalized)) {
    const parts = normalized.split(".").map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts;

    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
    if (a === 127) return true; // 127.0.0.0/8 (Loopback)
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (Link-local / Cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15
    if (a >= 224) return true; // Multicast & Reserved
    return false;
  }

  if (net.isIPv6(normalized)) {
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA fc00::/7
    if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
      return true; // Link-local fe80::/10
    }
    if (normalized.startsWith("ff")) return true; // Multicast
    return false;
  }

  return true;
}

/**
 * Valida URL pública HTTP/HTTPS e resolve DNS para prevenir SSRF.
 */
export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("URL inválida. Informe um link completo começando com https://");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Protocolo não permitido. Use apenas links http:// ou https://");
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    throw new Error("Domínio de rede local não permitido.");
  }

  if (net.isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      throw new Error("Endereço IP privado ou reservado não permitido.");
    }
    return parsed;
  }

  const records = await dns.lookup(host, { all: true });
  if (!records || records.length === 0) {
    throw new Error("Não foi possível resolver o domínio informado.");
  }

  for (const rec of records) {
    if (isPrivateOrReservedIp(rec.address)) {
      throw new Error("O domínio informado aponta para um endereço de rede privado.");
    }
  }

  return parsed;
}

/**
 * Extrai shortcode caso a URL seja de um post, reel ou IGTV público do Instagram.
 */
export function extractInstagramShortcode(url: URL): { shortcode: string; isReelOrVideo: boolean } | null {
  const host = url.hostname.toLowerCase();
  if (!host.endsWith("instagram.com") && !host.endsWith("instagr.am")) {
    return null;
  }

  const match = url.pathname.match(/^\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;

  const kind = match[1].toLowerCase();
  return {
    shortcode: match[2],
    isReelOrVideo: kind === "reel" || kind === "reels" || kind === "tv",
  };
}

/**
 * Executa fetch seguindo redirecionamentos manualmente com validação anti-SSRF em cada salto.
 */
async function fetchWithSafeRedirects(
  initialUrl: string,
  headers: Record<string, string>,
  maxRedirects = 5
): Promise<{ response: Response; finalUrl: URL }> {
  let currentUrl = await assertSafePublicUrl(initialUrl);

  for (let i = 0; i <= maxRedirects; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl.toString(), {
        method: "GET",
        headers,
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new Error("Redirecionamento inválido ao acessar o link.");
      }
      const nextUrl = new URL(location, currentUrl);
      if (
        nextUrl.hostname.toLowerCase().includes("instagram.com") &&
        nextUrl.pathname.toLowerCase().includes("/accounts/login")
      ) {
        throw new Error(
          "O Instagram exigiu login para acessar este link de post. Dica: abra a imagem no navegador, clique com o botão direito → 'Copiar endereço da imagem' e cole aqui, ou salve e faça upload do arquivo."
        );
      }
      currentUrl = await assertSafePublicUrl(nextUrl.toString());
      continue;
    }

    return { response: res, finalUrl: currentUrl };
  }

  throw new Error("Muitos redirecionamentos ao tentar acessar a URL.");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/");
}

function extractMetaContent(html: string, propertyNames: string[]): string | null {
  for (const prop of propertyNames) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
    ];
    for (const regex of patterns) {
      const match = html.match(regex);
      if (match && match[1]) {
        return decodeHtmlEntities(match[1].trim());
      }
    }
  }
  return null;
}

/**
 * Tenta obter a URL direta da mídia pública a partir de um post/reel do Instagram.
 */
async function resolveInstagramPostMediaUrl(
  shortcode: string,
  preferVideo: boolean
): Promise<string[]> {
  const candidates: string[] = [];
  const browserLikeHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  // 1. Tenta página pública do embed / post para ler tags OpenGraph e mídia embutida
  const pageUrls = [
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/`,
  ];

  for (const pageUrl of pageUrls) {
    try {
      const { response } = await fetchWithSafeRedirects(pageUrl, browserLikeHeaders);
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();

      const ogVideo = extractMetaContent(html, ["og:video:secure_url", "og:video"]);
      const ogImage = extractMetaContent(html, ["og:image", "twitter:image"]);

      if (preferVideo && ogVideo) candidates.push(ogVideo);
      if (ogImage) candidates.push(ogImage);
      if (!preferVideo && ogVideo) candidates.push(ogVideo);

      // Tenta localizar URLs de mídia pública renderizadas no HTML do embed
      const videoSrcMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
      if (videoSrcMatch?.[1]) {
        candidates.push(decodeHtmlEntities(videoSrcMatch[1]));
      }

      const embedImgMatch = html.match(
        /<img[^>]+class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]+src=["']([^"']+)["']/i
      );
      if (embedImgMatch?.[1]) {
        candidates.push(decodeHtmlEntities(embedImgMatch[1]));
      }

      // Fallback para atributo video_url / display_url no JSON embutido do embed público
      const jsonVideoMatch = html.match(/"video_url":"(https:[^"]+)"/);
      if (jsonVideoMatch?.[1]) {
        candidates.push(decodeHtmlEntities(jsonVideoMatch[1]));
      }

      const jsonDisplayMatch = html.match(/"display_url":"(https:[^"]+)"/);
      if (jsonDisplayMatch?.[1]) {
        candidates.push(decodeHtmlEntities(jsonDisplayMatch[1]));
      }

      if (candidates.length > 0) break;
    } catch {
      // Continua para o próximo método público
    }
  }

  // 2. Fallback padrão do endpoint /media/?size=l para imagens de posts públicos
  if (!preferVideo) {
    candidates.push(`https://www.instagram.com/p/${shortcode}/media/?size=l`);
  }

  return Array.from(new Set(candidates.filter((c) => c.startsWith("http"))));
}

/**
 * Lê stream com limite máximo de bytes para evitar exaustão de memória.
 */
async function readResponseWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
  const declaredLen = Number(response.headers.get("content-length") || "0");
  if (declaredLen > maxBytes) {
    throw new Error(`Arquivo remoto excede o limite permitido (${Math.round(maxBytes / (1024 * 1024))} MB).`);
  }

  if (!response.body) {
    const arr = await response.arrayBuffer();
    if (arr.byteLength > maxBytes) {
      throw new Error(`Arquivo remoto excede o limite permitido (${Math.round(maxBytes / (1024 * 1024))} MB).`);
    }
    return Buffer.from(arr);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`Arquivo remoto excede o limite permitido (${Math.round(maxBytes / (1024 * 1024))} MB).`);
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}

/**
 * Baixa uma imagem ou vídeo de uma URL externa (incluindo links do Instagram)
 * e salva em public/uploads/cms/ para evitar expiração e bloqueios de CORS/CORP.
 */
export async function importMediaFromUrl(
  rawUrl: string,
  expectedType: "image" | "video" | "any" = "any"
): Promise<ImportedMediaResult> {
  const parsed = await assertSafePublicUrl(rawUrl);
  const igPost = extractInstagramShortcode(parsed);

  const candidateUrls = igPost
    ? await resolveInstagramPostMediaUrl(igPost.shortcode, expectedType === "video" || (expectedType === "any" && igPost.isReelOrVideo))
    : [parsed.toString()];

  if (candidateUrls.length === 0) {
    throw new Error(
      "Não foi possível localizar a mídia pública neste link do Instagram. Tente copiar o endereço direto da imagem (botão direito → Copiar endereço da imagem) ou faça upload do arquivo."
    );
  }

  let lastError: string | null = null;

  for (const targetUrl of candidateUrls) {
    try {
      const { response, finalUrl } = await fetchWithSafeRedirects(targetUrl, {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: expectedType === "video" ? "video/*,*/*;q=0.8" : "image/avif,image/webp,image/png,image/jpeg,video/*,*/*;q=0.8",
      });

      if (!response.ok) {
        lastError = `Servidor remoto respondeu com status ${response.status}.`;
        continue;
      }

      const rawContentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      const urlExt = path.extname(finalUrl.pathname).toLowerCase();

      let mediaType: "image" | "video" | null = null;
      let ext = "";
      let mimeType = rawContentType;

      if (IMAGE_MIME_TO_EXT[rawContentType]) {
        mediaType = "image";
        ext = IMAGE_MIME_TO_EXT[rawContentType];
      } else if (VIDEO_MIME_TO_EXT[rawContentType]) {
        mediaType = "video";
        ext = VIDEO_MIME_TO_EXT[rawContentType];
      } else if (rawContentType.startsWith("image/") && rawContentType !== "image/svg+xml") {
        mediaType = "image";
        ext = EXT_TO_IMAGE_MIME[urlExt] ? urlExt : ".jpg";
      } else if (rawContentType.startsWith("video/")) {
        mediaType = "video";
        ext = EXT_TO_VIDEO_MIME[urlExt] ? urlExt : ".mp4";
      } else if ((!rawContentType || rawContentType === "application/octet-stream") && EXT_TO_IMAGE_MIME[urlExt]) {
        mediaType = "image";
        ext = urlExt;
        mimeType = EXT_TO_IMAGE_MIME[urlExt];
      } else if ((!rawContentType || rawContentType === "application/octet-stream") && EXT_TO_VIDEO_MIME[urlExt]) {
        mediaType = "video";
        ext = urlExt;
        mimeType = EXT_TO_VIDEO_MIME[urlExt];
      }

      if (!mediaType) {
        lastError = igPost
          ? "O Instagram bloqueou o download automático da mídia deste post (perfil privado ou restrição de acesso)."
          : `O link informado não retornou uma imagem ou vídeo válido (tipo recebido: ${rawContentType || "desconhecido"}).`;
        continue;
      }

      if (expectedType !== "any" && mediaType !== expectedType) {
        lastError =
          expectedType === "image"
            ? "O link informado aponta para um vídeo, mas este campo espera uma imagem."
            : "O link informado aponta para uma imagem, mas este campo espera um vídeo.";
        continue;
      }

      const limit = mediaType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      const buffer = await readResponseWithLimit(response, limit);

      if (buffer.length === 0) {
        lastError = "O arquivo retornado pelo link está vazio.";
        continue;
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "cms");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileHash = crypto.randomBytes(8).toString("hex");
      const fileName = `${Date.now()}-import-${fileHash}${ext}`;
      const targetFilePath = path.join(uploadDir, fileName);

      fs.writeFileSync(targetFilePath, buffer);

      return {
        url: `/uploads/cms/${fileName}`,
        fileName,
        mediaType,
        mimeType,
        size: buffer.length,
      };
    } catch (err: any) {
      lastError = err?.message || "Falha ao baixar mídia do link.";
    }
  }

  throw new Error(
    lastError ||
      "Não foi possível importar a mídia do link informado. Se for do Instagram, tente copiar o endereço direto da imagem ou fazer upload do arquivo."
  );
}
