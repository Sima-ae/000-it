/** Visible brand name on ExtraHosting sites only (spaced form). */
export const EXTRA_HOSTING_PUBLIC_NAME = "Extra Hosting";

const TRIPLE_ZERO_FULL = "TripleZero iT";
const TRIPLE_ZERO_SHORT = "TripleZero";
const EXTRA_HOSTING_COMPACT = "ExtraHosting";

type ExtraCheck = () => boolean;

function extraHostingCheck(): ExtraCheck | undefined {
  return (globalThis as { __siteIsExtraHosting?: ExtraCheck }).__siteIsExtraHosting;
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

/** Swap brand names only when this request is an ExtraHosting site. */
export function renameTripleZeroName(text: string): string {
  if (!isExtraHostingSurface()) return text;
  return replaceTripleZeroName(text);
}

export function replaceTripleZeroDeep<T>(value: T): T {
  if (typeof value === "string") return replaceTripleZeroName(value) as T;
  if (Array.isArray(value)) return value.map((item) => replaceTripleZeroDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceTripleZeroDeep(item);
    }
    return out as T;
  }
  return value;
}
