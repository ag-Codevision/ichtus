import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/documents
 * Listagem de documentos com filtros avançados: busca, categoria, período e status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const period = searchParams.get("period") || "ALL";

    const where: any = {};

    // 1. Filtro por Categoria
    if (category !== "ALL") {
      where.category = category;
    }

    // 2. Filtro por Status
    if (status !== "ALL") {
      if (status === "SENT_WHATSAPP") {
        where.sentViaWhatsapp = true;
      } else if (status === "NOT_SENT") {
        where.sentViaWhatsapp = false;
      } else {
        where.status = status;
      }
    }

    // 3. Filtro por Período
    if (period !== "ALL") {
      const now = new Date();
      if (period === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfDay };
      } else if (period === "week") {
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: startOfWeek };
      } else if (period === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.createdAt = { gte: startOfMonth };
      }
    }

    // 4. Busca Textual por título, código, cliente ou telefone
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { clientName: { contains: q, mode: "insensitive" } },
        { clientPhone: { contains: q, mode: "insensitive" } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            fullName: true,
            companyName: true,
            whatsapp: true,
            phone: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            columnId: true,
          },
        },
      },
    });

    // Métricas para os cards de topo
    const allDocs = await prisma.document.findMany({ select: { category: true, sentViaWhatsapp: true, totalAmount: true } });
    const totalCount = allDocs.length;
    const orcamentosCount = allDocs.filter((d) => d.category === "ORCAMENTO").length;
    const sentWhatsappCount = allDocs.filter((d) => d.sentViaWhatsapp).length;
    const totalVolume = allDocs.reduce((acc, d) => acc + (Number(d.totalAmount) || 0), 0);

    return NextResponse.json({
      success: true,
      documents,
      metrics: {
        totalCount,
        orcamentosCount,
        sentWhatsappCount,
        totalVolume,
      },
    });
  } catch (error: any) {
    console.error("[Documents API] Erro ao listar documentos:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar documentos", details: error?.message },
      { status: 500 }
    );
  }
}
