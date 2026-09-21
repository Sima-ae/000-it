"use client";

import { useMemo, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import type { KennisbankCategoryView } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";

const accents = [
  "from-primary/30 via-primary/10 to-accent/20",
  "from-accent/30 via-muted/40 to-primary/15",
  "from-primary/20 via-accent/15 to-muted/50",
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
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat, i) => (
          <Reveal key={cat.id} delay={Math.min(i, 8) * 0.04}>
            <GlassCard className="group h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md">
              <SoftLink
                href={localizedHref(locale, `/kennisbank/${cat.slug}`)}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div
                  className={`h-2 w-full bg-linear-to-r ${accents[i % accents.length]}`}
                  aria-hidden
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-primary">
                      {cat.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {cat.articleCount}
                    </span>
                  </div>
                  {cat.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs font-medium text-muted-foreground">
                    {cat.articleCount} {articlesLabel} →
                  </p>
                </div>
              </SoftLink>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
