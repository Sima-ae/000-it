import { setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/content/LegalDocument";
import { getLegalPage } from "@/lib/legal-content";

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
