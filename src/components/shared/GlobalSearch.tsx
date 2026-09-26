"use client";

import {
  Search,
  X,
  FileText,
  Briefcase,
  BookOpen,
  Newspaper,
  HelpCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import {
  siteSearchHasResults,
  type SiteSearchHit,
  type SiteSearchKind,
  type SiteSearchResult,
} from "@/lib/site-search-types";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<SiteSearchKind, typeof Search> = {
  page: FileText,
  service: Briefcase,
  kennisbank: BookOpen,
  news: Newspaper,
  faq: HelpCircle,
};

function useDebouncedValue<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function emptyResult(query = ""): SiteSearchResult {
  return {
    query,
    pages: [],
    services: [],
    kennisbank: [],
    news: [],
    faq: [],
  };
}

export function GlobalSearchButton() {
  const t = useTranslations("globalSearch");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-xl"
        aria-label={t("open")}
        title={t("open")}
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" aria-hidden />
      </Button>
      {open ? <GlobalSearchOverlay onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function GlobalSearchOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations("globalSearch");
  const locale = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [immediateQ, setImmediateQ] = useState<string | null>(null);
  const debouncedQ = useDebouncedValue(q.trim(), 260);
  const activeQ = (immediateQ ?? debouncedQ).trim();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SiteSearchResult>(emptyResult());

  const isSearching = activeQ.length >= 2;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Clear forced-enter query once debounce catches up.
    if (immediateQ !== null && debouncedQ === immediateQ) {
      setImmediateQ(null);
    }
  }, [debouncedQ, immediateQ]);

  useEffect(() => {
    if (!mounted) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isSearching) {
      setResult(emptyResult(activeQ));
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ q: activeQ, locale });
    fetch(`/api/search?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`search ${res.status}`);
        return (await res.json()) as SiteSearchResult;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (!controller.signal.aborted) setResult(emptyResult(activeQ));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeQ, isSearching, locale]);

  const closeAndNavigate = useCallback(() => {
    onClose();
  }, [onClose]);

  const runImmediateSearch = useCallback(() => {
    const next = q.trim();
    if (next.length >= 2) setImmediateQ(next);
  }, [q]);

  const sections: Array<{
    key: keyof Pick<
      SiteSearchResult,
      "pages" | "services" | "kennisbank" | "news" | "faq"
    >;
    kind: SiteSearchKind;
    label: string;
  }> = [
    { key: "pages", kind: "page", label: t("sectionPages") },
    { key: "services", kind: "service", label: t("sectionServices") },
    { key: "kennisbank", kind: "kennisbank", label: t("sectionKennisbank") },
    { key: "news", kind: "news", label: t("sectionNews") },
    { key: "faq", kind: "faq", label: t("sectionFaq") },
  ];

  const hasResults = siteSearchHasResults(result);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-10050 flex items-center justify-center px-4 py-8 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 bg-background/70 backdrop-blur-xl dark:bg-background/80"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[min(78vh,42rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
        <div className="shrink-0 border-b border-border/70 px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={q}
                onChange={(e) => {
                  setImmediateQ(null);
                  setQ(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runImmediateSearch();
                  }
                }}
                placeholder={t("placeholder")}
                autoComplete="off"
                className="w-full rounded-xl border border-border/70 bg-muted/30 py-3 pl-11 pr-4 text-base outline-none ring-primary/30 focus:ring-2 md:text-[1.05rem]"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-11 w-11 shrink-0 rounded-xl"
              aria-label={t("close")}
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 px-1 text-xs text-muted-foreground">{t("hint")}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
          <div className="space-y-6">
            {!isSearching ? (
              <p className="px-1 py-8 text-center text-sm text-muted-foreground">
                {t("idle")}
              </p>
            ) : null}

            {isSearching && loading && !hasResults ? (
              <p className="px-1 py-8 text-center text-sm text-muted-foreground">
                {t("loading")}
              </p>
            ) : null}

            {isSearching && !loading && !hasResults ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : null}

            {isSearching
              ? sections.map((section) => {
                  const items = result[section.key];
                  if (!items.length) return null;
                  return (
                    <ResultSection
                      key={section.key}
                      kind={section.kind}
                      label={section.label}
                      items={items}
                      onNavigate={closeAndNavigate}
                    />
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ResultSection({
  kind,
  label,
  items,
  onNavigate,
}: {
  kind: SiteSearchKind;
  label: string;
  items: SiteSearchHit[];
  onNavigate: () => void;
}) {
  const Icon = KIND_ICON[kind];
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          {label}
          <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground">
            ({items.length})
          </span>
        </h2>
      </div>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`}>
            <SoftLink
              href={item.href}
              prefetch={false}
              onClick={onNavigate}
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border/60 bg-background px-3.5 py-3 shadow-sm transition",
                "hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold tracking-tight text-foreground">
                  {item.title}
                </p>
                {item.meta ? (
                  <p className="mt-0.5 text-[11px] font-medium text-primary/90">
                    {item.meta}
                  </p>
                ) : null}
                {item.excerpt ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.excerpt}
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
    </section>
  );
}
