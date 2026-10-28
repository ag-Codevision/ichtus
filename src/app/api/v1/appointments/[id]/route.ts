import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/appointments/[id]
 * Atualiza campos do agendamento (título, tipo, serviço vinculado, cliente, data/hora, equipe, etc.)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      type,
      customType,
      status,
      scheduledAt,
      durationMinutes,
      locationAddress,
      assignedTeam,
      assignedProviderIds,
      notes,
      customerId,
      leadId,
      serviceOrderId,
    } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (type !== undefined) {
      dataToUpdate.type = type;
      dataToUpdate.customType = type === "OTHER" && customType ? customType.trim() : null;
    } else if (customType !== undefined) {
      dataToUpdate.customType = customType ? customType.trim() : null;
    }
    if (status !== undefined) dataToUpdate.status = status;
    if (scheduledAt !== undefined) dataToUpdate.scheduledAt = new Date(scheduledAt);
    if (durationMinutes !== undefined) dataToUpdate.durationMinutes = Number(durationMinutes);
    if (locationAddress !== undefined) dataToUpdate.locationAddress = locationAddress?.trim() || null;
    if (notes !== undefined) dataToUpdate.notes = notes?.trim() || null;

    if (customerId !== undefined) dataToUpdate.customerId = customerId || null;
    if (leadId !== undefined) {
      dataToUpdate.leadId = leadId || null;
      // Se customerId não foi explicitamente fornecido mas vinculou um Lead, herda o customerId do lead
      if (!customerId && leadId) {
        const linkedLead = await prisma.lead.findUnique({
          where: { id: leadId },
          select: { customerId: true },
        });
        if (linkedLead?.customerId) {
          dataToUpdate.customerId = linkedLead.customerId;
        }
      }
    }
    if (serviceOrderId !== undefined) dataToUpdate.serviceOrderId = serviceOrderId || null;

    // Atualização dos prestadores e equipe responsável
    if (assignedProviderIds !== undefined) {
      const cleanIds = Array.isArray(assignedProviderIds) ? assignedProviderIds.filter(Boolean) : [];
      dataToUpdate.assignedProviderIds = cleanIds;

      if (!assignedTeam && cleanIds.length > 0) {
        const providers = await prisma.customer.findMany({
          where: { id: { in: cleanIds } },
          select: { tradeName: true, fullName: true, companyName: true },
        });
        dataToUpdate.assignedTeam = providers
          .map((p) => p.tradeName || p.fullName || p.companyName)
          .filter(Boolean)
          .join(", ");
      }
    }

    if (assignedTeam !== undefined && assignedTeam.trim()) {
      dataToUpdate.assignedTeam = assignedTeam.trim();
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
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
      appointment: updated,
    });
  } catch (error: any) {
    console.error("[Appointments API] Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar agendamento", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/appointments/[id]
 * Exclui agendamento do cronograma
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento removido com sucesso",
    });
  } catch (error: any) {
    console.error("[Appointments API] Erro ao excluir agendamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao remover agendamento", details: error?.message },
      { status: 500 }
    );
  }
}
