"use client";

import { motion, useReducedMotion } from "framer-motion";

const bars = [42, 68, 55, 82, 61, 74, 88, 57];
const scores = [
  { label: "SEO", value: 88 },
  { label: "AEO", value: 84 },
  { label: "GEO", value: 79 },
  { label: "AI", value: 91 },
];

export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="w-full max-w-md rounded-[1.75rem] border border-border/70 bg-transparent p-5 md:p-6"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              AI Readiness
            </p>
            <p className="text-sm text-muted-foreground">Live growth signal</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-transparent px-3 py-2 text-right">
            <p className="font-display text-2xl font-bold text-accent">92</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Score
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-2">
          {scores.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/70 bg-transparent px-2 py-3 text-center"
            >
              <p className="font-display text-lg font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex h-24 items-end gap-1.5 rounded-2xl border border-border/70 bg-transparent p-3">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full bg-linear-to-t from-primary via-brand-sand to-accent"
              initial={{ height: reduce ? `${h}%` : "18%" }}
              animate={{ height: `${h}%` }}
              transition={{
                duration: 1.1,
                delay: 0.25 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Agents syncing
          </span>
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Servers online
          </span>
        </div>
      </motion.div>
    </div>
  );
}
