/**
 * Utilitário de Cálculo de Prazos e Status Visual de Cores
 * 
 * Regra do Sistema:
 * - Azul: Prazo confortável (> 7 dias restantes)
 * - Verde: Prazo em andamento normal (4 a 7 dias restantes)
 * - Amarelo: Prazo próximo / atenção (1 a 3 dias restantes)
 * - Vermelho: Prazo crítico (vence hoje ou atrasado, <= 0 dias)
 */

export interface DueDateStatus {
  daysDiff: number;
  label: string;
  badgeClass: string;
  dotColor: string;
  isOverdue: boolean;
  isDueToday: boolean;
}

export function getDueDateStatus(dueDateInput: string | Date | null | undefined): DueDateStatus | null {
  if (!dueDateInput) return null;

  const due = new Date(dueDateInput);
  if (isNaN(due.getTime())) return null;

  // Comparação normalizada em dias (zerando as horas de hoje e da data de vencimento)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(due);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      daysDiff,
      label: overdueDays === 1 ? "Atrasado há 1 dia" : `Atrasado há ${overdueDays} dias`,
      badgeClass:
        "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-bold",
      dotColor: "#EF4444",
      isOverdue: true,
      isDueToday: false,
    };
  }

  if (daysDiff === 0) {
    return {
      daysDiff: 0,
      label: "Vence hoje!",
      badgeClass:
        "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-bold animate-pulse",
      dotColor: "#EF4444",
      isOverdue: false,
      isDueToday: true,
    };
  }

  if (daysDiff === 1) {
    return {
      daysDiff: 1,
      label: "Falta 1 dia (Amanhã)",
      badgeClass:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold",
      dotColor: "#F59E0B",
      isOverdue: false,
      isDueToday: false,
    };
  }

  if (daysDiff <= 3) {
    return {
      daysDiff,
      label: `Faltam ${daysDiff} dias`,
      badgeClass:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold",
      dotColor: "#F59E0B",
      isOverdue: false,
      isDueToday: false,
    };
  }

  if (daysDiff <= 7) {
    return {
      daysDiff,
      label: `Faltam ${daysDiff} dias`,
      badgeClass:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold",
      dotColor: "#10B981",
      isOverdue: false,
      isDueToday: false,
    };
  }

  // Acima de 7 dias: Azul
  return {
    daysDiff,
    label: `Faltam ${daysDiff} dias`,
    badgeClass:
      "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold",
    dotColor: "#3B82F6",
    isOverdue: false,
    isDueToday: false,
  };
}
