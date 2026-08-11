"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const BASE_BARS = [42, 68, 55, 82, 61, 74, 88, 57];
const scores = [
  { label: "AEO", value: 84 },
  { label: "GEO", value: 79 },
  { label: "SEO", value: 88 },
];
const totalScore = Math.round(
  scores.reduce((sum, item) => sum + item.value, 0) / scores.length,
);

function nextCpuHeights(current: number[]) {
  return current.map((h, i) => {
    // Each bar drifts independently, with a slight wave bias across the row.
    const wave = Math.sin(Date.now() / 700 + i * 0.85) * 8;
    const jitter = (Math.random() - 0.5) * 22;
    const next = h * 0.72 + (BASE_BARS[i] + wave + jitter) * 0.28;
    return Math.min(96, Math.max(18, Math.round(next)));
  });
}

export function HeroVisual() {
  const reduce = useReducedMotion();
  const locale = useLocale();
  const isNl = locale === "nl";
  const [heights, setHeights] = useState(BASE_BARS);

  useEffect(() => {
    if (reduce) {
      setHeights(BASE_BARS);
      return;
    }

    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setHeights((prev) => nextCpuHeights(prev));
      // Occasional sharper spike like a CPU burst
      if (frame % 7 === 0) {
        setHeights((prev) =>
          prev.map((h, i) =>
            i === frame % prev.length
              ? Math.min(96, h + 12 + Math.round(Math.random() * 10))
              : h,
          ),
        );
      }
    }, 650);

    return () => window.clearInterval(id);
  }, [reduce]);

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
              AI Ready?
            </p>
            <p className="text-sm text-muted-foreground">
              {isNl ? "Live growth signalen" : "Live growth signals"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-transparent px-3 py-2 text-right">
            <p className="font-display text-2xl font-bold text-accent">{totalScore}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Score
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
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

        <div
          className="flex h-24 items-end gap-1.5 rounded-2xl border border-border/70 bg-transparent p-3"
          aria-hidden
        >
          {heights.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 origin-bottom rounded-full bg-linear-to-t from-accent from-0% via-accent via-50% to-primary to-100%"
              initial={false}
              animate={{ height: `${h}%` }}
              transition={{
                duration: reduce ? 0 : 0.55,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            Agents active
          </span>
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
            Servers online
          </span>
        </div>
      </motion.div>
    </div>
  );
}
