import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "orange" | "graphite" | "outline" | "success" | "warning";
}

export function Badge({
  className,
  variant = "graphite",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase transition-colors";

  const variantStyles = {
    // Laranja vibrante
    orange:
      "bg-glessios-orange/15 text-glessios-orange border border-glessios-orange/30",
    
    // Graphite sutil
    graphite:
      "bg-glessios-graphite text-glessios-text-heading border border-glessios-border-dark",
    
    // Outline discreto
    outline:
      "bg-transparent text-glessios-text-body border border-glessios-border-dark",
    
    // Sucesso / Aprovado
    success:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    
    // Alerta / Em revisão
    warning:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
