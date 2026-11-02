"use client";

import React, { useState } from "react";
import { MessageCircle, Linkedin, Copy, Check, Share2 } from "lucide-react";

interface ArticleShareButtonsProps {
  title: string;
  slug: string;
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function ArticleShareButtons({ title, slug }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${slug}`;
    }
    return `https://icthusbrasil.com/blog/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Confira este artigo técnico da ICTHUS: "${title}"\n${getFullUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(getFullUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(getFullUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-5 rounded-2xl bg-glessios-graphite/80 backdrop-blur-sm border border-glessios-border-dark space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-glessios-orange">
        <Share2 className="w-3.5 h-3.5" />
        Compartilhar Artigo
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={shareWhatsApp}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-semibold border border-[#25D366]/30 transition-all active:scale-95"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>WhatsApp</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={shareFacebook}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#428df5] text-xs font-semibold border border-[#1877F2]/30 transition-all active:scale-95"
          title="Compartilhar no Facebook"
        >
          <FacebookIcon className="w-4 h-4 fill-current" />
          <span>Facebook</span>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={shareLinkedIn}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0077B5]/15 hover:bg-[#0077B5]/25 text-[#70b5f9] text-xs font-semibold border border-[#0077B5]/30 transition-all active:scale-95"
          title="Compartilhar no LinkedIn"
        >
          <Linkedin className="w-4 h-4 fill-current" />
          <span>LinkedIn</span>
        </button>

        {/* Copiar Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
            copied
              ? "bg-green-500/20 text-green-400 border-green-500/40"
              : "bg-glessios-black/60 hover:bg-white/[0.08] text-glessios-text-body hover:text-white border-glessios-border-dark"
          }`}
          title="Copiar link do artigo"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span>Link Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
