"use client";

import React, { useState } from "react";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
}

export function WhatsAppButton({
  phone = "5541999999999",
  message = "Olá! Gostaria de um orçamento para comunicação visual e fachadas.",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip flutuante ao passar o mouse */}
      <span
        className={`pointer-events-none hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border backdrop-blur-md transition-all duration-300 ${
          isHovered
            ? "opacity-100 translate-x-0 bg-[#0B0C0D]/90 text-white border-emerald-500/40"
            : "opacity-0 translate-x-3 bg-glessios-graphite/90 text-glessios-text-body border-glessios-border-dark"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isHovered ? "bg-emerald-400 animate-ping" : "bg-glessios-orange"}`} />
        Fale conosco no WhatsApp
      </span>

      {/* Botão Flutuante: Laranja por padrão -> Verde no hover */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir conversa no WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 bg-orange-gradient shadow-[0_4px_20px_rgba(255,101,15,0.45)] hover:!bg-none hover:!bg-[#25D366] hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)] focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        {/* Halo de pulso sutil */}
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 animate-ping opacity-30 ${
            isHovered ? "bg-[#25D366]" : "bg-glessios-orange"
          }`}
        />

        {/* Ícone Oficial Vetorial do WhatsApp */}
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="transition-transform duration-300 group-hover:rotate-6 drop-shadow-sm"
          aria-hidden="true"
        >
          <path d="M17.507 14.307l-.009.075c-.239.987-.852 1.936-1.722 2.222-.503.193-1.041.241-1.57.172-2.128-.276-4.14-1.464-5.698-3.023-1.56-1.558-2.748-3.57-3.024-5.698-.07-.529-.022-1.067.171-1.57.286-.87 1.235-1.483 2.222-1.722.342-.083.708-.052 1.03.088.471.205.86.59 1.134 1.05.626 1.052 1.253 2.103 1.88 3.155.158.265.176.589.048.868-.128.28-.387.48-.682.528l-1.033.167c-.085.014-.16.06-.21.127-.05.067-.068.152-.05.234.347 1.626 1.487 2.766 3.113 3.113.082.018.167 0 .234-.05.067-.05.113-.125.127-.21l.167-1.033c.048-.295.248-.554.528-.682.279-.128.603-.11.868.048 1.052.627 2.103 1.254 3.155 1.88.46.274.845.663 1.05 1.134.14.322.171.688.088 1.03z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.908-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.166 8.166 0 01-4.227-1.177l-.303-.18-2.923.805.814-2.863-.196-.317A8.17 8.17 0 013.8 12c0-4.529 3.671-8.2 8.2-8.2 4.529 0 8.2 3.671 8.2 8.2 0 4.529-3.671 8.2-8.2 8.2z"
          />
        </svg>
      </a>
    </aside>
  );
}
