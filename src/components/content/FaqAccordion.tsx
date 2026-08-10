"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
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

export function FaqCategories({ categories }: { categories: FaqCategory[] }) {
  const locale = useLocale();
  const isNl = locale === "nl";
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("all");

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
            placeholder={isNl ? "Zoek in vragen en antwoorden…" : "Search questions and answers…"}
            className="h-11 rounded-xl border-border/70 bg-muted/30 pl-10 pr-10"
            aria-label={isNl ? "Zoeken in FAQ" : "Search FAQ"}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={isNl ? "Wis zoekopdracht" : "Clear search"}
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
            {isNl ? "Alles" : "All"}
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
          {visibleCount}{" "}
          {isNl
            ? visibleCount === 1
              ? "resultaat"
              : "resultaten"
            : visibleCount === 1
              ? "result"
              : "results"}
          {query ? (isNl ? ` voor “${query}”` : ` for “${query}”`) : null}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 px-4 py-10 text-center">
          <p className="font-medium text-foreground">
            {isNl ? "Geen resultaten" : "No results"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isNl
              ? "Probeer een andere zoekterm of kies een andere categorie."
              : "Try another search term or pick a different category."}
          </p>
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
              <CategoryAccordion items={category.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border/70 px-0"
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
  return <CategoryAccordion items={items} />;
}
