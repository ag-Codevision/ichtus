import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "orange" | "orange-light" | "orange-dark" | "graphite" | "outline" | "success" | "warning";
}

export function Badge({
  className,
  variant = "graphite",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors";

  const variantStyles = {
    // Laranja refinado padrão
    orange:
      "bg-orange-500/10 text-[#FF650F] border border-orange-500/25",
    
    // Laranja específico para seções claras
    "orange-light":
      "bg-orange-50 text-[#C2410C] border border-orange-200/90 font-bold",

    // Laranja específico para seções escuras
    "orange-dark":
      "bg-orange-500/15 text-[#FF650F] border border-orange-500/30",
    
    // Neutro sutil
    graphite:
      "bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    
    // Outline discreto
    outline:
      "bg-transparent text-slate-600 border border-slate-300 dark:text-slate-400 dark:border-slate-700",
    
    // Sucesso / Aprovado
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    
    // Alerta / Em revisão
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
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
