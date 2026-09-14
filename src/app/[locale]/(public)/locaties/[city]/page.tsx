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

export function generateStaticParams() {
  return seoCities.flatMap((city) => [
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
        {country} · {isNl ? city.regionNl : city.regionEn}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {t("cityTitle", { name })}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {t("cityIntro", { name })}
      </p>

      <ul className="mt-8 space-y-3 text-sm text-foreground">
        <li>{t("bulletScan", { name })}</li>
        <li>{t("bulletSeo")}</li>
        <li>{t("bulletStack")}</li>
      </ul>

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

      {/* Hidden geo coords for crawlers / consistency with meta */}
      <p className="sr-only">
        geo: {city.latitude}, {city.longitude}
      </p>
    </div>
  );
}
