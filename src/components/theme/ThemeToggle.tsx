"use client";

import * as React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder enquanto monta para evitar mismatch de hidratação
    return (
      <button
        aria-label="Alternar tema"
        className={`w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        <Moon className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
      title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 group ${
        isDark
          ? "bg-glessios-graphite hover:bg-glessios-graphite-hover border-white/10 text-glessios-text-body hover:text-white hover:border-glessios-orange/40"
          : "bg-white hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-glessios-orange/50 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-glessios-orange group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? "Modo Claro" : "Modo Escuro"}
        </span>
      )}
    </button>
  );
}
