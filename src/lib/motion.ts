import { Transition, Variants } from "framer-motion";

/**
 * ============================================================
 * MATERIAL DESIGN 3 EXPRESSIVE — MOTION SYSTEM
 * Especificação baseada em física de molas (Spring Physics)
 * Conforme M3_EXPRESSIVE_MIGRATION_MASTER.md (Seções 9 e 13.2)
 * ============================================================
 */

export const appMotion = {
  // Esquema Standard: para operações utilitárias frequentes e interfaces compactas
  standard: {
    fastSpatial: {
      type: "spring",
      stiffness: 520,
      damping: 36,
      mass: 1,
    } as Transition,
    defaultSpatial: {
      type: "spring",
      stiffness: 360,
      damping: 36,
      mass: 1,
    } as Transition,
    slowSpatial: {
      type: "spring",
      stiffness: 230,
      damping: 32,
      mass: 1,
    } as Transition,
  },

  // Esquema Expressive: para CTAs principais, aberturas de diálogos, hero e momentos de destaque
  expressive: {
    fastSpatial: {
      type: "spring",
      stiffness: 560,
      damping: 27,
      mass: 1,
    } as Transition,
    defaultSpatial: {
      type: "spring",
      stiffness: 350,
      damping: 27,
      mass: 1,
    } as Transition,
    slowSpatial: {
      type: "spring",
      stiffness: 190,
      damping: 25,
      mass: 1,
    } as Transition,
  },

  // Efeitos cromáticos, opacidade e filtros (Effects - não alteram bounds físicos)
  effects: {
    fast: {
      duration: 0.14,
      ease: [0.2, 0, 0, 1],
    } as Transition,
    default: {
      duration: 0.22,
      ease: [0.2, 0, 0, 1],
    } as Transition,
    slow: {
      duration: 0.34,
      ease: [0.2, 0, 0, 1],
    } as Transition,
  },

  // Fallback imediato para usuários com preferência de movimento reduzido (WCAG 2.2)
  reduced: {
    duration: 0.01,
  } as Transition,
};

/**
 * Variantes de Animação para Diálogos e Modais M3 Expressive
 */
export const m3DialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: appMotion.expressive.defaultSpatial,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: appMotion.standard.fastSpatial,
  },
};

/**
 * Variantes de Backdrop / Scrim com Desfoque Suave
 */
export const m3ScrimVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: appMotion.effects.default,
  },
  exit: {
    opacity: 0,
    transition: appMotion.effects.fast,
  },
};

/**
 * Variantes de Cards e Itens de Lista com Entrada Escalonada
 */
export const m3CardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...appMotion.expressive.defaultSpatial,
      delay: Math.min(i * 0.04, 0.24), // Máximo 240ms de delay para não atrasar a percepção
    },
  }),
};

/**
 * Variantes de Transição de Página M3 Expressive (Fade-Through com Leve Deslocamento e Mola)
 */
export const m3PageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.994,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...appMotion.expressive.fastSpatial,
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: appMotion.effects.fast,
  },
};

/**
 * Container Orquestrador para Entrada Escalonada (Stagger) de Elementos M3
 */
export const m3StaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

/**
 * Item Individual que surge em cascata dentro de um Stagger Container
 */
export const m3StaggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appMotion.expressive.defaultSpatial,
  },
};

/**
 * Variantes de Conteúdo de Abas (Tab Panels) com Transição Fluida M3
 */
export const m3TabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appMotion.expressive.fastSpatial,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: appMotion.effects.fast,
  },
};
