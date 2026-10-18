import fs from "fs";
import path from "path";

export interface SystemSettings {
  whatsapp: {
    provider: "wacli" | "evolution" | "z-api" | "custom_http";
    mode: "http" | "cli";
    apiUrl: string;
    sessionName: string;
    apiKey?: string;
    autoSendCredentials: boolean;
    autoSendProofs: boolean;
    autoSendOSUpdates: boolean;
    autoSendPixInvoice: boolean;
    connectedNumber?: string;
    status: "CONNECTED" | "PAIRING_REQUIRED" | "DISCONNECTED" | "SIMULATION_DEV";
    lastConnectedAt?: string | null;
  };
  company: {
    tradeName: string;
    legalName: string;
    cnpj: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
  };
  portal: {
    defaultPassword: string;
    portalUrl: string;
    allowSelfRegistration: boolean;
    welcomeMessageTemplate: string;
  };
  production: {
    notifyOnNewProof: boolean;
    notifyOnStageChange: boolean;
    notifyOnInstallationSchedule: boolean;
  };
  server: {
    vpsHost: string;
    cronEnabled: boolean;
  };
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "config", "system-settings.json");

export const DEFAULT_SETTINGS: SystemSettings = {
  whatsapp: {
    provider: "wacli",
    mode: "http",
    apiUrl: process.env.WACLI_API_URL || "http://localhost:3001",
    sessionName: process.env.WACLI_SESSION || "glessios-wpp",
    apiKey: "",
    autoSendCredentials: true,
    autoSendProofs: true,
    autoSendOSUpdates: true,
    autoSendPixInvoice: true,
    connectedNumber: "+55 (41) 99824-3990",
    status: "PAIRING_REQUIRED",
    lastConnectedAt: null,
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
    portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://glessios.com.br"}/portal/login`,
    allowSelfRegistration: false,
    welcomeMessageTemplate:
      "Olá, {nome}! Seu perfil de acesso ao Portal do Cliente Icthus foi liberado.\n\n🔗 Acesse: {url}\n📧 Login: {email}\n🔑 Senha: {senha}",
  },
  production: {
    notifyOnNewProof: true,
    notifyOnStageChange: true,
    notifyOnInstallationSchedule: true,
  },
  server: {
    vpsHost: process.env.VPS_HOST || "72.62.141.188",
    cronEnabled: true,
  },
};

/**
 * Carrega as configurações do sistema salvas em disco ou retorna os valores padrão
 */
export function getSystemSettings(): SystemSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        whatsapp: { ...DEFAULT_SETTINGS.whatsapp, ...(parsed.whatsapp || {}) },
        company: { ...DEFAULT_SETTINGS.company, ...(parsed.company || {}) },
        portal: { ...DEFAULT_SETTINGS.portal, ...(parsed.portal || {}) },
        production: { ...DEFAULT_SETTINGS.production, ...(parsed.production || {}) },
        server: { ...DEFAULT_SETTINGS.server, ...(parsed.server || {}) },
      };
    }
  } catch (err) {
    console.warn("[SETTINGS] Erro ao ler arquivo de configurações, usando defaults:", err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Salva as configurações do sistema
 */
export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  try {
    const current = getSystemSettings();
    const updated: SystemSettings = {
      ...current,
      ...settings,
      whatsapp: { ...current.whatsapp, ...(settings.whatsapp || {}) },
      company: { ...current.company, ...(settings.company || {}) },
      portal: { ...current.portal, ...(settings.portal || {}) },
      production: { ...current.production, ...(settings.production || {}) },
      server: { ...current.server, ...(settings.server || {}) },
    };

    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("[SETTINGS] Falha ao salvar configurações:", err);
    throw err;
  }
}
