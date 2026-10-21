import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Função utilitária estrita para extrair a sessão ativa (Admin ou Portal do Cliente de forma blindada)
async function getActiveSessionUser(req?: Request, targetUserId?: string) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("glessios_admin_session")?.value;
  const portalCookie = cookieStore.get("glessios_portal_session")?.value;

  const referer = req?.headers.get("referer") || "";
  const isPortalContext = referer.includes("/portal");

  let session: { userId?: string; role?: string; email?: string } | null = null;

  if (isPortalContext) {
    // No contexto do portal do cliente, APENAS a sessão de cliente é aceita
    if (portalCookie) {
      try {
        const parsed = JSON.parse(portalCookie);
        if (parsed.role === "CUSTOMER") {
          session = parsed;
        }
      } catch {}
    }
  } else {
    // No contexto administrativo, APENAS a sessão de administrador é aceita
    if (adminCookie) {
      try {
        const parsed = JSON.parse(adminCookie);
        if (parsed.role === "ADMIN") {
          session = parsed;
        }
      } catch {}
    }
  }

  // Se não houver sessão válida para o respectivo contexto, retorna null imediatamente (sem fallbacks permissivos)
  if (!session?.userId) {
    return null;
  }

  // Se temos um ID de destino específico e válido no banco
  if (targetUserId) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isActive: true,
      },
    });

    if (targetUser) {
      // Valida se o papel do usuário é compatível com o contexto
      if (isPortalContext && targetUser.role !== "CUSTOMER") return null;
      if (!isPortalContext && targetUser.role !== "ADMIN") return null;
      return targetUser;
    }
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

  if (user) {
    if (isPortalContext && user.role !== "CUSTOMER") return null;
    if (!isPortalContext && user.role !== "ADMIN") return null;
    return user;
  }

  return null;
}

// GET: Retorna os dados do perfil do usuário autenticado (sem expor e-mail conforme LGPD)
export async function GET(request: Request) {
  try {
    const user = await getActiveSessionUser(request);

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
    const body = await request.json();
    const { id, userId, name, avatarUrl, phone } = body;
    const targetUserId = userId || id;

    const user = await getActiveSessionUser(request, targetUserId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

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

    // Atualiza os cookies de sessão correspondentes para refletir o novo nome
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("glessios_admin_session")?.value;
    const portalCookie = cookieStore.get("glessios_portal_session")?.value;

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Perfil atualizado com sucesso no banco de dados.",
    });

    if (updatedUser.role === "ADMIN" && adminCookie) {
      try {
        const parsed = JSON.parse(adminCookie);
        parsed.name = updatedUser.name;
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

    if (updatedUser.role === "CUSTOMER" && portalCookie) {
      try {
        const parsed = JSON.parse(portalCookie);
        parsed.name = updatedUser.name;
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
