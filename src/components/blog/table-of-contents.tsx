"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ListTree, ChevronRight } from "lucide-react";
import { slugifyHeading } from "./markdown-content";

interface TableOfContentsProps {
  content: string;
}

interface HeadingItem {
  id: string;
  title: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo<HeadingItem[]>(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const list: HeadingItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        const title = trimmed.replace(/^##\s+/, "").trim();
        list.push({
          id: slugifyHeading(title),
          title,
        });
      }
    });

    return list;
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0% -60% 0%",
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const element = document.getElementById(h.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="p-5 sm:p-6 rounded-2xl bg-glessios-graphite/80 backdrop-blur-md border border-glessios-border-dark space-y-3.5 sticky top-28">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-glessios-orange pb-2 border-b border-glessios-border-dark">
        <ListTree className="w-4 h-4" />
        Índice de Tópicos
      </div>

      <ul className="space-y-1.5 text-xs sm:text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-200 flex items-start gap-1.5 ${
                  isActive
                    ? "bg-glessios-orange/15 text-glessios-orange font-bold translate-x-1"
                    : "text-glessios-text-body hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform ${
                    isActive ? "text-glessios-orange rotate-90" : "text-glessios-text-body/50"
                  }`}
                />
                <span className="line-clamp-2">{heading.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
