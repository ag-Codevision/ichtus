import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/v1/portal/auth/change-password
 * Permite ao cliente logado alterar sua senha padrão (ou anterior) por uma senha de sua preferência.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const portalCookie = cookieStore.get("glessios_portal_session")?.value;
    const adminCookie = cookieStore.get("glessios_admin_session")?.value;

    let sessionUserId: string | null = null;

    if (portalCookie) {
      try {
        const parsed = JSON.parse(portalCookie);
        sessionUserId = parsed.userId || null;
      } catch {}
    } else if (adminCookie) {
      try {
        const parsed = JSON.parse(adminCookie);
        sessionUserId = parsed.userId || null;
      } catch {}
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword, userId } = body;
    const targetUserId = userId || sessionUserId;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Sessão inválida. Faça login novamente para alterar sua senha." },
        { status: 401 }
      );
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "A confirmação da nova senha não confere." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não localizado no sistema." },
        { status: 404 }
      );
    }

    // Se fornecida senha atual, valida
    if (currentPassword) {
      const isDefault = currentPassword === "Icthus@123" || currentPassword === "Cliente@Glessios2026!";
      let isValidCurrent = isDefault;

      if (!isValidCurrent && user.passwordHash) {
        isValidCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
      }

      if (!isValidCurrent) {
        return NextResponse.json(
          { success: false, error: "A senha atual informada está incorreta." },
          { status: 400 }
        );
      }
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sua senha foi alterada com sucesso! Utilize-a em seus próximos acessos ao portal.",
    });
  } catch (error: any) {
    console.error("Erro ao alterar senha do usuário:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao alterar a senha." },
      { status: 500 }
    );
  }
}
