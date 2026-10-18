"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  m3PageVariants,
  m3StaggerContainer,
  m3StaggerItem,
  m3TabContentVariants,
} from "@/lib/motion";

interface M3PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * M3PageTransition: Envolve a visualização da página, emitindo uma onda
 * radial de ripple tonal do Material 3 Expressive na entrada e animando
 * todos os filhos com fade-through e física de molas.
 */
export function M3PageTransition({ children, className = "" }: M3PageTransitionProps) {
  const [showRipple, setShowRipple] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowRipple(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full flex-1 flex flex-col overflow-hidden">
      {/* Onda de Ripple Tonal na abertura da página */}
      {showRipple && (
        <span
          className="m3-page-ripple-overlay"
          aria-hidden="true"
        />
      )}

      {/* Conteúdo da Página com física de mola M3 */}
      <motion.div
        variants={m3PageVariants}
        initial="hidden"
        animate="visible"
        className={`flex-1 flex flex-col ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface M3StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
}

/**
 * M3StaggerContainer: Orquestra a entrada escalonada dos cards e KPIs.
 */
export function M3StaggerContainer({
  children,
  className = "",
  delayChildren,
}: M3StaggerContainerProps) {
  const customVariants = delayChildren
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren,
          },
        },
      }
    : m3StaggerContainer;

  return (
    <motion.div
      variants={customVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface M3StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * M3StaggerItem: Item filho que surge em cascata suave com física de mola.
 */
export function M3StaggerItem({ children, className = "" }: M3StaggerItemProps) {
  return (
    <motion.div variants={m3StaggerItem} className={className}>
      {children}
    </motion.div>
  );
}

interface M3TabPanelProps {
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * M3TabPanel: Anima a entrada dos cards e elementos sempre que uma aba é alternada.
 */
export function M3TabPanel({ activeKey, children, className = "" }: M3TabPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        variants={m3TabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
