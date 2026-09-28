"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const BASE_BARS = [42, 68, 55, 82, 61, 74, 88, 57];
const scores = [
  { label: "AEO", value: 90 },
  { label: "GEO", value: 92 },
  { label: "SEO", value: 98 },
] as const;

const RED = { r: 239, g: 68, b: 68 }; // red-500
const ORANGE = { r: 249, g: 115, b: 22 }; // orange-500
const ACCENT = { r: 0, g: 124, b: 141 }; // theme accent #007c8d

/** Hard bands: red 0–49, orange 50–89, theme accent 90–100. */
function scoreColor(n: number): string {
  if (n < 50) return `rgb(${RED.r} ${RED.g} ${RED.b})`;
  if (n < 90) return `rgb(${ORANGE.r} ${ORANGE.g} ${ORANGE.b})`;
  return `rgb(${ACCENT.r} ${ACCENT.g} ${ACCENT.b})`;
}

function nextCpuHeights(current: number[]) {
  return current.map((h, i) => {
    // Each bar drifts independently, with a slight wave bias across the row.
    const wave = Math.sin(Date.now() / 700 + i * 0.85) * 8;
    const jitter = (Math.random() - 0.5) * 22;
    const next = h * 0.72 + (BASE_BARS[i] + wave + jitter) * 0.28;
    return Math.min(96, Math.max(18, Math.round(next)));
  });
}

export function HeroVisual({
  variant = "default",
  className,
}: {
  variant?: "default" | "onDark";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const t = useTranslations("hero");
  const [heights, setHeights] = useState(BASE_BARS);
  const [displayScores, setDisplayScores] = useState(() => scores.map(() => 0));
  const onDark = variant === "onDark";

  useEffect(() => {
    if (reduce) {
      setDisplayScores(scores.map((s) => s.value));
      return;
    }

    const durationMs = 2200;
    const started = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const tProgress = Math.min(1, (now - started) / durationMs);
      // Ease-out so the climb slows near the target.
      const eased = 1 - Math.pow(1 - tProgress, 3);
      setDisplayScores(scores.map((s) => Math.round(s.value * eased)));
      if (tProgress < 1) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduce]);

  const totalScore = useMemo(() => {
    if (!displayScores.length) return 0;
    return Math.round(
      displayScores.reduce((sum, n) => sum + n, 0) / displayScores.length,
    );
  }, [displayScores]);

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

  const panel = onDark
    ? "border-white/40 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md"
    : "border-border/70 bg-transparent";
  const inset = onDark
    ? "border-black/10 bg-white"
    : "border-border/70 bg-transparent";
  const title = onDark ? "text-zinc-900" : "text-foreground";
  const muted = onDark ? "text-zinc-500" : "text-muted-foreground";
  const value = onDark ? "text-zinc-900" : "text-foreground";

  return (
    <div className={cn("relative flex h-full w-full items-center justify-center", className)}>
      <motion.div
        className={cn(
          "w-full max-w-md rounded-[1.75rem] border",
          onDark ? "rounded-2xl p-3.5" : "p-5 md:p-6",
          panel,
        )}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className={cn("flex items-center justify-between gap-2", onDark ? "mb-2.5" : "mb-5")}>
          <div>
            <p
              className={cn(
                "font-display font-semibold tracking-tight",
                onDark ? "text-[0.95rem]" : "text-lg",
                title,
              )}
            >
              {t("aiReady")}
            </p>
            <p className={cn(onDark ? "text-xs" : "text-sm", muted)}>{t("liveSignals")}</p>
          </div>
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border text-center",
              onDark ? "min-w-13 px-2.5 py-1.5" : "px-3 py-2",
              inset,
            )}
          >
            <p
              className={cn(
                "font-display leading-none font-bold transition-colors duration-300",
                onDark ? "text-xl" : "text-2xl",
              )}
              style={{ color: scoreColor(totalScore) }}
            >
              {totalScore}
            </p>
            <p
              className={cn(
                "mt-1 font-semibold uppercase leading-none tracking-[0.14em]",
                onDark ? "text-[9px]" : "text-[10px]",
                muted,
              )}
            >
              {t("score")}
            </p>
          </div>
        </div>

        <div className={cn("grid grid-cols-3 gap-1.5", onDark ? "mb-2.5" : "mb-5")}>
          {scores.map((item, i) => {
            const n = displayScores[i] ?? 0;
            return (
              <div
                key={item.label}
                className={cn(
                  "rounded-xl border text-center",
                  onDark ? "px-1.5 py-2" : "px-2 py-3",
                  inset,
                )}
              >
                <p
                  className={cn(
                    "font-display font-bold transition-colors duration-300",
                    onDark ? "text-[0.95rem]" : "text-lg",
                  )}
                  style={{ color: scoreColor(n) }}
                >
                  {n}
                </p>
                <p className={cn("mt-0.5 text-[9px] font-semibold uppercase tracking-wider", muted)}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "flex items-end gap-1 rounded-2xl border",
            onDark ? "h-14 p-2" : "h-24 p-3",
            inset,
          )}
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

        <div
          className={cn(
            "flex items-center justify-between font-medium",
            onDark ? "mt-2 text-[10px]" : "mt-4 text-xs",
            muted,
          )}
        >
          <span className={cn("inline-flex items-center gap-2", value)}>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            {t("agentsActive")}
          </span>
          <span className={cn("inline-flex items-center gap-2", value)}>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
            {t("serversOnline")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
