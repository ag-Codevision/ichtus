"use client";

import { useState } from "react";
import Image from "next/image";

interface PortfolioHeroBackgroundProps {
  src: string;
  alt: string;
}

// Micro placeholder SVG em Base64 ultraleve (~150 bytes) com gradiente arquitetônico escuro
// Renderiza em 0ms no primeiro paint do navegador, eliminando qualquer sensação de tela preta ou atraso
const ARCHITECTURAL_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDUiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjUiIGZpbGw9IiMxMjE0MTciLz48Y2lyY2xlIGN4PSI0IiBjeT0iMSIgcj0iMyIgZmlsbD0iI2ZmNjUwZiIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==";

export function PortfolioHeroBackground({ src, alt }: PortfolioHeroBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0D0E12]">
      {/* 1. Backdrop dinâmico imediato (visível em 0ms antes de qualquer download) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#16181E] via-[#0E1013] to-[#08090B]" />

      {/* 2. Brilho atmosférico sutil no topo simulando iluminação arquitetônica */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FF650F]/20 via-[#FF650F]/5 to-transparent blur-3xl pointer-events-none" />

      {/* 3. Imagem Estática Local Pré-otimizada com carregamento instantâneo */}
      <Image
        src={src}
        alt={alt}
        fill
        priority
        unoptimized
        decoding="async"
        placeholder="blur"
        blurDataURL={ARCHITECTURAL_BLUR_PLACEHOLDER}
        onLoad={() => setIsLoaded(true)}
        className={`object-cover object-center transition-all duration-1000 ease-out will-change-transform ${
          isLoaded
            ? "opacity-60 scale-100 filter-none"
            : "opacity-0 scale-105 blur-sm"
        }`}
        sizes="100vw"
      />

      {/* 4. Gradientes cinematográficos de profundidade e fusão com o restante da página */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F11] via-[#0E0F11]/60 to-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
    </div>
  );
}
