import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getCatalogItem,
  getServiceSlugs,
} from "@/content/fixweb/catalog";
import { localizedHref } from "@/i18n/pathnames";
import { getServiceContent } from "@/lib/fixweb-content";
import { buildServiceMetadata } from "@/lib/seo";
import { resolveEntityParam } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";
import { CatalogServiceDetail } from "@/components/content/CatalogServiceDetail";
import { getShopProductBySlug } from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

/** Live shop catalog drives price/specs — must not bake stale static product data. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  await hydrateEntitySlugs(locale);
  const slug = canonicalEntityKey(locale, "service", rawSlug);
  const content = await getServiceContent(slug, locale);
  if (!content) return { title: "Not found", robots: { index: false } };
  return buildServiceMetadata({
    locale,
    slug,
    title: content.title,
    description: content.subtitle,
    image: content.image,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  setRequestLocale(locale);
  const slug = await resolveEntityParam({
    locale,
    entityType: "service",
    param: rawSlug,
    internalPathFor: (key) => `/diensten/${key}`,
  });
  const shopCatalog = await loadShopCatalogFromDb();
  const shopProduct = getShopProductBySlug(slug);
  const meta = getCatalogItem(slug);
  if (meta?.href) {
    redirect(localizedHref(locale, meta.href));
  }
  // Hosting/shop products may exist only in the DB catalog (no static formweb entry).
  if (!meta && !shopProduct) notFound();
  return <CatalogServiceDetail locale={locale} slug={slug} />;
}
