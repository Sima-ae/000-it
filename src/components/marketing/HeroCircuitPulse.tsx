"use client";

import { useEffect, useId, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type PulseTheme = "a" | "b";

type PulseTrace = {
  id: string;
  d: string;
  theme: PulseTheme;
  delay: number;
  duration: number;
  dash: number;
};

const W = 1440;
const H = 640;
/** Spawn just behind Agent 000’s back (right side of hero). */
const AGENT_X = 1295;
const AGENT_Y = 355;

const THEMES = {
  triplezero: {
    a: { stroke: "#007c8d", glow: "#5eead4" },
    b: { stroke: "#5e3b88", glow: "#c4b0e0" },
  },
  extrahosting: {
    a: { stroke: "#1e9bff", glow: "#93c5fd" },
    b: { stroke: "#0a4f9c", glow: "#5eb0ff" },
  },
} as const;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Build an orthogonal path that starts near Agent 000’s back
 * (random spawn jitter) and flows outward through the hero.
 */
function generatePathFromAgent(): string {
  // Random spawn around behind Agent 000 — not one fixed point
  let x = Math.round(AGENT_X + rand(-55, 70));
  let y = Math.round(AGENT_Y + rand(-95, 110));
  x = clamp(x, 1080, W - 20);
  y = clamp(y, 80, H - 60);
  const parts = [`M${x} ${y}`];

  // First hop: prefer flowing out from behind his back into the hero
  const dirs = [
    { dx: -1, dy: 0 }, // left across the hero
    { dx: -1, dy: -1 }, // up-left
    { dx: -1, dy: 1 }, // down-left
    { dx: -1, dy: 0 },
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: 1, dy: 0 }, // short right-edge flicker
  ] as const;
  const primary = dirs[randInt(0, dirs.length - 1)]!;

  // Bias the first segment strongly in that direction
  if (primary.dx !== 0) {
    x = clamp(x + primary.dx * rand(140, 380), 0, W);
    parts.push(`H${Math.round(x)}`);
  } else {
    y = clamp(y + primary.dy * rand(80, 220), 12, H - 12);
    parts.push(`V${Math.round(y)}`);
  }

  const steps = randInt(5, 12);
  let horizontal = primary.dx === 0;

  for (let i = 0; i < steps; i++) {
    if (horizontal) {
      // Keep drifting outward; prefer continuing the primary x bias
      const bias = primary.dx !== 0 ? primary.dx : Math.random() > 0.55 ? -1 : 1;
      const delta = bias * rand(70, 320) + rand(-40, 40);
      x = clamp(x + delta, 0, W);
      parts.push(`H${Math.round(x)}`);
    } else {
      const bias = primary.dy !== 0 ? primary.dy : Math.random() > 0.5 ? -1 : 1;
      const delta = bias * rand(50, 180) + rand(-30, 30);
      y = clamp(y + delta, 12, H - 12);
      parts.push(`V${Math.round(y)}`);
    }
    horizontal = !horizontal;

    // Occasionally terminate at an edge for a clean exit
    if (i > 3 && Math.random() > 0.82) {
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? 0 : W;
        parts.push(`H${x}`);
      } else {
        y = Math.random() > 0.5 ? 12 : H - 12;
        parts.push(`V${y}`);
      }
      break;
    }
  }

  return parts.join(" ");
}

function generateTraces(generation: number): PulseTrace[] {
  return Array.from({ length: randInt(8, 14) }, (_, i) => {
    const theme: PulseTheme = Math.random() > 0.48 ? "a" : "b";
    const duration = rand(1.8, 3.6);
    return {
      id: `g${generation}-t${i}-${Math.random().toString(36).slice(2, 7)}`,
      d: generatePathFromAgent(),
      theme,
      // Negative delay = already mid-flight on spawn (never stands still)
      delay: -rand(0, duration),
      duration,
      dash: rand(2.5, 5),
    };
  });
}

const REGEN_MS = 9000;

/**
 * Glowing pulse packets that always flow OUT from Agent 000
 * through the hero in random directions. No static wire lines.
 */
export function HeroCircuitPulse({
  className,
  tone = "triplezero",
}: {
  className?: string;
  tone?: keyof typeof THEMES;
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [generation, setGeneration] = useState(0);
  const [traces, setTraces] = useState<PulseTrace[] | null>(null);
  const [visible, setVisible] = useState(true);
  const palette = THEMES[tone];

  useEffect(() => {
    setTraces(generateTraces(0));
  }, []);

  const hasTraces = traces !== null;

  useEffect(() => {
    if (reduce || !hasTraces) return;

    let fadeTimer: number | undefined;
    const timer = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setGeneration((g) => {
          const next = g + 1;
          setTraces(generateTraces(next));
          return next;
        });
        setVisible(true);
      }, 420);
    }, REGEN_MS);

    return () => {
      window.clearInterval(timer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [reduce, hasTraces]);

  if (!traces) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        "hero-circuit-layer",
        className,
      )}
      aria-hidden
    >
      <svg
        key={generation}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id={`hcp-pulse-glow-${uid}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {traces.map((trace) => {
          const colors = palette[trace.theme];
          const gap = 100 - trace.dash;
          const dashArray = `${trace.dash} ${gap}`;
          // Soft halo dash slightly longer than the core packet
          const glowDash = `${trace.dash * 1.2} ${100 - trace.dash * 1.2}`;

          return (
            <g key={trace.id}>
              {/* Soft glow packet (travels with the pulse) */}
              <path
                d={trace.d}
                className={cn(!reduce && "hero-circuit-pulse")}
                stroke={colors.glow}
                strokeWidth="1.5"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                pathLength={100}
                filter={`url(#hcp-pulse-glow-${uid})`}
                vectorEffect="non-scaling-stroke"
                style={
                  reduce
                    ? { opacity: 0 }
                    : {
                        strokeDasharray: glowDash,
                        animationDelay: `${trace.delay}s`,
                        animationDuration: `${trace.duration}s`,
                        opacity: 0.4,
                      }
                }
              />
              {/* Sharp core packet */}
              <path
                d={trace.d}
                className={cn(!reduce && "hero-circuit-pulse")}
                stroke={colors.stroke}
                strokeWidth="0.95"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                pathLength={100}
                vectorEffect="non-scaling-stroke"
                style={
                  reduce
                    ? { opacity: 0 }
                    : {
                        strokeDasharray: dashArray,
                        animationDelay: `${trace.delay}s`,
                        animationDuration: `${trace.duration}s`,
                      }
                }
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
