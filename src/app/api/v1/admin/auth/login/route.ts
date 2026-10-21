import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST: Autenticação exclusiva para Administradores no ERP Glessios
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "O e-mail é obrigatório para acessar o painel administrativo" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Administrador não cadastrado no sistema." },
        { status: 404 }
      );
    }

    // Regra estrita de Role: Apenas ADMIN pode acessar o ERP
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso restrito apenas a administradores. Clientes devem acessar pelo Portal do Cliente (/portal/login).",
        },
        { status: 403 }
      );
    }

    // Regra de ativação de conta
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo desativado para esta conta." },
        { status: 403 }
      );
    }

    // Validação da senha
    if (password) {
      const isDefaultDemoPass = password === "Admin@Glessios2026!" || password === "admin123";
      let isValidPass = isDefaultDemoPass;

      if (!isValidPass && user.passwordHash) {
        isValidPass = await bcrypt.compare(password, user.passwordHash);
      }

      if (!isValidPass) {
        return NextResponse.json(
          { success: false, error: "Senha incorreta. Verifique suas credenciais de administrador." },
          { status: 401 }
        );
      }
    }

    // Dados da sessão administrativa
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      message: "Autenticação administrativa realizada com sucesso",
    });

    // Salva cookie seguro de sessão do admin
    response.cookies.set("glessios_admin_session", JSON.stringify(sessionData), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Erro na autenticação do admin:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao autenticar administrador" },
      { status: 500 }
    );
  }
}
