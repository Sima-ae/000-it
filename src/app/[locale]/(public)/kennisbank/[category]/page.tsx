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
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>

        <Reveal>
          <header className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
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
