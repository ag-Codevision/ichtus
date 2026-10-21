import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CustomerType, PersonType, CustomerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * GET /api/v1/crm/contacts
 * Listagem paginada de contatos/entidades do CRM com filtros de tipo, pessoa, status, busca e ordenação
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const personTypeParam = searchParams.get("personType");
    const statusParam = searchParams.get("status");
    const sortByParam = searchParams.get("sortBy") || "default";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (typeParam && typeParam !== "ALL") {
      where.type = typeParam as CustomerType;
    }

    if (personTypeParam && personTypeParam !== "ALL") {
      where.personType = personTypeParam as PersonType;
    }

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam as CustomerStatus;
    }

    if (search) {
      where.OR = [
        { tradeName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { documentNumber: { contains: search } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { contactRole: { contains: search, mode: "insensitive" } },
        { contactPersonPhone: { contains: search } },
        { contactPersonEmail: { contains: search, mode: "insensitive" } },
        { contactPersonNotes: { contains: search, mode: "insensitive" } },
        { leadChannel: { contains: search, mode: "insensitive" } },
        { leadChannelDetails: { contains: search, mode: "insensitive" } },
        { leadChannel: { contains: search, mode: "insensitive" } },
        { leadChannelDetails: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { whatsapp: { contains: search } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Configuração de Ordenação Dinâmica
    let orderBy: any = [{ status: "asc" }, { updatedAt: "desc" }];
    if (sortByParam === "name_asc") {
      orderBy = [{ tradeName: "asc" }, { fullName: "asc" }, { companyName: "asc" }];
    } else if (sortByParam === "name_desc") {
      orderBy = [{ tradeName: "desc" }, { fullName: "desc" }, { companyName: "desc" }];
    } else if (sortByParam === "newest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sortByParam === "oldest") {
      orderBy = [{ createdAt: "asc" }];
    } else if (sortByParam === "recent_activity") {
      orderBy = [{ updatedAt: "desc" }];
    }

    const [contacts, totalCount, kpisData] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              role: true,
            },
          },
          _count: {
            select: {
              serviceOrders: true,
              invoices: true,
              leads: true,
              stockItems: true,
              appointments: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
      prisma.customer.groupBy({
        by: ["type"],
        _count: { _all: true },
      }),
    ]);

    const activeCount = await prisma.customer.count({
      where: { status: CustomerStatus.ACTIVE },
    });

    const kpis = {
      total: totalCount,
      customers: kpisData.find((k) => k.type === CustomerType.CUSTOMER)?._count._all || 0,
      serviceProviders: kpisData.find((k) => k.type === CustomerType.SERVICE_PROVIDER)?._count._all || 0,
      suppliers: kpisData.find((k) => k.type === CustomerType.SUPPLIER)?._count._all || 0,
      active: activeCount,
    };

    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      kpis,
    });
  } catch (error: any) {
    console.error("Erro ao listar contatos do CRM:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar contatos do CRM." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/crm/contacts
 * Cadastro de novo contato (Cliente, Fornecedor ou Prestador de Serviço)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      type = "CUSTOMER",
      personType = "PJ",
      status = "ACTIVE",
      companyName,
      tradeName,
      fullName,
      documentNumber,
      stateRegistration,
      municipalRegistration,
      rg,
      contactPerson,
      contactRole,
      contactPersonPhone,
      contactPersonEmail,
      contactPersonNotes,
      leadChannel,
      leadChannelDetails,
      phone,
      whatsapp,
      email,
      financialEmail,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      referencePoint,
      creditLimit,
      paymentTerms,
      pixKeyType,
      pixKey,
      bankName,
      bankAgency,
      bankAccount,
      notes,
      tags = [],
    } = body;

    // Validação mínima de identificação
    const displayName = personType === "PJ" ? (tradeName || companyName) : (fullName || contactPerson);
    if (!displayName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: personType === "PJ"
            ? "O Nome Fantasia ou Razão Social é obrigatório para Pessoa Jurídica."
            : "O Nome Completo é obrigatório para Pessoa Física.",
        },
        { status: 400 }
      );
    }

    // Se houver documento, verifica unicidade no banco
    const cleanedDoc = documentNumber?.replace(/\D/g, "");
    if (cleanedDoc) {
      const existing = await prisma.customer.findFirst({
        where: {
          documentNumber: {
            in: [documentNumber, cleanedDoc],
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `Já existe um cadastro com o documento informado (${existing.tradeName || existing.fullName || existing.companyName}).`,
          },
          { status: 409 }
        );
      }
    }

    const cleanEmail = email?.trim()?.toLowerCase() || null;
    let linkedUserId: string | null = null;

    // Se informado e-mail, cria automaticamente o perfil de acesso no banco
    if (cleanEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        linkedUserId = existingUser.id;
      } else {
        const defaultPasswordHash = await bcrypt.hash("Icthus@123", 10);
        const newUser = await prisma.user.create({
          data: {
            name: displayName,
            email: cleanEmail,
            passwordHash: defaultPasswordHash,
            phone: whatsapp?.trim() || phone?.trim() || null,
            role: "CUSTOMER",
            isActive: false, // Por padrão nasce desligada, sendo necessária a ativação manual pelo admin
          },
        });
        linkedUserId = newUser.id;
      }
    }

    const created = await prisma.customer.create({
      data: {
        userId: linkedUserId,
        type: type as CustomerType,
        personType: personType as PersonType,
        status: status as CustomerStatus,
        companyName: companyName?.trim() || null,
        tradeName: tradeName?.trim() || null,
        fullName: fullName?.trim() || null,
        documentNumber: documentNumber?.trim() || null,
        stateRegistration: stateRegistration?.trim() || null,
        municipalRegistration: municipalRegistration?.trim() || null,
        rg: rg?.trim() || null,
        contactPerson: contactPerson?.trim() || null,
        contactRole: contactRole?.trim() || null,
        contactPersonPhone: contactPersonPhone?.trim() || null,
        contactPersonEmail: contactPersonEmail?.trim()?.toLowerCase() || null,
        contactPersonNotes: contactPersonNotes?.trim() || null,
        leadChannel: leadChannel?.trim() || null,
        leadChannelDetails: leadChannelDetails?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        email: cleanEmail,
        financialEmail: financialEmail?.trim()?.toLowerCase() || null,
        zipCode: zipCode?.trim() || null,
        street: street?.trim() || null,
        number: number?.trim() || null,
        complement: complement?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim()?.toUpperCase() || null,
        referencePoint: referencePoint?.trim() || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        paymentTerms: paymentTerms?.trim() || null,
        pixKeyType: pixKeyType || null,
        pixKey: pixKey?.trim() || null,
        bankName: bankName?.trim() || null,
        bankAgency: bankAgency?.trim() || null,
        bankAccount: bankAccount?.trim() || null,
        notes: notes?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      contact: created,
      message: "Contato registrado com sucesso no CRM e perfil de acesso provisionado!",
    });
  } catch (error: any) {
    console.error("Erro ao criar contato no CRM:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno ao cadastrar contato." },
      { status: 500 }
    );
  }
}
