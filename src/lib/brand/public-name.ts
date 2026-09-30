/** Visible brand name on ExtraHosting sites only (spaced form). */
export const EXTRA_HOSTING_PUBLIC_NAME = "Extra Hosting";

const TRIPLE_ZERO_FULL = "TripleZero iT";
const TRIPLE_ZERO_SHORT = "TripleZero";
const EXTRA_HOSTING_COMPACT = "ExtraHosting";

export type ExtraHostingPublicDomain = "extrahosting.eu" | "extrahosting.nl";

export type ExtraHostingRemapOpts = {
  host?: string | null;
  locale?: string | null;
};

type ExtraCheck = () => boolean;
type ExtraHost = () => string;
type ExtraLocale = () => string;

function extraHostingCheck(): ExtraCheck | undefined {
  return (globalThis as { __siteIsExtraHosting?: ExtraCheck }).__siteIsExtraHosting;
}

function extraHostingHost(): ExtraHost | undefined {
  return (globalThis as { __siteExtraHostingHost?: ExtraHost }).__siteExtraHostingHost;
}

function extraHostingLocale(): ExtraLocale | undefined {
  return (globalThis as { __siteExtraHostingLocale?: ExtraLocale }).__siteExtraHostingLocale;
}

function resolveRequestHost(override?: string | null): string {
  if (override) return override.toLowerCase().split(":")[0] || "";
  if (typeof document !== "undefined") {
    return (document.location.hostname || "").toLowerCase();
  }
  try {
    return (extraHostingHost()?.() || "").toLowerCase();
  } catch {
    return "";
  }
}

function resolveRequestLocale(override?: string | null): string {
  if (override) return override.toLowerCase();
  if (typeof document !== "undefined") {
    return (document.documentElement.lang || "").toLowerCase();
  }
  try {
    return (extraHostingLocale()?.() || "").toLowerCase();
  } catch {
    return "";
  }
}

function isNlHost(host: string): boolean {
  return (
    host === "extrahosting.nl" ||
    host === "www.extrahosting.nl" ||
    host.endsWith(".extrahosting.nl")
  );
}

/** True on extrahosting.eu / extrahosting.nl, in the browser and during a request. */
export function isExtraHostingSurface(): boolean {
  if (typeof document !== "undefined") {
    return document.documentElement.dataset.brand === "extrahosting";
  }
  try {
    return extraHostingCheck()?.() === true;
  } catch {
    return false;
  }
}

/**
 * Dutch public surface: Dutch UI locale, or the extrahosting.nl country host.
 * Used for .nl contact domains and Dutch governing-law copy.
 */
export function isExtraHostingDutchSurface(opts?: ExtraHostingRemapOpts): boolean {
  const host = resolveRequestHost(opts?.host);
  const locale = resolveRequestLocale(opts?.locale);
  return isNlHost(host) || locale === "nl";
}

/** Public apex for ExtraHosting (.nl only for Dutch locale or extrahosting.nl). */
export function getExtraHostingPublicDomain(
  hostHeader?: string | null,
  locale?: string | null,
): ExtraHostingPublicDomain {
  if (isExtraHostingDutchSurface({ host: hostHeader, locale })) {
    return "extrahosting.nl";
  }
  return "extrahosting.eu";
}

/** Swap UAE governing-law phrases for Dutch law on Dutch EH surfaces only. */
export function remapExtraHostingJurisdiction(
  text: string,
  opts?: ExtraHostingRemapOpts,
): string {
  if (!isExtraHostingDutchSurface(opts)) return text;
  if (
    !text.includes("Verenigde Arabische Emiraten") &&
    !text.includes("United Arab Emirates")
  ) {
    return text;
  }
  return text
    .replace(
      /het recht van de Verenigde Arabische Emiraten/gi,
      "Nederlands recht",
    )
    .replace(
      /de rechtbanken van de Verenigde Arabische Emiraten/gi,
      "de Nederlandse rechtbanken",
    )
    .replace(
      /exportwetten en -regelgeving van de Verenigde Arabische Emiraten/gi,
      "Nederlandse exportwetten en -regelgeving",
    )
    .replace(
      /laws of(?: the)? United Arab Emirates/gi,
      "Dutch law",
    )
    .replace(
      /courts of(?: the)? United Arab Emirates/gi,
      "courts of the Netherlands",
    )
    .replace(
      /export laws and regulations of(?: the)? United Arab Emirates/gi,
      "Dutch export laws and regulations",
    );
}

/**
 * Remap 000-it.com URLs and @000-it.com mailboxes to the ExtraHosting apex.
 * Safe to call only when rendering ExtraHosting surfaces.
 */
export function remapExtraHostingSiteRefs(
  text: string,
  opts?: ExtraHostingRemapOpts | string | null,
): string {
  const normalized: ExtraHostingRemapOpts =
    typeof opts === "string" || opts == null
      ? { host: typeof opts === "string" ? opts : null }
      : opts;

  let out = text;
  if (out.includes("000-it.com") || out.includes("000-it.COM")) {
    const domain = getExtraHostingPublicDomain(
      normalized.host,
      normalized.locale,
    );
    out = out
      .replace(/https?:\/\/(www\.)?000-it\.com/gi, `https://${domain}`)
      .replace(/@000-it\.com/gi, `@${domain}`)
      .replace(/(^|[^/\w.-])(www\.)?000-it\.com\b/gi, `$1${domain}`);
  }
  return remapExtraHostingJurisdiction(out, normalized);
}

/**
 * Replace TripleZero / TripleZero iT / ExtraHosting with Extra Hosting.
 * Compounds like "TripleZero-producten" become "Extra Hosting-producten".
 */
export function replaceTripleZeroName(text: string): string {
  if (
    !text.includes(TRIPLE_ZERO_FULL) &&
    !text.includes(TRIPLE_ZERO_SHORT) &&
    !text.includes(EXTRA_HOSTING_COMPACT)
  ) {
    return text;
  }
  return text
    .replaceAll(TRIPLE_ZERO_FULL, EXTRA_HOSTING_PUBLIC_NAME)
    .replaceAll(TRIPLE_ZERO_SHORT, EXTRA_HOSTING_PUBLIC_NAME)
    .replaceAll(EXTRA_HOSTING_COMPACT, EXTRA_HOSTING_PUBLIC_NAME);
}

/** Swap brand names and contact refs only when this request is an ExtraHosting site. */
export function renameTripleZeroName(
  text: string,
  opts?: ExtraHostingRemapOpts,
): string {
  if (!isExtraHostingSurface()) return text;
  return remapExtraHostingSiteRefs(replaceTripleZeroName(text), opts);
}

export function replaceTripleZeroDeep<T>(
  value: T,
  opts?: ExtraHostingRemapOpts,
): T {
  if (typeof value === "string") {
    return remapExtraHostingSiteRefs(replaceTripleZeroName(value), opts) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceTripleZeroDeep(item, opts)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceTripleZeroDeep(item, opts);
    }
    return out as T;
  }
  return value;
}
