import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OSStage } from "@prisma/client";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

const STAGE_LABELS: Record<OSStage, string> = {
  BRIEFING_ARTWORK: "Briefing e Criação da Arte",
  ARTWORK_APPROVAL: "Aguardando Aprovação de Prova Digital",
  CNC_ROUTER_CUTTING: "Corte Router CNC & Laser",
  DIGITAL_PRINTING: "Impressão Digital UV & Laminação",
  ASSEMBLY_STRUCTURE: "Serralheria, Montagem & Elétrica LED",
  QUALITY_CONTROL: "Controle de Qualidade & Acabamento",
  READY_FOR_INSTALLATION: "Pronto para Envio / Instalação em Campo",
  INSTALLED_COMPLETED: "Instalado & Concluído",
  CANCELLED: "Cancelado",
};

/**
 * GET /api/v1/production/orders/[id]
 * Detalhes completos da Ordem de Serviço
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        items: true,
        artworkProofs: {
          orderBy: { version: "desc" },
        },
        invoices: true,
        appointments: true,
        stockMovements: {
          include: { stockItem: true },
        },
      },
    });

    if (!serviceOrder) {
      return NextResponse.json(
        { success: false, error: "Ordem de serviço não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      serviceOrder,
    });
  } catch (error: any) {
    console.error("[Production API] Erro ao obter OS:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar ordem de serviço", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/production/orders/[id]
 * Atualiza o estágio da esteira fabril e dispara alerta via WACLI
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { currentStage, priority, deadline, installationDate, notes } = body;

    const dataToUpdate: any = {};
    if (currentStage !== undefined) dataToUpdate.currentStage = currentStage as OSStage;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (deadline !== undefined) dataToUpdate.deadline = deadline ? new Date(deadline) : null;
    if (installationDate !== undefined)
      dataToUpdate.installationDate = installationDate ? new Date(installationDate) : null;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updatedOS = await prisma.serviceOrder.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: {
          include: { user: true },
        },
      },
    });

    // Se houve avanço de estágio, dispara notificação via WhatsApp (WACLI)
    if (currentStage && updatedOS.customer?.user?.phone) {
      const stageName = STAGE_LABELS[currentStage as OSStage] || currentStage;
      const clientName = updatedOS.customer.user.name;
      const phone = updatedOS.customer.user.phone;

      try {
        const msg = WhatsAppTemplates.osStageUpdated(clientName, updatedOS.code, stageName);
        await sendWhatsAppMessage({
          to: phone,
          message: msg,
        });
      } catch (wppErr) {
        console.warn("[Production API] Falha silenciosa no envio de WhatsApp:", wppErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ordem de Serviço ${updatedOS.code} atualizada com sucesso!`,
      serviceOrder: updatedOS,
    });
  } catch (error: any) {
    console.error("[Production API] Erro ao atualizar OS:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar ordem de serviço", details: error?.message },
      { status: 500 }
    );
  }
}
