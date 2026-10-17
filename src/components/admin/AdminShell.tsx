"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Recupera o estado de recolhimento da sidebar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("glessios_admin_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
    setMounted(true);
  }, []);

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem("glessios_admin_sidebar_collapsed", String(collapsed));
  };

  return (
    <div className="min-h-screen bg-glessios-black text-glessios-text-body flex">
      {/* Sidebar Retrátil Fixa */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Conteúdo Principal com compensação da largura da Sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-16" : "lg:pl-60"
        }`}
      >
        {/* Barra Superior com Título e Submenu do Avatar */}
        <AdminTopBar onOpenMobileMenu={() => setIsMobileOpen(true)} />

        {/* Área de Conteúdo da Página */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
