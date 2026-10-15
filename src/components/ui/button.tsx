"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ivory";
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
      // Laranja vibrante com gradiente de alta energia e glow controlado
      primary:
        "bg-orange-gradient text-white shadow-orange-glow hover:shadow-orange-glow-lg hover:brightness-105 border border-glessios-border-orange",
      
      // Graphite escuro editorial
      secondary:
        "bg-glessios-graphite text-glessios-text-heading hover:bg-glessios-graphite-hover border border-glessios-border-dark hover:border-glessios-border-dark-hover",
      
      // Outline refinado com transição de borda para laranja
      outline:
        "bg-transparent text-glessios-text-heading border border-glessios-border-dark hover:border-glessios-orange hover:text-white hover:bg-glessios-orange/10",
      
      // Ghost sem fundo
      ghost:
        "bg-transparent text-glessios-text-body hover:text-glessios-text-heading hover:bg-white/[0.05]",
      
      // Variante clara para seções Ivory
      ivory:
        "bg-glessios-black text-white hover:bg-glessios-charcoal shadow-sm",
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
