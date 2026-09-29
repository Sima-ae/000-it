import { headers } from "next/headers";
import { publicOriginForHost } from "@/lib/brand/config";
import { siteOrigin } from "@/lib/seo";

/**
 * Prefer the incoming request Host for absolute URLs (Stripe success/cancel,
 * email links). Falls back to SITE / NEXT_PUBLIC_APP_URL.
 */
export async function getPublicOriginFromRequest(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    if (host) {
      const origin = publicOriginForHost(host);
      if (origin && !/localhost|127\.0\.0\.1/i.test(origin)) {
        return origin;
      }
      // Dev: allow localhost with correct port from Host
      if (process.env.NODE_ENV !== "production" && host) {
        const proto = h.get("x-forwarded-proto") || "http";
        return `${proto}://${host.split(",")[0].trim()}`;
      }
    }
  } catch {
    /* headers() unavailable outside request */
  }
  return siteOrigin();
}

export function publicOriginFromRequestHeaders(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  if (host) {
    const origin = publicOriginForHost(host);
    if (origin && !/localhost|127\.0\.0\.1/i.test(origin)) {
      return origin;
    }
    if (process.env.NODE_ENV !== "production") {
      try {
        return new URL(request.url).origin;
      } catch {
        /* fall through */
      }
    }
  }
  return siteOrigin();
}

export function sourceBrandFromRequest(request: Request): "triplezero" | "extrahosting" {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  if (/extrahosting/i.test(host) || /extrahosting/i.test(process.env.SITE_BRAND || "")) {
    return "extrahosting";
  }
  return "triplezero";
}

export function sourceHostFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(":")[0]
    .toLowerCase();
}
