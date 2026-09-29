import { headers } from "next/headers";
import {
  brandIdForHost,
  getBrandConfig,
  publicOriginForHost,
  resolveHostContext,
  type BrandPublicConfig,
  type ResolvedHostContext,
  type SiteBrandId,
} from "@/lib/brand/config";

/** Server-only: resolve brand from the incoming request Host header. */
export async function getRequestBrandContext(): Promise<ResolvedHostContext> {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.AUTH_URL?.replace(/^https?:\/\//, "") ||
    "";
  return resolveHostContext(host);
}

export async function getRequestBrandId(): Promise<SiteBrandId> {
  const ctx = await getRequestBrandContext();
  return ctx.brand;
}

export async function getRequestBrand(): Promise<BrandPublicConfig> {
  const ctx = await getRequestBrandContext();
  return ctx.config;
}

export async function getRequestPublicOrigin(): Promise<string> {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "";
  return publicOriginForHost(host);
}

/** Client-safe brand from env when Host is unavailable (e.g. static). */
export function getEnvBrandId(): SiteBrandId {
  return brandIdForHost(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
      process.env.SITE_BRAND ||
      "000-it.com",
  );
}

export function getEnvBrand(): BrandPublicConfig {
  return getBrandConfig(getEnvBrandId());
}
