import prisma from "@/lib/prisma";
import {
  DEFAULT_SITE_DATA,
  DEFAULT_HERO_CONTENT,
  DEFAULT_SOLUTIONS_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_ACTION_AREAS_CONTENT,
  DEFAULT_SERVICES_CONTENT,
  DEFAULT_TEAM_CONTENT,
  DEFAULT_TESTIMONIALS_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_PORTFOLIO_SECTION_CONTENT,
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
} from "./cms-defaults";
import { PORTFOLIO_PROJECTS, type ProjectDetailItem } from "./portfolio-data";

/**
 * Recupera o conteúdo de uma seção com fallback transparente para o padrão.
 */
export async function getSiteSectionContent<T>(section: string, fallback: T): Promise<T> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { section },
    });
    if (record && record.data) {
      return { ...fallback, ...(record.data as unknown as object) } as T;
    }
  } catch (error) {
    console.warn(`[CMS Service] Falha ao buscar seção "${section}" no banco. Usando fallback.`, error);
  }
  return fallback;
}

/**
 * Salva ou atualiza os dados estruturados de uma seção do CMS.
 */
export async function saveSiteSectionContent<T extends object>(
  section: string,
  data: T,
  updatedBy?: string
): Promise<T> {
  try {
    const saved = await prisma.siteContent.upsert({
      where: { section },
      create: {
        section,
        data: data as any,
        updatedBy: updatedBy || "admin",
      },
      update: {
        data: data as any,
        updatedBy: updatedBy || "admin",
      },
    });
    return saved.data as unknown as T;
  } catch (error) {
    console.error(`[CMS Service] Erro ao salvar seção "${section}":`, error);
    throw error;
  }
}

/**
 * Retorna todos os conteúdos do site consolidado para o CMSProvider.
 */
export async function getAllSiteContent(): Promise<CMSCompleteSiteData> {
  try {
    const records = await prisma.siteContent.findMany();
    const map = new Map<string, any>();
    records.forEach((r) => {
      map.set(r.section, r.data);
    });

    return {
      hero: map.has("hero") ? { ...DEFAULT_HERO_CONTENT, ...map.get("hero") } : DEFAULT_HERO_CONTENT,
      solutions: map.has("solutions") ? { ...DEFAULT_SOLUTIONS_CONTENT, ...map.get("solutions") } : DEFAULT_SOLUTIONS_CONTENT,
      about: map.has("about") ? { ...DEFAULT_ABOUT_CONTENT, ...map.get("about") } : DEFAULT_ABOUT_CONTENT,
      action_areas: map.has("action_areas") ? { ...DEFAULT_ACTION_AREAS_CONTENT, ...map.get("action_areas") } : DEFAULT_ACTION_AREAS_CONTENT,
      services: map.has("services") ? { ...DEFAULT_SERVICES_CONTENT, ...map.get("services") } : DEFAULT_SERVICES_CONTENT,
      team: (() => {
        const raw = map.has("team") ? { ...DEFAULT_TEAM_CONTENT, ...map.get("team") } : DEFAULT_TEAM_CONTENT;
        if (!raw.members || !Array.isArray(raw.members) || raw.members.length === 0) {
          if (raw.leader) {
            raw.members = [
              {
                id: raw.leader.id || "leader-gg",
                name: raw.leader.name || "Glessios Gusso",
                role: raw.leader.role || "Diretor Geral",
                badge: raw.leader.badge || "Direção & Estratégia",
                bio: raw.leader.bio || "",
                photoUrl: raw.leader.photoUrl || "",
                initials: raw.leader.initials || "GG",
                highlights: raw.leader.highlights || [],
              },
            ];
          } else {
            raw.members = DEFAULT_TEAM_CONTENT.members;
          }
        }
        return raw;
      })(),
      testimonials: map.has("testimonials") ? { ...DEFAULT_TESTIMONIALS_CONTENT, ...map.get("testimonials") } : DEFAULT_TESTIMONIALS_CONTENT,
      contact_info: map.has("contact_info") ? { ...DEFAULT_CONTACT_CONTENT, ...map.get("contact_info") } : DEFAULT_CONTACT_CONTENT,
      portfolio: map.has("portfolio") ? { ...DEFAULT_PORTFOLIO_SECTION_CONTENT, ...map.get("portfolio") } : DEFAULT_PORTFOLIO_SECTION_CONTENT,
    };
  } catch (error) {
    console.warn("[CMS Service] Falha ao buscar lista de seções no banco. Retornando dados padrão completos.", error);
    return DEFAULT_SITE_DATA;
  }
}

/**
 * ====================================================
 * GESTÃO DE CATEGORIAS DE PORTFÓLIO
 * ====================================================
 */

export async function getPortfolioCategories(): Promise<string[]> {
  try {
    const dbCats = await prisma.portfolioCategory.findMany({
      orderBy: { order: "asc" },
    });
    if (dbCats && dbCats.length > 0) {
      const names = dbCats.map((c) => c.name);
      return ["Tudo", ...names.filter((n) => n !== "Tudo")];
    }
  } catch (error) {
    console.warn("[CMS Service] Falha ao buscar categorias no banco:", error);
  }

  // Fallback padrão
  return DEFAULT_PORTFOLIO_SECTION_CONTENT.categories;
}

export async function createPortfolioCategory(name: string) {
  const cleanName = name.trim();
  if (!cleanName || cleanName.toLowerCase() === "tudo") {
    throw new Error("Nome de categoria inválido ou reservado.");
  }

  const count = await prisma.portfolioCategory.count();
  return prisma.portfolioCategory.create({
    data: {
      name: cleanName,
      order: count,
    },
  });
}

export async function deletePortfolioCategoryByNameOrId(identifier: string) {
  try {
    return await prisma.portfolioCategory.deleteMany({
      where: {
        OR: [{ id: identifier }, { name: identifier }],
      },
    });
  } catch (error) {
    console.error("[CMS Service] Erro ao deletar categoria:", error);
    throw error;
  }
}

/**
 * ====================================================
 * GESTÃO DE PROJETOS DE PORTFÓLIO (CRUD)
 * ====================================================
 */

export async function getAllCMSProjects(): Promise<ProjectDetailItem[]> {
  try {
    const dbProjects = await prisma.portfolioProject.findMany({
      orderBy: { createdAt: "desc" },
    });

    const localSlugs = new Set(PORTFOLIO_PROJECTS.map((p) => p.slug));

    // Projetos do banco convertidos para o formato ProjectDetailItem
    const formattedDbProjects: ProjectDetailItem[] = dbProjects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle || `${p.category} executada com excelência para ${p.clientName || "Cliente Especial"}.`,
      category: p.category,
      clientName: p.clientName || "Cliente Glessios",
      clientSegment: p.clientSegment || "Comunicação Visual Corporativa",
      location: p.location || "Porto Alegre, RS",
      year: p.year || (p.completedAt ? p.completedAt.getFullYear().toString() : "2026"),
      executionTime: p.executionTime || "Sob Medida",
      dimensions: p.dimensions || "Conforme Projeto Aprovado",
      warranty: p.warranty || "Garantia Integral Glessios",
      coverImage: p.coverImage || p.featuredImage,
      featuredImage: p.featuredImage,
      galleryImages: (p.galleryImages && p.galleryImages.length > 0
        ? p.galleryImages
        : [p.featuredImage]
      ).map((url, i) => ({
        url,
        caption: `Foto ${i + 1} da execução do projeto ${p.title}`,
        category: "Finalizado",
      })),
      videos: Array.isArray(p.videos) ? (p.videos as any) : [],
      description: p.description,
      challenge: p.challenge || "Desenvolver uma solução sob medida com acabamento impecável e alta durabilidade.",
      solution: p.solution || "Aplicação dos mais nobres materiais do setor com projeto de engenharia e montagem técnica.",
      results: p.results && p.results.length > 0 ? p.results : ["Destaque visual de excelência"],
      materials: p.materials && p.materials.length > 0 ? p.materials : ["ACM", "LED", "Acrílico"],
      technicalSpecs: Array.isArray(p.technicalSpecs) ? (p.technicalSpecs as any) : [
        { label: "Categoria", value: p.category },
        { label: "Cliente", value: p.clientName || "Cliente Glessios" },
        { label: "Garantia", value: p.warranty || "5 anos de garantia" },
      ],
      testimonial: p.testimonial ? (p.testimonial as any) : undefined,
      tags: p.tags && p.tags.length > 0 ? p.tags : [p.category],
    }));

    // Mantém os projetos do banco primeiro, depois os locais que não foram sobrescritos
    const dbSlugs = new Set(dbProjects.map((p) => p.slug));
    const nonOverriddenLocals = PORTFOLIO_PROJECTS.filter((p) => !dbSlugs.has(p.slug));

    return [...formattedDbProjects, ...nonOverriddenLocals];
  } catch (error) {
    console.warn("[CMS Service] Falha ao buscar projetos no banco. Retornando locais.", error);
    return PORTFOLIO_PROJECTS;
  }
}

export async function createCMSProject(data: Partial<ProjectDetailItem>): Promise<ProjectDetailItem> {
  if (!data.title || !data.category) {
    throw new Error("Título e categoria são obrigatórios para o projeto.");
  }

  // Gera slug amigável caso não fornecido
  const slug = (
    data.slug ||
    data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ) + `-${Date.now().toString().slice(-4)}`;

  const created = await prisma.portfolioProject.create({
    data: {
      title: data.title,
      slug,
      subtitle: data.subtitle || "",
      category: data.category,
      clientName: data.clientName || "",
      clientSegment: data.clientSegment || "",
      location: data.location || "Porto Alegre, RS",
      year: data.year || "2026",
      executionTime: data.executionTime || "15 dias úteis",
      dimensions: data.dimensions || "Sob medida",
      warranty: data.warranty || "5 anos de garantia estrutural",
      description: data.description || "Projeto corporativo desenvolvido sob medida.",
      challenge: data.challenge || "",
      solution: data.solution || "",
      results: data.results || [],
      materials: data.materials || [],
      technicalSpecs: (data.technicalSpecs as any) || [],
      testimonial: (data.testimonial as any) || null,
      featuredImage: data.featuredImage || data.coverImage || "/images/portfolio/fachada-acm-tech-tower-thumb.webp",
      coverImage: data.coverImage || data.featuredImage || "/images/portfolio/fachada-acm-tech-tower-cover.webp",
      galleryImages: data.galleryImages ? data.galleryImages.map((g) => g.url) : [],
      videos: (data.videos as any) || [],
      tags: data.tags || [data.category],
    },
  });

  return {
    ...data,
    id: created.id,
    slug: created.slug,
    title: created.title,
    category: created.category,
    featuredImage: created.featuredImage,
    coverImage: created.coverImage || created.featuredImage,
  } as ProjectDetailItem;
}

export async function deleteCMSProject(idOrSlug: string) {
  try {
    return await prisma.portfolioProject.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
  } catch (error) {
    console.error("[CMS Service] Erro ao deletar projeto do portfólio:", error);
    throw error;
  }
}

export const getCMSCompleteSiteData = getAllSiteContent;
