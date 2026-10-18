"use client";

import React from "react";
import { Plus } from "lucide-react";

interface GoogleFabProps {
  onClick: () => void;
  label?: string;
}

export function GoogleFab({ onClick, label = "Novo" }: GoogleFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[88px] right-6 z-40 lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#FF650F] to-[#FF7E36] text-white shadow-[0_8px_20px_rgba(255,101,15,0.4)] hover:shadow-xl active:scale-95 transition-all duration-200 select-none group focus:outline-none border border-white/20"
      aria-label={label}
    >
      <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90 shrink-0" />
      <span className="text-xs font-bold tracking-tight pr-0.5">
        {label}
      </span>
    </button>
  );
}
