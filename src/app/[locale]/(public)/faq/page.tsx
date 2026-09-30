import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaqPageClient } from "@/components/content/FaqPageClient";
import { getFaqContent } from "@/content/faq";
import { getRequestBrand } from "@/lib/brand/server";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const brand = await getRequestBrand();
  const hostingOnly = brand.catalogMode === "domains_hosting";
  const base = await buildStaticPageMetadata(locale, "/faq");
  if (locale === "nl" || locale === "en") {
    if (!hostingOnly) return base;
    const content = getFaqContent(locale, { hostingOnly: true });
    return {
      ...base,
      title: content.title,
      description: content.subtitle,
    };
  }
  const content = getFaqContent(locale, { hostingOnly });
  return {
    ...base,
    title: `${content.title} — ${brand.displayName}`,
    description: content.subtitle,
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const brand = await getRequestBrand();
  const content = getFaqContent(locale, {
    hostingOnly: brand.catalogMode === "domains_hosting",
  });

  return <FaqPageClient locale={locale} content={content} />;
}
