import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária para merge e concatenação condicional de classes CSS Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatação de moeda no padrão brasileiro (BRL)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(numericValue)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

/**
 * Formatação de data no padrão brasileiro com proteção contra datas inválidas (Fuso de Brasília)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(d);
  } catch {
    return "-";
  }
}

/**
 * Formatação de data com hora no padrão brasileiro ("dd/mm/aaaa às HH:mm" - Fuso de Brasília)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    const datePart = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(d);
    return `${datePart} às ${timePart}`;
  } catch {
    return "-";
  }
}

/**
 * Indica se o <Image> do Next.js deve ignorar a otimização automática (ex: uploads locais dinâmicos ou URLs externas fora de Pexels/Unsplash).
 */
export function shouldBypassImageOptimization(src?: string | null): boolean {
  if (!src) return true;
  const trimmed = src.trim();
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/api/") || trimmed.startsWith("data:")) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    return !["images.pexels.com", "images.unsplash.com"].includes(url.hostname);
  } catch {
    return trimmed.startsWith("/");
  }
}

/**
 * Garante URL absoluta para metadados SEO (OpenGraph / JSON-LD) quando a imagem for um upload local.
 */
export function resolvePublicBlogImageUrl(src?: string | null): string {
  const baseUrl = "https://icthusbrasil.com";
  if (!src || !src.trim()) return `${baseUrl}/logo.jpg`;
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
