"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { appMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface SegmentedButtonProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  layoutId?: string;
}

export function SegmentedButton<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  layoutId = "segmented-indicator",
}: SegmentedButtonProps<T>) {
  const sizeClasses = {
    sm: "h-9 p-1 text-xs gap-1",
    md: "h-11 p-1 text-sm gap-1.5",
  };

  const itemSizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
  };

  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm select-none",
        sizeClasses[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center font-semibold rounded-full transition-colors z-10",
              itemSizeClasses[size],
              isSelected
                ? "text-zinc-950 dark:text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={appMotion.expressive.fastSpatial}
                className="absolute inset-0 rounded-full bg-white dark:bg-[#1E1F24] shadow-m3-1 -z-10"
              />
            )}
            <span className="flex items-center gap-2">
              {option.icon && (
                <span className={cn(isSelected ? "text-[#FF650F]" : "text-zinc-500")}>
                  {option.icon}
                </span>
              )}
              {option.label}
              {typeof option.count === "number" && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isSelected
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200"
                      : "bg-black/[0.05] text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-400"
                  )}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
