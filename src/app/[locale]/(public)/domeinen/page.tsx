import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CatalogServiceDetail } from "@/components/content/CatalogServiceDetail";
import { getServiceContent } from "@/lib/fixweb-content";
import { buildServiceMetadata } from "@/lib/seo";

const SLUG = "domains";

/** Live shop catalog drives price/specs — must not bake stale static product data. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await getServiceContent(SLUG, locale);
  if (!content) return { title: "Not found", robots: { index: false } };
  return buildServiceMetadata({
    locale,
    slug: SLUG,
    title: content.title,
    description: content.subtitle,
    image: content.image,
  });
}

export default async function DomainsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CatalogServiceDetail locale={locale} slug={SLUG} />;
}
