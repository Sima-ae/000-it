import type { Metadata } from "next";
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
import { EXTRA_HOSTING_PUBLIC_NAME } from "@/lib/brand/public-name";
import { applyExtraHostingMessages } from "@/lib/brand/extra-hosting-messages";
import { setCatalogLocaleOverlay } from "@/content/fixweb/catalog-title";
import {
  getCatalogOverlaySync,
  hydrateLocalizedCopy,
} from "@/lib/localized-copy";
import { hydrateAllEntitySlugs, hydrateEntitySlugs } from "@/lib/entity-slugs";
import { exportEntitySlugSnapshot } from "@/lib/entity-slug-cache";

function replaceDutchAmpersands<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\s*&\s*/g, " en ") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceDutchAmpersands(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceDutchAmpersands(item);
    }
    return out as T;
  }
  return value;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getRequestBrandContext();
  if (brand.brand !== "extrahosting") return {};
  const favicon = brand.config.favicon;
  return {
    title: {
      default: EXTRA_HOSTING_PUBLIC_NAME,
      template: `%s · ${EXTRA_HOSTING_PUBLIC_NAME}`,
    },
    applicationName: EXTRA_HOSTING_PUBLIC_NAME,
    appleWebApp: { title: EXTRA_HOSTING_PUBLIC_NAME, capable: true },
    authors: [{ name: EXTRA_HOSTING_PUBLIC_NAME }],
    creator: EXTRA_HOSTING_PUBLIC_NAME,
    publisher: EXTRA_HOSTING_PUBLIC_NAME,
    icons: {
      icon: [
        { url: favicon, sizes: "any", type: "image/png" },
        { url: favicon, sizes: "32x32", type: "image/png" },
        { url: favicon, sizes: "192x192", type: "image/png" },
        { url: favicon, sizes: "512x512", type: "image/png" },
      ],
      shortcut: [favicon],
      apple: [{ url: favicon, sizes: "180x180", type: "image/png" }],
      other: [{ rel: "mask-icon", url: favicon, color: "#0a4f9c" }],
    },
  };
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
  let brandMessages = { ...messages } as Record<string, unknown>;
  if (brandCtx.brand === "extrahosting") {
    brandMessages = applyExtraHostingMessages(brandMessages, locale) as Record<
      string,
      unknown
    >;
    if (locale === "nl") {
      brandMessages = replaceDutchAmpersands(brandMessages);
    }
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
