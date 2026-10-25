"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Eye,
  PenLine,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

/**
 * Componente de Editor de Texto Rico estilo Trello com formatação Markdown e Pré-visualização instantânea
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Descreva instruções, regras ou escopo do trabalho...",
  minRows = 4,
  className = "",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inserção inteligente de sintaxe Markdown no ponto de seleção
  const insertSyntax = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  // Renderizador simplificado de Markdown para HTML seguro no preview
  const renderMarkdown = (text: string) => {
    if (!text || !text.trim()) {
      return (
        <span className="text-zinc-400 italic text-xs">
          Nenhuma descrição informada. Escreva algo na aba &quot;Escrever&quot;.
        </span>
      );
    }

    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed break-words">
        {lines.map((line, idx) => {
          // Cabeçalhos (### ou ## ou #)
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="font-bold text-sm text-zinc-900 dark:text-white pt-1">
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("## ") || line.startsWith("# ")) {
            return (
              <h3 key={idx} className="font-extrabold text-base text-zinc-900 dark:text-white pt-1.5 border-b border-black/[0.05] dark:border-white/[0.05] pb-1">
                {line.replace(/^#+\s/, "")}
              </h3>
            );
          }

          // Citações
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 my-1 border-l-2 border-[#FF650F] bg-orange-500/5 text-zinc-700 dark:text-zinc-300 rounded-r-lg italic"
              >
                {line.replace("> ", "")}
              </blockquote>
            );
          }

          // Lista com Marcadores
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF650F] mt-1.5 shrink-0" />
                <span>{parseInlineFormatting(line.substring(2))}</span>
              </div>
            );
          }

          // Lista Numerada
          const numMatch = line.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-mono font-bold text-xs text-[#FF650F] shrink-0">
                  {numMatch[1]}.
                </span>
                <span>{parseInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Linha divisória
          if (line.trim() === "---" || line.trim() === "***") {
            return <hr key={idx} className="my-2 border-black/[0.06] dark:border-white/[0.06]" />;
          }

          // Linha vazia (espaçamento)
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Parágrafo normal
          return <p key={idx}>{parseInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  // Formatação em linha: negrito (**), itálico (*), código (`), links ([nome](url))
  const parseInlineFormatting = (str: string) => {
    // Substitui links [texto](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="text-[#FF650F] hover:underline font-semibold"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.map((part, i) => {
      if (typeof part !== "string") return part;

      // Código inline `código`
      const codeRegex = /`([^`]+)`/g;
      const codeParts = part.split(codeRegex);

      return codeParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return (
            <code
              key={j}
              className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-white/[0.1] font-mono text-[11px] text-[#FF650F]"
            >
              {subPart}
            </code>
          );
        }

        // Negrito **texto**
        const boldRegex = /\*\*([^*]+)\*\*/g;
        const boldParts = subPart.split(boldRegex);

        return boldParts.map((bPart, k) => {
          if (k % 2 === 1) {
            return <strong key={k} className="font-bold text-zinc-900 dark:text-white">{bPart}</strong>;
          }

          // Itálico *texto*
          const italicRegex = /\*([^*]+)\*/g;
          const italicParts = bPart.split(italicRegex);

          return italicParts.map((iPart, l) => {
            if (l % 2 === 1) {
              return <em key={l} className="italic text-zinc-800 dark:text-zinc-200">{iPart}</em>;
            }
            return iPart;
          });
        });
      });
    });
  };

  return (
    <div className={`rounded-2xl bg-white dark:bg-[#18191E] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden shadow-xs flex flex-col ${className}`}>
      {/* Barra de Ferramentas Superior */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151B] flex-wrap gap-1.5">
        {/* Botões de Formatação */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Negrito (**texto**)"
            onClick={() => insertSyntax("**", "**", "texto em negrito")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Itálico (*texto*)"
            onClick={() => insertSyntax("*", "*", "texto em itálico")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Título (### Título)"
            onClick={() => insertSyntax("### ", "", "Título")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

          <button
            type="button"
            title="Lista com marcadores"
            onClick={() => insertSyntax("- ", "", "Item da lista")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Lista numerada"
            onClick={() => insertSyntax("1. ", "", "Item numerado")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Citação (> citação)"
            onClick={() => insertSyntax("> ", "", "Citação ou regra")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Inserir Link [título](url)"
            onClick={() => insertSyntax("[", "](https://exemplo.com)", "Título do Link")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Código ou medidas (`120x80cm`)"
            onClick={() => insertSyntax("`", "`", "120x80cm")}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FF650F] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Abas Escrever / Visualizar */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-white/[0.06] p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "write"
                ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <PenLine className="w-3 h-3 text-[#FF650F]" />
            <span>Escrever</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "preview"
                ? "bg-white dark:bg-[#18191E] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3 h-3 text-[#FF650F]" />
            <span>Visualizar</span>
          </button>
        </div>
      </div>

      {/* Conteúdo: Escrever (Textarea) ou Visualizar (Markdown Renderizado) */}
      <div className="p-3">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none resize-y no-scrollbar"
          />
        ) : (
          <div className="min-h-[96px] p-1">
            {renderMarkdown(value)}
          </div>
        )}
      </div>
    </div>
  );
}
