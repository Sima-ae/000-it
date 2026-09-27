"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Globe2,
  Lock,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { whoisLookupUrl } from "@/lib/domains/whois";
import {
  sortByTldPopularity,
  compareTldsByPopularity,
} from "@/lib/domains/tld-order";
import {
  TLD_CATEGORY_ORDER,
  categorizeTld,
  isPremiumTld,
  type TldCategoryId,
} from "@/lib/domains/tld-categories";

type TldProduct = {
  tld: string;
  priceInCents: number;
  priceLabel: string;
  listPriceInCents?: number;
  listPriceLabel?: string;
  offerPriceInCents?: number | null;
  onOffer?: boolean;
  renewPriceInCents: number | null;
  renewPriceLabel: string | null;
};

type CheckResult = {
  domain: string;
  available: boolean;
  priceInCents: number | null;
  listPriceInCents?: number | null;
  onOffer?: boolean;
  renewPriceInCents: number | null;
  tld: string;
};

type CatalogTab = "popular" | "premium" | "all";

const POPULAR_COUNT = 36;
const CHECK_BATCH = 80;
const PAGE_SIZE = 20;

const searchSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9.-]{2,30})?$/i),
});

const registrantSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(190),
  phone: z.string().min(6).max(40),
  address1: z.string().min(2).max(120),
  city: z.string().min(1).max(80),
  stateProvince: z.string().max(80).optional(),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(2),
  organization: z.string().max(120).optional(),
});

type RegistrantForm = z.infer<typeof registrantSchema>;

function formatPrice(cents: number | null, locale: string) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : locale, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function DomainPriceDisplay({
  priceInCents,
  listPriceInCents,
  onOffer,
  locale,
  className,
  offerClassName,
}: {
  priceInCents: number | null;
  listPriceInCents?: number | null;
  onOffer?: boolean;
  locale: string;
  className?: string;
  offerClassName?: string;
}) {
  const price = formatPrice(priceInCents, locale);
  if (!price) return null;
  const showOffer =
    Boolean(onOffer) &&
    listPriceInCents != null &&
    priceInCents != null &&
    listPriceInCents > priceInCents;
  const listLabel = showOffer ? formatPrice(listPriceInCents, locale) : null;

  if (showOffer && listLabel) {
    return (
      <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
        <span className="text-muted-foreground line-through decoration-2 opacity-80">
          {listLabel}
        </span>
        <span className={cn("text-[1.05em] font-semibold", offerClassName)}>
          {price}
        </span>
      </span>
    );
  }

  return <span className={className}>{price}</span>;
}

export function DomainSearch() {
  const t = useTranslations("domainsPage");
  const locale = useLocale();
  const { data: session } = useSession();
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("popular");
  const [selectedTlds, setSelectedTlds] = useState<string[] | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tldQuery, setTldQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TldCategoryId | "all">(
    "all",
  );
  const [priceMinEur, setPriceMinEur] = useState("");
  const [priceMaxEur, setPriceMaxEur] = useState("");
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [availableFirst, setAvailableFirst] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    { popular: true },
  );
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [preferredTld, setPreferredTld] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [checkoutDomain, setCheckoutDomain] = useState<CheckResult | null>(
    null,
  );
  const [checkProgress, setCheckProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data: productsRaw = [] } = useQuery({
    queryKey: ["domain-products"],
    queryFn: async () => {
      const res = await fetch("/api/domains/products");
      if (!res.ok) throw new Error("products");
      return (await res.json()) as TldProduct[];
    },
  });

  const products = useMemo(
    () => sortByTldPopularity(productsRaw),
    [productsRaw],
  );

  const priceMinCents = Math.max(
    0,
    Math.round((Number(priceMinEur.replace(",", ".")) || 0) * 100),
  );
  const priceMaxCents = (() => {
    const n = Number(priceMaxEur.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
  })();

  const pricedProducts = useMemo(() => {
    return products.filter((p) => {
      if (priceMinCents > 0 && p.priceInCents < priceMinCents) return false;
      if (priceMaxCents != null && p.priceInCents > priceMaxCents) return false;
      return true;
    });
  }, [products, priceMinCents, priceMaxCents]);

  const popularTlds = useMemo(
    () => pricedProducts.slice(0, POPULAR_COUNT).map((p) => p.tld),
    [pricedProducts],
  );

  const premiumTlds = useMemo(
    () =>
      pricedProducts
        .filter((p) => isPremiumTld(p.priceInCents))
        .map((p) => p.tld),
    [pricedProducts],
  );

  const activeTlds = useMemo(() => {
    if (selectedTlds) return selectedTlds;
    if (catalogTab === "premium") return premiumTlds;
    if (catalogTab === "all") return pricedProducts.map((p) => p.tld);
    return popularTlds;
  }, [selectedTlds, catalogTab, premiumTlds, pricedProducts, popularTlds]);

  const filteredPickerProducts = useMemo(() => {
    const q = tldQuery.trim().toLowerCase().replace(/^\./, "");
    return pricedProducts.filter((p) => {
      if (q && !p.tld.includes(q)) return false;
      if (categoryFilter === "all") return true;
      if (categoryFilter === "premium") return isPremiumTld(p.priceInCents);
      if (categoryFilter === "popular") {
        return popularTlds.includes(p.tld) && !isPremiumTld(p.priceInCents);
      }
      return categorizeTld(p.tld) === categoryFilter;
    });
  }, [pricedProducts, tldQuery, categoryFilter, popularTlds]);

  const productsByCategory = useMemo(() => {
    const map = new Map<TldCategoryId, TldProduct[]>();
    for (const id of TLD_CATEGORY_ORDER) map.set(id, []);
    for (const p of filteredPickerProducts) {
      let cat: TldCategoryId;
      if (isPremiumTld(p.priceInCents)) cat = "premium";
      else if (popularTlds.includes(p.tld)) cat = "popular";
      else cat = categorizeTld(p.tld);
      map.get(cat)!.push(p);
    }
    return map;
  }, [filteredPickerProducts, popularTlds]);

  const searchForm = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  const registrantForm = useForm<RegistrantForm>({
    resolver: zodResolver(registrantSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "NL",
      organization: "",
    },
  });

  useEffect(() => {
    if (!session?.user) return;
    const email = session.user.email?.trim();
    if (email && !registrantForm.getValues("email")) {
      registrantForm.setValue("email", email);
    }
    const name = session.user.name?.trim();
    if (name && !registrantForm.getValues("firstName")) {
      const parts = name.split(/\s+/);
      registrantForm.setValue("firstName", parts[0] || "");
      if (parts.length > 1) {
        registrantForm.setValue("lastName", parts.slice(1).join(" "));
      }
    }
  }, [session, registrantForm]);

  const checkoutPriceLabel = useMemo(() => {
    if (!checkoutDomain) return null;
    return formatPrice(checkoutDomain.priceInCents, locale);
  }, [checkoutDomain, locale]);

  const checkoutListPriceLabel = useMemo(() => {
    if (
      !checkoutDomain?.onOffer ||
      checkoutDomain.listPriceInCents == null ||
      checkoutDomain.priceInCents == null ||
      checkoutDomain.listPriceInCents <= checkoutDomain.priceInCents
    ) {
      return null;
    }
    return formatPrice(checkoutDomain.listPriceInCents, locale);
  }, [checkoutDomain, locale]);

  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingMore, setIsSearchingMore] = useState(false);
  const searchAbortRef = useMemo(() => ({ id: 0 }), []);

  async function fetchCheck(
    query: string,
    tlds: string[],
  ): Promise<CheckResult[]> {
    const params = new URLSearchParams({
      domain: query,
      tlds: tlds.join(","),
    });
    const res = await fetch(`/api/domains/check?${params}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t("checkFailed"));
    return (data.results || []) as CheckResult[];
  }

  function sortResults(
    rows: CheckResult[],
    preferredTld: string | null,
  ): CheckResult[] {
    return [...rows].sort((a, b) => {
      if (preferredTld) {
        if (a.tld === preferredTld && b.tld !== preferredTld) return -1;
        if (b.tld === preferredTld && a.tld !== preferredTld) return 1;
      }
      if (availableFirst && a.available !== b.available) {
        return a.available ? -1 : 1;
      }
      return compareTldsByPopularity(a.tld, b.tld);
    });
  }

  async function runSearch(query: string, tldsOverride?: string[]) {
    const q = query.toLowerCase().trim();
    const preferred = q.includes(".")
      ? q.slice(q.lastIndexOf(".") + 1).toLowerCase()
      : null;
    setPreferredTld(preferred);
    setVisibleCount(PAGE_SIZE);

    const catalogTlds = products.map((p) => p.tld);
    let tlds = [...(tldsOverride ?? activeTlds)];
    if (
      preferred &&
      catalogTlds.includes(preferred) &&
      !tlds.includes(preferred)
    ) {
      tlds = [preferred, ...tlds];
    }
    tlds = [...new Set(tlds)];
    if (!tlds.length) {
      toast.error(t("checkFailed"));
      return;
    }

    const primaryTld =
      preferred && tlds.includes(preferred)
        ? preferred
        : [...tlds].sort(compareTldsByPopularity)[0]!;
    const rest = tlds
      .filter((tld) => tld !== primaryTld)
      .sort(compareTldsByPopularity);

    const runId = ++searchAbortRef.id;
    setIsSearching(true);
    setIsSearchingMore(false);
    setResults(null);
    setCheckProgress({ done: 0, total: tlds.length });

    const map = new Map<string, CheckResult>();

    try {
      const first = await fetchCheck(q, [primaryTld]);
      if (runId !== searchAbortRef.id) return;
      for (const row of first) map.set(row.domain, row);
      setResults(sortResults([...map.values()], preferred));
      setCheckProgress({ done: 1, total: tlds.length });
      setIsSearching(false);

      if (!rest.length) return;

      setIsSearchingMore(true);
      for (let i = 0; i < rest.length; i += CHECK_BATCH) {
        if (runId !== searchAbortRef.id) return;
        const batch = rest.slice(i, i + CHECK_BATCH);
        const more = await fetchCheck(q, batch);
        if (runId !== searchAbortRef.id) return;
        for (const row of more) map.set(row.domain, row);
        setResults(sortResults([...map.values()], preferred));
        setCheckProgress({
          done: Math.min(1 + i + batch.length, tlds.length),
          total: tlds.length,
        });
      }
    } catch (err) {
      if (runId !== searchAbortRef.id) return;
      toast.error(err instanceof Error ? err.message : t("checkFailed"));
    } finally {
      if (runId === searchAbortRef.id) {
        setIsSearching(false);
        setIsSearchingMore(false);
        setCheckProgress(null);
      }
    }
  }

  const checkoutMutation = useMutation({
    mutationFn: async (input: {
      domain: string;
      registrant: RegistrantForm;
    }) => {
      const res = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: input.domain,
          years: 1,
          locale,
          registrant: {
            ...input.registrant,
            stateProvince: input.registrant.stateProvince || "NA",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("checkoutFailed"));
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : t("checkoutFailed")),
  });

  function tldsForTab(tab: CatalogTab): string[] {
    if (tab === "premium") return premiumTlds;
    if (tab === "all") return pricedProducts.map((p) => p.tld);
    return popularTlds;
  }

  function setTab(tab: CatalogTab) {
    setCatalogTab(tab);
    setSelectedTlds(null);
    const q = searchForm.getValues("query")?.trim();
    if (!q) return;
    if (!searchSchema.safeParse({ query: q }).success) return;
    void runSearch(q, tldsForTab(tab));
  }

  function toggleTld(tld: string) {
    setSelectedTlds((prev) => {
      const base = prev ?? [...activeTlds];
      const next = base.includes(tld)
        ? base.filter((x) => x !== tld)
        : [...base, tld];
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedTlds(filteredPickerProducts.map((p) => p.tld));
  }

  function selectPopular() {
    setTab("popular");
  }

  function resetFilters() {
    setCatalogTab("popular");
    setSelectedTlds(null);
    setTldQuery("");
    setCategoryFilter("all");
    setPriceMinEur("");
    setPriceMaxEur("");
    setHideUnavailable(false);
    setAvailableFirst(true);
  }

  const displayedResults = useMemo(() => {
    if (!results) return null;
    let rows = [...results];
    if (hideUnavailable) rows = rows.filter((r) => r.available);
    rows.sort((a, b) => {
      if (preferredTld) {
        if (a.tld === preferredTld && b.tld !== preferredTld) return -1;
        if (b.tld === preferredTld && a.tld !== preferredTld) return 1;
      }
      if (availableFirst && a.available !== b.available) {
        return a.available ? -1 : 1;
      }
      return compareTldsByPopularity(a.tld, b.tld);
    });
    return rows;
  }, [results, hideUnavailable, availableFirst, preferredTld]);

  const visibleResults = useMemo(() => {
    if (!displayedResults) return null;
    return displayedResults.slice(0, visibleCount);
  }, [displayedResults, visibleCount]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !displayedResults) return;
    if (visibleCount >= displayedResults.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((n) =>
          Math.min(n + PAGE_SIZE, displayedResults.length),
        );
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayedResults, visibleCount]);

  const summaryParts = [
    t("filterTldCount", { count: activeTlds.length }),
    products.length
      ? t("filterCatalogCount", { count: products.length })
      : null,
    selectedTlds
      ? t("filterCustomSelection")
      : catalogTab === "premium"
        ? t("tabPremium")
        : catalogTab === "all"
          ? t("tabAll")
          : t("tabPopular"),
  ].filter(Boolean);

  function categoryLabel(id: TldCategoryId) {
    switch (id) {
      case "popular":
        return t("catPopular");
      case "premium":
        return t("catPremium");
      case "international":
        return t("catInternational");
      case "tech":
        return t("catTech");
      case "business":
        return t("catBusiness");
      case "media":
        return t("catMedia");
      default:
        return t("catOther");
    }
  }

  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={searchForm.handleSubmit((values) => {
          void runSearch(values.query);
        })}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <Input
            {...searchForm.register("query")}
            placeholder={t("placeholder")}
            className="h-12 rounded-2xl"
            autoComplete="off"
          />
          {searchForm.formState.errors.query ? (
            <p className="mt-1 text-sm text-destructive">{t("invalidFormat")}</p>
          ) : null}
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-2xl"
          disabled={isSearching || isSearchingMore}
        >
          {isSearching || isSearchingMore ? t("searching") : t("search")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-muted/15 px-3 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["popular", t("tabPopular")],
              ["premium", t("tabPremium")],
              ["all", t("tabAll")],
            ] as const
          ).map(([id, label]) => {
            const on = !selectedTlds && catalogTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  on
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {label}
                {id === "premium" ? (
                  <span className="ml-1 opacity-70">({premiumTlds.length})</span>
                ) : null}
                {id === "all" ? (
                  <span className="ml-1 opacity-70">({pricedProducts.length})</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            {summaryParts.join(" · ")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-xl"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("advanced")}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition",
                showAdvanced && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showAdvanced ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("priceRange")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      inputMode="decimal"
                      placeholder="€ 0"
                      value={priceMinEur}
                      onChange={(e) => setPriceMinEur(e.target.value)}
                      className="h-9 rounded-xl"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      inputMode="decimal"
                      placeholder="€ ∞"
                      value={priceMaxEur}
                      onChange={(e) => setPriceMaxEur(e.target.value)}
                      className="h-9 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("options")}
                  </p>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-[var(--accent)]"
                        checked={hideUnavailable}
                        onChange={(e) => setHideUnavailable(e.target.checked)}
                      />
                      {t("hideUnavailable")}
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-[var(--accent)]"
                        checked={availableFirst}
                        onChange={(e) => setAvailableFirst(e.target.checked)}
                      />
                      {t("availableFirst")}
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={selectPopular}
                  >
                    {t("usePopular")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={selectAllFiltered}
                  >
                    {t("selectAllFiltered")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={resetFilters}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("resetFilters")}
                  </Button>
                </div>
              </div>

              <div className="min-h-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[12rem] flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={tldQuery}
                      onChange={(e) => setTldQuery(e.target.value)}
                      placeholder={t("searchTlds", { count: products.length })}
                      className="h-9 rounded-xl pl-8"
                    />
                  </div>
                </div>

                <div className="mb-2 flex flex-wrap gap-1">
                  {(
                    [
                      "all",
                      ...TLD_CATEGORY_ORDER,
                    ] as const
                  ).map((id) => {
                    const on = categoryFilter === id;
                    const label =
                      id === "all" ? t("catAll") : categoryLabel(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCategoryFilter(id)}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] transition",
                          on
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted-foreground hover:border-accent/40",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-muted/10 p-2">
                  {TLD_CATEGORY_ORDER.map((catId) => {
                    const rows = productsByCategory.get(catId) || [];
                    if (!rows.length) return null;
                    const open = openCategories[catId] ?? catId === "popular";
                    return (
                      <div key={catId}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:bg-muted/40"
                          onClick={() =>
                            setOpenCategories((prev) => ({
                              ...prev,
                              [catId]: !open,
                            }))
                          }
                        >
                          <span>
                            {categoryLabel(catId)}{" "}
                            <span className="font-normal opacity-70">
                              ({rows.length})
                            </span>
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition",
                              open && "rotate-180",
                            )}
                          />
                        </button>
                        {open ? (
                          <div className="flex flex-wrap gap-1.5 px-1 pb-2 pt-1">
                            {rows.map((p) => {
                              const on = activeTlds.includes(p.tld);
                              return (
                                <button
                                  key={p.tld}
                                  type="button"
                                  onClick={() => toggleTld(p.tld)}
                                  className={cn(
                                    "rounded-full border px-2.5 py-1 text-[11px] transition",
                                    on
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background text-muted-foreground hover:border-primary/50",
                                  )}
                                >
                                  .{p.tld}
                                  <span className="ml-1 opacity-80">
                                    {p.onOffer && p.listPriceLabel ? (
                                      <>
                                        <span className="line-through opacity-70">
                                          {p.listPriceLabel}
                                        </span>{" "}
                                        <span className="font-semibold">
                                          {p.priceLabel}
                                        </span>
                                      </>
                                    ) : (
                                      p.priceLabel
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {!filteredPickerProducts.length ? (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                      {t("noTldsMatch")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!showAdvanced && products.length ? (
        <div className="grid w-full grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12">
          {(catalogTab === "premium"
            ? pricedProducts
                .filter((p) => isPremiumTld(p.priceInCents))
                .slice(0, 24)
            : catalogTab === "all"
              ? pricedProducts.slice(0, 24)
              : pricedProducts.slice(0, POPULAR_COUNT)
          ).map((p) => {
            const on = activeTlds.includes(p.tld);
            return (
              <button
                key={p.tld}
                type="button"
                onClick={() => toggleTld(p.tld)}
                title={`.${p.tld} · ${p.priceLabel}`}
                className={cn(
                  "w-full truncate rounded-full border px-1.5 py-1 text-center text-[10px] leading-tight transition sm:px-2 sm:text-[11px]",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                .{p.tld} ·{" "}
                {p.onOffer && p.listPriceLabel ? (
                  <>
                    <span className="line-through opacity-70">
                      {p.listPriceLabel}
                    </span>{" "}
                    <span className="font-semibold">{p.priceLabel}</span>
                  </>
                ) : (
                  p.priceLabel
                )}
              </button>
            );
          })}
          {(catalogTab === "all" && pricedProducts.length > 24) ||
          (catalogTab === "premium" && premiumTlds.length > 24) ? (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="w-full truncate rounded-full border border-dashed border-border px-1.5 py-1 text-center text-[10px] text-muted-foreground hover:border-accent hover:text-accent sm:px-2 sm:text-[11px]"
            >
              +
              {(catalogTab === "premium"
                ? premiumTlds.length
                : pricedProducts.length) - 24}{" "}
              {t("moreTlds")}
            </button>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {visibleResults && displayedResults ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                {t("showingCount", {
                  shown: visibleResults.length,
                  total: displayedResults.length,
                })}
                {checkProgress && isSearchingMore
                  ? ` · ${t("checkingProgress", {
                      done: checkProgress.done,
                      total: checkProgress.total,
                    })}`
                  : null}
              </p>
              {hideUnavailable ? (
                <p>{t("hidingUnavailableHint")}</p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleResults.map((row) => {
                const renew =
                  row.renewPriceInCents != null && row.renewPriceInCents > 0
                    ? formatPrice(row.renewPriceInCents, locale)
                    : products.find((p) => p.tld === row.tld)?.renewPriceLabel ||
                      null;
                const tone = row.available
                  ? "text-accent"
                  : "text-red-600 dark:text-red-400";
                const premium =
                  row.priceInCents != null && isPremiumTld(row.priceInCents);
                return (
                  <div
                    key={row.domain}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
                          {row.domain}
                        </p>
                        {premium ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {t("badgePremium")}
                          </span>
                        ) : null}
                      </div>
                      <p className={cn("text-sm font-medium", tone)}>
                        {row.available ? t("available") : t("unavailable")}
                        {row.priceInCents != null ? (
                          <span className={cn("ml-2", tone)}>
                            <DomainPriceDisplay
                              priceInCents={row.priceInCents}
                              listPriceInCents={row.listPriceInCents}
                              onOffer={row.onOffer}
                              locale={locale}
                              offerClassName="text-base"
                            />
                          </span>
                        ) : null}
                      </p>
                      {renew ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t("renewalPrice", { price: renew })}
                        </p>
                      ) : null}
                    </div>
                    {row.available ? (
                      <Button
                        variant="accent"
                        className="rounded-xl"
                        onClick={() => setCheckoutDomain(row)}
                      >
                        {t("order")}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="destructive"
                        className="rounded-xl"
                      >
                        <a
                          href={whoisLookupUrl(row.domain, row.tld)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("whois")}
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {visibleCount < displayedResults.length ? (
              <div
                ref={loadMoreRef}
                className="flex flex-col items-center gap-2 py-3"
              >
                <p className="text-xs text-muted-foreground animate-pulse">
                  {t("scrollForMore")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() =>
                    setVisibleCount((n) =>
                      Math.min(n + PAGE_SIZE, displayedResults.length),
                    )
                  }
                >
                  {t("loadMore")}
                </Button>
              </div>
            ) : null}
            {isSearchingMore ? (
              <p className="px-1 py-2 text-sm text-muted-foreground animate-pulse">
                {t("searchingMore")}
              </p>
            ) : null}
          </motion.div>
        ) : isSearching ? (
          <p className="text-sm text-muted-foreground animate-pulse">
            {t("searching")}
          </p>
        ) : null}
      </AnimatePresence>

      <Dialog
        open={Boolean(checkoutDomain)}
        onOpenChange={(open) => {
          if (!open) setCheckoutDomain(null);
        }}
      >
        <DialogContent className="w-[min(96vw,36rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl md:text-2xl">
              {t("registrantTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {checkoutDomain
                ? t("registrantSubtitle", { domain: checkoutDomain.domain })
                : null}
            </DialogDescription>
            {checkoutDomain ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-3.5 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight">
                    {checkoutDomain.domain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    .{checkoutDomain.tld} · 1{" "}
                    {locale === "nl" ? "jaar" : "year"}
                  </p>
                </div>
                {checkoutPriceLabel ? (
                  <div className="text-right tabular-nums">
                    {checkoutListPriceLabel ? (
                      <p className="text-xs text-muted-foreground line-through decoration-2">
                        {checkoutListPriceLabel}
                      </p>
                    ) : null}
                    <p
                      className={cn(
                        "font-semibold text-primary",
                        checkoutListPriceLabel ? "text-lg" : "text-base",
                      )}
                    >
                      {checkoutPriceLabel}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </DialogHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={registrantForm.handleSubmit((values) => {
              if (!checkoutDomain) return;
              checkoutMutation.mutate({
                domain: checkoutDomain.domain,
                registrant: values,
              });
            })}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6">
              <p className="text-sm text-muted-foreground">
                {t("registrantHint")}
              </p>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("registrantContact")}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input
                      id="firstName"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="given-name"
                      {...registrantForm.register("firstName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input
                      id="lastName"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="family-name"
                      {...registrantForm.register("lastName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="email"
                      {...registrantForm.register("email")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="tel"
                      placeholder="+31…"
                      {...registrantForm.register("phone")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="organization">{t("organization")}</Label>
                    <Input
                      id="organization"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="organization"
                      {...registrantForm.register("organization")}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("registrantAddress")}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address1">{t("address")}</Label>
                    <Input
                      id="address1"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="street-address"
                      {...registrantForm.register("address1")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">{t("postalCode")}</Label>
                    <Input
                      id="postalCode"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="postal-code"
                      {...registrantForm.register("postalCode")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{t("city")}</Label>
                    <Input
                      id="city"
                      className="mt-1.5 h-11 rounded-xl"
                      autoComplete="address-level2"
                      {...registrantForm.register("city")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="country">{t("country")}</Label>
                    <Input
                      id="country"
                      className="mt-1.5 h-11 rounded-xl uppercase"
                      autoComplete="country"
                      maxLength={2}
                      {...registrantForm.register("country")}
                    />
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-border/60 bg-muted/10 px-5 py-4 md:px-6 sm:justify-between">
              <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <Lock className="h-3.5 w-3.5" />
                Stripe · iDEAL / card
              </p>
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setCheckoutDomain(null)}
                >
                  {t("registrantCancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={checkoutMutation.isPending}
                  className="rounded-2xl px-6"
                >
                  {checkoutMutation.isPending ? t("processing") : t("pay")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
