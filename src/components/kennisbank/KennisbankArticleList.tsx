"use client";

import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import type { KennisbankArticleListItem } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";

/** Idle (no search) article list for a category page. */
export function KennisbankArticleList({
  articles,
  locale,
  categorySlug,
  emptyLabel,
}: {
  articles: KennisbankArticleListItem[];
  locale: string;
  categorySlug: string;
  emptyLabel: string;
}) {
  if (!articles.length) {
    return (
      <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {articles.map((article, i) => (
        <Reveal key={article.id} delay={Math.min(i, 10) * 0.02}>
          <li>
            <SoftLink
              href={localizedHref(
                locale,
                `/kennisbank/${categorySlug}/${article.slug}`,
              )}
              prefetch={false}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background/75 px-3.5 py-3 shadow-sm transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:gap-3.5 sm:px-4"
            >
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
  );
}
