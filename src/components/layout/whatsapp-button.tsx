"use client";

import React, { useState } from "react";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
}

export function WhatsAppButton({
  phone = "5551981192976",
  message = "Olá! Gostaria de um orçamento para comunicação visual e fachadas.",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip flutuante ao passar o mouse com suporte a Dark e Light Mode */}
      <span
        className={`pointer-events-none hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border backdrop-blur-md transition-all duration-300 ${
          isHovered
            ? "opacity-100 translate-x-0 bg-white/95 dark:bg-[#141519]/95 text-zinc-900 dark:text-white border-emerald-500/40 shadow-emerald-500/10"
            : "opacity-0 translate-x-3 bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border-black/[0.08] dark:border-white/[0.08]"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Fale conosco no WhatsApp
      </span>

      {/* Botão Flutuante Oficial WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir conversa no WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 bg-gradient-to-tr from-[#1EBE5D] via-[#25D366] to-[#2EE876] shadow-[0_6px_24px_rgba(37,211,102,0.48)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.72)] focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        {/* Halo de pulso suave verde */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] -z-10 animate-ping opacity-30 pointer-events-none"
        />

        {/* Ícone Oficial WhatsApp Vetorial: Balão Sólido Branco + Fone Verde Esculpido */}
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          className="transition-transform duration-300 group-hover:rotate-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
          aria-hidden="true"
        >
          {/* Balão de mensagem oficial branco preenchido */}
          <path
            fill="#FFFFFF"
            d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.925-7.062A9.925 9.925 0 0 0 12.012 2z"
          />
          {/* Fone telefônico recortado verde oficial WhatsApp */}
          <path
            fill="#25D366"
            d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.277-.1-.478-.15-.678.15-.2.302-.779.98-.954 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.134.301-.35.451-.525.151-.176.2-.301.3-.502.101-.2.051-.377-.025-.527-.076-.151-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.08 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.547.719.31 1.28.496 1.718.636.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.43-.075-.126-.276-.201-.577-.352z"
          />
        </svg>
      </a>
    </aside>
  );
}
