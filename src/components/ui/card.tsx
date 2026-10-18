import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
  hoverEffect?: boolean;
  bordered?: boolean;
}

export function Card({
  className,
  variant = "filled",
  hoverEffect = false,
  bordered = true,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    // M3 Expressive Filled (Container padrão de superfície tonal)
    filled:
      "bg-[#F6F1EC] dark:bg-[#141519] text-zinc-900 dark:text-zinc-100 border border-black/[0.05] dark:border-white/[0.06]",
    
    // M3 Expressive Elevated (Com sombra suave M3-1)
    elevated:
      "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-zinc-100 shadow-m3-1 hover:shadow-m3-2 border border-black/[0.04] dark:border-white/[0.06]",

    // M3 Expressive Outlined (Delimitação sutil)
    outlined:
      "bg-transparent text-zinc-900 dark:text-zinc-100 border border-black/10 dark:border-white/10",
  };

  return (
    <div
      className={cn(
        "rounded-3xl p-6 transition-all duration-200",
        variantStyles[variant],
        hoverEffect &&
          "hover:border-[#FF650F]/40 dark:hover:border-[#FF781B]/40 hover:scale-[1.008] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-2", className)} {...props}>{children}</div>;
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-zinc-100 dark:border-white/10", className)}
      {...props}
    >
      {children}
    </div>
  );
}
