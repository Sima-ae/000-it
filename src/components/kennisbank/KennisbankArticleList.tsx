"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import type { KennisbankArticleListItem } from "@/lib/kennisbank";

export function KennisbankArticleList({
  articles,
  locale,
  categorySlug,
  searchPlaceholder,
  emptyLabel,
}: {
  articles: KennisbankArticleListItem[];
  locale: string;
  categorySlug: string;
  searchPlaceholder: string;
  emptyLabel: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.excerpt.toLowerCase().includes(needle),
    );
  }, [articles, q]);

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </label>

      {!filtered.length ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/70">
          {filtered.map((article) => (
            <li key={article.id}>
              <SoftLink
                href={`/${locale}/kennisbank/${categorySlug}/${article.slug}`}
                className="block px-4 py-4 transition hover:bg-muted/40 sm:px-5"
              >
                <h2 className="font-medium tracking-tight text-foreground hover:text-primary">
                  {article.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>
              </SoftLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
