import { SoftLink } from "@/components/shared/SoftLink";
import type { SeoCity } from "@/content/seo/cities";
import { localizedHref } from "@/i18n/pathnames";

/**
 * Server-rendered city links for crawlers (Google + answer engines).
 * The interactive directory only shows a paginated subset via client JS.
 */
export function LocationsCrawlIndex({
  locale,
  cities,
  title,
}: {
  locale: string;
  cities: SeoCity[];
  title: string;
}) {
  const useNl = locale === "nl";
  const byCountry = new Map<string, { label: string; cities: SeoCity[] }>();

  for (const city of cities) {
    const existing = byCountry.get(city.country);
    if (existing) {
      existing.cities.push(city);
    } else {
      byCountry.set(city.country, {
        label: useNl ? city.countryNameNl : city.countryNameEn,
        cities: [city],
      });
    }
  }

  const countries = [...byCountry.entries()].sort((a, b) =>
    a[1].label.localeCompare(b[1].label, locale),
  );

  return (
    <section className="mt-14 border-t border-border/60 pt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-6 space-y-3">
        {countries.map(([code, group]) => {
          const sorted = [...group.cities].sort((a, b) =>
            (useNl ? a.nameNl : a.nameEn).localeCompare(
              useNl ? b.nameNl : b.nameEn,
              locale,
            ),
          );
          const openByDefault = code === "NL" || code === "BE" || code === "US";
          return (
            <details
              key={code}
              open={openByDefault}
              className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-medium">
                {group.label}{" "}
                <span className="text-muted-foreground">({sorted.length})</span>
              </summary>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                {sorted.map((city) => (
                  <li key={city.slug}>
                    <SoftLink
                      href={localizedHref(locale, `/locaties/${city.slug}`)}
                      className="text-sm text-foreground underline-offset-2 hover:underline"
                    >
                      {useNl ? city.nameNl : city.nameEn}
                    </SoftLink>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
