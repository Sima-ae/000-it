import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import {
  getArticleBySlug,
  getCategoryBySlug,
  listArticles,
} from "@/lib/kennisbank";
import { absoluteUrl, localePath } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ locale: string; category: string; slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const article = await getArticleBySlug(slug, { locale }).catch(() => null);
  if (!article) return {};
  const title =
    article.seoTitle ||
    `${article.title} | TripleZero iT Hosting Kennisbank`;
  const description = article.seoDescription || article.excerpt;
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(
        localePath(locale, `/kennisbank/${category}/${slug}`),
      ),
    },
  };
}

export default async function KennisbankArticlePage({ params }: Params) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";

  const cat = await getCategoryBySlug(category, { locale });
  const article = await getArticleBySlug(slug, { locale });
  if (!cat || !article) notFound();
  if (!article.categorySlugs.includes(category)) notFound();

  const related = (await listArticles({ locale, categorySlug: category }))
    .filter((a) => a.slug !== article.slug)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <nav className="mb-6 text-sm text-muted-foreground">
        <SoftLink href={`/${locale}/kennisbank`} className="hover:text-foreground">
          {isNl ? "Kennisbank" : "Knowledge base"}
        </SoftLink>
        <span className="mx-2">/</span>
        <SoftLink
          href={`/${locale}/kennisbank/${category}`}
          className="hover:text-foreground"
        >
          {cat.name}
        </SoftLink>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1">{article.title}</span>
      </nav>

      <article>
        <header className="mb-8 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{article.excerpt}</p>
          {article.categoryNames.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.categorySlugs.map((s, i) => (
                <SoftLink
                  key={s}
                  href={`/${locale}/kennisbank/${s}`}
                  className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {article.categoryNames[i]}
                </SoftLink>
              ))}
            </div>
          ) : null}
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />
      </article>

      {related.length ? (
        <aside className="mt-12 border-t border-border/70 pt-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {isNl ? "Gerelateerde artikelen" : "Related articles"}
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((item) => (
              <li key={item.id}>
                <SoftLink
                  href={`/${locale}/kennisbank/${category}/${item.slug}`}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {item.title}
                </SoftLink>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
