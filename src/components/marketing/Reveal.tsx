"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type RevealFrom = "up" | "down" | "left" | "right" | "fade" | "scale";

const OFFSETS: Record<RevealFrom, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  down: { y: -20 },
  left: { x: -36 },
  right: { x: 36 },
  fade: {},
  scale: { scale: 0.94, y: 16 },
};

function useRtlDocument() {
  const [rtl, setRtl] = useState(false);
  useEffect(() => {
    const sync = () =>
      setRtl(document.documentElement.getAttribute("dir") === "rtl");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => obs.disconnect();
  }, []);
  return rtl;
}

export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  duration = 0.55,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: RevealFrom;
  duration?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const rtl = useRtlDocument();

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  const offset = OFFSETS[from];
  const x =
    offset.x != null && rtl ? -offset.x : (offset.x ?? 0);

  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        x,
        y: offset.y ?? 0,
        scale: offset.scale ?? 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: "0px 0px -8% 0px", amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
