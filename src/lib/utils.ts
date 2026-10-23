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
 * Formatação de data no padrão brasileiro com proteção contra datas inválidas
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
    }).format(d);
  } catch {
    return "-";
  }
}

/**
 * Formatação de data com hora no padrão brasileiro com proteção contra datas inválidas
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}
