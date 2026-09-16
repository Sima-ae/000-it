"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import type { FaqCategory, FaqItem } from "@/content/faq";
import { cn } from "@/lib/utils";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function FaqCategories({
  categories,
  highlightFaqId,
  highlightCategoryId,
}: {
  categories: FaqCategory[];
  highlightFaqId?: string | null;
  highlightCategoryId?: string | null;
}) {
  const t = useTranslations("faqPage");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("all");
  const [openItem, setOpenItem] = useState<string>("");

  useEffect(() => {
    if (!highlightFaqId) return;
    if (highlightCategoryId) setActiveId(highlightCategoryId);
    setOpenItem(highlightFaqId);
    const el = document.getElementById(`faq-item-${highlightFaqId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightFaqId, highlightCategoryId]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return categories
      .map((category) => {
        const items = category.items.filter((item) => {
          if (activeId !== "all" && category.id !== activeId) return false;
          if (!q) return true;
          return (
            normalize(item.question).includes(q) ||
            normalize(item.answer).includes(q) ||
            normalize(category.title).includes(q)
          );
        });
        return { ...category, items };
      })
      .filter((category) => category.items.length > 0);
  }, [categories, query, activeId]);

  const visibleCount = filtered.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="space-y-5">
      <div className="sticky top-[calc(var(--nav-offset)+0.5rem)] z-20 space-y-3 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-sm backdrop-blur-md md:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 rounded-xl border-border/70 bg-muted/30 pl-10 pr-10"
            aria-label={t("searchAria")}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveId("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              activeId === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {t("all")}
            <span className="ml-1 opacity-70">
              ({categories.reduce((s, c) => s + c.items.length, 0)})
            </span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition",
                activeId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {category.title}
              <span className="ml-1 opacity-70">({category.items.length})</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {visibleCount} {visibleCount === 1 ? t("result") : t("results")}
          {query ? ` ${t("forQuery")} “${query}”` : null}
          {highlightFaqId ? ` · ${t("matchedHint")}` : null}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 px-4 py-10 text-center">
          <p className="font-medium text-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((category) => (
            <section key={category.id} id={`faq-${category.id}`} className="scroll-mt-36">
              <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
                <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                  {category.title}
                </h2>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {category.items.length} Q&A
                </span>
              </div>
              <CategoryAccordion
                items={category.items}
                openItem={
                  highlightCategoryId === category.id || activeId === category.id || activeId === "all"
                    ? openItem
                    : ""
                }
                onOpenChange={setOpenItem}
                highlightFaqId={highlightFaqId}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryAccordion({
  items,
  openItem,
  onOpenChange,
  highlightFaqId,
}: {
  items: FaqItem[];
  openItem: string;
  onOpenChange: (v: string) => void;
  highlightFaqId?: string | null;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      value={openItem || undefined}
      onValueChange={(v) => onOpenChange(v || "")}
      className="w-full"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          id={`faq-item-${item.id}`}
          className={cn(
            "border-border/70 px-0 scroll-mt-40",
            highlightFaqId === item.id && "rounded-xl bg-primary/5 px-2 ring-1 ring-primary/30",
          )}
        >
          <AccordionTrigger className="py-3 text-left text-sm font-medium hover:no-underline md:text-[15px]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-3 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** @deprecated use FaqCategories */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <CategoryAccordion
      items={items}
      openItem=""
      onOpenChange={() => undefined}
    />
  );
}
