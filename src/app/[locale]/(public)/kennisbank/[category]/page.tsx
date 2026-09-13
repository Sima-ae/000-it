import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { KennisbankArticleList } from "@/components/kennisbank/KennisbankArticleList";
import {
  getCategoryBySlug,
  listArticles,
  listCategories,
} from "@/lib/kennisbank";
import { absoluteUrl, localePath } from "@/lib/seo";

type Params = { params: Promise<{ locale: string; category: string }> };

export async function generateStaticParams() {
  try {
    const cats = await listCategories({ locale: "nl" });
    return cats.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = await getCategoryBySlug(category, { locale });
  if (!cat) return {};
  const title =
    locale === "nl"
      ? `${cat.name} — Kennisbank | TripleZero iT Hosting`
      : `${cat.name} — Knowledge base | TripleZero iT Hosting`;
  const description =
    cat.description ||
    (locale === "nl"
      ? `Artikelen over ${cat.name} in de TripleZero iT Hosting kennisbank.`
      : `Articles about ${cat.name} in the TripleZero iT Hosting knowledge base.`);
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(localePath(locale, `/kennisbank/${category}`)),
    },
  };
}

export default async function KennisbankCategoryPage({ params }: Params) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";
  const cat = await getCategoryBySlug(category, { locale });
  if (!cat) notFound();

  const articles = await listArticles({ locale, categorySlug: category });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <nav className="mb-6 text-sm text-muted-foreground">
        <SoftLink href={`/${locale}/kennisbank`} className="hover:text-foreground">
          {isNl ? "Kennisbank" : "Knowledge base"}
        </SoftLink>
        <span className="mx-2">/</span>
        <span className="text-foreground">{cat.name}</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {cat.name}
        </h1>
        {cat.description ? (
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {cat.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-xs text-muted-foreground">
          {articles.length} {isNl ? "artikelen" : "articles"}
        </p>
      </header>

      <KennisbankArticleList
        articles={articles}
        locale={locale}
        categorySlug={category}
        searchPlaceholder={
          isNl ? "Zoeken in deze categorie…" : "Search in this category…"
        }
        emptyLabel={isNl ? "Geen artikelen gevonden." : "No articles found."}
      />
    </div>
  );
}
