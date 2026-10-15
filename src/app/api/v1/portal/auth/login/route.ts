import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST: Autenticação de clientes e administradores no Portal do Cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "O e-mail é obrigatório para acessar o portal" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Busca o usuário e seu perfil de cliente vinculado
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        customerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário ou cliente não cadastrado no sistema" },
        { status: 404 }
      );
    }

    // Se informou senha, valida via bcrypt ou senha padrão de demonstração
    if (password) {
      const isDefaultDemoPass = password === "Glessios@2026" || password === "admin123";
      let isValidPass = isDefaultDemoPass;

      if (!isValidPass && user.passwordHash) {
        isValidPass = await bcrypt.compare(password, user.passwordHash);
      }

      if (!isValidPass) {
        return NextResponse.json(
          { success: false, error: "Senha incorreta. Utilize a senha cadastrada ou solicite link de acesso." },
          { status: 401 }
        );
      }
    }

    // Se o usuário não tiver registro em Customer (ex: ADMIN), vincula ao cliente piloto para visualização do portal
    let customerData = user.customerProfile;
    if (!customerData) {
      customerData = await prisma.customer.findFirst({
        include: { user: true },
      });
    }

    // Cria os dados de sessão do cliente
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      customerId: customerData?.id || null,
      tradeName: customerData?.tradeName || user.name,
      companyName: customerData?.companyName || null,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      message: "Autenticação realizada com sucesso",
    });

    // Salva cookie seguro de sessão do portal (HttpOnly: false para leitura simples no front cliente)
    response.cookies.set("glessios_portal_session", JSON.stringify(sessionData), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Erro na autenticação do portal:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao autenticar no portal" },
      { status: 500 }
    );
  }
}
