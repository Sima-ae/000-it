import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { LocaleHtmlLang } from "@/components/shared/LocaleHtmlLang";
import { ContentGuard } from "@/components/shared/ContentGuard";
import { CatalogI18nProvider } from "@/components/shared/CatalogI18nProvider";
import { EntitySlugProvider } from "@/components/shared/EntitySlugProvider";
import { BrandProvider } from "@/lib/brand/BrandProvider";
import { getRequestBrandContext } from "@/lib/brand/server";
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
  const brandCtx = await getRequestBrandContext();
  await Promise.all([
    hydrateLocalizedCopy(locale),
    hydrateAllEntitySlugs(),
    hydrateEntitySlugs(locale),
  ]);
  const catalogOverlay = getCatalogOverlaySync(locale);
  setCatalogLocaleOverlay(locale, catalogOverlay);
  const entitySlugSnapshot = exportEntitySlugSnapshot();
  const messages = await getMessages();
  const brandMessages = { ...messages } as Record<string, unknown>;
  if (brandCtx.brand === "extrahosting") {
    brandMessages.brand = brandCtx.config.displayName;
    const liveChat = {
      ...((messages as { liveChat?: Record<string, string> }).liveChat || {}),
    };
    liveChat.subtitle = brandCtx.config.displayName;
    liveChat.powered = `Agent 000 · ${brandCtx.config.displayName}`;
    brandMessages.liveChat = liveChat;
    const hero = {
      ...((messages as { hero?: Record<string, string> }).hero || {}),
    };
    if (locale === "nl") {
      hero.title = "Domeinen en webhosting — snel, stabiel en scherp geprijsd";
      hero.subtitle =
        "Registreer je domein en kies shared, WordPress of VPS hosting bij ExtraHosting.";
      hero.introTitleLine1 = "Domeinen & hosting";
      hero.introTitleLine2 = "met ExtraHosting";
      hero.ctaServices = "Bekijk hosting";
    } else {
      hero.title = "Domains and web hosting — fast, stable and fairly priced";
      hero.subtitle =
        "Register your domain and choose shared, WordPress or VPS hosting with ExtraHosting.";
      hero.introTitleLine1 = "Domains & hosting";
      hero.introTitleLine2 = "with ExtraHosting";
      hero.ctaServices = "View hosting";
    }
    brandMessages.hero = hero;
    const footer = {
      ...((messages as { footer?: Record<string, string> }).footer || {}),
    };
    footer.tagline =
      locale === "nl"
        ? brandCtx.config.tagline.nl
        : brandCtx.config.tagline.en;
    brandMessages.footer = footer;
  }

  return (
    <NextIntlClientProvider messages={brandMessages}>
      <LocaleHtmlLang locale={locale} brand={brandCtx.brand} />
      <BrandProvider brand={brandCtx.config}>
        <Providers>
          <ContentGuard />
          <EntitySlugProvider snapshot={entitySlugSnapshot}>
            <CatalogI18nProvider locale={locale} overlay={catalogOverlay}>
              {children}
            </CatalogI18nProvider>
          </EntitySlugProvider>
        </Providers>
      </BrandProvider>
    </NextIntlClientProvider>
  );
}
