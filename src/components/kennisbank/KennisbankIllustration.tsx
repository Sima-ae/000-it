/** Category-themed SVG illustrations for kennisbank articles (no external assets). */

const motifs: Record<
  string,
  { c1: string; c2: string; motif: "shield" | "mail" | "server" | "globe" | "bot" | "doc" }
> = {
  domeinnamen: { c1: "#5e3b88", c2: "#007c8d", motif: "globe" },
  bloggen: { c1: "#5e3b88", c2: "#9b7fc0", motif: "doc" },
  hosting: { c1: "#2f3a48", c2: "#5e3b88", motif: "server" },
  "e-mail": { c1: "#5e3b88", c2: "#007c8d", motif: "mail" },
  directadmin: { c1: "#5e3b88", c2: "#2f3a48", motif: "server" },
  cyberpanel: { c1: "#007c8d", c2: "#5e3b88", motif: "server" },
  beveiliging: { c1: "#5e3b88", c2: "#e11d48", motif: "shield" },
  "crm-klantenpanel": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  wordpress: { c1: "#21759b", c2: "#5e3b88", motif: "doc" },
  "veilig-online": { c1: "#007c8d", c2: "#5e3b88", motif: "shield" },
  support: { c1: "#5e3b88", c2: "#9b7fc0", motif: "mail" },
  plesk: { c1: "#52bce6", c2: "#5e3b88", motif: "server" },
  "ai-scan": { c1: "#5e3b88", c2: "#007c8d", motif: "bot" },
  "aeo-geo-seo": { c1: "#5e3b88", c2: "#007c8d", motif: "globe" },
  "ai-agents": { c1: "#5e3b88", c2: "#9b7fc0", motif: "bot" },
  "shop-en-pakketten": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  microsoft: { c1: "#5e3b88", c2: "#0078d4", motif: "mail" },
  vps: { c1: "#2f3a48", c2: "#007c8d", motif: "server" },
  "ssl-certificaten": { c1: "#5e3b88", c2: "#e11d48", motif: "shield" },
  "dns-records": { c1: "#5e3b88", c2: "#007c8d", motif: "globe" },
  "domein-verhuizen": { c1: "#5e3b88", c2: "#007c8d", motif: "globe" },
  "domein-registratie": { c1: "#5e3b88", c2: "#9b7fc0", motif: "globe" },
  webmail: { c1: "#5e3b88", c2: "#007c8d", motif: "mail" },
  "e-mail-instellen": { c1: "#5e3b88", c2: "#007c8d", motif: "mail" },
  "spam-en-veiligheid": { c1: "#5e3b88", c2: "#e11d48", motif: "mail" },
  "mailbox-beheer": { c1: "#5e3b88", c2: "#9b7fc0", motif: "mail" },
  "php-en-scripts": { c1: "#2f3a48", c2: "#5e3b88", motif: "server" },
  "ftp-en-bestanden": { c1: "#2f3a48", c2: "#9b7fc0", motif: "server" },
  "opslag-en-verkeer": { c1: "#2f3a48", c2: "#007c8d", motif: "server" },
  "wordpress-beveiliging": { c1: "#21759b", c2: "#e11d48", motif: "shield" },
  "wordpress-installatie": { c1: "#21759b", c2: "#5e3b88", motif: "doc" },
  "wordpress-onderhoud": { c1: "#21759b", c2: "#9b7fc0", motif: "doc" },
  "windows-vps": { c1: "#2f3a48", c2: "#0078d4", motif: "server" },
  "linux-vps": { c1: "#2f3a48", c2: "#007c8d", motif: "server" },
  "vps-beheer": { c1: "#2f3a48", c2: "#5e3b88", motif: "server" },
  "facturen-en-betalen": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  "tickets-en-berichten": { c1: "#5e3b88", c2: "#9b7fc0", motif: "mail" },
  "account-en-inloggen": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  "tickets-en-chat": { c1: "#5e3b88", c2: "#9b7fc0", motif: "mail" },
  "betalen-en-btw": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  hostingpakketten: { c1: "#5e3b88", c2: "#2f3a48", motif: "server" },
  "business-pakketten": { c1: "#5e3b88", c2: "#007c8d", motif: "doc" },
  "firewall-en-hacks": { c1: "#5e3b88", c2: "#e11d48", motif: "shield" },
  "directadmin-e-mail": { c1: "#5e3b88", c2: "#007c8d", motif: "mail" },
  "directadmin-wordpress": { c1: "#21759b", c2: "#5e3b88", motif: "doc" },
  "microsoft-mail": { c1: "#5e3b88", c2: "#0078d4", motif: "mail" },
};

function motifPath(motif: string) {
  switch (motif) {
    case "shield":
      return "M120 42c28 12 48 18 60 20v58c0 34-24 58-60 74-36-16-60-40-60-74V62c12-2 32-8 60-20z";
    case "mail":
      return "M55 78h130v70H55V78zm0 0 65 42 65-42";
    case "server":
      return "M60 70h120v28H60V70zm0 40h120v28H60v-28zm0 40h120v28H60v-28z";
    case "bot":
      return "M120 55c22 0 40 18 40 40v35H80v-35c0-22 18-40 40-40zm-18 48h10v10h-10v-10zm26 0h10v10h-10v-10zM95 150h50";
    case "globe":
      return "M120 55a65 65 0 1 1 0 130 65 65 0 1 1 0-130zm0 0c24 28 24 102 0 130-24-28-24-102 0-130zm-65 65h130";
    default:
      return "M75 55h90v130H75V55zm18 28h54m-54 24h54m-54 24h40";
  }
}

export function KennisbankIllustration({
  categorySlug,
  categoryLabel,
  footerLabel,
  variant = "hero",
  caption,
}: {
  categorySlug: string;
  categoryLabel?: string;
  footerLabel?: string;
  variant?: "hero" | "mid";
  caption?: string;
}) {
  const parentSlug = categorySlug.endsWith("-overige")
    ? categorySlug.slice(0, -"-overige".length)
    : null;
  const theme =
    motifs[categorySlug] ||
    (parentSlug ? motifs[parentSlug] : undefined) || {
      c1: "#5e3b88",
      c2: "#007c8d",
      motif: "doc" as const,
    };
  const label = categoryLabel || "TripleZero iT";
  const footer = footerLabel || "TripleZero iT";
  const h = variant === "hero" ? 220 : 180;

  return (
    <figure className="kb-figure">
      <svg
        viewBox={`0 0 480 ${h}`}
        role="img"
        aria-label={label}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`kb-g-${categorySlug}-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.c1} stopOpacity="0.95" />
            <stop offset="100%" stopColor={theme.c2} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect width="480" height={h} fill={`url(#kb-g-${categorySlug}-${variant})`} />
        <circle cx="420" cy="30" r="70" fill="#fff" opacity="0.08" />
        <circle cx="40" cy={h - 20} r="90" fill="#fff" opacity="0.07" />
        <g
          transform={`translate(${variant === "hero" ? 120 : 140} ${variant === "hero" ? 10 : 0}) scale(0.85)`}
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        >
          <path d={motifPath(theme.motif)} />
        </g>
        <text
          x="28"
          y={h - 28}
          fill="#fff"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="18"
          fontWeight="650"
          opacity="0.95"
        >
          {label}
        </text>
        <text
          x="28"
          y={h - 10}
          fill="#fff"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="12"
          opacity="0.75"
        >
          {footer}
        </text>
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
