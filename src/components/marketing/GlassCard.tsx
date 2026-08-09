"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "rounded-2xl border border-border/70 bg-card/70 p-6 shadow-xl backdrop-blur-xl",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
