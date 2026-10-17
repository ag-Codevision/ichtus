"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Rotas que não devem exibir a sidebar retrátil (telas de login e proposta A4 para impressão)
  const isExcluded =
    pathname === "/admin/login" ||
    pathname === "/glessios/login" ||
    pathname?.startsWith("/admin/propostas/");

  if (isExcluded) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
