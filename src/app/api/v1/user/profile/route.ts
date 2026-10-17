import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Função utilitária para extrair a sessão ativa (Admin ou Portal do Cliente)
async function getActiveSessionUser() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("glessios_admin_session")?.value;
  const portalCookie = cookieStore.get("glessios_portal_session")?.value;

  let session: { userId?: string; role?: string; email?: string } | null = null;

  if (adminCookie) {
    try {
      session = JSON.parse(adminCookie);
    } catch {}
  } else if (portalCookie) {
    try {
      session = JSON.parse(portalCookie);
    } catch {}
  }

  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      role: true,
      avatarUrl: true,
      phone: true,
      isActive: true,
    },
  });

  return user;
}

// GET: Retorna os dados do perfil do usuário autenticado (sem expor e-mail conforme LGPD)
export async function GET() {
  try {
    const user = await getActiveSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao obter dados do perfil." },
      { status: 500 }
    );
  }
}

// PATCH: Atualiza nome e foto de perfil do usuário logado (nos dois papéis: ADMIN e CUSTOMER)
export async function PATCH(request: Request) {
  try {
    const user = await getActiveSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatarUrl, phone } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "O nome é obrigatório para atualização do perfil." },
        { status: 400 }
      );
    }

    // Validação de tamanho do avatar (se for base64, máximo ~2.5MB)
    if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.length > 3 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "A imagem selecionada é muito pesada. O tamanho máximo permitido é 2MB." },
        { status: 400 }
      );
    }

    // Atualização no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        avatarUrl: avatarUrl !== undefined ? (avatarUrl ? avatarUrl.trim() : null) : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isActive: true,
      },
    });

    // Atualiza os cookies de sessão correspondentes para refletir o novo nome (avatar leve ou omitido no cookie)
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("glessios_admin_session")?.value;
    const portalCookie = cookieStore.get("glessios_portal_session")?.value;

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Perfil atualizado com sucesso no banco de dados.",
    });

    if (adminCookie) {
      try {
        const parsed = JSON.parse(adminCookie);
        parsed.name = updatedUser.name;
        // NUNCA salvar string base64 em cookies (limite de 4KB por cookie no protocolo HTTP)
        if (updatedUser.avatarUrl && !updatedUser.avatarUrl.startsWith("data:") && updatedUser.avatarUrl.length < 300) {
          parsed.avatarUrl = updatedUser.avatarUrl;
        } else {
          delete parsed.avatarUrl;
        }
        response.cookies.set("glessios_admin_session", JSON.stringify(parsed), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      } catch {}
    }

    if (portalCookie) {
      try {
        const parsed = JSON.parse(portalCookie);
        parsed.name = updatedUser.name;
        // NUNCA salvar string base64 em cookies (limite de 4KB por cookie no protocolo HTTP)
        if (updatedUser.avatarUrl && !updatedUser.avatarUrl.startsWith("data:") && updatedUser.avatarUrl.length < 300) {
          parsed.avatarUrl = updatedUser.avatarUrl;
        } else {
          delete parsed.avatarUrl;
        }
        response.cookies.set("glessios_portal_session", JSON.stringify(parsed), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      } catch {}
    }

    return response;
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao salvar alterações do perfil." },
      { status: 500 }
    );
  }
}
