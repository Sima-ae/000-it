/** Brand mark used when a shop product has no image or the file fails to load. */
export const SHOP_IMAGE_FALLBACK = "/branding/WEBLOGO-TripleZero-iT.png";

/** Bump when fixweb product art changes (e.g. transparent PNG pass). */
export const FIXWEB_ART_VERSION = "3";

/**
 * Keep public `/uploads/...` URLs. Middleware rewrites them to `/api/uploads/...`
 * (disk-backed). Do not point the browser at `/api/uploads` directly — that path
 * shared the anti-scrape API budget and caused shop cards to fall back to the logo.
 */
export function resolveShopImageSrc(image?: string | null): string {
  const src = (image || "").trim();
  if (!src) return SHOP_IMAGE_FALLBACK;
  // Normalize accidental API paths back to the public uploads URL.
  if (src.startsWith("/api/uploads/")) return src.slice(4);
  return withFixwebArtVersion(src);
}

/** Cache-bust local product art so browsers pick up re-exported transparent PNGs. */
export function withFixwebArtVersion(src: string): string {
  if (
    !src.startsWith("/uploads/fixweb/") &&
    !src.startsWith("/uploads/infoweb/") &&
    !src.startsWith("/uploads/fixweb-eh/")
  ) {
    return src;
  }
  if (src.includes("?v=") || src.includes("&v=")) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${FIXWEB_ART_VERSION}`;
}

export function shouldUnoptimizeShopImage(src: string) {
  const bare = src.split("?")[0] ?? src;
  return (
    bare.startsWith("/api/") ||
    bare.startsWith("/uploads/") ||
    bare.startsWith("/branding/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}
