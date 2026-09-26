"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { localizedHref } from "@/i18n/pathnames";
import {
  KennisbankArticleForm,
  KennisbankCategoryForm,
  type ArticleFormValues,
  type CategoryFormValues,
} from "@/components/kennisbank/KennisbankAdminForms";
import type {
  KennisbankArticleListItem,
  KennisbankCategoryView,
} from "@/lib/kennisbank";
import { canDelete } from "@/lib/roles";

type Tab = "categories" | "articles";
type PubFilter = "all" | "published" | "draft";

function matchesQuery(haystack: string, q: string) {
  if (!q.trim()) return true;
  return haystack.toLowerCase().includes(q.trim().toLowerCase());
}

function KennisbankTotals({
  mainCount,
  subCount,
  articleCount,
}: {
  mainCount: number;
  subCount: number;
  articleCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Hoofdcategorieën</p>
        <p className="text-lg font-semibold tabular-nums">{mainCount}</p>
      </div>
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Subcategorieën</p>
        <p className="text-lg font-semibold tabular-nums">{subCount}</p>
      </div>
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Artikelen</p>
        <p className="text-lg font-semibold tabular-nums">{articleCount}</p>
      </div>
    </div>
  );
}

function CategoryActions({
  item,
  showDelete,
  onEdit,
  onDeleted,
}: {
  item: KennisbankCategoryView;
  showDelete: boolean;
  onEdit: (item: KennisbankCategoryView) => void;
  onDeleted: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
        Bewerken
      </Button>
      {showDelete ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            if (!confirm("Categorie verwijderen?")) return;
            const res = await fetch(`/api/kennisbank/categories/${item.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              toast.error("Verwijderen mislukt");
              return;
            }
            toast.success("Verwijderd");
            onDeleted();
          }}
        >
          Verwijderen
        </Button>
      ) : null}
    </div>
  );
}

export default function KennisbankAdminPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const showDelete = canDelete(session?.user?.role);
  const [tab, setTab] = useState<Tab>("categories");
  const [catOpen, setCatOpen] = useState(false);
  const [artOpen, setArtOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryFormValues | null>(null);
  const [editingArt, setEditingArt] = useState<ArticleFormValues | null>(null);
  const [search, setSearch] = useState("");
  const [pubFilter, setPubFilter] = useState<PubFilter>("all");
  const [mainFilterId, setMainFilterId] = useState<string>("");

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["kennisbank-categories-admin"],
    queryFn: async () => {
      const res = await fetch("/api/kennisbank/categories?all=1&locale=nl");
      if (!res.ok) throw new Error("Failed to load categories");
      return (await res.json()) as KennisbankCategoryView[];
    },
  });

  const { data: articles = [], isLoading: artsLoading } = useQuery({
    queryKey: ["kennisbank-articles-admin"],
    queryFn: async () => {
      const res = await fetch("/api/kennisbank/articles?all=1&locale=nl");
      if (!res.ok) throw new Error("Failed to load articles");
      return (await res.json()) as KennisbankArticleListItem[];
    },
  });

  const mains = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );
  const subs = useMemo(
    () => categories.filter((c) => !!c.parentId),
    [categories],
  );

  const totals = useMemo(
    () => ({
      mainCount: mains.length,
      subCount: subs.length,
      articleCount: articles.length,
    }),
    [mains.length, subs.length, articles.length],
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  const slugToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.slug, c.id);
    return map;
  }, [categories]);

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: ["kennisbank-categories-admin"] });
    void qc.invalidateQueries({ queryKey: ["kennisbank-articles-admin"] });
  };

  const openEditCat = (item: KennisbankCategoryView) => {
    setEditingCat({
      id: item.id,
      slug: item.slug,
      sortKey: item.sortKey,
      name: item.name,
      description: item.description || "",
      published: item.published,
      parentId: item.parentId,
    });
    setCatOpen(true);
  };

  const filteredMains = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mains
      .map((main) => {
        const childMatches = main.children.filter((child) => {
          if (pubFilter === "published" && !child.published) return false;
          if (pubFilter === "draft" && child.published) return false;
          if (!q) return true;
          return matchesQuery(
            `${child.name} ${child.slug} ${child.description || ""}`,
            q,
          );
        });
        const mainSelfMatch =
          (!q ||
            matchesQuery(
              `${main.name} ${main.slug} ${main.description || ""}`,
              q,
            )) &&
          (pubFilter === "all" ||
            (pubFilter === "published" ? main.published : !main.published));

        if (mainFilterId && main.id !== mainFilterId) return null;
        if (!mainSelfMatch && !childMatches.length) return null;

        // When searching, show matching children; if main matches, show all
        // children that pass pubFilter (or all matching children).
        const children =
          q && !matchesQuery(`${main.name} ${main.slug}`, q)
            ? childMatches
            : main.children.filter((child) => {
                if (pubFilter === "published" && !child.published) return false;
                if (pubFilter === "draft" && child.published) return false;
                if (!q) return true;
                return (
                  matchesQuery(
                    `${child.name} ${child.slug} ${child.description || ""}`,
                    q,
                  ) || matchesQuery(`${main.name} ${main.slug}`, q)
                );
              });

        return { ...main, children };
      })
      .filter(Boolean) as KennisbankCategoryView[];
  }, [mains, search, pubFilter, mainFilterId]);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((item) => {
      if (pubFilter === "published" && !item.published) return false;
      if (pubFilter === "draft" && item.published) return false;
      if (mainFilterId) {
        const main = mains.find((m) => m.id === mainFilterId);
        if (!main) return false;
        const allowed = new Set([
          main.slug,
          ...main.children.map((c) => c.slug),
        ]);
        if (!item.categorySlugs.some((s) => allowed.has(s))) return false;
      }
      if (!q) return true;
      return matchesQuery(
        `${item.title} ${item.slug} ${item.excerpt} ${item.categoryNames.join(" ")}`,
        q,
      );
    });
  }, [articles, search, pubFilter, mainFilterId, mains]);

  const visibleTotals = useMemo(() => {
    if (tab === "categories") {
      const visibleSubs = filteredMains.reduce(
        (n, m) => n + m.children.length,
        0,
      );
      const visibleArts = filteredMains.reduce(
        (n, m) => n + m.articleCount,
        0,
      );
      return {
        mainCount: filteredMains.length,
        subCount: visibleSubs,
        articleCount: search || pubFilter !== "all" || mainFilterId
          ? visibleArts
          : totals.articleCount,
      };
    }
    return {
      mainCount: totals.mainCount,
      subCount: totals.subCount,
      articleCount: filteredArticles.length,
    };
  }, [
    tab,
    filteredMains,
    filteredArticles.length,
    search,
    pubFilter,
    mainFilterId,
    totals,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("kennisbank")}</h1>
          <p className="text-sm text-muted-foreground">
            Beheer categorieën en artikelen van de publieke kennisbank
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={localizedHref(locale, "/kennisbank")} target="_blank">
              Bekijk publieke pagina
            </Link>
          </Button>
          {tab === "categories" ? (
            <Button
              onClick={() => {
                setEditingCat(null);
                setCatOpen(true);
              }}
            >
              Categorie toevoegen
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingArt(null);
                setArtOpen(true);
              }}
            >
              Artikel toevoegen
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "categories" ? "default" : "outline"}
          onClick={() => setTab("categories")}
        >
          Categorieën
        </Button>
        <Button
          variant={tab === "articles" ? "default" : "outline"}
          onClick={() => setTab("articles")}
        >
          Artikelen
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>
              {tab === "categories"
                ? "Categorieën (hoofd → sub)"
                : "Artikelen"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Totaal: {totals.mainCount} hoofd · {totals.subCount} sub ·{" "}
              {totals.articleCount} artikelen
            </p>
          </div>
          <KennisbankTotals {...visibleTotals} />
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "categories"
                  ? "Zoek categorie of subcategorie…"
                  : "Zoek artikel op titel, slug of categorie…"
              }
              className="lg:max-w-md"
              aria-label="Zoeken"
            />
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={pubFilter}
                onChange={(e) => setPubFilter(e.target.value as PubFilter)}
                aria-label="Filter publicatie"
              >
                <option value="all">Alles</option>
                <option value="published">Gepubliceerd</option>
                <option value="draft">Concept</option>
              </select>
              <select
                className="h-10 min-w-48 rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={mainFilterId}
                onChange={(e) => setMainFilterId(e.target.value)}
                aria-label="Filter hoofdcategorie"
              >
                <option value="">Alle hoofdcategorieën</option>
                {mains.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {(search || pubFilter !== "all" || mainFilterId) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10"
                  onClick={() => {
                    setSearch("");
                    setPubFilter("all");
                    setMainFilterId("");
                  }}
                >
                  Filters wissen
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tab === "categories" ? (
            <>
              {catsLoading && <p className="text-muted-foreground">Laden…</p>}
              {!catsLoading && !filteredMains.length && (
                <p className="text-muted-foreground">
                  Geen categorieën gevonden.
                </p>
              )}
              {filteredMains.map((main) => (
                <div
                  key={main.id}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <div className="flex flex-col gap-3 bg-muted/40 p-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{main.name}</p>
                        <Badge>Hoofd</Badge>
                        <Badge variant="secondary">
                          {main.articleCount} artikelen
                        </Badge>
                        <Badge variant="outline">
                          {main.children.length} subcategorie
                          {main.children.length === 1 ? "" : "ën"}
                        </Badge>
                        {!main.published ? (
                          <Badge variant="outline">Concept</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        /{main.slug}
                      </p>
                      {main.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {main.description}
                        </p>
                      ) : null}
                    </div>
                    <CategoryActions
                      item={main}
                      showDelete={showDelete}
                      onEdit={openEditCat}
                      onDeleted={invalidateAll}
                    />
                  </div>

                  {main.children.length ? (
                    <div className="divide-y divide-border border-t border-border">
                      {main.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex flex-col gap-3 bg-background px-3 py-2.5 pl-6 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{child.name}</p>
                              <Badge variant="outline">Sub</Badge>
                              <Badge variant="secondary">
                                {child.articleCount} artikelen
                              </Badge>
                              {!child.published ? (
                                <Badge variant="outline">Concept</Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              /{child.slug}
                            </p>
                            {child.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {child.description}
                              </p>
                            ) : null}
                          </div>
                          <CategoryActions
                            item={child}
                            showDelete={showDelete}
                            onEdit={openEditCat}
                            onDeleted={invalidateAll}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                      Geen subcategorieën
                    </p>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {artsLoading && <p className="text-muted-foreground">Laden…</p>}
              {!artsLoading && !filteredArticles.length && (
                <p className="text-muted-foreground">Geen artikelen gevonden.</p>
              )}
              <div className="space-y-3">
                {filteredArticles.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        {!item.published ? (
                          <Badge variant="outline">Concept</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.categoryNames.map((name) => (
                          <Badge key={name} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.excerpt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const res = await fetch(
                            `/api/kennisbank/articles/${item.id}`,
                          );
                          if (!res.ok) {
                            toast.error("Artikel laden mislukt");
                            return;
                          }
                          const full = await res.json();
                          setEditingArt({
                            id: item.id,
                            slug: item.slug,
                            title: item.title,
                            excerpt: item.excerpt,
                            bodyHtml: full.bodyHtml || "",
                            seoTitle: full.seoTitle || "",
                            seoDescription: full.seoDescription || "",
                            published: item.published,
                            categoryIds: item.categorySlugs
                              .map((s) => slugToId.get(s))
                              .filter(Boolean) as string[],
                          });
                          setArtOpen(true);
                        }}
                      >
                        Bewerken
                      </Button>
                      {showDelete ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!confirm("Artikel verwijderen?")) return;
                            const res = await fetch(
                              `/api/kennisbank/articles/${item.id}`,
                              { method: "DELETE" },
                            );
                            if (!res.ok) {
                              toast.error("Verwijderen mislukt");
                              return;
                            }
                            toast.success("Verwijderd");
                            invalidateAll();
                          }}
                        >
                          Verwijderen
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-border pt-4">
            <KennisbankTotals {...visibleTotals} />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={catOpen}
        onOpenChange={(next) => {
          setCatOpen(next);
          if (!next) setEditingCat(null);
        }}
      >
        <DialogContent className="max-h-[min(92vh,720px)] w-[min(96vw,40rem)] overflow-hidden p-0">
          <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            <DialogHeader className="mb-6 pr-8">
              <DialogTitle>
                {editingCat?.id ? "Categorie bewerken" : "Categorie toevoegen"}
              </DialogTitle>
              <DialogDescription>
                Kies optioneel een hoofdcategorie als dit een subcategorie is.
              </DialogDescription>
            </DialogHeader>
            <KennisbankCategoryForm
              key={editingCat?.id || "create-cat"}
              initial={editingCat || undefined}
              parentOptions={categoryOptions}
              onCancel={() => {
                setCatOpen(false);
                setEditingCat(null);
              }}
              onSaved={() => {
                setCatOpen(false);
                setEditingCat(null);
                invalidateAll();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={artOpen}
        onOpenChange={(next) => {
          setArtOpen(next);
          if (!next) setEditingArt(null);
        }}
      >
        <DialogContent className="max-h-[min(92vh,920px)] w-[min(96vw,56rem)] overflow-hidden p-0">
          <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            <DialogHeader className="mb-6 pr-8">
              <DialogTitle>
                {editingArt?.id ? "Artikel bewerken" : "Artikel toevoegen"}
              </DialogTitle>
              <DialogDescription>
                Schrijf in het Nederlands. Vertalingen volgen later per taal.
              </DialogDescription>
            </DialogHeader>
            <KennisbankArticleForm
              key={editingArt?.id || "create-art"}
              initial={editingArt || undefined}
              categories={categoryOptions}
              onCancel={() => {
                setArtOpen(false);
                setEditingArt(null);
              }}
              onSaved={() => {
                setArtOpen(false);
                setEditingArt(null);
                invalidateAll();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
