import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/content/LegalDocument";
import { getLegalPage } from "@/lib/legal-content";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/cookies");
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = getLegalPage("cookie-policy", locale);
  if (!page) return null;

  return <LegalDocument locale={locale} page={page} />;
}
