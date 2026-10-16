"use client";

import React, { useRef, useState, useCallback } from "react";

interface HeroParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HeroParallaxContainer — Resposta de profundidade e proximidade do cursor (React Bits Proximity).
 * Adiciona um movimento tridimensional sutil e orgânico às camadas visuais da Hero.
 */
export function HeroParallaxContainer({
  children,
  className = "",
}: HeroParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Fator normalizado de -1 a 1
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    // Deslocamento máximo suave de 12px
    setOffsets({
      x: normX * 12,
      y: normY * 10,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffsets({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={
        {
          "--parallax-x": `${offsets.x}px`,
          "--parallax-y": `${offsets.y}px`,
          "--parallax-x-inv": `${-offsets.x * 0.7}px`,
          "--parallax-y-inv": `${-offsets.y * 0.7}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
