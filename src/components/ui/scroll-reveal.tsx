"use client";

import React from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { appMotion } from "@/lib/motion";

interface M3ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fadeUp" | "fadeDown" | "fadeIn" | "scaleUp";
  delay?: number;
  duration?: number;
  amount?: number | "some" | "all";
  margin?: string;
}

const revealVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 32,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },
  fadeDown: {
    hidden: {
      opacity: 0,
      y: -32,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },
  fadeIn: {
    hidden: {
      opacity: 0,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  },
  scaleUp: {
    hidden: {
      opacity: 0,
      scale: 0.92,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  },
};

/**
 * M3ScrollReveal: Executa animações de entrada E saída conforme o elemento
 * entra ou sai da área visível (viewport) durante a rolagem da página,
 * com física de mola (spring) do Material Design 3 Expressive.
 */
export function M3ScrollReveal({
  children,
  className = "",
  variant = "fadeUp",
  delay = 0,
  amount = 0.15,
  margin = "-50px 0px -50px 0px",
}: M3ScrollRevealProps) {
  const chosenVariant = revealVariants[variant] || revealVariants.fadeUp;

  return (
    <motion.div
      variants={chosenVariant}
      initial="hidden"
      whileInView="visible"
      exit="hidden"
      viewport={{ once: false, amount, margin }}
      transition={{
        ...appMotion.expressive.defaultSpatial,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface M3ScrollStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  amount?: number | "some" | "all";
  margin?: string;
}

const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (staggerDelay = 0.06) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.02,
    },
  }),
};

/**
 * M3ScrollStagger: Contêiner para grids e listas de cards.
 * Aciona a animação em cascata (stagger) dos itens filhos quando a seção
 * entra no viewport e os recolhe quando a seção sai do viewport.
 */
export function M3ScrollStagger({
  children,
  className = "",
  staggerDelay = 0.06,
  amount = 0.15,
  margin = "-50px 0px -50px 0px",
}: M3ScrollStaggerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      custom={staggerDelay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount, margin }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface M3ScrollItemProps {
  children: React.ReactNode;
  className?: string;
  customTransition?: Transition;
}

const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appMotion.expressive.defaultSpatial,
  },
};

/**
 * M3ScrollItem: Item individual dentro de um M3ScrollStagger.
 */
export function M3ScrollItem({
  children,
  className = "",
  customTransition,
}: M3ScrollItemProps) {
  const itemVariants: Variants = customTransition
    ? {
        ...staggerItemVariants,
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: customTransition,
        },
      }
    : staggerItemVariants;

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
