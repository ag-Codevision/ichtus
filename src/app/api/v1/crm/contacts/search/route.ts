import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CustomerType } from "@prisma/client";

/**
 * GET /api/v1/crm/contacts/search
 * Endpoint otimizado e leve para auto-complete e seletores de Contatos (Select/Combobox)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const typeParam = searchParams.get("type");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: any = {};

    if (typeParam && typeParam !== "ALL") {
      where.type = typeParam as CustomerType;
    }

    if (query) {
      where.OR = [
        { tradeName: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
        { documentNumber: { contains: query } },
        { contactPerson: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { whatsapp: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.customer.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        type: true,
        personType: true,
        tradeName: true,
        companyName: true,
        fullName: true,
        documentNumber: true,
        phone: true,
        whatsapp: true,
        email: true,
        city: true,
        state: true,
        status: true,
      },
    });

    const formatted = contacts.map((c) => ({
      id: c.id,
      displayName: c.tradeName || c.fullName || c.companyName || "Sem Nome",
      companyName: c.companyName,
      tradeName: c.tradeName,
      fullName: c.fullName,
      type: c.type,
      personType: c.personType,
      documentNumber: c.documentNumber,
      phone: c.phone,
      whatsapp: c.whatsapp,
      email: c.email,
      city: c.city,
      state: c.state,
      status: c.status,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Erro na busca de contatos para auto-complete:", error);
    return NextResponse.json(
      { success: false, error: "Falha na busca de contatos." },
      { status: 500 }
    );
  }
}
