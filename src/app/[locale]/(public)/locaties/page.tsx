import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { seoCities } from "@/content/seo/cities";
import {
  breadcrumbJsonLd,
  buildStaticPageMetadata,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/locaties");
}

export default async function LocatiesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("locations");
  const tNav = await getTranslations("nav");
  const useNl = locale === "nl";

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: tNav("home"), path: localizedHref(locale, "/") },
            {
              name: t("title"),
              path: localizedHref(locale, "/locaties"),
            },
          ]),
        ]}
      />
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {seoCities.map((city) => (
          <SoftLink
            key={city.slug}
            href={localizedHref(locale, `/locaties/${city.slug}`)}
            className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 transition hover:border-accent/40 hover:bg-muted/50"
          >
            <p className="font-medium text-foreground">
              {useNl ? city.nameNl : city.nameEn}
            </p>
            <p className="text-xs text-muted-foreground">
              {useNl ? city.countryNameNl : city.countryNameEn}
              {" · "}
              {useNl ? city.regionNl : city.regionEn}
            </p>
          </SoftLink>
        ))}
      </div>
    </div>
  );
}
