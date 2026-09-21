"use client";
/* Checkpoint: approved Agent 000 pose and proportions. Not used by the app. */

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
  const body = `a000body-${uid}`;
  const dark = `a000dark-${uid}`;
  const cap = `a000cap-${uid}`;
  const brim = `a000brim-${uid}`;
  const eye = `a000eye-${uid}`;
  const glow = `a000glow-${uid}`;
  const armL = `a000armL-${uid}`;
  const armR = `a000armR-${uid}`;
  const hand = `a000hand-${uid}`;
  const armMask = `a000armMask-${uid}`;

  const dim =
    size === "sm" ? "h-10 w-10" : size === "md" ? "h-24 w-24" : "h-40 w-40 md:h-52 md:w-52";

  return (
    <div
      className={cn("agent000 relative shrink-0 select-none", `is-${state}`, dim, className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 292"
        className="h-full w-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={plate} x1="0%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e8eef5" />
            <stop offset="100%" stopColor="#b8c4d4" />
          </linearGradient>
          <linearGradient id={body} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={cap} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={brim} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="45%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={dark} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d4f63" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={armL} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={armR} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={hand} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
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
          <mask id={armMask} maskUnits="userSpaceOnUse">
            <rect x="-40" y="-40" width="280" height="380" fill="#fff" />
            <path
              d="M66 112 C66 100 80 92 100 92 C120 92 134 100 134 112 L144 162 C144 180 126 194 100 194 C74 194 56 180 56 162 Z"
              fill="#000"
            />
          </mask>
        </defs>

        <ellipse className="a000-shadow" cx="100" cy="280" rx="52" ry="5" fill="#0ea5e9" />

        {/* Legs behind the torso so the hips read as attached */}
        <g className="a000-leg-left">
          <path
            d="
              M74 176
              C68 196 64 216 66 234
              C67 244 72 250 80 250
              L90 249
              C96 247 100 240 100 230
              C102 212 100 194 94 176
              Z
            "
            fill={`url(#${armL})`}
            stroke="#8fa0b5"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M80 182 C74 200 70 220 72 238"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.32"
          />
          <path
            d="M70 214 C80 216 92 216 98 212"
            fill="none"
            stroke="#64748b"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="
              M62 244
              C54 248 48 258 52 266
              C56 272 74 274 94 268
              C98 266 98 256 92 250
              L76 246
              C70 243 66 243 62 244 Z
            "
            fill={`url(#${brim})`}
            stroke="#1e293b"
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
          <path
            d="M56 260 C64 256 74 254 82 256"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle cx="74" cy="246" r="1.05" fill="#22d3ee" className="a000-led" />
        </g>
        <g className="a000-leg-right">
          <path
            d="
              M126 176
              C132 196 136 216 134 234
              C133 244 128 250 120 250
              L110 249
              C104 247 100 240 100 230
              C98 212 100 194 106 176
              Z
            "
            fill={`url(#${armR})`}
            stroke="#8fa0b5"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M120 182 C126 200 130 220 128 238"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.32"
          />
          <path
            d="M130 214 C120 216 108 216 102 212"
            fill="none"
            stroke="#64748b"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="
              M138 244
              C146 248 152 258 148 266
              C144 272 126 274 106 268
              C102 266 102 256 108 250
              L124 246
              C130 243 134 243 138 244 Z
            "
            fill={`url(#${brim})`}
            stroke="#1e293b"
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
          <path
            d="M144 260 C136 256 126 254 118 256"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle cx="126" cy="246" r="1.05" fill="#22d3ee" className="a000-led" />
        </g>

        {/* Left arm tube — behind torso at shoulder, continuous to wrist */}
        <g className="a000-arm-left" transform="translate(8 0)">
          <path
            d="
              M66 100
              C50 103 40 114 37 132
              C34 148 34 162 40 172
              C41 176 45 178 50 178
              L54 176
              C52 174 49 170 48 166
              C46 156 46 144 49 130
              C52 116 59 106 70 102
              Z
            "
            fill={`url(#${armL})`}
            stroke="#8fa0b5"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M62 104 C52 110 45 124 43 138"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.35"
          />
          <g className="a000-hand a000-hand-left">
            <path
              d="M42 174 C38 175 35 179 36 184 C37 189 41 192 46 191 C51 190 54 186 54 181 C54 176 50 173 46 173 C44 173 43 173.5 42 174 Z"
              fill={`url(#${hand})`}
              stroke="#8fa0b5"
              strokeWidth="0.9"
            />
            <path
              d="M40 175 C36 173 33 175 33 178.5 C33 181.5 36 183 39 182 C41.5 181 42 177 40 175 Z"
              fill={`url(#${hand})`}
              stroke="#8fa0b5"
              strokeWidth="0.7"
            />
            <rect x="38" y="188" width="2.6" height="7.5" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="42" y="189" width="2.6" height="8.5" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="46" y="188.5" width="2.6" height="7.8" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="50" y="187.5" width="2.4" height="6.8" rx="1.2" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <circle cx="44" cy="180" r="0.95" fill="#22d3ee" className="a000-led" />
          </g>
        </g>

        {/* Raised upper arm tucked under the shoulder like the other arm; forearm unchanged */}
        <g className="a000-arm-right">
          <path
            d="
              M126 114
              L172 88
              Q180 84 176 78
              L170 58
              L160 38
              L152 40
              L162 60
              L164 81
              L126 102
              Z
            "
            fill={`url(#${armR})`}
            stroke="#8fa0b5"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M146 97 L166 86"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>

        {/* Torso over arm roots so shoulders read as attached at side */}
        <path
          d="M66 112 C66 100 80 92 100 92 C120 92 134 100 134 112 L144 162 C144 180 126 194 100 194 C74 194 56 180 56 162 Z"
          fill={`url(#${body})`}
          stroke="#8fa0b5"
          strokeWidth="1.15"
        />
        <ellipse cx="88" cy="118" rx="16" ry="11" fill="#ffffff" opacity="0.28" />
        <g transform="translate(100 140) scale(0.74) translate(-100 -140)">
          <path
            d="
              M100 164
              C100 164 76 147 76 130
              C76 120.5 83 115.5 91 115.5
              C96 115.5 99 117.5 100 122
              C101 117.5 104 115.5 109 115.5
              C117 115.5 124 120.5 124 130
              C124 147 100 164 100 164 Z
            "
            fill={`url(#${dark})`}
            opacity="0.94"
          />
          <circle className="a000-led" cx="90" cy="138" r="2.1" fill="#22d3ee" />
          <circle className="a000-led" cx="100" cy="142" r="2.1" fill="#22d3ee" />
          <circle className="a000-led" cx="110" cy="138" r="2.1" fill="#22d3ee" />
        </g>

        {/* Neck */}
        <rect x="91" y="78" width="18" height="16" rx="4" fill={`url(#${dark})`} />
        <rect x="94" y="82" width="12" height="2.5" rx="1" fill="#22d3ee" opacity="0.35" />

        <g className="a000-head">
          <ellipse
            cx="100"
            cy="56"
            rx="40"
            ry="44"
            fill={`url(#${plate})`}
            stroke="#8fa0b5"
            strokeWidth="1.25"
          />
          <ellipse cx="88" cy="42" rx="13" ry="9" fill="#ffffff" opacity="0.28" />

          <g className="a000-glasses" fill="none" stroke="#334155" strokeWidth="3.3" strokeLinejoin="round">
            <rect x="67" y="40" width="27" height="25" rx="7" ry="7" />
            <rect x="106" y="40" width="27" height="25" rx="7" ry="7" />
            <path d="M94 52.5 H106" strokeWidth="3.1" strokeLinecap="round" />
            <path d="M67 51.5 H59" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M133 51.5 H141" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <ellipse
            className="a000-eye"
            cx="80.5"
            cy="52.5"
            rx="7.5"
            ry="8.5"
            fill={`url(#${eye})`}
            filter={`url(#${glow})`}
          />
          <ellipse
            className="a000-eye"
            cx="119.5"
            cy="52.5"
            rx="7.5"
            ry="8.5"
            fill={`url(#${eye})`}
            filter={`url(#${glow})`}
          />
          <circle cx="80.5" cy="52.5" r="3.2" fill="#0f172a" opacity="0.92" />
          <circle cx="119.5" cy="52.5" r="3.2" fill="#0f172a" opacity="0.92" />
          <circle cx="78.6" cy="50.2" r="1.25" fill="#ecfeff" opacity="0.95" />
          <circle cx="117.6" cy="50.2" r="1.25" fill="#ecfeff" opacity="0.95" />

          <path
            className="a000-mouth"
            d="M83 71 Q100 92 117 71 Q100 82 83 71 Z"
            fill="#475569"
            opacity="0.85"
          />

          {/* Baseball cap — on the skull, brim cocked left and clear of the glasses */}
          <g className="a000-cap">
            <ellipse cx="74" cy="35" rx="12" ry="2.2" fill="#0f172a" opacity="0.14" />
            <path
              d="
                M84 27
                C70 24 52 25 40 29
                C30 32 30 36 42 36
                C56 36 72 33 86 30
                C92 29 90 27 84 27 Z
              "
              fill={`url(#${brim})`}
              stroke="#1e293b"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <path
              d="
                M66 31
                C64 16 78 4 100 1
                C122 -1 138 10 140 24
                C141 30 132 33 116 33
                C98 35 80 33 66 31 Z
              "
              fill={`url(#${cap})`}
              stroke="#8fa0b5"
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            <path
              d="M70 29 C88 34 114 33 136 26"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity="0.28"
            />
            <path d="M100 3 C98 12 97 22 99 32" fill="none" stroke="#64748b" strokeWidth="0.6" opacity="0.28" />
            <path d="M99 6 C88 14 78 22 70 30" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.22" />
            <path d="M102 6 C116 14 130 22 136 30" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.22" />
            <ellipse cx="88" cy="14" rx="10" ry="5" fill="#ffffff" opacity="0.34" transform="rotate(-14 88 14)" />
            <circle cx="100" cy="3" r="2" fill={`url(#${cap})`} stroke="#8fa0b5" strokeWidth="0.6" />
          </g>
        </g>

        {/* Same hand as before, turned fingers-up on the raised wrist */}
        <g className="a000-arm-right" transform="translate(4 2)">
          <g className="a000-hand a000-hand-right a000-wave">
            <path
              d="M158 42 C162 41 165 37 164 32 C163 27 159 24 154 25 C149 26 146 30 146 35 C146 40 150 43 154 43 C156 43 157 42.5 158 42 Z"
              fill={`url(#${hand})`}
              stroke="#8fa0b5"
              strokeWidth="0.9"
            />
            <path
              d="M160 41 C164 43 167 41 167 37.5 C167 34.5 164 33 161 34 C158.5 35 158 39 160 41 Z"
              fill={`url(#${hand})`}
              stroke="#8fa0b5"
              strokeWidth="0.7"
            />
            <rect x="147.6" y="21.7" width="2.4" height="6.8" rx="1.2" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="151.4" y="19.7" width="2.6" height="7.8" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="155.4" y="18.5" width="2.6" height="8.5" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <rect x="159.4" y="20.5" width="2.6" height="7.5" rx="1.3" fill={`url(#${hand})`} stroke="#8fa0b5" strokeWidth="0.55" />
            <circle cx="156" cy="36" r="0.95" fill="#22d3ee" className="a000-led" />
          </g>
        </g>
      </svg>
    </div>
  );
}
