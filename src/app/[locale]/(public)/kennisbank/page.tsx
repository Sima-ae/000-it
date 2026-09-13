import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { GlassCard } from "@/components/marketing/GlassCard";
import { KennisbankCategoryGrid } from "@/components/kennisbank/KennisbankCategoryGrid";
import { listArticles, listCategories } from "@/lib/kennisbank";
import { buildStaticPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const base = buildStaticPageMetadata(locale, "/kennisbank");
  if (locale === "nl" || locale === "en") return base;
  return {
    ...base,
    title: `${t("title")} — TripleZero iT Hosting`,
    description: t("subtitle"),
  };
}

export default async function KennisbankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let total = 0;
  try {
    categories = await listCategories({ locale });
    const articles = await listArticles({ locale });
    total = articles.length;
  } catch (error) {
    console.error("[kennisbank] unavailable during render", error);
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-linear-to-b from-primary/12 via-accent/5 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <Reveal>
          <header className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t("brandEyebrow")}
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                {categories.length} {t("categoriesLabel")}
              </span>
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                {total} {t("articlesLabel")}
              </span>
            </div>
          </header>
        </Reveal>

        <KennisbankCategoryGrid
          categories={categories}
          locale={locale}
          articlesLabel={t("articlesLabel")}
          searchPlaceholder={t("searchPlaceholder")}
        />

        <aside className="mt-12">
          <GlassCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {t("ctaTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t("ctaBody")}
              </p>
            </div>
            <Button asChild className="shrink-0 rounded-xl">
              <SoftLink href={`/${locale}/contact`}>{t("ctaButton")}</SoftLink>
            </Button>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
