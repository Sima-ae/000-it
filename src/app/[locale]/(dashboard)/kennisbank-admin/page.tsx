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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  const slugToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.slug, c.id);
    return map;
  }, [categories]);

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
            <Link href={`/${locale}/kennisbank`} target="_blank">
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

      {tab === "categories" ? (
        <Card>
          <CardHeader>
            <CardTitle>Alle categorieën (A–Z)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {catsLoading && <p className="text-muted-foreground">Laden…</p>}
            {!catsLoading && !categories.length && (
              <p className="text-muted-foreground">Nog geen categorieën.</p>
            )}
            {categories.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant="secondary">{item.articleCount} artikelen</Badge>
                    {!item.published ? (
                      <Badge variant="outline">Concept</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">/{item.slug}</p>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCat({
                        id: item.id,
                        slug: item.slug,
                        sortKey: item.sortKey,
                        name: item.name,
                        description: item.description || "",
                        published: item.published,
                      });
                      setCatOpen(true);
                    }}
                  >
                    Bewerken
                  </Button>
                  {showDelete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm("Categorie verwijderen?")) return;
                        const res = await fetch(
                          `/api/kennisbank/categories/${item.id}`,
                          { method: "DELETE" },
                        );
                        if (!res.ok) {
                          toast.error("Verwijderen mislukt");
                          return;
                        }
                        toast.success("Verwijderd");
                        void qc.invalidateQueries({
                          queryKey: ["kennisbank-categories-admin"],
                        });
                        void qc.invalidateQueries({
                          queryKey: ["kennisbank-articles-admin"],
                        });
                      }}
                    >
                      Verwijderen
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle artikelen (A–Z)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artsLoading && <p className="text-muted-foreground">Laden…</p>}
            {!artsLoading && !articles.length && (
              <p className="text-muted-foreground">Nog geen artikelen.</p>
            )}
            {articles.map((item) => (
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
                      const res = await fetch(`/api/kennisbank/articles/${item.id}`);
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
                        void qc.invalidateQueries({
                          queryKey: ["kennisbank-articles-admin"],
                        });
                        void qc.invalidateQueries({
                          queryKey: ["kennisbank-categories-admin"],
                        });
                      }}
                    >
                      Verwijderen
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
                Categorieën verschijnen A–Z op de publieke kennisbank.
              </DialogDescription>
            </DialogHeader>
            <KennisbankCategoryForm
              key={editingCat?.id || "create-cat"}
              initial={editingCat || undefined}
              onCancel={() => {
                setCatOpen(false);
                setEditingCat(null);
              }}
              onSaved={() => {
                setCatOpen(false);
                setEditingCat(null);
                void qc.invalidateQueries({
                  queryKey: ["kennisbank-categories-admin"],
                });
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
                void qc.invalidateQueries({
                  queryKey: ["kennisbank-articles-admin"],
                });
                void qc.invalidateQueries({
                  queryKey: ["kennisbank-categories-admin"],
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
