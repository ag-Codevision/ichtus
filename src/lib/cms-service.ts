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
import {
  PORTFOLIO_PROJECTS,
  mapDbProjectToDetailItem,
  type ProjectDetailItem,
} from "./portfolio-data";

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

    // Projetos do banco convertidos para o formato ProjectDetailItem (reutilizando o mapper oficial)
    const formattedDbProjects: ProjectDetailItem[] = dbProjects.map((p) => {
      const fallback = PORTFOLIO_PROJECTS.find((local) => local.slug === p.slug || local.id === p.id);
      return mapDbProjectToDetailItem(p, fallback);
    });

    // Mantém os projetos do banco primeiro, depois os locais que não foram sobrescritos
    const dbSlugs = new Set(dbProjects.map((p) => p.slug));
    const nonOverriddenLocals = PORTFOLIO_PROJECTS.filter((p) => !dbSlugs.has(p.slug));

    return [...formattedDbProjects, ...nonOverriddenLocals];
  } catch (error) {
    console.warn("[CMS Service] Falha ao buscar projetos no banco. Retornando locais.", error);
    return PORTFOLIO_PROJECTS;
  }
}

function normalizeGalleryUrls(galleryImages: unknown): string[] {
  if (!Array.isArray(galleryImages)) return [];
  return galleryImages
    .map((g: any) => (typeof g === "string" ? g.trim() : typeof g?.url === "string" ? g.url.trim() : ""))
    .filter(Boolean);
}

function normalizeVideosList(videos: unknown) {
  if (!Array.isArray(videos)) return [];
  return videos
    .filter((v: any) => v && typeof v.videoUrl === "string" && v.videoUrl.trim())
    .map((v: any, idx: number) => ({
      id: v.id || `vid-${Date.now()}-${idx + 1}`,
      title: typeof v.title === "string" ? v.title.trim() : "",
      description: typeof v.description === "string" ? v.description.trim() : "",
      videoUrl: v.videoUrl.trim(),
      thumbnailUrl: typeof v.thumbnailUrl === "string" ? v.thumbnailUrl.trim() : "",
      duration: typeof v.duration === "string" ? v.duration.trim() : "",
      tag: typeof v.tag === "string" ? v.tag.trim() : "",
    }));
}

export async function createCMSProject(data: Partial<ProjectDetailItem>): Promise<ProjectDetailItem> {
  const title = data.title?.trim() || "";
  const category = data.category?.trim() || "";
  const cover = data.featuredImage?.trim() || data.coverImage?.trim() || "";

  if (!title || !category || !cover) {
    throw new Error("Título, categoria e imagem de capa são obrigatórios para o projeto.");
  }

  // Gera slug amigável caso não fornecido
  const baseSlug =
    data.slug?.trim() ||
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "projeto";
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const created = await prisma.portfolioProject.create({
    data: {
      title,
      slug,
      subtitle: data.subtitle?.trim() || "",
      category,
      clientName: data.clientName?.trim() || "",
      clientSegment: data.clientSegment?.trim() || "",
      location: data.location?.trim() || "",
      year: data.year?.trim() || "",
      executionTime: data.executionTime?.trim() || "",
      dimensions: data.dimensions?.trim() || "",
      warranty: data.warranty?.trim() || "",
      description: data.description?.trim() || "",
      challenge: data.challenge?.trim() || "",
      solution: data.solution?.trim() || "",
      results: Array.isArray(data.results) ? data.results.map((r) => r.trim()).filter(Boolean) : [],
      materials: Array.isArray(data.materials) ? data.materials.map((m) => m.trim()).filter(Boolean) : [],
      technicalSpecs: Array.isArray(data.technicalSpecs) ? (data.technicalSpecs as any) : [],
      testimonial: data.testimonial ? (data.testimonial as any) : null,
      featuredImage: data.featuredImage?.trim() || cover,
      coverImage: data.coverImage?.trim() || cover,
      galleryImages: normalizeGalleryUrls(data.galleryImages),
      videos: normalizeVideosList(data.videos) as any,
      tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : [category],
    },
  });

  return mapDbProjectToDetailItem(created);
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
