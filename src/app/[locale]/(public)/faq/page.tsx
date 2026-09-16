import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaqPageClient } from "@/components/content/FaqPageClient";
import { getFaqContent } from "@/content/faq";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = await buildStaticPageMetadata(locale, "/faq");
  if (locale === "nl" || locale === "en") return base;
  const content = getFaqContent(locale);
  return {
    ...base,
    title: `${content.title} — TripleZero iT`,
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
  const content = getFaqContent(locale);

  return <FaqPageClient locale={locale} content={content} />;
}
