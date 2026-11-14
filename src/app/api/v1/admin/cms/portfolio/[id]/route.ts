import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteCMSProject } from "@/lib/cms-service";
import { PORTFOLIO_PROJECTS, mapDbProjectToDetailItem } from "@/lib/portfolio-data";
import { verifyAdminRequest } from "@/lib/cms-media-server";

interface Params {
  params: Promise<{ id: string }>;
}

function normalizeGalleryUrls(galleryImages: unknown): string[] | undefined {
  if (!Array.isArray(galleryImages)) return undefined;
  return galleryImages
    .map((g: any) => (typeof g === "string" ? g.trim() : typeof g?.url === "string" ? g.url.trim() : ""))
    .filter(Boolean);
}

function normalizeVideosList(videos: unknown) {
  if (!Array.isArray(videos)) return undefined;
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

/**
 * DELETE /api/v1/admin/cms/portfolio/[id]
 * Remove um projeto do banco de dados pelo ID ou Slug.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteCMSProject(id);
    return NextResponse.json({ success: true, message: `Projeto ${id} excluído com sucesso.` });
  } catch (error) {
    console.error("[API CMS Portfolio DELETE] Erro:", error);
    return NextResponse.json({ success: false, error: "Erro ao excluir projeto." }, { status: 500 });
  }
}

/**
 * PUT /api/v1/admin/cms/portfolio/[id]
 * Atualiza os dados de um projeto existente (ou persiste edição de projeto estático no banco).
 */
export async function PUT(request: NextRequest, { params }: Params) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const category = typeof body.category === "string" ? body.category.trim() : undefined;
    const featuredImage = typeof body.featuredImage === "string" ? body.featuredImage.trim() : undefined;
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : undefined;

    if (title !== undefined && !title) {
      return NextResponse.json({ success: false, error: "O título do projeto é obrigatório." }, { status: 400 });
    }
    if (category !== undefined && !category) {
      return NextResponse.json({ success: false, error: "A categoria do projeto é obrigatória." }, { status: 400 });
    }
    if ((featuredImage !== undefined || coverImage !== undefined) && !(featuredImage || coverImage)) {
      return NextResponse.json({ success: false, error: "A imagem de capa é obrigatória." }, { status: 400 });
    }

    const existing = await prisma.portfolioProject.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    const normalizedGallery = normalizeGalleryUrls(body.galleryImages);
    const normalizedVideos = normalizeVideosList(body.videos);
    const normalizedResults = Array.isArray(body.results)
      ? body.results.map((r: any) => String(r).trim()).filter(Boolean)
      : undefined;
    const normalizedMaterials = Array.isArray(body.materials)
      ? body.materials.map((m: any) => String(m).trim()).filter(Boolean)
      : undefined;

    if (existing) {
      const resolvedCover = featuredImage || coverImage;
      const saved = await prisma.portfolioProject.update({
        where: { id: existing.id },
        data: {
          title,
          subtitle: body.subtitle !== undefined ? String(body.subtitle || "").trim() : undefined,
          category,
          clientName: body.clientName !== undefined ? String(body.clientName || "").trim() : undefined,
          clientSegment: body.clientSegment !== undefined ? String(body.clientSegment || "").trim() : undefined,
          location: body.location !== undefined ? String(body.location || "").trim() : undefined,
          year: body.year !== undefined ? String(body.year || "").trim() : undefined,
          executionTime: body.executionTime !== undefined ? String(body.executionTime || "").trim() : undefined,
          dimensions: body.dimensions !== undefined ? String(body.dimensions || "").trim() : undefined,
          warranty: body.warranty !== undefined ? String(body.warranty || "").trim() : undefined,
          description: body.description !== undefined ? String(body.description || "").trim() : undefined,
          challenge: body.challenge !== undefined ? String(body.challenge || "").trim() : undefined,
          solution: body.solution !== undefined ? String(body.solution || "").trim() : undefined,
          results: normalizedResults,
          materials: normalizedMaterials,
          technicalSpecs: body.technicalSpecs !== undefined ? body.technicalSpecs : undefined,
          testimonial: body.testimonial !== undefined ? body.testimonial : undefined,
          featuredImage: resolvedCover,
          coverImage: coverImage || resolvedCover,
          galleryImages: normalizedGallery,
          videos: normalizedVideos as any,
          tags: Array.isArray(body.tags) ? body.tags : undefined,
        },
      });

      return NextResponse.json({ success: true, project: mapDbProjectToDetailItem(saved) });
    }

    // Caso seja um projeto da lista estática ainda não gravado no banco, persiste sobrescrita pelo mesmo slug
    const localProject = PORTFOLIO_PROJECTS.find((p) => p.id === id || p.slug === id);
    const finalTitle = title || localProject?.title;
    const finalCategory = category || localProject?.category;
    const finalCover = featuredImage || coverImage || localProject?.featuredImage || localProject?.coverImage;

    if (!finalTitle || !finalCategory || !finalCover) {
      return NextResponse.json(
        { success: false, error: "Projeto não encontrado ou dados obrigatórios ausentes." },
        { status: 404 }
      );
    }

    const created = await prisma.portfolioProject.create({
      data: {
        title: finalTitle,
        slug: localProject?.slug || body.slug || id,
        subtitle: body.subtitle !== undefined ? String(body.subtitle || "").trim() : localProject?.subtitle || "",
        category: finalCategory,
        clientName: body.clientName !== undefined ? String(body.clientName || "").trim() : localProject?.clientName || "",
        clientSegment: body.clientSegment !== undefined ? String(body.clientSegment || "").trim() : localProject?.clientSegment || "",
        location: body.location !== undefined ? String(body.location || "").trim() : localProject?.location || "",
        year: body.year !== undefined ? String(body.year || "").trim() : localProject?.year || "",
        executionTime: body.executionTime !== undefined ? String(body.executionTime || "").trim() : localProject?.executionTime || "",
        dimensions: body.dimensions !== undefined ? String(body.dimensions || "").trim() : localProject?.dimensions || "",
        warranty: body.warranty !== undefined ? String(body.warranty || "").trim() : localProject?.warranty || "",
        description: body.description !== undefined ? String(body.description || "").trim() : localProject?.description || "",
        challenge: body.challenge !== undefined ? String(body.challenge || "").trim() : localProject?.challenge || "",
        solution: body.solution !== undefined ? String(body.solution || "").trim() : localProject?.solution || "",
        results: normalizedResults ?? localProject?.results ?? [],
        materials: normalizedMaterials ?? localProject?.materials ?? [],
        technicalSpecs: (body.technicalSpecs ?? localProject?.technicalSpecs ?? []) as any,
        testimonial: (body.testimonial ?? localProject?.testimonial ?? null) as any,
        featuredImage: finalCover,
        coverImage: coverImage || finalCover,
        galleryImages: normalizedGallery ?? localProject?.galleryImages?.map((g) => g.url) ?? [],
        videos: (normalizedVideos ?? localProject?.videos ?? []) as any,
        tags: Array.isArray(body.tags) ? body.tags : localProject?.tags ?? [finalCategory],
      },
    });

    return NextResponse.json({ success: true, project: mapDbProjectToDetailItem(created, localProject) });
  } catch (error) {
    console.error("[API CMS Portfolio PUT] Erro:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar projeto." }, { status: 500 });
  }
}
