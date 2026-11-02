"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  DEFAULT_SITE_DATA,
  type CMSCompleteSiteData,
  type CMSHeroContent,
  type CMSSolutionsContent,
  type CMSAboutContent,
  type CMSActionAreasContent,
  type CMSServicesContent,
  type CMSTeamContent,
  type CMSTestimonialsContent,
  type CMSGlobalContactContent,
  type CMSPortfolioSectionContent,
} from "@/lib/cms-defaults";
import type { ProjectDetailItem } from "@/lib/portfolio-data";

interface CMSContextType {
  data: CMSCompleteSiteData;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isAdmin: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveMessage: string | null;
  togglePreview: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  updateSection: <K extends keyof CMSCompleteSiteData>(
    section: K,
    updater: Partial<CMSCompleteSiteData[K]> | ((prev: CMSCompleteSiteData[K]) => CMSCompleteSiteData[K])
  ) => void;
  saveAllChanges: () => Promise<boolean>;
  discardChanges: () => void;
  
  // Modais de Controle
  heroMediaModalOpen: boolean;
  setHeroMediaModalOpen: (open: boolean) => void;
  contactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  portfolioModalOpen: boolean;
  setPortfolioModalOpen: (open: boolean) => void;
  selectedPortfolioProject: ProjectDetailItem | null;
  openPortfolioModal: (project?: ProjectDetailItem | null) => void;
  refreshPortfolio: () => void;
  portfolioRefreshCounter: number;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: CMSCompleteSiteData;
}) {
  const [data, setData] = useState<CMSCompleteSiteData>(initialData || DEFAULT_SITE_DATA);
  const [savedData, setSavedData] = useState<CMSCompleteSiteData>(initialData || DEFAULT_SITE_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Estados de Modais
  const [heroMediaModalOpen, setHeroMediaModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedPortfolioProject, setSelectedPortfolioProject] = useState<ProjectDetailItem | null>(null);
  const [portfolioRefreshCounter, setPortfolioRefreshCounter] = useState(0);

  // 1. Detecta permissão de administrador e parâmetro de edição na URL
  useEffect(() => {
    // Verifica cookie de administrador
    const cookies = document.cookie;
    const hasAdminCookie = cookies.includes("glessios_admin_session");
    
    // Verifica flag na URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const cmsParam = urlParams.get("cms_edit");
    const storedEdit = localStorage.getItem("glessios_cms_edit_active");

    if (hasAdminCookie) {
      setIsAdmin(true);
      if (cmsParam === "true" || storedEdit === "true") {
        setIsEditMode(true);
      }
    }
  }, []);

  // 2. Busca dados atualizados do servidor na inicialização
  useEffect(() => {
    async function loadRemoteContent() {
      try {
        const res = await fetch("/api/v1/cms/content", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setData(json.data);
            setSavedData(json.data);
          }
        }
      } catch (err) {
        console.warn("[CMS Provider] Usando dados padrão locais:", err);
      }
    }
    loadRemoteContent();
  }, []);

  // Atualização de uma seção específica
  const updateSection = useCallback(
    <K extends keyof CMSCompleteSiteData>(
      section: K,
      updater: Partial<CMSCompleteSiteData[K]> | ((prev: CMSCompleteSiteData[K]) => CMSCompleteSiteData[K])
    ) => {
      setData((prev) => {
        const currentSection = prev[section];
        const nextSection =
          typeof updater === "function"
            ? (updater as (prev: CMSCompleteSiteData[K]) => CMSCompleteSiteData[K])(currentSection)
            : { ...currentSection, ...updater };

        return {
          ...prev,
          [section]: nextSection,
        };
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  // Salvar todas as alterações pendentes no servidor
  const saveAllChanges = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/v1/admin/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: data }),
      });

      if (res.ok) {
        setSavedData(data);
        setHasUnsavedChanges(false);
        setSaveMessage("Alterações publicadas com sucesso!");
        setTimeout(() => setSaveMessage(null), 4000);
        return true;
      } else {
        const errJson = await res.json();
        setSaveMessage(`Erro ao salvar: ${errJson.error || "Tente novamente."}`);
        return false;
      }
    } catch (err) {
      console.error("[CMS Save Error]:", err);
      setSaveMessage("Erro de conexão ao salvar alterações.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  // Descartar alterações não salvas
  const discardChanges = useCallback(() => {
    setData(savedData);
    setHasUnsavedChanges(false);
    setSaveMessage("Alterações revertidas para a última versão salva.");
    setTimeout(() => setSaveMessage(null), 3000);
  }, [savedData]);

  const togglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const enableEditMode = useCallback(() => {
    setIsEditMode(true);
    localStorage.setItem("glessios_cms_edit_active", "true");
  }, []);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
    localStorage.removeItem("glessios_cms_edit_active");
  }, []);

  const openPortfolioModal = useCallback((project?: ProjectDetailItem | null) => {
    setSelectedPortfolioProject(project || null);
    setPortfolioModalOpen(true);
  }, []);

  const refreshPortfolio = useCallback(() => {
    setPortfolioRefreshCounter((c) => c + 1);
  }, []);

  return (
    <CMSContext.Provider
      value={{
        data,
        isEditMode,
        isPreviewMode,
        isAdmin,
        hasUnsavedChanges,
        isSaving,
        saveMessage,
        togglePreview,
        enableEditMode,
        disableEditMode,
        updateSection,
        saveAllChanges,
        discardChanges,
        heroMediaModalOpen,
        setHeroMediaModalOpen,
        contactModalOpen,
        setContactModalOpen,
        portfolioModalOpen,
        setPortfolioModalOpen,
        selectedPortfolioProject,
        openPortfolioModal,
        refreshPortfolio,
        portfolioRefreshCounter,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

const FALLBACK_CMS_CONTEXT: CMSContextType = {
  data: DEFAULT_SITE_DATA,
  isEditMode: false,
  isPreviewMode: false,
  isAdmin: false,
  hasUnsavedChanges: false,
  isSaving: false,
  saveMessage: null,
  togglePreview: () => {},
  enableEditMode: () => {},
  disableEditMode: () => {},
  updateSection: () => {},
  saveAllChanges: async () => false,
  discardChanges: () => {},
  heroMediaModalOpen: false,
  setHeroMediaModalOpen: () => {},
  contactModalOpen: false,
  setContactModalOpen: () => {},
  portfolioModalOpen: false,
  setPortfolioModalOpen: () => {},
  selectedPortfolioProject: null,
  openPortfolioModal: () => {},
  refreshPortfolio: () => {},
  portfolioRefreshCounter: 0,
};

export function useCMS(): CMSContextType {
  const context = useContext(CMSContext);
  return context || FALLBACK_CMS_CONTEXT;
}

export function useOptionalCMS() {
  return useContext(CMSContext);
}
