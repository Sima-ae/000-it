"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import type { SeoCity } from "@/content/seo/cities";
import { touristScore } from "@/content/seo/tourist-destinations";
import { localizedHref } from "@/i18n/pathnames";

type Labels = {
  searchPlaceholder: string;
  allCountries: string;
  noResults: string;
  showMore: string;
};

const PAGE_SIZE = 60;

export function LocationsDirectory({
  locale,
  cities,
  labels,
}: {
  locale: string;
  cities: SeoCity[];
  labels: Labels;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("ALL");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const useNl = locale === "nl";

  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const city of cities) {
      if (!map.has(city.country)) {
        map.set(
          city.country,
          useNl ? city.countryNameNl : city.countryNameEn,
        );
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], locale));
  }, [cities, locale, useNl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities
      .filter((city) => {
        if (country !== "ALL" && city.country !== country) return false;
        if (!q) return true;
        const hay = [
          city.nameNl,
          city.nameEn,
          city.countryNameNl,
          city.countryNameEn,
          city.regionNl,
          city.regionEn,
          city.continent || "",
          ...(city.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const scoreDiff = touristScore(b.slug) - touristScore(a.slug);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.population || 0) - (a.population || 0);
      });
  }, [cities, country, query]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="mt-10 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder={labels.searchPlaceholder}
          className="h-11 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm outline-none ring-accent/30 focus:ring-2 sm:max-w-md"
        />
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          className="h-11 rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none ring-accent/30 focus:ring-2 sm:min-w-48"
        >
          <option value="ALL">{labels.allCountries}</option>
          {countries.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <section>
        {shown.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{labels.noResults}</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {shown.map((city) => (
              <CityCard key={city.slug} city={city} locale={locale} />
            ))}
          </div>
        )}
        {visible < filtered.length ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-2xl border border-border/70 bg-background px-5 py-2.5 text-sm font-medium hover:border-accent/40"
            >
              {labels.showMore}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function CityCard({
  city,
  locale,
}: {
  city: SeoCity;
  locale: string;
}) {
  const useNl = locale === "nl";
  return (
    <SoftLink
      href={localizedHref(locale, `/locaties/${city.slug}`)}
      className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 transition hover:border-accent/40 hover:bg-muted/50"
    >
      <p className="font-medium text-foreground">
        {useNl ? city.nameNl : city.nameEn}
      </p>
      <p className="text-xs text-muted-foreground">
        {useNl ? city.countryNameNl : city.countryNameEn}
      </p>
    </SoftLink>
  );
}
