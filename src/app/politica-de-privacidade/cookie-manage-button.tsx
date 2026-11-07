"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { openCookiePreferences } from "@/lib/cookie-consent";

interface CookieManageButtonProps {
  label?: string;
  className?: string;
}

export function CookieManageButton({
  label = "Preferências de Cookies",
  className = "",
}: CookieManageButtonProps) {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer ${className}`}
    >
      <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF650F]" />
      <span>{label}</span>
    </button>
  );
}
