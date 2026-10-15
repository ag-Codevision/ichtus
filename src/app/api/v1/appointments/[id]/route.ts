import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, scheduledAt, durationMinutes, assignedTeam, notes } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (scheduledAt !== undefined) dataToUpdate.scheduledAt = new Date(scheduledAt);
    if (durationMinutes !== undefined) dataToUpdate.durationMinutes = Number(durationMinutes);
    if (assignedTeam !== undefined) dataToUpdate.assignedTeam = assignedTeam;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
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
