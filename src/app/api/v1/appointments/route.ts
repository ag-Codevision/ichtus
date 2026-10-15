import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";
import { formatDateTime } from "@/lib/utils";

/**
 * GET /api/v1/appointments
 * Listagem de agendamentos com filtros
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
            user: { select: { name: true, phone: true } },
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
      status = "SCHEDULED",
      scheduledAt,
      durationMinutes = 60,
      locationAddress,
      assignedTeam,
      notes,
      customerId,
      serviceOrderId,
      notifyPhone,
    } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Título e data/hora do agendamento são obrigatórios." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        type,
        status,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: Number(durationMinutes) || 60,
        locationAddress: locationAddress || null,
        assignedTeam: assignedTeam || "Equipe de Campo 01",
        notes: notes || null,
        customerId: customerId || null,
        serviceOrderId: serviceOrderId || null,
      },
    });

    // Se fornecido telefone para notificação via WACLI (WhatsApp)
    if (notifyPhone) {
      try {
        const typeLabels: Record<string, string> = {
          TECHNICAL_VISIT_MEASUREMENT: "Visita Técnica e Medição",
          INTERNAL_PRODUCTION_RUN: "Produção Interna",
          EXTERNAL_INSTALLATION: "Instalação Externa da Fachada",
          DELIVERY_PICKUP: "Entrega / Retirada",
        };
        const label = typeLabels[type] || "Atendimento Técnico";

        const msg = `📅 *Agendamento Confirmado — Glessios*\n\nSeu compromisso de *${label}* está confirmado para:\n🗓️ *Data e Hora:* ${formatDateTime(appointment.scheduledAt)}\n📍 *Local:* ${locationAddress || "A combinar"}\n👥 *Equipe:* ${appointment.assignedTeam}\n\nQualquer necessidade de reagendamento, nos avise por este canal!`;
        await sendWhatsAppMessage({
          to: notifyPhone,
          message: msg,
        });
      } catch (err) {
        console.warn("[Appointments] Falha no disparo do WhatsApp:", err);
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
