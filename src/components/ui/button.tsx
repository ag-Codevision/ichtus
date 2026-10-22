"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "ivory"
    | "dark-secondary"
    | "outline-dark"
    | "filled"
    | "tonal"
    | "outlined"
    | "text"
    | "elevated";
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
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[#FF650F] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.985] select-none";

    const sizeStyles = {
      sm: "h-9 px-4 text-xs font-semibold rounded-full gap-1.5",
      md: "h-11 px-5 text-sm font-semibold rounded-full gap-2",
      lg: "h-14 px-7 text-base font-bold rounded-full gap-2.5",
      icon: "h-11 w-11 p-0 rounded-full",
    };

    const variantStyles = {
      // M3 Expressive Filled (Primary Action)
      primary:
        "bg-[#FF650F] hover:bg-[#EA580C] text-white shadow-m3-1 hover:shadow-m3-2 active:bg-[#C2410C]",
      filled:
        "bg-[#FF650F] hover:bg-[#EA580C] text-white shadow-m3-1 hover:shadow-m3-2 active:bg-[#C2410C]",

      // M3 Expressive Tonal (Secondary Container)
      tonal:
        "bg-orange-100/70 hover:bg-orange-100 text-orange-950 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 dark:text-orange-200",
      secondary:
        "bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white border border-black/[0.06] dark:border-white/[0.08]",
      "dark-secondary":
        "bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/15 hover:border-white/30 backdrop-blur-sm",

      // M3 Expressive Outlined
      outlined:
        "bg-transparent text-zinc-800 dark:text-zinc-200 hover:text-[#FF650F] dark:hover:text-[#FF781B] border border-black/15 dark:border-white/15 hover:border-[#FF650F] dark:hover:border-[#FF781B] hover:bg-orange-500/[0.06]",
      outline:
        "bg-transparent text-zinc-700 dark:text-zinc-200 hover:text-[#FF650F] dark:hover:text-[#FF781B] border border-zinc-300 dark:border-white/20 hover:border-[#FF650F] dark:hover:border-[#FF781B] hover:bg-orange-50/40 dark:hover:bg-white/[0.06]",
      "outline-dark":
        "bg-transparent text-zinc-200 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.06]",

      // M3 Expressive Text (Ghost)
      text:
        "bg-transparent text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08]",
      ghost:
        "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08]",

      // M3 Expressive Elevated
      elevated:
        "bg-white dark:bg-[#1C1D22] text-zinc-900 dark:text-white shadow-m3-1 hover:shadow-m3-2 border border-black/[0.04] dark:border-white/[0.06]",
      ivory:
        "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm",
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
