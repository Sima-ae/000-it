import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { GlassCard } from "@/components/marketing/GlassCard";
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
        className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-linear-to-b from-primary/12 via-accent/5 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <Reveal>
          <header className="mx-auto mb-10 grid max-w-5xl items-center gap-6 text-center lg:grid-cols-[1fr_auto] lg:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t("brandEyebrow")}
              </p>
              <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                {t("title")}
              </h1>
              <p className="mx-auto mt-4 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
                {t("subtitle")}
              </p>
            </div>
            <div className="relative mx-auto hidden h-40 w-44 overflow-hidden lg:block">
              <Image
                src={BRANDING_IMAGES.tabletMarketer}
                alt=""
                fill
                unoptimized
                sizes="176px"
                className="object-contain object-bottom"
              />
            </div>
          </header>
        </Reveal>

        <KennisbankCategoryGrid
          categories={categories}
          locale={locale}
          articlesLabel={t("articlesLabel")}
          searchPlaceholder={t("searchPlaceholder")}
        />

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {categories.length} {t("categoriesLabel")}
          </span>
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {total} {t("articlesLabel")}
          </span>
        </div>

        <aside className="mt-12">
          <GlassCard className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-center sm:text-left md:p-8">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-semibold tracking-tight text-primary">
                {t("ctaTitle")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("ctaBody")}
              </p>
            </div>
            <Button asChild className="shrink-0 rounded-xl">
              <SoftLink href={localizedHref(locale, "/contact")}>{t("ctaButton")}</SoftLink>
            </Button>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
