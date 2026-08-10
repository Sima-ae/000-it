import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
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
  const { locale, city: slug } = await params;
  const city = getSeoCity(slug);
  if (!city) return { title: "Not found", robots: { index: false } };
  return buildCityMetadata(city, locale);
}

export default async function LocatieCityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city: slug } = await params;
  setRequestLocale(locale);
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
            { name: "Home", path: `/${locale}` },
            {
              name: isNl ? "Locaties" : "Locations",
              path: `/${locale}/locaties`,
            },
            { name, path: `/${locale}/locaties/${city.slug}` },
          ]),
        ]}
      />

      <p className="text-sm font-medium text-accent">
        {country} · {isNl ? city.regionNl : city.regionEn}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {isNl
          ? `AI, AEO, GEO & SEO in ${name}`
          : `AI, AEO, GEO & SEO in ${name}`}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {isNl
          ? `TripleZero iT helpt ondernemers en teams in ${name} sneller groeien met AI-integratie, AEO, GEO, SEO, online marketing en maatwerk software. Lokaal denkwerk, meetbare resultaten.`
          : `TripleZero iT helps entrepreneurs and teams in ${name} grow faster with AI integration, AEO, GEO, SEO, online marketing and custom software. Local insight, measurable results.`}
      </p>

      <ul className="mt-8 space-y-3 text-sm text-foreground">
        <li>
          {isNl
            ? `Gratis AI-scan voor websites in ${name}`
            : `Free AI scan for websites in ${name}`}
        </li>
        <li>
          {isNl
            ? "AEO, GEO en SEO optimalisatie voor klassieke én AI-zoekmachines"
            : "AEO, GEO and SEO optimization for classic and AI search engines"}
        </li>
        <li>
          {isNl
            ? "Webdesign, WordPress, hosting en digital marketing"
            : "Web design, WordPress, hosting and digital marketing"}
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <SoftLink href={`/${locale}/ai-scan`}>
            {isNl ? "Start gratis AI-scan" : "Start free AI scan"}
          </SoftLink>
        </Button>
        <Button asChild variant="outline">
          <SoftLink href={`/${locale}/afspraak`}>
            {isNl ? "Afspraak maken" : "Book a meeting"}
          </SoftLink>
        </Button>
        <Button asChild variant="ghost">
          <SoftLink href={`/${locale}/diensten`}>
            {isNl ? "Alle diensten" : "All services"}
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
