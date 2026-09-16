"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type Agent000State = "idle" | "thinking" | "speaking";

type Props = {
  state?: Agent000State;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Animated Agent 000 — white tech humanoid with cyan accents.
 * Pure SVG + CSS on a transparent canvas (no raster photo / JPG).
 */
export function Agent000Avatar({
  state = "idle",
  className,
  size = "lg",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const plate = `a000plate-${uid}`;
  const dark = `a000dark-${uid}`;
  const eye = `a000eye-${uid}`;
  const glow = `a000glow-${uid}`;

  const dim =
    size === "sm" ? "h-10 w-10" : size === "md" ? "h-24 w-24" : "h-40 w-40 md:h-52 md:w-52";

  return (
    <div
      className={cn("agent000 relative shrink-0 select-none", `is-${state}`, dim, className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 240"
        className="h-full w-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={plate} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="55%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={dark} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id={eye} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
          <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse className="a000-shadow" cx="100" cy="228" rx="48" ry="6" fill="#0ea5e9" />

        <path
          d="M62 118 C62 108 78 100 100 100 C122 100 138 108 138 118 L148 168 C148 186 128 198 100 198 C72 198 52 186 52 168 Z"
          fill={`url(#${plate})`}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
        <path
          d="M78 128 L122 128 L118 158 C116 168 108 174 100 174 C92 174 84 168 82 158 Z"
          fill={`url(#${dark})`}
          opacity="0.9"
        />
        <circle className="a000-led" cx="88" cy="142" r="2.2" fill="#22d3ee" />
        <circle className="a000-led" cx="100" cy="146" r="2.2" fill="#22d3ee" />
        <circle className="a000-led" cx="112" cy="142" r="2.2" fill="#22d3ee" />

        <path
          d="M52 122 C40 128 34 148 38 168 L52 162 Z"
          fill={`url(#${plate})`}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <path
          d="M148 122 C160 128 166 148 162 168 L148 162 Z"
          fill={`url(#${plate})`}
          stroke="#94a3b8"
          strokeWidth="1"
        />

        <g className="a000-hand">
          <path
            d="M150 150 C162 138 168 118 158 104 C154 98 148 102 150 110 C152 122 146 136 138 144 Z"
            fill={`url(#${plate})`}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <circle className="a000-led" cx="156" cy="108" r="1.6" fill="#22d3ee" />
        </g>

        <rect x="90" y="86" width="20" height="16" rx="4" fill={`url(#${dark})`} />

        <g className="a000-head">
          <ellipse
            cx="100"
            cy="58"
            rx="42"
            ry="48"
            fill={`url(#${plate})`}
            stroke="#94a3b8"
            strokeWidth="1.4"
          />
          <path
            d="M70 52 Q100 46 130 52"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.8"
            opacity="0.55"
          />
          <circle
            className="a000-ear"
            cx="58"
            cy="58"
            r="10"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            filter={`url(#${glow})`}
          />
          <circle
            className="a000-ear"
            cx="142"
            cy="58"
            r="10"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            filter={`url(#${glow})`}
          />
          <ellipse
            className="a000-eye"
            cx="84"
            cy="56"
            rx="9"
            ry="11"
            fill={`url(#${eye})`}
            filter={`url(#${glow})`}
          />
          <ellipse
            className="a000-eye"
            cx="116"
            cy="56"
            rx="9"
            ry="11"
            fill={`url(#${eye})`}
            filter={`url(#${glow})`}
          />
          <circle cx="84" cy="56" r="3" fill="#ecfeff" opacity="0.95" />
          <circle cx="116" cy="56" r="3" fill="#ecfeff" opacity="0.95" />
          <ellipse
            className="a000-mouth"
            cx="100"
            cy="80"
            rx="10"
            ry="3"
            fill="#64748b"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}
