"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Calendar,
  Layers,
  Package,
  ShoppingCart,
  DollarSign,
  Menu,
  X,
  Briefcase,
  Factory,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export function AdminMobileAppMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Busca dados do perfil do usuário para o cabeçalho Google Account
    fetch("/api/v1/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setProfile({
            name: data.user.name || "Super Admin",
            role: data.user.role || "ADMIN",
            avatarUrl: data.user.avatarUrl,
          });
        }
      })
      .catch(() => {
        // Fallback gracioso
        setProfile({
          name: "Super Admin",
          role: "ADMIN",
        });
      });
  }, []);

  // Bloqueia o scroll do body quando o menu estilo aplicativo estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignora erro de rede no logout
    }
    router.push("/admin/login");
  };

  const navSections = [
    {
      title: "Visão Geral",
      items: [
        {
          label: "Visão Geral",
          description: "Painel Central Consolidado",
          href: "/admin",
          icon: LayoutDashboard,
          active: pathname === "/admin",
        },
      ],
    },
    {
      title: "Gestão & Negócios",
      badgeIcon: Briefcase,
      badgeColor: "text-[#FF650F]",
      items: [
        {
          label: "CRM & Contatos",
          description: "Clientes, Fornecedores & Prestadores",
          href: "/admin/crm",
          icon: Users,
          active: pathname === "/admin/crm" || (pathname.startsWith("/admin/crm") && !pathname.startsWith("/admin/crm/kanban")),
        },
        {
          label: "Funil Kanban",
          description: "Funil Comercial & Oportunidades",
          href: "/admin/kanban",
          icon: Kanban,
          active: pathname.startsWith("/admin/kanban"),
        },
        {
          label: "Agendamentos",
          description: "Medição em Campo & Instalação",
          href: "/admin/agendamentos",
          icon: Calendar,
          active: pathname.startsWith("/admin/agendamentos"),
        },
        {
          label: "Financeiro & DRE",
          description: "Faturamento, CMV & Rentabilidade",
          href: "/admin/financeiro",
          icon: DollarSign,
          active: pathname.startsWith("/admin/financeiro"),
        },
      ],
    },
    {
      title: "Fábrica & CNC",
      badgeIcon: Factory,
      badgeColor: "text-emerald-500",
      items: [
        {
          label: "Compras",
          description: "Insumos & Suprimentos por OS",
          href: "/admin/compras",
          icon: ShoppingCart,
          active: pathname.startsWith("/admin/compras"),
        },
        {
          label: "Linha de Produção",
          description: "8 Fases Fabris & Provas de Arte",
          href: "/admin/producao",
          icon: Layers,
          active: pathname.startsWith("/admin/producao"),
        },
        {
          label: "Estoque & Insumos",
          description: "ACM, LEDs & Router CNC",
          href: "/admin/estoque",
          icon: Package,
          active: pathname.startsWith("/admin/estoque"),
        },
      ],
    },
  ];

  return (
    <>
      {/* Botão Flutuante (FAB) do Material Design 3 no Canto Inferior Direito */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        {/* Onda de Ripple ao clicar */}
        {isOpen && <span className="m3-menu-fab-wave" />}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu do aplicativo" : "Abrir menu do aplicativo"}
          aria-expanded={isOpen}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#E65300] via-[#FF650F] to-[#FF8534] shadow-[0_8px_24px_rgba(255,101,15,0.45)] active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF650F]/40"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.div>
        </button>
      </div>

      {/* Menu estilo Aplicativo do Google com Máscara Radial de Revelação (Circular Clip-Path) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              clipPath: "circle(0px at calc(100% - 52px) calc(100% - 52px))",
              opacity: 0.9,
            }}
            animate={{
              clipPath: "circle(160% at calc(100% - 52px) calc(100% - 52px))",
              opacity: 1,
            }}
            exit={{
              clipPath: "circle(0px at calc(100% - 52px) calc(100% - 52px))",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
              mass: 0.8,
            }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col bg-[#FDF9F6] dark:bg-[#0E0F12] text-[#1E1B19] dark:text-[#F5EFEB] overflow-y-auto"
          >
            {/* Topo do Aplicativo: Marca & Fechar */}
            <div className="shrink-0 pt-5 px-6 pb-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-[#141519]/70 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-orange-gradient p-1.5 shadow-md shadow-orange-500/20 flex items-center justify-center">
                  <Image
                    src="/icon-web.png"
                    alt="ICTHUS / Glessios"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                    Glessios App
                  </h1>
                  <span className="text-[10px] font-mono text-[#FF650F] font-bold">
                    Painel Operacional Integrado
                  </span>
                </div>
              </div>

              {/* Botão sutil de toque para fechar no topo */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Principal do Menu de Aplicativo do Google */}
            <div className="flex-1 px-5 py-6 space-y-6">
              {/* Google Account Profile Header Card */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#18191E] border border-black/[0.06] dark:border-white/[0.08] shadow-m3-1 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FF650F]/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 border-2 border-[#FF650F]/30 flex items-center justify-center text-[#FF650F] font-black text-base">
                        {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#18191E]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {profile?.name || "Administrador"}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#FF650F] bg-[#FF650F]/10 px-2 py-0.5 rounded-full border border-[#FF650F]/20">
                        {profile?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Sessão autenticada & ativa
                    </span>
                  </div>
                </div>
              </div>

              {/* Seções de Navegação Material Design 3 */}
              <div className="space-y-5">
                {navSections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="px-2 flex items-center gap-1.5">
                      {section.badgeIcon && (
                        <section.badgeIcon className={`w-3.5 h-3.5 ${section.badgeColor}`} />
                      )}
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {section.title}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-2 space-y-1 shadow-m3-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                              item.active
                                ? "bg-[#FF650F]/10 dark:bg-[#FF650F]/15 border border-[#FF650F]/25 text-[#FF650F]"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                  item.active
                                    ? "bg-[#FF650F] text-white shadow-md shadow-orange-500/25"
                                    : "bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className={`text-sm leading-tight ${item.active ? "font-bold text-[#FF650F]" : "font-semibold text-zinc-900 dark:text-white"}`}>
                                  {item.label}
                                </h2>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                item.active ? "text-[#FF650F] translate-x-0.5" : "text-zinc-400 dark:text-zinc-600"
                              }`}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de Configuração do App (Tema & Logout) */}
              <div className="space-y-3 pt-2">
                <span className="px-2 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Preferências & Sistema
                </span>

                <div className="bg-white dark:bg-[#18191E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-3 shadow-m3-1 space-y-2">
                  {/* Alternador de Tema M3 */}
                  {mounted && (
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#FF650F] flex items-center justify-center">
                          {theme === "dark" ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-[#FF650F]" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                            Tema da Interface
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {theme === "dark" ? "Modo Noturno (Ativo)" : "Modo Claro (Ativo)"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#FF650F] bg-[#FF650F]/10 px-3 py-1 rounded-full border border-[#FF650F]/20">
                        Alternar
                      </span>
                    </button>
                  )}

                  {/* Botão de Encerramento de Sessão */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">
                          Encerrar Sessão
                        </span>
                        <span className="text-[10px] text-red-500/80">
                          Sair do painel de administração
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Rodapé com Informações Técnicas e Espaço de Segurança para o FAB */}
              <div className="text-center pt-2 pb-28 space-y-1">
                <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Plataforma Glessios • Material Design 3 Expressive
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Banco de Dados & Fábrica Conectados
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
