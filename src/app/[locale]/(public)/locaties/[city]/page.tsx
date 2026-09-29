import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  cityDisplayName,
  getSeoCity,
  relatedSeoCities,
  seoCities,
} from "@/content/seo/cities";
import {
  cityDirectAnswer,
  cityFaqItems,
  citySectionCopy,
} from "@/content/seo/city-aeo";
import {
  breadcrumbJsonLd,
  buildCityMetadata,
  cityServiceJsonLd,
  cityWebPageJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { resolveEntityParam } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";

/** Pre-render NL+EN for all NL metros + top ~200 global cities; others on demand. */
export function generateStaticParams() {
  const nl = seoCities.filter((c) => c.country === "NL");
  const top = seoCities.slice(0, 200);
  const slugs = new Set([...nl, ...top].map((c) => c.slug));
  return [...slugs].flatMap((city) => [
    { locale: "nl", city },
    { locale: "en", city },
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
  const t = await getTranslations({ locale, namespace: "locations" });
  const name = cityDisplayName(city, locale);
  return buildCityMetadata(city, locale, {
    title: t("cityTitle", { name }),
    description: t("cityIntro", { name }),
  });
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
  const region = isNl ? city.regionNl : city.regionEn;
  const tags = city.tags?.length
    ? city.tags
    : ["AI", "AEO", "GEO", "SEO", name, country];
  const faqs = cityFaqItems(city, locale);
  const sections = citySectionCopy(city, locale);
  const directAnswer = cityDirectAnswer(city, locale);
  const related = relatedSeoCities(city, 8);
  const pageTitle = t("cityTitle", { name });
  const pageDescription = directAnswer;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          cityServiceJsonLd(city, locale),
          cityWebPageJsonLd({
            city,
            locale,
            title: pageTitle,
            description: pageDescription,
          }),
          faqPageJsonLd(faqs),
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
        {city.continent ? ` · ${city.continent}` : ""}
        {region ? ` · ${region}` : ""}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {t("cityTitle", { name })}
      </h1>
      <p className="city-direct-answer mt-4 text-lg leading-relaxed text-foreground">
        {directAnswer}
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {t("cityIntro", { name })}
      </p>

      <ul className="mt-8 space-y-3 text-sm text-foreground">
        <li>{t("bulletScan", { name })}</li>
        <li>{t("bulletAeo", { name })}</li>
        <li>{t("bulletGeo", { name })}</li>
        <li>{t("bulletSeo", { name })}</li>
        <li>{t("bulletStack")}</li>
      </ul>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {sections.aeoTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sections.aeoBody}
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {sections.geoTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sections.geoBody}
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {sections.seoTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sections.seoBody}
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {sections.whyTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sections.whyBody}
          </p>
        </div>
      </section>

      <section className="city-faq mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {t("faqTitle", { name })}
        </h2>
        <div className="mt-4 space-y-4">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-border/70 bg-muted/20 p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

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
            <dt className="text-muted-foreground">{t("geoRegion")}</dt>
            <dd className="font-medium">{region}</dd>
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

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-base font-semibold tracking-tight">
            {t("relatedTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("relatedSubtitle", { name })}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {related.map((near) => (
              <li key={near.slug}>
                <SoftLink
                  href={localizedHref(locale, `/locaties/${near.slug}`)}
                  className="block rounded-xl border border-border/60 px-3 py-2 text-sm transition hover:border-accent/40"
                >
                  <span className="font-medium">
                    {isNl ? near.nameNl : near.nameEn}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {isNl ? near.countryNameNl : near.countryNameEn}
                  </span>
                </SoftLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
