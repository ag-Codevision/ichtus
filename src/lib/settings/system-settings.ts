import fs from "fs";
import path from "path";

export interface DocumentCustomizationSettings {
  logoUrl?: string;
  companyTradeName: string;
  companyLegalName: string;
  cnpj: string;
  stateRegistration?: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pixKey?: string;
  pixKeyType?: string;
  proposalValidityDays: number;
  defaultWarrantyMonths: number;
  proposalFooterNotes?: string;
  contractDefaultJurisdiction?: string;
  contractGeneralClauses?: string;
}

export interface SystemSettings {
  documents: DocumentCustomizationSettings;
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
    templates?: {
      proposalMessage?: string;
      contractMessage?: string;
    };
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
  documents: {
    logoUrl: "",
    companyTradeName: "Icthus Soluções & Design",
    companyLegalName: "Icthus Comunicação Visual Ltda",
    cnpj: "45.123.456/0001-78",
    stateRegistration: "Isento",
    phone: "(41) 3345-8900",
    whatsapp: "(41) 99824-3990",
    email: "contato@icthusbrasil.com",
    website: "https://icthusbrasil.com",
    address: "Rua das Indústrias, 1024 - CIC",
    city: "Curitiba",
    state: "PR",
    pixKey: "45123456000178",
    pixKeyType: "CNPJ",
    proposalValidityDays: 15,
    defaultWarrantyMonths: 12,
    proposalFooterNotes: "Proposta sujeita a aprovação técnica e cadastral. Instalação e frete inclusos conforme especificações deste orçamento.",
    contractDefaultJurisdiction: "Comarca de Curitiba, Estado do Paraná",
    contractGeneralClauses: "As partes elegem o foro da Comarca de Curitiba/PR para dirimir quaisquer dúvidas oriundas deste contrato, renunciando a qualquer outro por mais privilegiado que seja.",
  },
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
    email: "contato@icthusbrasil.com",
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
        whatsapp: {
          ...DEFAULT_SETTINGS.whatsapp,
          ...(parsed.whatsapp || {}),
          templates: {
            ...DEFAULT_SETTINGS.whatsapp.templates,
            ...((parsed.whatsapp && parsed.whatsapp.templates) || {}),
          },
        },
        company: { ...DEFAULT_SETTINGS.company, ...(parsed.company || {}) },
        portal: { ...DEFAULT_SETTINGS.portal, ...(parsed.portal || {}) },
        production: { ...DEFAULT_SETTINGS.production, ...(parsed.production || {}) },
        server: { ...DEFAULT_SETTINGS.server, ...(parsed.server || {}) },
        documents: { ...DEFAULT_SETTINGS.documents, ...(parsed.documents || {}) },
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
      whatsapp: {
        ...current.whatsapp,
        ...(settings.whatsapp || {}),
        templates: {
          ...(current.whatsapp.templates || DEFAULT_SETTINGS.whatsapp.templates),
          ...(settings.whatsapp?.templates || {}),
        },
      },
      company: { ...current.company, ...(settings.company || {}) },
      portal: { ...current.portal, ...(settings.portal || {}) },
      production: { ...current.production, ...(settings.production || {}) },
      server: { ...current.server, ...(settings.server || {}) },
      documents: { ...current.documents, ...(settings.documents || {}) },
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
