import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/crm/services
 * Retorna lista rápida de serviços / cards do CRM (Leads do Kanban)
 * Suporta busca por texto (q) e filtro por cliente (customerId)
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    const customerId = req.nextUrl.searchParams.get("customerId")?.trim() || "";

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { budgetCode: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { customer: { tradeName: { contains: q, mode: "insensitive" } } },
        { customer: { companyName: { contains: q, mode: "insensitive" } } },
        { customer: { fullName: { contains: q, mode: "insensitive" } } },
      ];
    }

    const services = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 60,
      select: {
        id: true,
        title: true,
        budgetCode: true,
        contactName: true,
        contactPhone: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            city: true,
            street: true,
            number: true,
            neighborhood: true,
          },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        column: {
          select: { id: true, name: true, color: true },
        },
        estimatedValue: true,
        dueDate: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error: any) {
    console.error("[CRM Services API] Erro ao listar serviços:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar serviços vinculados" },
      { status: 500 }
    );
  }
}
