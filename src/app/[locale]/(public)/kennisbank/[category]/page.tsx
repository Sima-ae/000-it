import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import { KennisbankArticleList } from "@/components/kennisbank/KennisbankArticleList";
import { KennisbankIllustration } from "@/components/kennisbank/KennisbankIllustration";
import { getCategoryBySlug, listArticles } from "@/lib/kennisbank";
import { absoluteUrl, hreflangAlternates, localePath } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { resolveKennisbankParams } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, category: rawCategory } = await params;
  await hydrateEntitySlugs(locale);
  const category = canonicalEntityKey(locale, "kb_category", rawCategory);
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const cat = await getCategoryBySlug(category, { locale }).catch(() => null);
  if (!cat) return {};
  const title = `${cat.name} — ${t("seoTitleSuffix")} | TripleZero iT`;
  const description =
    cat.description ||
    `${t("title")}: ${cat.name} · TripleZero iT`;
  const path = `/kennisbank/${category}`;
  const alts = hreflangAlternates(path);
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(localePath(locale, path)),
      languages: alts.languages,
    },
  };
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
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-88 bg-linear-to-b from-primary/10 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <nav className="mb-8 text-sm text-muted-foreground">
          <SoftLink
            href={localizedHref(locale, "/kennisbank")}
            className="transition hover:text-foreground"
          >
            {t("breadcrumb")}
          </SoftLink>
          {cat.parentSlug && cat.parentName ? (
            <>
              <span className="mx-2 opacity-50">/</span>
              <SoftLink
                href={localizedHref(locale, `/kennisbank/${cat.parentSlug}`)}
                className="transition hover:text-foreground"
              >
                {cat.parentName}
              </SoftLink>
            </>
          ) : null}
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>

        <Reveal>
          <header className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-4xl">
                {cat.name}
              </h1>
              {cat.description ? (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
              ) : null}
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {articles.length} {t("articlesInCategory")}
              </p>
            </div>
            <KennisbankIllustration
              categorySlug={category}
              categoryLabel={cat.name}
              footerLabel={t("illustrationFooter")}
              variant="mid"
              caption={t("categoryPickCaption")}
            />
          </header>
        </Reveal>

        {cat.children.length ? (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              {t("subcategoriesLabel")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.children.map((child) => (
                <SoftLink
                  key={child.id}
                  href={localizedHref(locale, `/kennisbank/${child.slug}`)}
                  className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-primary">{child.name}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {child.articleCount}
                    </span>
                  </div>
                  {child.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {child.description}
                    </p>
                  ) : null}
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
