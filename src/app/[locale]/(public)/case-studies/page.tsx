import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { CaseStudiesGrid } from "@/components/content/CaseStudiesGrid";
import { listCaseStudies } from "@/lib/case-studies";
import { buildStaticPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/case-studies");
}

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";
  const t = await getTranslations("cases");
  const cases = await listCaseStudies();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground md:text-lg">{t("subtitle")}</p>
      </Reveal>

      <CaseStudiesGrid
        items={cases}
        labels={{
          client: isNl ? "Klant" : "Client",
          industry: isNl ? "Branche" : "Industry",
          technologies: isNl ? "Technologieën" : "Technologies",
          visit: isNl ? "Bekijk project" : "View project",
        }}
      />
    </div>
  );
}
