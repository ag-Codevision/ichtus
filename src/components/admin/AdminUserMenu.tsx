"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileText,
  Building,
  Check,
  UserCog,
} from "lucide-react";
import { EditProfileModal, UserProfileData } from "@/components/profile/EditProfileModal";

export function AdminUserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dados do usuário autenticado no Admin
  const [profile, setProfile] = useState<UserProfileData>({
    id: "admin",
    name: "Administrador Geral",
    role: "ADMIN",
    avatarUrl: null,
  });

  // Carrega dados da sessão ativa do banco / API
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/v1/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setProfile(data.user);
          }
        }
      } catch (err) {
        console.warn("Aviso ao carregar perfil do admin:", err);
      }
    }
    loadProfile();
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    document.cookie = "glessios_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/glessios/login");
  };


  const getInitials = (n: string) => {
    const parts = (n || "Admin").trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || "A").toUpperCase();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Botão de Disparo com Avatar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu do Administrador"
          className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1A1B20] hover:border-glessios-orange/40 hover:shadow-sm transition-all duration-200 group focus:outline-none"
        >
          <div className="flex flex-col text-right hidden sm:flex max-w-[150px]">
            <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-glessios-orange transition-colors truncate">
              {profile.name}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono -mt-0.5 truncate">
              Operações & Fábrica
            </span>
          </div>

          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-glessios-orange/50 bg-orange-gradient flex items-center justify-center font-black text-white text-xs shadow-sm">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(profile.name)}</span>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1B20]" />
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-glessios-orange" : "group-hover:text-zinc-900 dark:group-hover:text-white"
            }`}
          />
        </button>

        {/* Submenu Dropdown Flutuante M3 */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-[#1A1B20] border border-black/[0.08] dark:border-white/[0.08] shadow-m3-3 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-white">
            {/* Cabeçalho do Perfil (Conforme LGPD: sem expor e-mail) */}
            <div className="p-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl mb-1.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-glessios-orange bg-glessios-orange/15 px-2 py-0.5 rounded-full border border-glessios-orange/30">
                  ROLE: ADMIN
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">
                {profile.name}
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-mono">
                Sessão Ativa • Operações & Gestão
              </p>
            </div>

            <div className="space-y-0.5 pt-1">
              {/* Opção de Editar Meu Perfil */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEditProfileOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <UserCog className="w-4 h-4 text-glessios-orange" />
                  <span>Editar Meu Perfil</span>
                </div>
                <span className="text-[10px] text-glessios-orange font-medium bg-glessios-orange/10 px-2 py-0.5 rounded-full border border-glessios-orange/20">
                  Nome & Foto
                </span>
              </button>

              {/* Voltar ao Site */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <span>Voltar ao Site</span>
                </div>
                <span className="text-[10px] text-zinc-400">Início</span>
              </Link>

              {/* Proposta Comercial Piloto */}
              <Link
                href="/admin/propostas/cm8a7b6c5000108l4f1h20987"
                target="_blank"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Proposta A4 Modelo</span>
                </div>
                <span className="text-[10px] text-zinc-400">PDF</span>
              </Link>
            </div>

            {/* Divisor */}
            <div className="my-2 border-t border-black/[0.06] dark:border-white/[0.06]" />

            {/* Botão de Sair / Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Encerrar Sessão / Sair</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edição de Perfil do Administrador */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialData={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </>
  );
}
