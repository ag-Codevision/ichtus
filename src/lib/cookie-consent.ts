/**
 * Gerenciamento de Consentimento de Cookies em conformidade com a LGPD
 * (Lei Geral de Proteção de Dados - Lei Federal nº 13.709/2018)
 */

export interface CookiePreferences {
  necessary: boolean; // Sempre true (essencial para funcionamento do site)
  functional: boolean; // Preferências do usuário, idioma, temas e formulários
  analytics: boolean; // Métricas e estatísticas anônimas de uso
  marketing: boolean; // Campanhas, medição de conversão e anúncios direcionados
  timestamp: string; // Data/hora do consentimento
  version: string; // Versão da política de cookies aceita
}

export const COOKIE_CONSENT_KEY = "icthus_cookie_consent";
export const COOKIE_CONSENT_VERSION = "1.0";
export const COOKIE_MAX_AGE_DAYS = 365;

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: COOKIE_CONSENT_VERSION,
};

/**
 * Lê o consentimento salvo em localStorage ou em document.cookie
 */
export function getStoredCookieConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const local = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (local) {
      const parsed = JSON.parse(local) as CookiePreferences;
      if (parsed && typeof parsed === "object" && parsed.necessary) {
        return parsed;
      }
    }
  } catch {
    // Falha silenciosa em caso de restrição de localStorage (ex: navegação privada restrita)
  }

  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${COOKIE_CONSENT_KEY}=([^;]*)`)
    );
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded) as CookiePreferences;
      if (parsed && typeof parsed === "object" && parsed.necessary) {
        return parsed;
      }
    }
  } catch {
    // Falha silenciosa ao ler cookie
  }

  return null;
}

/**
 * Salva as preferências de consentimento no localStorage e no cookie
 */
export function saveCookieConsent(
  preferences: Omit<CookiePreferences, "necessary" | "timestamp" | "version">
): CookiePreferences {
  const fullPreferences: CookiePreferences = {
    necessary: true,
    functional: Boolean(preferences.functional),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    timestamp: new Date().toISOString(),
    version: COOKIE_CONSENT_VERSION,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify(fullPreferences)
      );
    } catch {
      // Ignora erro em modo restrito
    }

    try {
      const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
      const isHttps = window.location.protocol === "https:";
      const cookieValue = encodeURIComponent(JSON.stringify(fullPreferences));
      const secureFlag = isHttps ? "; Secure" : "";
      document.cookie = `${COOKIE_CONSENT_KEY}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
    } catch {
      // Ignora erro ao gravar cookie
    }

    // Dispara evento global para que serviços e scripts possam reagir
    window.dispatchEvent(
      new CustomEvent("icthus:cookie-consent-updated", {
        detail: fullPreferences,
      })
    );
  }

  return fullPreferences;
}

/**
 * Aceita todas as categorias de cookies
 */
export function acceptAllCookies(): CookiePreferences {
  return saveCookieConsent({
    functional: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Rejeita os cookies opcionais, mantendo apenas os estritamente necessários
 */
export function rejectOptionalCookies(): CookiePreferences {
  return saveCookieConsent({
    functional: false,
    analytics: false,
    marketing: false,
  });
}

/**
 * Dispara evento global para abrir o modal de preferências de cookies
 */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("icthus:open-cookie-preferences"));
  }
}
