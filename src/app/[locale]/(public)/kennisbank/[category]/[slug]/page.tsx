import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { KennisbankArticleBody } from "@/components/kennisbank/KennisbankArticleBody";
import {
  getArticleBySlug,
  getCategoryBySlug,
  listArticles,
} from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";
import { absoluteUrl, hreflangAlternates, localePath } from "@/lib/seo";
import { resolveKennisbankParams } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ locale: string; category: string; slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, category: rawCategory, slug: rawSlug } = await params;
  await hydrateEntitySlugs(locale);
  const category = canonicalEntityKey(locale, "kb_category", rawCategory);
  const slug = canonicalEntityKey(locale, "kb_article", rawSlug);
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const article = await getArticleBySlug(slug, { locale }).catch(() => null);
  if (!article) return {};
  const title =
    article.seoTitle ||
    `${article.title} | TripleZero iT ${t("seoTitleSuffix")}`;
  const description = article.seoDescription || article.excerpt;
  const path = `/kennisbank/${category}/${slug}`;
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

function extractToc(html: string): { id: string; text: string }[] {
  const items: { id: string; text: string }[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    items.push({ id: `kb-s-${i++}`, text });
  }
  return items;
}

function injectHeadingIds(html: string): string {
  let i = 0;
  return html.replace(/<h2([^>]*)>/gi, (_full, attrs: string) => {
    const id = `kb-s-${i++}`;
    if (/\sid=/.test(attrs)) return `<h2${attrs}>`;
    return `<h2${attrs} id="${id}">`;
  });
}

export default async function KennisbankArticlePage({ params }: Params) {
  const { locale, category: rawCategory, slug: rawSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kennisbank" });
  const { categoryKey: category, articleKey: slug } =
    await resolveKennisbankParams({
      locale,
      categoryParam: rawCategory,
      articleParam: rawSlug,
    });
  if (!slug) notFound();

  const cat = await getCategoryBySlug(category, { locale });
  const article = await getArticleBySlug(slug, { locale });
  if (!cat || !article) notFound();
  if (!article.categorySlugs.includes(category)) notFound();

  const related = (await listArticles({ locale, categorySlug: category }))
    .filter((a) => a.slug !== article.slug)
    .slice(0, 6);

  const bodyWithIds = injectHeadingIds(article.bodyHtml);
  const toc = extractToc(bodyWithIds);

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-primary/10 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
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
          <SoftLink
            href={localizedHref(locale, `/kennisbank/${category}`)}
            className="transition hover:text-foreground"
          >
            {cat.name}
          </SoftLink>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <article>
            <Reveal>
              <header className="mb-8 rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-sm md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {cat.name}
                </p>
                <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
                  {article.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                {article.categoryNames.length > 1 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {article.categorySlugs.map((s, i) => (
                      <SoftLink
                        key={s}
                        href={localizedHref(locale, `/kennisbank/${s}`)}
                        className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                      >
                        {article.categoryNames[i]}
                      </SoftLink>
                    ))}
                  </div>
                ) : null}
              </header>
            </Reveal>

            <GlassCard interactive={false} className="p-6 md:p-9">
              <KennisbankArticleBody
                html={bodyWithIds}
                categorySlug={category}
                categoryLabel={cat.name}
                footerLabel={t("illustrationFooter")}
                heroCaption={t("heroCaption")}
                midCaption={t("midCaption")}
              />
            </GlassCard>
          </article>

          <aside className="hidden lg:sticky lg:top-28 lg:block">
            {toc.length ? (
              <GlassCard className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("contents")}
                </p>
                <ul className="mt-3 space-y-2">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm leading-snug text-muted-foreground transition hover:text-primary"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ) : null}
          </aside>
        </div>

        {related.length ? (
          <aside className="mt-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">
              {t("relatedTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("relatedSubtitle")}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <SoftLink
                    href={localizedHref(locale, `/kennisbank/${category}/${item.slug}`)}
                    prefetch={false}
                    className="block h-full"
                  >
                    <GlassCard className="group h-full p-5 transition hover:border-primary/40 hover:shadow-md">
                      <h3 className="font-display text-base font-semibold tracking-tight text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.excerpt}
                      </p>
                    </GlassCard>
                  </SoftLink>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
