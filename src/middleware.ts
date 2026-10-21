import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Blindagem de Rotas Administrativas (/admin/*)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminCookie = request.cookies.get("glessios_admin_session")?.value;

    if (!adminCookie) {
      const loginUrl = new URL("/glessios/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parsed = JSON.parse(adminCookie);
      if (parsed.role !== "ADMIN") {
        const loginUrl = new URL("/glessios/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/glessios/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Blindagem de Rotas do Portal do Cliente (/portal/* exceto /portal/login)
  if (pathname.startsWith("/portal") && pathname !== "/portal/login") {
    const portalCookie = request.cookies.get("glessios_portal_session")?.value;

    if (!portalCookie) {
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parsed = JSON.parse(portalCookie);
      if (parsed.role !== "CUSTOMER" || !parsed.customerId) {
        const loginUrl = new URL("/portal/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
  ],
};
