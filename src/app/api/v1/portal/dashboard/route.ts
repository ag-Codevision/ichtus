import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { InvoiceStatus, ArtworkStatus } from "@prisma/client";

// GET: Dados consolidados para o Portal do Cliente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("glessios_portal_session");

    let customerId = searchParams.get("customerId");

    // Se houver sessão em cookie, prioriza o customerId da sessão
    if (!customerId && sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        customerId = parsed.customerId;
      } catch (e) {
        // Ignora erro de parsing
      }
    }

    // Se não encontrou cliente na sessão, busca o cliente piloto (Loja Concept Batel)
    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { user: true },
      });
    }

    if (!customer) {
      customer = await prisma.customer.findFirst({
        include: { user: true },
      });
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Nenhum cliente cadastrado no sistema" },
        { status: 404 }
      );
    }

    // 1. Ordens de Serviço do Cliente
    const serviceOrders = await prisma.serviceOrder.findMany({
      where: { customerId: customer.id },
      include: {
        items: true,
        artworkProofs: {
          orderBy: { version: "desc" },
        },
        appointments: {
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Faturas do Cliente
    const invoices = await prisma.invoice.findMany({
      where: { customerId: customer.id },
      include: {
        serviceOrder: {
          select: { code: true, title: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // 3. Provas de Arte que necessitam de ação do cliente
    const pendingProofs = await prisma.artworkProof.findMany({
      where: {
        serviceOrder: { customerId: customer.id },
        status: ArtworkStatus.PENDING_CUSTOMER_REVIEW,
      },
      include: {
        serviceOrder: {
          select: { id: true, code: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Agendamentos futuros de visitas ou instalação
    const appointments = await prisma.appointment.findMany({
      where: { customerId: customer.id },
      include: {
        serviceOrder: { select: { code: true, title: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Mapeamento de percentual de progresso de cada OS (8 etapas fabris)
    const STAGE_ORDER: Record<string, number> = {
      BRIEFING_ARTWORK: 12.5,
      ARTWORK_APPROVAL: 25,
      CNC_ROUTER_CUTTING: 37.5,
      DIGITAL_PRINTING: 50,
      ASSEMBLY_STRUCTURE: 62.5,
      QUALITY_CONTROL: 75,
      READY_FOR_INSTALLATION: 87.5,
      INSTALLED_COMPLETED: 100,
      CANCELLED: 0,
    };

    const formattedOrders = serviceOrders.map((os) => ({
      ...os,
      totalAmount: Number(os.totalAmount),
      discount: Number(os.discount),
      netAmount: Number(os.netAmount),
      progressPercentage: STAGE_ORDER[os.currentStage] || 15,
      items: os.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
        widthMeters: i.widthMeters ? Number(i.widthMeters) : null,
        heightMeters: i.heightMeters ? Number(i.heightMeters) : null,
      })),
    }));

    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      amount: Number(inv.amount),
    }));

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        tradeName: customer.tradeName || customer.companyName || customer.user?.name || "Cliente",
        companyName: customer.companyName,
        documentNumber: customer.documentNumber,
        street: customer.street,
        number: customer.number,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
        user: customer.user
          ? {
              id: customer.user.id,
              name: customer.user.name,
              avatarUrl: customer.user.avatarUrl,
              phone: customer.user.phone,
            }
          : null,
      },
      serviceOrders: formattedOrders,
      invoices: formattedInvoices,
      pendingProofs,
      appointments,
      metrics: {
        totalOrders: serviceOrders.length,
        activeOrders: serviceOrders.filter((os) => os.currentStage !== "INSTALLED_COMPLETED" && os.currentStage !== "CANCELLED").length,
        pendingProofsCount: pendingProofs.length,
        pendingInvoicesCount: invoices.filter((inv) => inv.status === InvoiceStatus.PENDING).length,
      },
    });

    // Se o cliente ainda não possuía cookie de sessão, assegura a persistência segura
    if (!sessionCookie?.value && customer.user) {
      const sessionPayload = {
        userId: customer.user.id,
        name: customer.user.name,
        role: "CUSTOMER",
        customerId: customer.id,
        tradeName: customer.tradeName || customer.user.name,
        companyName: customer.companyName || null,
      };
      response.cookies.set("glessios_portal_session", JSON.stringify(sessionPayload), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Erro ao carregar dados do portal do cliente:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar painel do cliente" },
      { status: 500 }
    );
  }
}
