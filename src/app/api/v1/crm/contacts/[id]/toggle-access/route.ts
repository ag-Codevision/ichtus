import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp/wacli";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/contacts/[id]/toggle-access
 * Ativa ou desativa o acesso do cliente ao Portal Icthus.
 * Ao ativar, envia automaticamente mensagem pelo WhatsApp com as boas-vindas e credenciais de acesso.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { active, resendOnly } = body;

    const contact = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contato não localizado." },
        { status: 404 }
      );
    }

    const email = contact.email || contact.user?.email;
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "O contato precisa ter um e-mail cadastrado para ter perfil de acesso ao Portal do Cliente.",
        },
        { status: 400 }
      );
    }

    const displayName = contact.tradeName || contact.fullName || contact.companyName || contact.contactPerson || "Cliente";
    const phone = contact.whatsapp || contact.phone || contact.user?.phone;

    let targetUser = contact.user;

    // Se o contato ainda não tem usuário vinculado, cria agora
    if (!targetUser) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existingUser) {
        targetUser = existingUser;
      } else {
        const defaultHash = await bcrypt.hash("Icthus@123", 10);
        targetUser = await prisma.user.create({
          data: {
            name: displayName,
            email: email.trim().toLowerCase(),
            passwordHash: defaultHash,
            phone: phone ? phone.trim() : null,
            role: "CUSTOMER",
            isActive: Boolean(active),
          },
        });
      }

      await prisma.customer.update({
        where: { id: contact.id },
        data: { userId: targetUser.id },
      });
    }

    // Se for apenas reenvio ou se foi solicitado ativar/desativar
    const shouldBeActive = resendOnly ? (targetUser.isActive ?? true) : Boolean(active);

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        isActive: shouldBeActive,
      },
    });

    let whatsappSent = false;
    let whatsappError: string | null = null;

    // Se ativado (ou se for reenvio explícito de credenciais), envia mensagem no WhatsApp
    if (shouldBeActive && phone) {
      try {
        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://glessios.com.br"}/portal/login`;
        const messageText = WhatsAppTemplates.welcomeCustomerWithCredentials(
          displayName,
          updatedUser.email,
          portalUrl,
          "Icthus@123"
        );

        const wppResult = await sendWhatsAppMessage({
          to: phone,
          message: messageText,
        });

        whatsappSent = wppResult.success;
        if (!wppResult.success) {
          whatsappError = wppResult.error || "Falha no envio da mensagem";
        }
      } catch (err: any) {
        console.warn("[CRM] Falha ao disparar WhatsApp de boas-vindas:", err);
        whatsappError = err?.message || "Erro de conexão com o WhatsApp";
      }
    }

    return NextResponse.json({
      success: true,
      isActive: updatedUser.isActive,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      },
      whatsappSent,
      whatsappError,
      message: updatedUser.isActive
        ? `Acesso ao Portal do Cliente liberado com sucesso! ${whatsappSent ? "Credenciais enviadas via WhatsApp." : (phone ? "Aviso: WhatsApp em modo simulação/fila." : "Aviso: Contato não possui WhatsApp para envio de credenciais.")}`
        : "Acesso ao Portal do Cliente desativado com sucesso. O cliente não conseguirá mais efetuar login.",
    });
  } catch (error: any) {
    console.error("Erro ao alterar acesso do cliente:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha interna ao alternar acesso do cliente." },
      { status: 500 }
    );
  }
}
