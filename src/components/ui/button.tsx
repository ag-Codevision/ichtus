"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ivory" | "dark-secondary" | "outline-dark";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glessios-orange disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-9 px-4 text-xs tracking-wide",
      md: "h-11 px-6 text-sm tracking-wide",
      lg: "h-14 px-8 text-base font-semibold tracking-tight",
      icon: "h-11 w-11 p-0",
    };

    const variantStyles = {
      // Laranja vibrante com alta legibilidade e acabamento limpo
      primary:
        "bg-[#FF650F] hover:bg-[#EA580C] text-white shadow-sm hover:shadow-md transition-all font-semibold active:scale-[0.99] btn-shine-effect",
      
      // Superfície neutra suave (para seções claras)
      secondary:
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80 transition-all font-medium",
      
      // Superfície grafite para seções escuras
      "dark-secondary":
        "bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/15 hover:border-white/30 backdrop-blur-sm transition-all font-medium",

      // Outline refinado claro
      outline:
        "bg-transparent text-zinc-700 hover:text-[#FF650F] border border-zinc-300 hover:border-[#FF650F] hover:bg-orange-50/40 transition-all font-medium",
      
      // Outline refinado para seções escuras
      "outline-dark":
        "bg-transparent text-zinc-200 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.06] transition-all font-medium",

      // Ghost sem fundo
      ghost:
        "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all",
      
      // Variante corporativa sóbria
      ivory:
        "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Carregando...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
