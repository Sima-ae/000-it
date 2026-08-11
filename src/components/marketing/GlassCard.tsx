"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  interactive = true,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  /** Purple/green hover glow overlay. Defaults to the same as `interactive`. */
  glow?: boolean;
}) {
  const reduce = useReducedMotion();
  const showGlow = glow ?? interactive;

  return (
    <motion.div
      whileHover={
        interactive && !reduce ? { y: -4, scale: 1.01 } : undefined
      }
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 transition-[border-color,background,box-shadow] duration-300",
        "glass",
        interactive && "hover:border-primary/25",
        showGlow && "glow-hover",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
