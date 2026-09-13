"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import type { KennisbankCategoryView } from "@/lib/kennisbank";

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
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        (c.description || "").toLowerCase().includes(needle),
    );
  }, [categories, q]);

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat) => (
          <SoftLink
            key={cat.id}
            href={`/${locale}/kennisbank/${cat.slug}`}
            className="group rounded-2xl border border-border/70 bg-muted/20 p-5 transition hover:border-primary/40 hover:bg-muted/40"
          >
            <h2 className="font-display text-lg font-semibold tracking-tight group-hover:text-primary">
              {cat.name}
            </h2>
            {cat.description ? (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {cat.description}
              </p>
            ) : null}
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {cat.articleCount} {articlesLabel}
            </p>
          </SoftLink>
        ))}
      </div>
    </div>
  );
}
