import "server-only";

import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { brandIdForHost } from "@/lib/brand/config";

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
    const raw = headers.get("x-forwarded-host") || headers.get("host") || "";
    const host = raw.split(",")[0]?.trim() || "";
    return brandIdForHost(host) === "extrahosting";
  } catch {
    return false;
  }
}

(globalThis as { __siteIsExtraHosting?: () => boolean }).__siteIsExtraHosting =
  isExtraHostingRequest;

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
