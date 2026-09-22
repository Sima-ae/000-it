/** Brand mark used when a shop product has no image or the file fails to load. */
export const SHOP_IMAGE_FALLBACK = "/branding/WEBLOGO-TripleZero-iT.png";

/**
 * Local `/uploads/...` files are served through `/api/uploads/...` (middleware rewrite).
 * Point Next/Image at the API path so the optimizer never fetches a rewritten URL.
 */
export function resolveShopImageSrc(image?: string | null): string {
  const src = (image || "").trim();
  if (!src) return SHOP_IMAGE_FALLBACK;
  if (src.startsWith("/uploads/")) return `/api${src}`;
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
