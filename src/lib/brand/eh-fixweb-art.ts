/** Bump when EH art files change so browsers drop the cached grainy copies. */
const EH_ART_VERSION = "8";

/**
 * Extra Hosting serves smooth navy/light-blue product art.
 * Generated copies live under /uploads/fixweb-eh/.
 */
export function extrahostingFixwebArtSrc(src: string): string {
  const bare = src.split("?")[0] ?? src;
  const versioned = (file: string) => `/uploads/fixweb-eh/${file}?v=${EH_ART_VERSION}`;
  if (bare.startsWith("/uploads/fixweb/")) {
    return versioned(bare.slice("/uploads/fixweb/".length));
  }
  if (bare.startsWith("/uploads/infoweb/")) {
    return versioned(bare.slice("/uploads/infoweb/".length));
  }
  if (bare.startsWith("/uploads/fixweb-eh/")) {
    return versioned(bare.slice("/uploads/fixweb-eh/".length));
  }
  return src;
}
