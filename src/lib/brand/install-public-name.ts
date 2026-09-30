import "server-only";

import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { brandIdForHost } from "@/lib/brand/config";

function requestHostHeader(): string {
  try {
    const store = workUnitAsyncStorage.getStore() as
      | { headers?: { get(name: string): string | null } }
      | undefined;
    const headers = store?.headers;
    if (!headers?.get) return "";
    const raw = headers.get("x-forwarded-host") || headers.get("host") || "";
    return raw.split(",")[0]?.trim() || "";
  } catch {
    return "";
  }
}

function requestLocale(): string {
  try {
    const store = workUnitAsyncStorage.getStore() as
      | { headers?: { get(name: string): string | null } }
      | undefined;
    const headers = store?.headers;
    if (!headers?.get) return "";
    const stamped = (headers.get("x-site-locale") || headers.get("x-fixed-locale") || "")
      .trim()
      .toLowerCase();
    if (stamped) return stamped;
    const cookie = headers.get("cookie") || "";
    const fromCookie = cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/i);
    if (fromCookie?.[1]) return decodeURIComponent(fromCookie[1]).toLowerCase();
    return "";
  } catch {
    return "";
  }
}

function isExtraHostingRequest(): boolean {
  try {
    const store = workUnitAsyncStorage.getStore() as
      | { headers?: { get(name: string): string | null } }
      | undefined;
    const headers = store?.headers;
    if (!headers?.get) return false;
    const marked = (headers.get("x-site-brand") || "").trim().toLowerCase();
    if (marked === "extrahosting") return true;
    if (marked === "triplezero") return false;
    return brandIdForHost(requestHostHeader()) === "extrahosting";
  } catch {
    return false;
  }
}

(globalThis as { __siteIsExtraHosting?: () => boolean }).__siteIsExtraHosting =
  isExtraHostingRequest;
(globalThis as { __siteExtraHostingHost?: () => string }).__siteExtraHostingHost =
  requestHostHeader;
(globalThis as { __siteExtraHostingLocale?: () => string }).__siteExtraHostingLocale =
  requestLocale;

/** Brand stamped by middleware. Does not call `headers()`, so it is safe inside next-intl config. */
export function readRequestSiteBrand(): "extrahosting" | "triplezero" | null {
  try {
    const store = workUnitAsyncStorage.getStore() as
      | { type?: string; headers?: { get(name: string): string | null } }
      | undefined;
    const marked = (store?.headers?.get("x-site-brand") || "").trim().toLowerCase();
    const raw = store?.headers?.get("x-forwarded-host") || store?.headers?.get("host") || "";
    if (marked === "extrahosting" || marked === "triplezero") return marked;
    const host = raw.split(",")[0]?.trim() || "";
    if (!host) return null;
    const id = brandIdForHost(host);
    return id === "extrahosting" ? "extrahosting" : "triplezero";
  } catch {
    return null;
  }
}
