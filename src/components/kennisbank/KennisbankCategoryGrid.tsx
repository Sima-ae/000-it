"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import type { KennisbankCategoryView } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";

const accents = [
  "from-primary/35 via-primary/12 to-accent/25",
  "from-accent/30 via-primary/10 to-primary/20",
  "from-primary/25 via-accent/15 to-muted/40",
];

export function KennisbankCategoryGrid({
  categories,
  locale,
  articlesLabel,
  searchPlaceholder,
}: {
  categories: KennisbankCategoryView[];
  locale: string;
  articlesLabel: string;
  searchPlaceholder: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((c) => {
      const inParent =
        c.name.toLowerCase().includes(needle) ||
        (c.description || "").toLowerCase().includes(needle);
      const inChild = c.children.some(
        (ch) =>
          ch.name.toLowerCase().includes(needle) ||
          (ch.description || "").toLowerCase().includes(needle),
      );
      return inParent || inChild;
    });
  }, [categories, q]);

  return (
    <div className="space-y-4">
      <label className="mx-auto block max-w-3xl">
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm outline-none ring-primary/30 backdrop-blur focus:ring-2"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat, i) => (
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
    </div>
  );
}
