"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Escultura Tridimensional 3D — Peça de Acrílico Cortada a Laser com Halo LED Traseiro
 * Baseada no arquivo oficial "icone 3d.png".
 * Sem sombras escuras. Volume 3D em camadas translúcidas e iluminação LED indireta (Backlight).
 */
export function HeroSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Rastreamento suave do ponteiro do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTargetRotation({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTargetRotation({ x: 0, y: 0 });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (el) {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Loop de física e interpolação contínua (60fps) com oscilação orgânica
  useEffect(() => {
    const loop = () => {
      timeRef.current += 0.02;
      const idleOscillationX = Math.sin(timeRef.current * 0.7) * 0.22;
      const idleOscillationY = Math.cos(timeRef.current * 0.5) * 0.18;

      setCurrentRotation((prev) => {
        const targetX = targetRotation.x * 0.9 + idleOscillationX;
        const targetY = targetRotation.y * 0.9 + idleOscillationY;
        const lerpFactor = isHovered ? 0.08 : 0.035;
        return {
          x: prev.x + (targetX - prev.x) * lerpFactor,
          y: prev.y + (targetY - prev.y) * lerpFactor,
        };
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetRotation, isHovered]);

  const rotY = currentRotation.x * 24; // Rotação horizontal em graus
  const rotX = -currentRotation.y * 18; // Rotação vertical em graus
  const floatY = Math.sin(timeRef.current * 0.75) * 8; // Flutuação suave
  const specularX = 50 + currentRotation.x * 35;
  const specularY = 50 + currentRotation.y * 35;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[580px] h-[380px] sm:h-[460px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: "1300px" }}
    >
      {/* Halo de Luz LED Indireta Traseira de Fundo (Backlight Atmosférico Laranja Quente) */}
      <div
        className="absolute w-[340px] sm:w-[460px] h-[220px] sm:h-[300px] rounded-full bg-gradient-to-tr from-glessios-orange/35 via-glessios-orange-light/25 to-transparent blur-[90px] pointer-events-none transition-transform duration-700 -z-10"
        style={{
          transform: `translate(${currentRotation.x * 40}px, ${currentRotation.y * 40}px) scale(${isHovered ? 1.2 : 1})`,
        }}
      />

      {/* Palco 3D Giratório e Interativo da Peça de Acrílico */}
      <div
        className="relative w-[320px] sm:w-[420px] h-[180px] sm:h-[235px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${floatY}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        {/* =======================================================================
            CAMADA 1: Módulo de Luz LED Traseira Direta (Halo Lit Backlight)
            Projeta iluminação intensa por trás de todos os recortes do acrílico
            ======================================================================= */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: "translateZ(-28px)",
            filter: "drop-shadow(0 0 35px rgba(255, 101, 15, 0.95)) drop-shadow(0 0 70px rgba(255, 120, 27, 0.6)) brightness(1.7)",
            opacity: 0.9,
          }}
        >
          <Image
            src="/icone-3d.png"
            alt="Halo LED Traseiro"
            width={420}
            height={230}
            priority
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Segundo emissor LED difuso traseiro com leve pulso */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse-slow"
          style={{
            transform: "translateZ(-20px)",
            filter: "drop-shadow(0 0 20px rgba(255, 200, 100, 0.8)) blur(6px)",
            opacity: 0.85,
          }}
        >
          <Image
            src="/icone-3d.png"
            alt="LED Quente Traseiro"
            width={420}
            height={230}
            priority
            className="w-full h-auto object-contain"
          />
        </div>

        {/* =======================================================================
            CAMADAS 2 A 7: Volume 3D da Placa de Acrílico Cortada a Laser
            Múltiplas camadas de extrusão positiva que geram a espessura física de 20mm
            com translucidez e refração de luz nas bordas de corte
            ======================================================================= */}
        {[-14, -9, -4, 2, 8, 14].map((depthZ, idx) => {
          // Gradiente de luminosidade que simula a passagem da luz LED pelas camadas do acrílico
          const brightnessFactor = 1.05 + idx * 0.04;
          const opacityVal = 0.85 + idx * 0.025;
          return (
            <div
              key={depthZ}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translateZ(${depthZ}px)`,
                filter: `brightness(${brightnessFactor}) contrast(1.15) drop-shadow(0 0 8px rgba(255, 101, 15, 0.35))`,
                opacity: opacityVal,
              }}
            >
              <Image
                src="/icone-3d.png"
                alt="Volume Acrílico 3D"
                width={420}
                height={230}
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          );
        })}

        {/* =======================================================================
            CAMADA 8: Face Frontal Principal da Peça de Acrílico (Laser Cut Crystal)
            Alta nitidez, brilho vibrante e contorno cristalino chanfrado
            ======================================================================= */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "translateZ(20px)",
            filter: "drop-shadow(0 0 15px rgba(255, 120, 27, 0.5))",
          }}
        >
          <Image
            src="/icone-3d.png"
            alt="Glessios Peça Acrílico 3D"
            width={420}
            height={230}
            priority
            className="w-full h-auto object-contain transition-all duration-300"
          />
        </div>

        {/* =======================================================================
            CAMADA 9: Reflexo Especular Vitrificado Frontal (Sheen Polido de Acrílico)
            A luz reflete na face lisa superior conforme o usuário move o mouse
            ======================================================================= */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay"
          style={{
            transform: "translateZ(28px)",
            opacity: isHovered ? 0.9 : 0.5,
            transition: "opacity 0.3s ease",
          }}
        >
          <div
            className="w-full h-full rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${specularX}% ${specularY}%, rgba(255,255,255,0.95) 0%, rgba(255,220,180,0.5) 25%, transparent 60%)`,
              maskImage: "url(/icone-3d.png)",
              WebkitMaskImage: "url(/icone-3d.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
        </div>

        {/* Linha de reflexo diamantado nas arestas usinadas */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45 mix-blend-screen"
          style={{
            transform: "translateZ(34px)",
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(${timeRef.current * 35}deg, transparent 42%, rgba(255,255,255,0.85) 50%, transparent 58%)`,
              maskImage: "url(/icone-3d.png)",
              WebkitMaskImage: "url(/icone-3d.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
        </div>

        {/* Pontos de luz LED indireta nas extremidades */}
        <div
          className="absolute -top-2 right-12 w-2 h-2 rounded-full bg-glessios-orange animate-ping pointer-events-none"
          style={{ transform: "translateZ(38px)" }}
        />
        <div
          className="absolute bottom-1 left-16 w-1.5 h-1.5 rounded-full bg-white animate-pulse pointer-events-none"
          style={{ transform: "translateZ(28px)" }}
        />
      </div>
    </div>
  );
}
