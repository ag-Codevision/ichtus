"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
  isDark?: boolean;
}

/**
 * SpotlightCard — Inspirado no conceito Spotlight do React Bits.
 * Projeta um halo de luz dinâmico que segue a posição do cursor sobre o card,
 * destacando bordas e texturas industriais com extrema sofisticação e suavidade.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor,
  spotlightSize = 350,
  isDark = false,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const defaultColor = isDark
    ? "rgba(255, 101, 15, 0.12)"
    : "rgba(255, 101, 15, 0.08)";

  const color = spotlightColor || defaultColor;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Camada do Spotlight seguindo o cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
        }}
      />
      
      {/* Borda reflexiva iluminada pelo spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-20"
        style={{
          opacity,
          maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          WebkitMaskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          background: `radial-gradient(${spotlightSize * 0.75}px circle at ${position.x}px ${position.y}px, ${
            isDark ? "rgba(255, 120, 27, 0.45)" : "rgba(255, 101, 15, 0.35)"
          }, transparent 70%)`,
        }}
      />

      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
}
