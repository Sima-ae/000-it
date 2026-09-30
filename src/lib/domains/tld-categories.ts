/** Sell price at/above this (EUR cents) → Premium tab. */
export const PREMIUM_PRICE_CENTS = 5000;

export type TldCategoryId =
  | "popular"
  | "premium"
  | "international"
  | "tech"
  | "business"
  | "media"
  | "other";

const INTERNATIONAL = new Set(
  [
    "nl",
    "be",
    "eu",
    "de",
    "fr",
    "uk",
    "co.uk",
    "org.uk",
    "me.uk",
    "es",
    "it",
    "pt",
    "pl",
    "at",
    "ch",
    "se",
    "no",
    "dk",
    "fi",
    "ie",
    "cz",
    "sk",
    "hu",
    "ro",
    "bg",
    "hr",
    "si",
    "lt",
    "lv",
    "ee",
    "gr",
    "cy",
    "mt",
    "lu",
    "is",
    "us",
    "ca",
    "au",
    "co.nz",
    "jp",
    "cn",
    "in",
    "br",
    "mx",
    "za",
    "sg",
    "hk",
    "tw",
    "kr",
    "tr",
    "il",
    "ae",
    "ru",
    "ua",
    "by",
    "am",
    "ge",
    "az",
  ].map((t) => t.toLowerCase()),
);

const TECH = new Set(
  [
    "io",
    "ai",
    "app",
    "dev",
    "tech",
    "cloud",
    "software",
    "digital",
    "computer",
    "network",
    "systems",
    "codes",
    "code",
    "data",
    "host",
    "hosting",
    "domain",
    "domains",
    "email",
    "online",
    "site",
    "website",
    "web",
    "page",
    "pages",
    "link",
    "click",
    "download",
    "mobile",
    "phone",
    "android",
    "foo",
  ].map((t) => t.toLowerCase()),
);

const BUSINESS = new Set(
  [
    "com",
    "net",
    "org",
    "biz",
    "co",
    "company",
    "ltd",
    "llc",
    "inc",
    "corp",
    "enterprises",
    "business",
    "services",
    "solutions",
    "consulting",
    "management",
    "group",
    "agency",
    "studio",
    "global",
    "international",
    "world",
    "shop",
    "store",
    "market",
    "markets",
    "boutique",
    "sale",
    "deals",
    "discount",
    "finance",
    "money",
    "capital",
    "fund",
    "investments",
    "insure",
    "insurance",
    "tax",
    "accountants",
    "lawyer",
    "law",
    "legal",
    "attorney",
    "estate",
    "properties",
    "realtor",
    "immo",
    "villas",
    "house",
    "homes",
  ].map((t) => t.toLowerCase()),
);

const MEDIA = new Set(
  [
    "media",
    "news",
    "blog",
    "press",
    "photo",
    "photos",
    "pics",
    "pictures",
    "video",
    "videos",
    "film",
    "movie",
    "movies",
    "tv",
    "radio",
    "music",
    "audio",
    "art",
    "design",
    "graphics",
    "gallery",
    "studio",
    "camera",
    "fashion",
    "style",
    "beauty",
    "sexy",
  ].map((t) => t.toLowerCase()),
);

export function isPremiumTld(priceInCents: number): boolean {
  return priceInCents >= PREMIUM_PRICE_CENTS;
}

export function categorizeTld(
  tld: string,
): Exclude<TldCategoryId, "popular" | "premium"> | "other" {
  const key = tld.toLowerCase().replace(/^\./, "");
  if (INTERNATIONAL.has(key) || key.includes(".")) return "international";
  if (TECH.has(key)) return "tech";
  if (BUSINESS.has(key)) return "business";
  if (MEDIA.has(key)) return "media";
  return "other";
}

export const TLD_CATEGORY_ORDER: TldCategoryId[] = [
  "popular",
  "premium",
  "international",
  "tech",
  "business",
  "media",
  "other",
];
