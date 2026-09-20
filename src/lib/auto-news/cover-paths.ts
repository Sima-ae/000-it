/**
 * Browser-safe cover path helpers (no Node / sharp).
 * Server generation lives in `cover-image.ts`.
 */

export function sanitizeCoverFileId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

export function localNewsCoverPath(id: string) {
  return `/uploads/nieuws/${sanitizeCoverFileId(id)}.jpg`;
}

/** Prefer stored cover; fall back to the deterministic local upload path. */
export function featuredCoverUrl(id: string, coverImage?: string | null) {
  const src = (coverImage || "").trim();
  return src || localNewsCoverPath(id);
}

export function isCustomRemoteCover(coverImage?: string | null) {
  const src = (coverImage || "").trim();
  if (!src.startsWith("http://") && !src.startsWith("https://")) return false;
  return !src.includes("image.pollinations.ai");
}

/** On-demand cover endpoint used when the static upload 404s. */
export function coverApiPath(id: string) {
  return `/api/news/cover/${encodeURIComponent(id)}?v=3`;
}
