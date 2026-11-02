import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteCMSProject } from "@/lib/cms-service";

function verifyAdmin(request: NextRequest): boolean {
  const adminCookie = request.cookies.get("glessios_admin_session")?.value;
  if (!adminCookie) return false;
  try {
    const parsed = JSON.parse(adminCookie);
    return parsed.role === "ADMIN";
  } catch {
    return false;
  }
}

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/admin/cms/portfolio/[id]
 * Remove um projeto do banco de dados pelo ID ou Slug.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!verifyAdmin(request)) {
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
 * Atualiza os dados de um projeto existente.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.portfolioProject.updateMany({
      where: {
        OR: [{ id }, { slug: id }],
      },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        category: body.category,
        clientName: body.clientName,
        clientSegment: body.clientSegment,
        location: body.location,
        year: body.year,
        executionTime: body.executionTime,
        dimensions: body.dimensions,
        warranty: body.warranty,
        description: body.description,
        challenge: body.challenge,
        solution: body.solution,
        results: body.results,
        materials: body.materials,
        technicalSpecs: body.technicalSpecs,
        testimonial: body.testimonial,
        featuredImage: body.featuredImage,
        coverImage: body.coverImage,
        galleryImages: body.galleryImages ? body.galleryImages.map((g: any) => (typeof g === "string" ? g : g.url)) : undefined,
        videos: body.videos,
        tags: body.tags,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("[API CMS Portfolio PUT] Erro:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar projeto." }, { status: 500 });
  }
}
