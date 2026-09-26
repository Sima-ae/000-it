"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import type { KennisbankArticleListItem } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";

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
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm outline-none ring-primary/30 backdrop-blur focus:ring-2"
        />
      </label>

      {!filtered.length ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((article, i) => (
            <Reveal key={article.id} delay={Math.min(i, 10) * 0.02}>
              <li>
                <SoftLink
                  href={localizedHref(locale, `/kennisbank/${categorySlug}/${article.slug}`)}
                  prefetch={false}
                  className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background/75 px-3.5 py-3 shadow-sm transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:gap-3.5 sm:px-4"
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-semibold text-primary"
                    aria-hidden
                  >
                    {article.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-sm font-semibold tracking-tight text-primary md:text-[0.95rem]">
                      {article.title}
                    </h2>
                    <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground sm:line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <span
                    className="mt-1 hidden shrink-0 text-sm text-muted-foreground transition group-hover:text-primary sm:inline"
                    aria-hidden
                  >
                    →
                  </span>
                </SoftLink>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
