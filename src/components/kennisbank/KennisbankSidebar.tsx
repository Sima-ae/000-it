"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import type { KennisbankCategoryView } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

export type KennisbankPopularLink = {
  label: string;
  href: string;
};

export type KennisbankTopicLabel = {
  label: string;
  href: string;
};

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ms-2 inline-flex min-w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      {count}
    </span>
  );
}

function CategoryRow({
  locale,
  category,
  activeSlug,
  depth = 0,
  expandLabel,
  collapseLabel,
}: {
  locale: string;
  category: KennisbankCategoryView;
  activeSlug?: string | null;
  depth?: number;
  expandLabel: string;
  collapseLabel: string;
}) {
  const hasChildren = category.children.length > 0;
  const isActive =
    category.slug === activeSlug ||
    category.children.some(
      (c) =>
        c.slug === activeSlug ||
        c.children.some((gc) => gc.slug === activeSlug),
    );
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const href = localizedHref(locale, `/kennisbank/${category.slug}`);
  const activeExact = category.slug === activeSlug;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg transition",
          activeExact
            ? "bg-primary/8 text-primary"
            : "hover:bg-muted/50 text-foreground",
        )}
        style={{ paddingInlineStart: depth ? `${depth * 0.65}rem` : undefined }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? collapseLabel : expandLabel}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-background hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                open ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="inline-block w-7 shrink-0" aria-hidden />
        )}
        <SoftLink
          href={href}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5 pe-2 text-sm leading-snug transition",
            activeExact ? "font-semibold" : "font-medium",
          )}
        >
          <span className="truncate">{category.name}</span>
          <CountBadge count={category.articleCount} />
        </SoftLink>
      </div>
      {hasChildren && open ? (
        <ul className="mt-0.5 space-y-0.5 border-s border-border/50 ms-3.5 ps-1">
          {category.children.map((child) => (
            <CategoryRow
              key={child.id}
              locale={locale}
              category={child}
              activeSlug={activeSlug}
              depth={depth + 1}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function KennisbankSidebar({
  locale,
  categories,
  activeSlug,
  browseLabel,
  labelsTitle,
  popularTitle,
  popularLinks = [],
  topicLabels = [],
  showFiltersLabel,
  hideFiltersLabel,
  expandLabel,
  collapseLabel,
  className,
}: {
  locale: string;
  categories: KennisbankCategoryView[];
  activeSlug?: string | null;
  browseLabel: string;
  labelsTitle: string;
  popularTitle: string;
  popularLinks?: KennisbankPopularLink[];
  topicLabels?: KennisbankTopicLabel[];
  showFiltersLabel: string;
  hideFiltersLabel: string;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const tops = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const nav = (
    <nav aria-label={browseLabel} className="space-y-5">
      {popularLinks.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {popularTitle}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {popularLinks.map((link) => (
              <li key={link.href + link.label}>
                <SoftLink
                  href={link.href}
                  className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {link.label}
                </SoftLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {browseLabel}
        </p>
        <ul className="space-y-0.5">
          {tops.map((cat) => (
            <CategoryRow
              key={cat.id}
              locale={locale}
              category={cat}
              activeSlug={activeSlug}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
            />
          ))}
        </ul>
      </div>

      {topicLabels.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {labelsTitle}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {topicLabels.map((tag) => (
              <li key={tag.href + tag.label}>
                <SoftLink
                  href={tag.href}
                  className="inline-flex rounded-md bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  {tag.label}
                </SoftLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );

  return (
    <aside className={cn("kennisbank-sidebar", className)}>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/90 px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm"
          aria-expanded={mobileOpen}
        >
          <span>{mobileOpen ? hideFiltersLabel : showFiltersLabel}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_92%,var(--muted)_8%)] p-3.5 shadow-sm">
            {nav}
          </div>
        ) : null}
      </div>

      <div className="hidden rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_92%,var(--muted)_8%)] p-4 shadow-sm lg:block lg:sticky lg:top-24">
        {nav}
      </div>
    </aside>
  );
}
