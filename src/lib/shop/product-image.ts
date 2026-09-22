/** Brand mark used when a shop product has no image or the file fails to load. */
export const SHOP_IMAGE_FALLBACK = "/branding/WEBLOGO-TripleZero-iT.png";

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
  return src;
}

export function shouldUnoptimizeShopImage(src: string) {
  return (
    src.startsWith("/api/") ||
    src.startsWith("/uploads/") ||
    src.startsWith("/branding/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}
