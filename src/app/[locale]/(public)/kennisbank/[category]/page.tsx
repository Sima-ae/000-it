import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { KennisbankArticleList } from "@/components/kennisbank/KennisbankArticleList";
import { KennisbankIllustration } from "@/components/kennisbank/KennisbankIllustration";
import { getCategoryBySlug, listArticles } from "@/lib/kennisbank";
import { brandingImageForKennisbank } from "@/lib/branding-images";
import {
  breadcrumbJsonLd,
  buildKennisbankCategoryMetadata,
  localePath,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { resolveKennisbankParams } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateAllEntitySlugs, hydrateEntitySlugs } from "@/lib/entity-slugs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, category: rawCategory } = await params;
  await hydrateEntitySlugs(locale);
  await hydrateAllEntitySlugs();
  const category = canonicalEntityKey(locale, "kb_category", rawCategory);
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const cat = await getCategoryBySlug(category, { locale }).catch(() => null);
  if (!cat) return {};
  return buildKennisbankCategoryMetadata({
    locale,
    categorySlug: category,
    name: cat.name,
    description: cat.description || "",
    image: brandingImageForKennisbank(category),
    titleSuffix: t("seoTitleSuffix"),
  });
}

export default async function KennisbankCategoryPage({ params }: Params) {
  const { locale, category: rawCategory } = await params;
  setRequestLocale(locale);
  const { categoryKey: category } = await resolveKennisbankParams({
    locale,
    categoryParam: rawCategory,
  });
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const cat = await getCategoryBySlug(category, { locale });
  if (!cat) notFound();

  const articles = await listArticles({ locale, categorySlug: category });

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "TripleZero iT", path: localizedHref(locale, "/") },
          { name: t("breadcrumb"), path: localizedHref(locale, "/kennisbank") },
          {
            name: cat.name,
            path: localePath(locale, `/kennisbank/${category}`),
          },
        ])}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-primary/8 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <nav className="mb-5 text-xs text-muted-foreground md:text-sm">
          <SoftLink
            href={localizedHref(locale, "/kennisbank")}
            className="transition hover:text-foreground"
          >
            {t("breadcrumb")}
          </SoftLink>
          {cat.parentSlug && cat.parentName ? (
            <>
              <span className="mx-1.5 opacity-40">/</span>
              <SoftLink
                href={localizedHref(locale, `/kennisbank/${cat.parentSlug}`)}
                className="transition hover:text-foreground"
              >
                {cat.parentName}
              </SoftLink>
            </>
          ) : null}
          <span className="mx-1.5 opacity-40">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>

        <Reveal>
          <header className="mb-6 overflow-hidden rounded-2xl border border-border/60 bg-background/75 shadow-sm">
            <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.65fr)]">
              <div className="flex flex-col justify-center px-5 py-5 md:px-6 md:py-6">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-accent md:text-3xl">
                  {cat.name}
                </h1>
                {cat.description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                ) : null}
                <p className="mt-3 inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                  {articles.length} {t("articlesInCategory")}
                </p>
              </div>
              <div className="border-t border-border/50 md:border-t-0 md:border-l md:border-border/50">
                <KennisbankIllustration
                  categorySlug={category}
                  categoryLabel={cat.name}
                  footerLabel={t("illustrationFooter")}
                  variant="compact"
                />
              </div>
            </div>
          </header>
        </Reveal>

        {cat.children.length ? (
          <section className="mb-6">
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {t("subcategoriesLabel")}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cat.children.map((child) => (
                <SoftLink
                  key={child.id}
                  href={localizedHref(locale, `/kennisbank/${child.slug}`)}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3.5 py-2.5 transition hover:border-primary/35 hover:bg-background"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-accent">
                      {child.name}
                    </p>
                    {child.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {child.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                    {child.articleCount}
                  </span>
                </SoftLink>
              ))}
            </div>
          </section>
        ) : null}

        <KennisbankArticleList
          articles={articles}
          locale={locale}
          categorySlug={category}
          searchPlaceholder={t("searchCategoryPlaceholder")}
          emptyLabel={t("emptyArticles")}
        />
      </div>
    </div>
  );
}
