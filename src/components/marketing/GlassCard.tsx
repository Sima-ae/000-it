"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  interactive = true,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={
        interactive && !reduce ? { y: -4, scale: 1.01 } : undefined
      }
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "glass rounded-3xl p-6 transition-[border-color,background] duration-300",
        interactive && "hover:border-primary/25",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
