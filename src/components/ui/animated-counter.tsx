"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

/**
 * AnimatedCounter — Animação numérica com easing cúbico cinematográfico.
 * Ativa quando o elemento entra na viewport do usuário.
 */
export function AnimatedCounter({
  from = 0,
  to,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(from);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const startTime = performance.now();

          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing cinematográfico out-cubic: 1 - (1 - progress)^3
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const value = from + (to - from) * easeOutProgress;

            setCurrentValue(value);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCurrentValue(to);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [from, to, duration]);

  const formattedValue =
    decimals > 0
      ? currentValue.toFixed(decimals)
      : Math.floor(currentValue).toLocaleString("pt-BR");

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
