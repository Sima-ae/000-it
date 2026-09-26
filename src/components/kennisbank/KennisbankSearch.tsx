"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import type { KennisbankCategoryView } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

type SearchArticle = {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  categoryName: string;
  confidence: number;
  inPreferred?: boolean;
};

type SearchCategory = {
  slug: string;
  name: string;
  description: string | null;
  articleCount: number;
};

type SearchResponse = {
  query: string;
  articles: SearchArticle[];
  categories: SearchCategory[];
};

const accents = [
  "from-primary/35 via-primary/12 to-accent/25",
  "from-accent/30 via-primary/10 to-primary/20",
  "from-primary/25 via-accent/15 to-muted/40",
];

function useDebouncedValue<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function KennisbankSearch({
  locale,
  categories,
  articlesLabel,
  searchPlaceholder,
  searchArticlesLabel,
  searchCategoriesLabel,
  searchEmptyLabel,
  searchLoadingLabel,
  searchInCategoryLabel,
  searchElsewhereLabel,
  preferCategorySlug,
  preferCategoryName,
  mode = "index",
  children,
}: {
  locale: string;
  categories: KennisbankCategoryView[];
  articlesLabel: string;
  searchPlaceholder: string;
  searchArticlesLabel: string;
  searchCategoriesLabel: string;
  searchEmptyLabel: string;
  searchLoadingLabel: string;
  searchInCategoryLabel: string;
  searchElsewhereLabel: string;
  preferCategorySlug?: string;
  preferCategoryName?: string;
  /** index = category grid when idle; category = render children when idle */
  mode?: "index" | "category";
  children?: React.ReactNode;
}) {
  const inputId = useId();
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q.trim(), 280);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const isSearching = debouncedQ.length >= 2;

  useEffect(() => {
    if (!isSearching) {
      setResult(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({
      q: debouncedQ,
      locale,
      limit: "28",
    });
    if (preferCategorySlug) params.set("category", preferCategorySlug);

    fetch(`/api/kennisbank/search?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`search ${res.status}`);
        return (await res.json()) as SearchResponse;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setResult({ query: debouncedQ, articles: [], categories: [] });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQ, isSearching, locale, preferCategorySlug]);

  const idleCategories = useMemo(() => categories, [categories]);

  const localArticles = result?.articles.filter((a) => a.inPreferred) ?? [];
  const otherArticles = result?.articles.filter((a) => !a.inPreferred) ?? [];
  const showSplit =
    Boolean(preferCategorySlug) &&
    localArticles.length > 0 &&
    otherArticles.length > 0;

  return (
    <div className="space-y-4">
      <label className="mx-auto block max-w-3xl" htmlFor={inputId}>
        <span className="sr-only">{searchPlaceholder}</span>
        <div className="relative">
          <input
            id={inputId}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm outline-none ring-primary/30 backdrop-blur focus:ring-2"
          />
          {loading ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
              {searchLoadingLabel}
            </span>
          ) : null}
        </div>
      </label>

      {!isSearching && mode === "index" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {idleCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={Math.min(i, 8) * 0.03}>
              <SoftLink
                href={localizedHref(locale, `/kennisbank/${cat.slug}`)}
                className="group block h-full overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div
                  className={`h-1 w-full bg-linear-to-r ${accents[i % accents.length]}`}
                  aria-hidden
                />
                <div className="flex h-full flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-accent md:text-base">
                      {cat.name}
                    </h2>
                    <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                      {cat.articleCount}
                    </span>
                  </div>
                  {cat.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                  ) : null}
                  <p className="mt-auto pt-3 text-[11px] font-medium text-muted-foreground transition group-hover:text-primary">
                    {cat.articleCount} {articlesLabel} →
                  </p>
                </div>
              </SoftLink>
            </Reveal>
          ))}
        </div>
      ) : null}

      {!isSearching && mode === "category" ? children : null}

      {isSearching ? (
        <div className="space-y-6" aria-live="polite">
          {!loading &&
          result &&
          !result.articles.length &&
          !result.categories.length ? (
            <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              {searchEmptyLabel}
            </p>
          ) : null}

          {result?.articles.length ? (
            <section className="space-y-3">
              {showSplit ? (
                <>
                  <ArticleGroup
                    title={searchInCategoryLabel.replace(
                      "{category}",
                      preferCategoryName || preferCategorySlug || "",
                    )}
                    articles={localArticles}
                    locale={locale}
                  />
                  <ArticleGroup
                    title={searchElsewhereLabel}
                    articles={otherArticles}
                    locale={locale}
                  />
                </>
              ) : (
                <ArticleGroup
                  title={
                    preferCategorySlug && localArticles.length
                      ? searchInCategoryLabel.replace(
                          "{category}",
                          preferCategoryName || preferCategorySlug,
                        )
                      : searchArticlesLabel
                  }
                  articles={result.articles}
                  locale={locale}
                />
              )}
            </section>
          ) : null}

          {mode === "index" && result?.categories.length ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {searchCategoriesLabel}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.categories.map((cat, i) => (
                  <SoftLink
                    key={cat.slug}
                    href={localizedHref(locale, `/kennisbank/${cat.slug}`)}
                    className="group block overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold text-accent">
                        {cat.name}
                      </h3>
                      <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                        {cat.articleCount}
                      </span>
                    </div>
                    {cat.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                        {cat.description}
                      </p>
                    ) : null}
                    <p
                      className={cn(
                        "mt-3 text-[11px] font-medium text-muted-foreground transition group-hover:text-primary",
                      )}
                    >
                      {cat.articleCount} {articlesLabel} →
                    </p>
                    <span className="sr-only">{i}</span>
                  </SoftLink>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ArticleGroup({
  title,
  articles,
  locale,
}: {
  title: string;
  articles: SearchArticle[];
  locale: string;
}) {
  if (!articles.length) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        {title}
        <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground">
          ({articles.length})
        </span>
      </h2>
      <ul className="grid gap-2">
        {articles.map((article) => (
          <li key={`${article.categorySlug}:${article.slug}`}>
            <SoftLink
              href={localizedHref(
                locale,
                `/kennisbank/${article.categorySlug}/${article.slug}`,
              )}
              prefetch={false}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background/75 px-3.5 py-3 shadow-sm transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold tracking-tight text-primary md:text-[0.95rem]">
                  {article.title}
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-accent/90">
                  {article.categoryName}
                </p>
                {article.excerpt ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>
                ) : null}
              </div>
              <span
                className="mt-1 hidden shrink-0 text-sm text-muted-foreground transition group-hover:text-primary sm:inline"
                aria-hidden
              >
                →
              </span>
            </SoftLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
