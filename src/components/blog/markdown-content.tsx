import React from "react";
import Link from "next/link";
import { Lightbulb, Info, CheckCircle2 } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Valida se a URL de imagem é segura para exibição no artigo
 */
function isSafeImageSrc(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/")
  );
}

/**
 * Converte formatações inline como ![alt](url), **negrito**, *itálico* e [texto](url) em nós React
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Regex combinada para tokens inline: imagens ![alt](url), links [texto](url), **negrito**, *itálico*
  const pattern = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Imagem inline: ![alt](url)
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const imgAlt = imgMatch[1].trim();
      const imgUrl = imgMatch[2].trim();
      if (!isSafeImageSrc(imgUrl)) return <span key={index}>{part}</span>;
      return (
        <img
          key={index}
          src={imgUrl}
          alt={imgAlt || "Imagem do artigo"}
          loading="lazy"
          className="my-4 rounded-2xl border border-glessios-border-dark max-w-full h-auto shadow-lg"
        />
      );
    }

    // Link: [texto](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const isInternal = linkUrl.startsWith("/") || linkUrl.includes("icthusbrasil.com") || linkUrl.includes("glessios.com.br");

      if (isInternal) {
        return (
          <Link
            key={index}
            href={linkUrl}
            className="text-glessios-orange hover:text-glessios-orange-hover underline underline-offset-4 decoration-glessios-orange/40 hover:decoration-glessios-orange font-medium transition-colors"
          >
            {linkText}
          </Link>
        );
      }

      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-glessios-orange hover:text-glessios-orange-hover underline underline-offset-4 decoration-glessios-orange/40 hover:decoration-glessios-orange font-medium transition-colors"
        >
          {linkText}
        </a>
      );
    }

    // Negrito: **texto**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Itálico: *texto*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-glessios-text-heading/90">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Texto puro
    return <span key={index}>{part}</span>;
  });
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  // Quebra por blocos de parágrafos
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="space-y-6 text-glessios-text-body text-base sm:text-lg leading-relaxed selection:bg-glessios-orange/30 selection:text-white">
      {blocks.map((rawBlock, blockIdx) => {
        const block = rawBlock.trim();
        if (!block) return null;

        // Título H2
        if (block.startsWith("## ")) {
          const titleText = block.replace(/^##\s+/, "").trim();
          const headingId = slugifyHeading(titleText);

          return (
            <div key={blockIdx} id={headingId} className="pt-8 pb-3 scroll-mt-28">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-start sm:items-center gap-3 group">
                <span className="w-2.5 h-7 rounded-full bg-glessios-orange shrink-0 mt-1 sm:mt-0 shadow-sm shadow-glessios-orange/50" />
                <span className="flex-grow">{titleText}</span>
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-glessios-border-dark via-glessios-border-dark to-transparent mt-3" />
            </div>
          );
        }

        // Título H3
        if (block.startsWith("### ")) {
          const titleText = block.replace(/^###\s+/, "").trim();
          return (
            <h3 key={blockIdx} className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-5 pb-1">
              {titleText}
            </h3>
          );
        }

        // Citação ou Callout de Destaque
        if (block.startsWith("> ")) {
          const quoteLines = block
            .split("\n")
            .map((line) => line.replace(/^>\s?/, "").trim())
            .join(" ");

          const isTip = quoteLines.toLowerCase().includes("dica") || quoteLines.includes("💡");
          const isWarning = quoteLines.toLowerCase().includes("importante") || quoteLines.includes("atenção");

          return (
            <div
              key={blockIdx}
              className={`my-6 p-5 sm:p-6 rounded-2xl border backdrop-blur-sm ${
                isTip
                  ? "bg-glessios-orange/10 border-glessios-orange/40 text-glessios-text-heading"
                  : isWarning
                  ? "bg-amber-500/10 border-amber-500/40 text-glessios-text-heading"
                  : "bg-glessios-graphite/80 border-glessios-border-dark border-l-4 border-l-glessios-orange text-white"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {isTip ? (
                  <Lightbulb className="w-5 h-5 text-glessios-orange shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-2xl font-serif text-glessios-orange select-none leading-none">“</span>
                )}
                <div className="text-base sm:text-lg leading-relaxed font-medium">
                  {parseInlineFormatting(quoteLines)}
                </div>
              </div>
            </div>
          );
        }

        // Listas com marcadores (- ou *)
        if (block.startsWith("- ") || block.startsWith("* ")) {
          const items = block
            .split("\n")
            .map((item) => item.replace(/^[-*]\s+/, "").trim())
            .filter(Boolean);

          return (
            <ul key={blockIdx} className="space-y-3 pl-1 sm:pl-2 my-5">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-glessios-orange shrink-0 mt-2.5 shadow-sm shadow-glessios-orange/50" />
                  <div className="leading-relaxed text-glessios-text-body">{parseInlineFormatting(item)}</div>
                </li>
              ))}
            </ul>
          );
        }

        // Listas numeradas (1. , 2. )
        if (/^\d+\.\s/.test(block)) {
          const items = block
            .split("\n")
            .map((item) => item.replace(/^\d+\.\s+/, "").trim())
            .filter(Boolean);

          return (
            <ol key={blockIdx} className="space-y-3 pl-1 sm:pl-2 my-5">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-lg bg-glessios-charcoal border border-glessios-border-dark text-glessios-orange text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {itemIdx + 1}
                  </span>
                  <div className="leading-relaxed text-glessios-text-body">{parseInlineFormatting(item)}</div>
                </li>
              ))}
            </ol>
          );
        }

        // Bloco de imagem Markdown isolada: ![alt](url)
        const blockImgMatch = block.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
        if (blockImgMatch && isSafeImageSrc(blockImgMatch[2])) {
          const altText = blockImgMatch[1].trim();
          const imgSrc = blockImgMatch[2].trim();
          const titleCaption = blockImgMatch[3]?.trim() || altText;

          return (
            <figure
              key={blockIdx}
              className="my-8 rounded-2xl overflow-hidden bg-glessios-charcoal border border-glessios-border-dark shadow-xl"
            >
              <img
                src={imgSrc}
                alt={altText || "Imagem ilustrativa do artigo"}
                loading="lazy"
                className="w-full h-auto max-h-[560px] object-cover"
              />
              {titleCaption && (
                <figcaption className="px-4 py-2.5 text-xs text-glessios-text-body/80 border-t border-glessios-border-dark bg-black/30">
                  {titleCaption}
                </figcaption>
              )}
            </figure>
          );
        }

        // Parágrafo regular
        return (
          <p key={blockIdx} className="text-base sm:text-lg text-glessios-text-body leading-relaxed">
            {parseInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
}
