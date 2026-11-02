"use client";

import React, { useState, useEffect } from "react";
import { useCMS } from "@/components/cms/cms-provider";
import { Edit2, Plus, Trash2, X, Check } from "lucide-react";

const DEFAULT_ROTATING_WORDS = [
  "Comunicação",
  "Design",
  "Decoração",
  "Papelaria",
  "Sinalização",
  "Web",
];

interface HeroRotatingWordProps {
  words?: string[];
}

/**
 * HeroRotatingWord — Transição vertical cinematográfica suave com desfoque de movimento e iluminação âmbar.
 * No modo de edição do CMS, permite adicionar, editar e excluir as palavras que alternam!
 */
export function HeroRotatingWord({ words }: HeroRotatingWordProps) {
  const { isEditMode, isPreviewMode, updateSection } = useCMS();
  const effectiveWords = words && words.length > 0 ? words : DEFAULT_ROTATING_WORDS;

  const [wordIndex, setWordIndex] = useState(0);
  const [stage, setStage] = useState<"entering" | "idle" | "exiting">("entering");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWords, setEditingWords] = useState<string[]>(effectiveWords);
  const [newWordInput, setNewWordInput] = useState("");

  useEffect(() => {
    setEditingWords(effectiveWords);
  }, [words]);

  useEffect(() => {
    if (editModalOpen) return; // pausa animação enquanto estiver editando

    const enterTimer = setTimeout(() => {
      setStage("idle");
    }, 600);

    const exitTimer = setTimeout(() => {
      setStage("exiting");
    }, 2800);

    const nextTimer = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % effectiveWords.length);
      setStage("entering");
    }, 3300);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [wordIndex, effectiveWords.length, editModalOpen]);

  const safeIndex = wordIndex % effectiveWords.length;
  const currentWord = effectiveWords[safeIndex] || effectiveWords[0] || "Soluções";

  const handleSaveWords = () => {
    const cleaned = editingWords.map((w) => w.trim()).filter(Boolean);
    if (cleaned.length === 0) return;

    updateSection("hero", (prev) => ({
      ...prev,
      rotatingWords: cleaned,
    }));
    setEditModalOpen(false);
  };

  const handleAddWord = () => {
    const trimmed = newWordInput.trim();
    if (trimmed && !editingWords.includes(trimmed)) {
      setEditingWords([...editingWords, trimmed]);
      setNewWordInput("");
    }
  };

  const handleRemoveWord = (index: number) => {
    if (editingWords.length <= 1) return;
    setEditingWords(editingWords.filter((_, i) => i !== index));
  };

  return (
    <>
      <style>{`
        @keyframes rotatingWordIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 75%, 0) scale(0.96);
            filter: blur(8px);
          }
          60% {
            opacity: 0.95;
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes rotatingWordOut {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px);
          }
          40% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
            transform: translate3d(0, -75%, 0) scale(0.96);
            filter: blur(8px);
          }
        }

        .animate-word-in {
          animation: rotatingWordIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, filter;
        }

        .animate-word-out {
          animation: rotatingWordOut 0.45s cubic-bezier(0.7, 0, 0.84, 0) forwards;
          will-change: transform, opacity, filter;
        }

        .animate-word-idle {
          transform: translate3d(0, 0, 0);
          opacity: 1;
          filter: blur(0px);
        }
      `}</style>

      <span
        onClick={() => {
          if (isEditMode && !isPreviewMode) {
            setEditModalOpen(true);
          }
        }}
        className={`inline-block relative overflow-hidden align-baseline group/rotword ${
          isEditMode && !isPreviewMode
            ? "cursor-pointer ring-1 ring-dashed ring-[#FF650F]/70 rounded px-1.5"
            : ""
        }`}
        title={isEditMode && !isPreviewMode ? "Clique para editar as palavras que alternam" : undefined}
      >
        <span
          key={`${safeIndex}-${stage}`}
          className={`inline-block text-[#FF650F] font-extrabold tracking-tight pb-0.5 leading-none transition-colors ${
            stage === "entering"
              ? "animate-word-in"
              : stage === "exiting"
              ? "animate-word-out"
              : "animate-word-idle"
          }`}
          style={{
            textShadow: "0 0 28px rgba(255, 101, 15, 0.45)",
          }}
        >
          {currentWord}
        </span>

        {isEditMode && !isPreviewMode && (
          <span className="absolute -top-3 -right-2 bg-[#FF650F] text-white p-0.5 rounded-full shadow text-[10px] hidden group-hover/rotword:flex items-center justify-center">
            <Edit2 className="w-2.5 h-2.5" />
          </span>
        )}
      </span>

      {/* Modal para Editar a Lista de Palavras Rotativas */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#16171B] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <Edit2 className="w-4 h-4 text-[#FF650F]" />
                Editar Palavras que Alternam
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Adicione ou remova as palavras que ficam alternando na Hero após &quot;para&quot;.
            </p>

            {/* Input para adicionar nova palavra */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
                placeholder="Ex: Sua Marca, Seu Negócio..."
                className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs focus:border-[#FF650F] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddWord}
                className="px-3 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>

            {/* Lista atual de palavras */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {editingWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold"
                >
                  <span className="text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF650F]" />
                    {word}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(idx)}
                    disabled={editingWords.length <= 1}
                    className="text-zinc-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors p-1"
                    title="Remover palavra"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveWords}
                className="px-4 py-2 rounded-xl bg-[#FF650F] hover:bg-orange-600 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                Salvar Palavras
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
