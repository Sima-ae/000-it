/** localStorage key: ISO timestamp of when the user last opened SEO Analyses. */
export const SEO_SEEN_AT_KEY = "tz-seo-analyses-seen-at";

export function readSeoSeenAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SEO_SEEN_AT_KEY);
  } catch {
    return null;
  }
}

/** Mark current SEO analyses as seen (clears the sidebar badge until new ones arrive). */
export function markSeoAnalysesSeen(seenAt = new Date().toISOString()) {
  if (typeof window === "undefined") return seenAt;
  try {
    localStorage.setItem(SEO_SEEN_AT_KEY, seenAt);
  } catch {
    /* ignore */
  }
  return seenAt;
}
