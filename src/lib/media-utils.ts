/**
 * Utilitários compartilhados (cliente e servidor) para detecção, validação e embed de URLs de mídia.
 */

export function isValidMediaUrlInput(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isInstagramPostPageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    if (!host.endsWith("instagram.com") && !host.endsWith("instagr.am")) {
      return false;
    }
    return /^\/(?:[^/]+\/)?(p|reel|reels|tv)\/[A-Za-z0-9_-]+/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function isInstagramAnyUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith("instagram.com") ||
      host.endsWith("instagr.am") ||
      host.endsWith("cdninstagram.com") ||
      host.endsWith("fbcdn.net")
    );
  } catch {
    return false;
  }
}

export function isExternalPlatformVideoUrl(rawUrl: string): boolean {
  return Boolean(getExternalVideoEmbedUrl(rawUrl));
}

export function getExternalVideoEmbedUrl(rawUrl: string, autoplay = false): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      let videoId: string | null = null;
      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/")[2] || null;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/")[2] || null;
      } else {
        videoId = parsed.searchParams.get("v");
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0${autoplay ? "&autoplay=1" : ""}`;
      }
    }

    if (host.includes("vimeo.com")) {
      const match = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
      if (match?.[1]) {
        return `https://player.vimeo.com/video/${match[1]}${autoplay ? "?autoplay=1" : ""}`;
      }
    }
  } catch {
    // URL relativa ou inválida não é embed externo
  }
  return null;
}

export function getYouTubeThumbnailUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("youtube.com") && !host.includes("youtu.be")) return null;
    let videoId: string | null = null;
    if (host.includes("youtu.be")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/")[2] || null;
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/")[2] || null;
    } else {
      videoId = parsed.searchParams.get("v");
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}
