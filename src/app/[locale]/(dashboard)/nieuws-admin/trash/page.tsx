"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedHref } from "@/i18n/pathnames";
import { NewsCoverImage } from "@/components/content/NewsCoverImage";
import type { NewsPost } from "@/lib/news";

function formatWhen(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

export default function NewsTrashPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["news-trash"],
    queryFn: async () => {
      const res = await fetch("/api/news?trash=1");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as NewsPost[];
    },
  });

  async function restore(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/news/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        toast.error("Restore failed");
        return;
      }
      toast.success("Restored — this post will stay until you move it to trash again");
      void qc.invalidateQueries({ queryKey: ["news-trash"] });
      void qc.invalidateQueries({ queryKey: ["news-admin"] });
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(id: string) {
    if (
      !confirm(
        "Permanently delete this news post? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/news/${id}/permanent`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Permanent delete failed");
        return;
      }
      toast.success("Permanently deleted");
      void qc.invalidateQueries({ queryKey: ["news-trash"] });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("newsTrash")}</h1>
          <p className="text-sm text-muted-foreground">
            Super admin only. News older than 365 days lands here automatically. Restore
            keeps a post on the site; permanent delete removes it for good.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={localizedHref(locale, "/nieuws-admin")}>Back to news</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle>Trash</CardTitle>
          {!isLoading ? (
            <Badge variant="secondary" className="text-sm font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && !items.length && (
            <p className="text-muted-foreground">Trash is empty.</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
            >
              <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                <NewsCoverImage
                  id={item.id}
                  coverImage={item.coverImage}
                  alt=""
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.titleNl?.trim() || item.title}</p>
                  {item.deletedReason === "expired" ? (
                    <Badge variant="secondary">Expired (365 days)</Badge>
                  ) : (
                    <Badge variant="outline">Manual</Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.excerptNl?.trim() || item.excerpt}
                </p>
                <p className="text-xs text-muted-foreground">
                  Published {item.date} · Trashed {formatWhen(item.deletedAt)} · {item.author}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === item.id}
                  onClick={() => void restore(item.id)}
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={busyId === item.id}
                  onClick={() => void destroy(item.id)}
                >
                  Delete forever
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
