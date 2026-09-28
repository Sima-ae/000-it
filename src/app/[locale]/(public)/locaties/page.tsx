import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LocationsDirectory } from "@/components/marketing/LocationsDirectory";
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

      <LocationsDirectory
        locale={locale}
        cities={seoCities}
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          allCountries: t("allCountries"),
          noResults: t("noResults"),
          showMore: t("showMore"),
        }}
      />
    </div>
  );
}
