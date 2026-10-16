"use client";

import React, { useState, useEffect } from "react";

const ROTATING_WORDS = [
  "Comunicação",
  "Design",
  "Decoração",
  "Papelaria",
  "Sinalização",
  "Web",
];

/**
 * HeroRotatingWord — Inspirado no Rotating Text do React Bits com Mask Reveal.
 * Transição vertical cinematográfica suave com desfoque de movimento e iluminação âmbar.
 */
export function HeroRotatingWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [stage, setStage] = useState<"entering" | "idle" | "exiting">("entering");

  useEffect(() => {
    // 1. Entrada concluída após 600ms -> estado idle
    const enterTimer = setTimeout(() => {
      setStage("idle");
    }, 600);

    // 2. Transição de saída aos 2800ms
    const exitTimer = setTimeout(() => {
      setStage("exiting");
    }, 2800);

    // 3. Troca de palavra aos 3300ms
    const nextTimer = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      setStage("entering");
    }, 3300);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [wordIndex]);

  const currentWord = ROTATING_WORDS[wordIndex];

  return (
    <>
      <style>{`
        @keyframes rotatingWordIn {
          0% {
            transform: translateY(100%);
            opacity: 0;
            filter: blur(8px);
          }
          100% {
            transform: translateY(0%);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes rotatingWordOut {
          0% {
            transform: translateY(0%);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
            filter: blur(8px);
          }
        }

        .rotating-word-in {
          animation: rotatingWordIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .rotating-word-out {
          animation: rotatingWordOut 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .rotating-word-idle {
          transform: translateY(0%);
          opacity: 1;
          filter: blur(0px);
        }
      `}</style>

      <span className="inline-block overflow-hidden align-baseline h-[1.2em] min-w-[150px] sm:min-w-[240px] md:min-w-[340px] relative select-none">
        <span
          key={wordIndex}
          className={`inline-block font-extrabold text-[#FF650F] ${
            stage === "entering"
              ? "rotating-word-in"
              : stage === "exiting"
              ? "rotating-word-out"
              : "rotating-word-idle"
          }`}
          style={{
            willChange: "transform, opacity, filter",
            textShadow: "0 0 25px rgba(255, 101, 15, 0.45)",
          }}
        >
          {currentWord}
        </span>
      </span>
    </>
  );
}
