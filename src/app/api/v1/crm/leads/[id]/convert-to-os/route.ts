import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OSStage, PriorityLevel, InvoiceStatus, PaymentMethod } from "@prisma/client";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp/wacli";
import * as bcrypt from "bcryptjs";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/convert-to-os
 * Conversão comercial de Lead fechado em Ordem de Serviço (OS) e Faturamento
 * Conforme especificado em SDD.md (seção 4.2) e SPEC.md (RF-03.3)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: leadId } = await params;
    const body = await req.json().catch(() => ({}));

    // 1. Localiza o Lead no banco
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead não encontrado." },
        { status: 404 }
      );
    }

    // 2. Localiza um usuário admin para assinar a criação da OS
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Usuário administrador não configurado." },
        { status: 500 }
      );
    }

    // 3. Localiza ou cria o Cliente e Usuário correspondente
    let user = await prisma.user.findUnique({
      where: { email: lead.contactEmail || `cliente-${lead.contactPhone}@glessios.com.br` },
    });

    if (!user) {
      const tempPassword = await bcrypt.hash("Glessios@2026", 10);
      user = await prisma.user.create({
        data: {
          name: lead.contactName,
          email: lead.contactEmail || `cliente-${lead.contactPhone}@glessios.com.br`,
          phone: lead.contactPhone,
          passwordHash: tempPassword,
          role: "CUSTOMER",
        },
      });
    }

    let customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: user.id,
          tradeName: lead.title,
        },
      });
    }

    // 4. Gera código sequencial da OS (ex: OS-2026-0001)
    const currentYear = new Date().getFullYear();
    const osCount = await prisma.serviceOrder.count();
    const osCode = `OS-${currentYear}-${String(osCount + 1).padStart(4, "0")}`;

    const totalValue = lead.estimatedValue ? Number(lead.estimatedValue) : 4500.0;

    // 5. Criação da Ordem de Serviço
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        code: osCode,
        customerId: customer.id,
        leadId: lead.id,
        createdById: adminUser.id,
        title: lead.title,
        description: lead.notes || "Projeto aprovado comercialmente a partir do CRM Kanban.",
        currentStage: OSStage.BRIEFING_ARTWORK,
        priority: lead.priority,
        totalAmount: totalValue,
        discount: 0.0,
        netAmount: totalValue,
        items: {
          create: [
            {
              description: body.itemDescription || lead.title || "Fachada Comercial em ACM com Letreiro LED",
              unit: "serviço",
              quantity: 1,
              unitPrice: totalValue,
              totalPrice: totalValue,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // 6. Geração da Fatura Inicial em Contas a Receber
    const invoiceCode = `FAT-${currentYear}-${String(osCount + 1).padStart(4, "0")}-1`;
    const invoice = await prisma.invoice.create({
      data: {
        code: invoiceCode,
        serviceOrderId: serviceOrder.id,
        customerId: customer.id,
        amount: totalValue,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Vencimento em 7 dias
        status: InvoiceStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
        pixCopyPasteCode: `00020126580014br.gov.bcb.pix0136glessios-${invoiceCode}520400005303986540${totalValue}.005802BR5925GLESSIOS COMUNICACAO VISUAL6008CURITIBA62070503***6304ABCD`,
      },
    });

    // 7. Move o Lead para a coluna "Aprovado" ou "Em Produção"
    const approvedCol = await prisma.kanbanColumn.findFirst({
      where: { name: { in: ["Aprovado", "Em Produção"] } },
      orderBy: { order: "asc" },
    });

    if (approvedCol) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { columnId: approvedCol.id },
      });
    }

    // 8. Disparo de Boas-Vindas e Acesso ao Portal via WACLI (WhatsApp)
    try {
      const portalUrl = `https://glessios.com.br/portal/login`;
      const welcomeMsg = WhatsAppTemplates.welcomeCustomer(
        lead.contactName,
        user.email,
        portalUrl
      );
      await sendWhatsAppMessage({
        to: lead.contactPhone,
        message: welcomeMsg,
      });
    } catch (wppErr) {
      console.warn("[CRM] Falha ao enviar WhatsApp de conversão:", wppErr);
    }

    return NextResponse.json({
      success: true,
      message: `Lead convertido com sucesso na Ordem de Serviço ${osCode}!`,
      serviceOrder,
      invoice,
    });
  } catch (error: any) {
    console.error("[CRM API] Erro na conversão para OS:", error);
    return NextResponse.json(
      { success: false, error: "Falha na conversão para OS", details: error?.message },
      { status: 500 }
    );
  }
}
