import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";
import { formatDateTime } from "@/lib/utils";

/**
 * GET /api/v1/appointments
 * Listagem de agendamentos com filtros e dados completos (cliente, serviço/lead, prestadores)
 */
export async function GET(req: NextRequest) {
  try {
    const statusParam = req.nextUrl.searchParams.get("status") as AppointmentStatus | null;
    const typeParam = req.nextUrl.searchParams.get("type") as AppointmentType | null;

    const where: any = {};
    if (statusParam) where.status = statusParam;
    if (typeParam) where.type = typeParam;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            user: { select: { name: true, phone: true } },
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            budgetCode: true,
            column: { select: { id: true, name: true, color: true } },
            category: { select: { id: true, name: true, color: true } },
          },
        },
        serviceOrder: {
          select: { id: true, code: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    console.error("[Appointments API] Erro ao listar agendamentos:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar agendamentos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/appointments
 * Criação de novo compromisso de campo ou produção
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      type = "TECHNICAL_VISIT_MEASUREMENT",
      customType,
      status = "SCHEDULED",
      scheduledAt,
      durationMinutes = 60,
      locationAddress,
      assignedTeam,
      assignedProviderIds = [],
      notes,
      customerId,
      leadId,
      serviceOrderId,
      notifyPhone,
    } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Título e data/hora do agendamento são obrigatórios." },
        { status: 400 }
      );
    }

    const parsedScheduledAt = new Date(scheduledAt);
    if (isNaN(parsedScheduledAt.getTime())) {
      return NextResponse.json(
        { success: false, error: "A data e horário informados são inválidos." },
        { status: 400 }
      );
    }

    // Se o cliente não foi explicitamente fornecido mas o serviço (lead) foi, herda o customerId do Lead
    let resolvedCustomerId = customerId || null;
    if (!resolvedCustomerId && leadId) {
      const linkedLead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { customerId: true },
      });
      if (linkedLead?.customerId) {
        resolvedCustomerId = linkedLead.customerId;
      }
    }

    // Se houver prestadores selecionados e o assignedTeam não tiver sido fornecido, busca os nomes dos prestadores
    let finalAssignedTeam = assignedTeam?.trim() || "";
    const cleanProviderIds = Array.isArray(assignedProviderIds)
      ? assignedProviderIds.filter(Boolean)
      : [];

    if (!finalAssignedTeam && cleanProviderIds.length > 0) {
      const providers = await prisma.customer.findMany({
        where: { id: { in: cleanProviderIds } },
        select: { tradeName: true, fullName: true, companyName: true },
      });
      finalAssignedTeam = providers
        .map((p) => p.tradeName || p.fullName || p.companyName)
        .filter(Boolean)
        .join(", ");
    }

    if (!finalAssignedTeam) {
      finalAssignedTeam = "Equipe Técnica";
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: title.trim(),
        type,
        customType: type === "OTHER" && customType ? customType.trim() : null,
        status,
        scheduledAt: parsedScheduledAt,
        durationMinutes: Number(durationMinutes) || 60,
        locationAddress: locationAddress?.trim() || null,
        assignedTeam: finalAssignedTeam,
        assignedProviderIds: cleanProviderIds,
        notes: notes?.trim() || null,
        customerId: resolvedCustomerId,
        leadId: leadId || null,
        serviceOrderId: serviceOrderId || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            tradeName: true,
            companyName: true,
            fullName: true,
            phone: true,
            whatsapp: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            budgetCode: true,
            column: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    // Se fornecido telefone para notificação via WACLI (WhatsApp), despacha em background sem travar o response da API
    if (notifyPhone) {
      try {
        const typeLabels: Record<string, string> = {
          TECHNICAL_VISIT_MEASUREMENT: "Visita Técnica e Medição",
          INTERNAL_PRODUCTION_RUN: "Produção Interna",
          EXTERNAL_INSTALLATION: "Instalação Externa da Fachada",
          DELIVERY_PICKUP: "Entrega / Retirada",
          OTHER: appointment.customType || "Outros Serviços",
        };
        const label = typeLabels[type] || "Atendimento Técnico";

        const msg = `📅 *Agendamento Confirmado — Icthus Soluções*\n\nSeu compromisso de *${label}* está confirmado para:\n🗓️ *Data e Hora:* ${formatDateTime(appointment.scheduledAt)}\n📍 *Local:* ${locationAddress || "A combinar"}\n👥 *Equipe/Responsáveis:* ${appointment.assignedTeam}\n\nQualquer necessidade de reagendamento, nos avise por este canal!`;

        // Disparo assíncrono não-bloqueante
        sendWhatsAppMessage({
          to: notifyPhone,
          message: msg,
        }).catch((err) => {
          console.warn("[Appointments] Falha no disparo do WhatsApp em background:", err);
        });
      } catch (err) {
        console.warn("[Appointments] Falha ao preparar mensagem de WhatsApp:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Compromisso agendado com sucesso!",
        appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Appointments API] Erro ao criar agendamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar agendamento", details: error?.message },
      { status: 500 }
    );
  }
}
