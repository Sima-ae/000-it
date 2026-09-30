/** Bump when EH art files change so browsers drop the cached grainy copies. */
const EH_ART_VERSION = "4";

/**
 * Extra Hosting serves smooth navy/light-blue product art.
 * Generated copies live under /uploads/fixweb-eh/.
 */
export function extrahostingFixwebArtSrc(src: string): string {
  const versioned = (file: string) => `/uploads/fixweb-eh/${file}?v=${EH_ART_VERSION}`;
  if (src.startsWith("/uploads/fixweb/")) {
    return versioned(src.slice("/uploads/fixweb/".length));
  }
  if (src.startsWith("/uploads/infoweb/")) {
    return versioned(src.slice("/uploads/infoweb/".length));
  }
  return src;
}
