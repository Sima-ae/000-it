import type { ShopLineOfBusiness } from "@prisma/client";
import { isHostingPlanSlug } from "@/lib/shop/catalog";

export type { ShopLineOfBusiness };

export const SHOP_LINES = ["SERVICE", "HOSTING"] as const;

/** Known hosting product slugs (plans under shared/cloud/email/reseller/WordPress/VPS). */
export function isHostingSlug(slug: string): boolean {
  if (slug === "web-hosting") return true;
  return isHostingPlanSlug(slug);
}

export function lineOfBusinessFromProduct(input: {
  slug: string;
  category?: string | null;
  lineOfBusiness?: ShopLineOfBusiness | string | null;
}): ShopLineOfBusiness {
  // Known hosting SKUs / category win over a stale SERVICE default from seed.
  if (input.category === "hosting" || isHostingSlug(input.slug)) return "HOSTING";
  if (input.lineOfBusiness === "HOSTING" || input.lineOfBusiness === "SERVICE") {
    return input.lineOfBusiness;
  }
  return "SERVICE";
}

export function orderNumberPrefix(line: ShopLineOfBusiness): "TZ-S" | "TZ-H" {
  return line === "HOSTING" ? "TZ-H" : "TZ-S";
}

export function makeShopOrderNumber(line: ShopLineOfBusiness): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${orderNumberPrefix(line)}-${stamp}-${rand}`;
}

export function makeDomainOrderNumber(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TZ-D-${stamp}-${rand}`;
}

export function parseLineOfBusinessParam(
  value: string | null | undefined,
  fallback: ShopLineOfBusiness = "SERVICE",
): ShopLineOfBusiness {
  if (value === "HOSTING" || value === "SERVICE") return value;
  return fallback;
}
