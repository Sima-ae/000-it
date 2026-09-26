import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { KennisbankCategoryGrid } from "@/components/kennisbank/KennisbankCategoryGrid";
import { listArticles, listCategories, topLevelCategories } from "@/lib/kennisbank";
import { BRANDING_IMAGES } from "@/lib/branding-images";
import {
  breadcrumbJsonLd,
  buildStaticPageMetadata,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const base = await buildStaticPageMetadata(locale, "/kennisbank");
  if (locale === "nl" || locale === "en") return base;
  return {
    ...base,
    title: `${t("title")} — TripleZero iT`,
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
    categories = topLevelCategories(await listCategories({ locale }));
    const articles = await listArticles({ locale });
    total = articles.length;
  } catch (error) {
    console.error("[kennisbank] unavailable during render", error);
  }

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "TripleZero iT", path: localizedHref(locale, "/") },
          {
            name: t("breadcrumb"),
            path: localizedHref(locale, "/kennisbank"),
          },
        ])}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-primary/10 via-accent/4 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <Reveal>
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {t("brandEyebrow")}
              </p>
              <h1 className="font-display mt-1.5 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                {t("subtitle")}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                {categories.length} {t("categoriesLabel")}
              </span>
              <span className="rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                {total} {t("articlesLabel")}
              </span>
              <div className="relative ml-1 hidden h-14 w-16 overflow-hidden lg:block">
                <Image
                  src={BRANDING_IMAGES.tabletMarketer}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </header>
        </Reveal>

        <KennisbankCategoryGrid
          categories={categories}
          locale={locale}
          articlesLabel={t("articlesLabel")}
          searchPlaceholder={t("searchPlaceholder")}
        />

        <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
          <span className="rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {categories.length} {t("categoriesLabel")}
          </span>
          <span className="rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {total} {t("articlesLabel")}
          </span>
        </div>

        <aside className="mt-8 rounded-2xl border border-border/60 bg-background/70 px-5 py-4 shadow-sm md:px-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 max-w-xl">
              <h2 className="font-display text-base font-semibold tracking-tight text-primary md:text-lg">
                {t("ctaTitle")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {t("ctaBody")}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 rounded-xl">
              <SoftLink href={localizedHref(locale, "/contact")}>{t("ctaButton")}</SoftLink>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
