import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoCity, seoCities } from "@/content/seo/cities";
import {
  breadcrumbJsonLd,
  buildCityMetadata,
  cityServiceJsonLd,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { resolveEntityParam } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";

/** Pre-render NL+EN for highest-priority cities; others resolve on demand. */
export function generateStaticParams() {
  const top = seoCities.slice(0, 80);
  return top.flatMap((city) => [
    { locale: "nl", city: city.slug },
    { locale: "en", city: city.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city: rawCity } = await params;
  await hydrateEntitySlugs(locale);
  const slug = canonicalEntityKey(locale, "city", rawCity);
  const city = getSeoCity(slug);
  if (!city) return { title: "Not found", robots: { index: false } };
  return buildCityMetadata(city, locale);
}

export default async function LocatieCityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city: rawCity } = await params;
  setRequestLocale(locale);
  const slug = await resolveEntityParam({
    locale,
    entityType: "city",
    param: rawCity,
    internalPathFor: (key) => `/locaties/${key}`,
  });
  const tNav = await getTranslations("nav");
  const t = await getTranslations("locations");
  const city = getSeoCity(slug);
  if (!city) notFound();

  const isNl = locale === "nl";
  const name = isNl ? city.nameNl : city.nameEn;
  const country = isNl ? city.countryNameNl : city.countryNameEn;
  const tags = city.tags?.length
    ? city.tags
    : ["AI", "AEO", "GEO", "SEO", name, country];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          cityServiceJsonLd(city, locale),
          breadcrumbJsonLd([
            { name: tNav("home"), path: localizedHref(locale, "/") },
            {
              name: t("breadcrumb"),
              path: localizedHref(locale, "/locaties"),
            },
            { name, path: localizedHref(locale, `/locaties/${city.slug}`) },
          ]),
        ]}
      />

      <p className="text-sm font-medium text-accent">
        {country}
        {city.continent ? ` - ${city.continent}` : ""}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {t("cityTitle", { name })}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {t("cityIntro", { name })}
      </p>

      <ul className="mt-8 space-y-3 text-sm text-foreground">
        <li>{t("bulletScan", { name })}</li>
        <li>{t("bulletAeo", { name })}</li>
        <li>{t("bulletGeo", { name })}</li>
        <li>{t("bulletSeo", { name })}</li>
        <li>{t("bulletStack")}</li>
      </ul>

      <section className="mt-8">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {t("tagsTitle")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <SoftLink href={localizedHref(locale, "/ai-scan")}>
            {t("startFreeAiScan")}
          </SoftLink>
        </Button>
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/afspraak")}>
            {tNav("book")}
          </SoftLink>
        </Button>
        <Button asChild variant="ghost">
          <SoftLink href={localizedHref(locale, "/diensten")}>
            {t("allServices")}
          </SoftLink>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {t("geoTitle")}
        </h2>
        <dl className="mt-3 grid gap-2 rounded-2xl border border-border/70 bg-muted/30 p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t("geoCountry")}</dt>
            <dd className="font-medium">{country}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("geoCoords")}</dt>
            <dd className="font-medium">
              {city.latitude}, {city.longitude}
            </dd>
          </div>
          {city.population ? (
            <div>
              <dt className="text-muted-foreground">{t("geoPopulation")}</dt>
              <dd className="font-medium">
                {city.population.toLocaleString(locale)}
              </dd>
            </div>
          ) : null}
          {city.timezone ? (
            <div>
              <dt className="text-muted-foreground">{t("geoTimezone")}</dt>
              <dd className="font-medium">{city.timezone}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <p className="sr-only">
        geo: {city.latitude}, {city.longitude}. tags: {tags.join(", ")}.
        keywords: {(city.keywords || []).join(", ")}.
      </p>
    </div>
  );
}
