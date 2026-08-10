"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  // Prefer CSS-friendly instant paint — avoid opacity:0 traps on tall sections
  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px", amount: 0.01 }}
      transition={{ duration: 0.22, delay: Math.min(delay, 0.08), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
