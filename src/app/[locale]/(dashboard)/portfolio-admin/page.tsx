"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PortfolioAdminForm,
  type PortfolioFormValues,
} from "@/components/portfolio/PortfolioAdminForm";

type Item = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  coverImage: string | null;
  gallery: unknown;
  projectUrl: string | null;
  repoUrl: string | null;
  clientName: string | null;
  industry: string | null;
  year: number | null;
  tags: unknown;
  technologies: unknown;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

function listToCsv(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map(String).join(", ");
}

export default function PortfolioAdminPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const qc = useQueryClient();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<PortfolioFormValues | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio-admin"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio?all=1");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as Item[];
    },
  });

  const initialEdit = useMemo(() => editing, [editing]);

  function startCreate() {
    setEditing(null);
    setMode("create");
  }

  function startEdit(item: Item) {
    setEditing({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      description: item.description || "",
      coverImage: item.coverImage || "",
      gallery: Array.isArray(item.gallery) ? item.gallery.map(String) : [],
      projectUrl: item.projectUrl || "",
      repoUrl: item.repoUrl || "",
      clientName: item.clientName || "",
      industry: item.industry || "",
      year: item.year ? String(item.year) : "",
      tags: listToCsv(item.tags),
      technologies: listToCsv(item.technologies),
      featured: item.featured,
      published: item.published,
      sortOrder: String(item.sortOrder ?? 0),
    });
    setMode("edit");
  }

  async function remove(id: string) {
    if (!confirm("Delete this portfolio project?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Deleted");
    void qc.invalidateQueries({ queryKey: ["portfolio-admin"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("portfolio")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage public portfolio projects shown on /portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/portfolio`} target="_blank">
              View public page
            </Link>
          </Button>
          {mode === "list" ? (
            <Button onClick={startCreate}>Add project</Button>
          ) : (
            <Button variant="outline" onClick={() => setMode("list")}>
              Back to list
            </Button>
          )}
        </div>
      </div>

      {mode !== "list" && (
        <PortfolioAdminForm
          initial={mode === "edit" ? initialEdit || undefined : undefined}
          onCancel={() => setMode("list")}
          onSaved={() => {
            setMode("list");
            void qc.invalidateQueries({ queryKey: ["portfolio-admin"] });
          }}
        />
      )}

      {mode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>All portfolio projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-muted-foreground">Loading…</p>}
            {!isLoading && !items.length && (
              <p className="text-muted-foreground">No portfolio projects yet.</p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {item.published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                    {item.featured && <Badge>Featured</Badge>}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                  <p className="text-xs text-muted-foreground">/{item.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
