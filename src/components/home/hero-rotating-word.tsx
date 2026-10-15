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

export function HeroRotatingWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const currentWord = ROTATING_WORDS[wordIndex];
    // Duração total da saída de todas as letras com seus delays
    const exitDuration = currentWord.length * 30 + 400;

    // Tempo em que a palavra permanece totalmente visível
    const displayTimer = setTimeout(() => {
      setIsExiting(true);

      // Após a conclusão da rotação 3D de saída, avança para a próxima palavra
      const nextTimer = setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsExiting(false);
      }, exitDuration);

      return () => clearTimeout(nextTimer);
    }, 2800);

    return () => clearTimeout(displayTimer);
  }, [wordIndex]);

  const currentWord = ROTATING_WORDS[wordIndex];

  return (
    <>
      <style>{`
        @keyframes letterFlipIn3D {
          0% {
            transform: rotateX(-90deg) translateY(20px) translateZ(-25px);
            opacity: 0;
            filter: blur(3px);
          }
          70% {
            transform: rotateX(12deg) translateY(-2px) translateZ(4px);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: rotateX(0deg) translateY(0) translateZ(0);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes letterFlipOut3D {
          0% {
            transform: rotateX(0deg) translateY(0) translateZ(0);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: rotateX(90deg) translateY(-20px) translateZ(-25px);
            opacity: 0;
            filter: blur(3px);
          }
        }

        .letter-flip-in {
          animation: letterFlipIn3D 0.55s cubic-bezier(0.25, 1, 0.5, 1) both;
        }

        .letter-flip-out {
          animation: letterFlipOut3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>

      <span
        className="inline-flex items-center align-middle"
        style={{ perspective: "1000px" }}
        aria-label={currentWord}
      >
        <span
          key={wordIndex}
          className="inline-flex items-center min-w-[200px] sm:min-w-[280px] md:min-w-[360px] py-1 select-none"
          style={{ transformStyle: "preserve-3d" }}
        >
          {currentWord.split("").map((char, index) => {
            const delay = isExiting ? index * 30 : index * 45;

            return (
              <span
                key={`${wordIndex}-${index}`}
                className={`inline-block text-transparent bg-clip-text bg-orange-gradient font-extrabold ${
                  isExiting ? "letter-flip-out" : "letter-flip-in"
                }`}
                style={{
                  animationDelay: `${delay}ms`,
                  transformOrigin: "50% 50% -12px",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  willChange: "transform, opacity",
                  textShadow: "0 0 35px rgba(255, 107, 0, 0.35)",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </span>
      </span>
    </>
  );
}
