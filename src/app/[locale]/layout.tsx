import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { LocaleHtmlLang } from "@/components/shared/LocaleHtmlLang";
import { ContentGuard } from "@/components/shared/ContentGuard";
import { CatalogI18nProvider } from "@/components/shared/CatalogI18nProvider";
import { EntitySlugProvider } from "@/components/shared/EntitySlugProvider";
import { setCatalogLocaleOverlay } from "@/content/fixweb/catalog-title";
import {
  getCatalogOverlaySync,
  hydrateLocalizedCopy,
} from "@/lib/localized-copy";
import { hydrateAllEntitySlugs, hydrateEntitySlugs } from "@/lib/entity-slugs";
import { exportEntitySlugSnapshot } from "@/lib/entity-slug-cache";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  await Promise.all([
    hydrateLocalizedCopy(locale),
    hydrateAllEntitySlugs(),
    hydrateEntitySlugs(locale),
  ]);
  const catalogOverlay = getCatalogOverlaySync(locale);
  setCatalogLocaleOverlay(locale, catalogOverlay);
  const entitySlugSnapshot = exportEntitySlugSnapshot();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang locale={locale} />
      <Providers>
        <ContentGuard />
        <EntitySlugProvider snapshot={entitySlugSnapshot}>
          <CatalogI18nProvider locale={locale} overlay={catalogOverlay}>
            {children}
          </CatalogI18nProvider>
        </EntitySlugProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
