import { z } from "zod";

export const SHOP_PRODUCT_TYPES = ["product", "service", "plan"] as const;
export type ShopAdminProductType = (typeof SHOP_PRODUCT_TYPES)[number];

export const SHOP_BILLING_INTERVALS = [
  "one_time",
  "weekly",
  "monthly",
  "yearly",
] as const;
export type ShopAdminBillingInterval = (typeof SHOP_BILLING_INTERVALS)[number];

export const SHOP_CATEGORIES = [
  "hosting",
  "ai",
  "seo",
  "webdesign",
  "content",
  "ads",
  "support",
  "software",
  "plans",
  "other",
] as const;

export function slugifyShop(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const shopProductUpsertSchema = z.object({
  sku: z.string().min(1).max(64),
  slug: z.string().min(1).max(80).optional(),
  type: z.enum(SHOP_PRODUCT_TYPES).default("service"),
  nameNl: z.string().min(1).max(190),
  nameEn: z.string().min(1).max(190),
  shortDescriptionNl: z.string().max(4000).default(""),
  shortDescriptionEn: z.string().max(4000).default(""),
  descriptionNl: z.string().max(50000).default(""),
  descriptionEn: z.string().max(50000).default(""),
  /** Euro amount including VAT, e.g. 64.95 */
  priceIncl: z.number().positive().max(1_000_000),
  currency: z.literal("EUR").default("EUR"),
  billingInterval: z.enum(SHOP_BILLING_INTERVALS).default("one_time"),
  billAsYearlyPackage: z.boolean().default(false),
  checkoutMonths: z.number().int().min(1).max(36).nullable().optional(),
  category: z.string().max(64).nullable().optional(),
  image: z.string().max(2000).nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  planKey: z.enum(["starter", "growth"]).nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export type ShopProductUpsertInput = z.infer<typeof shopProductUpsertSchema>;

export function eurosToCentsSafe(euros: number) {
  return Math.round(euros * 100);
}

export function centsToEurosNumber(cents: number) {
  return Math.round(cents) / 100;
}
