import { readFileSync } from "node:fs";
import { join } from "node:path";
import { localizedHref } from "@/i18n/pathnames";

/**
 * Local SEO cities — top 6 NL metros + ~994 largest world cities by population.
 * Data: `world-cities.json` (GeoNames cities5000 + curated NL top 6).
 */
export type SeoCity = {
  slug: string;
  nameNl: string;
  nameEn: string;
  regionNl: string;
  regionEn: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
  countryNameNl: string;
  countryNameEn: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
  continent?: string;
  /** Sitemap priority 0–1 (higher = more important). */
  priority: number;
  changeFrequency: "weekly" | "monthly";
  tags?: string[];
  keywords?: string[];
  /** Open Graph / social image path (site-relative). */
  image?: string;
};

type WorldCitiesFile = {
  count: number;
  cities: SeoCity[];
};

let cached: SeoCity[] | null = null;

function loadCities(): SeoCity[] {
  if (cached) return cached;
  const raw = readFileSync(
    join(process.cwd(), "src/content/seo/world-cities.json"),
    "utf8",
  );
  const data = JSON.parse(raw) as WorldCitiesFile;
  cached = [...(data.cities || [])].sort((a, b) => b.priority - a.priority);
  return cached;
}

/** All cities sorted by sitemap priority (NL top 6 first). */
export const seoCities: SeoCity[] = loadCities();

/** @deprecated use seoCities — kept for older imports */
export const seoCitiesRaw: SeoCity[] = seoCities;

export function getSeoCity(slug: string) {
  return seoCities.find((c) => c.slug === slug);
}

export function cityPath(locale: string, slug: string) {
  return localizedHref(locale, `/locaties/${slug}`);
}

export function cityDisplayName(city: SeoCity, locale: string) {
  return locale === "nl" ? city.nameNl : city.nameEn;
}

export function cityCountryName(city: SeoCity, locale: string) {
  return locale === "nl" ? city.countryNameNl : city.countryNameEn;
}

export function cityRegionName(city: SeoCity, locale: string) {
  return locale === "nl" ? city.regionNl : city.regionEn;
}

/** Featured NL metros shown first on the index. */
export function featuredNlCities() {
  return seoCities.filter((c) => c.country === "NL").slice(0, 6);
}

export function citiesByCountry() {
  const map = new Map<string, SeoCity[]>();
  for (const city of seoCities) {
    const list = map.get(city.country) || [];
    list.push(city);
    map.set(city.country, list);
  }
  return map;
}
