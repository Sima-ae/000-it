"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
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
    <div className="space-y-5">
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
        <p className="rounded-2xl border border-dashed border-border/70 px-5 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((article, i) => (
            <Reveal key={article.id} delay={Math.min(i, 10) * 0.03}>
              <li>
                <SoftLink
                  href={localizedHref(locale, `/kennisbank/${categorySlug}/${article.slug}`)}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <GlassCard className="group flex gap-4 overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md sm:gap-5">
                    <div
                      className="hidden w-1.5 shrink-0 bg-linear-to-b from-primary via-primary/60 to-accent sm:block"
                      aria-hidden
                    />
                    <div className="flex min-w-0 flex-1 items-start gap-4 p-4 sm:p-5">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-semibold text-primary"
                        aria-hidden
                      >
                        {article.title.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-base font-semibold tracking-tight text-primary md:text-lg">
                          {article.title}
                        </h2>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {article.excerpt}
                        </p>
                      </div>
                      <span
                        className="mt-1 hidden shrink-0 text-muted-foreground transition group-hover:text-primary sm:inline"
                        aria-hidden
                      >
                        →
                      </span>
                    </div>
                  </GlassCard>
                </SoftLink>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
