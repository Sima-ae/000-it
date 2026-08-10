"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
  NewsAdminForm,
  newsPostToForm,
  type NewsFormValues,
} from "@/components/content/NewsAdminForm";
import type { NewsPost } from "@/lib/news";
import { canDelete, canEditResource } from "@/lib/roles";

export default function NieuwsAdminPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const role = session?.user?.role;
  const userId = session?.user?.id || "";
  const showDelete = canDelete(role);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsFormValues | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["news-admin"],
    queryFn: async () => {
      const res = await fetch("/api/news?all=1");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as NewsPost[];
    },
  });

  const initialEdit = useMemo(() => editing, [editing]);
  const isEdit = !!editing?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("news")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage public news posts shown on /nieuws
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/nieuws`} target="_blank">
              View public page
            </Link>
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Add post
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All news posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && !items.length && (
            <p className="text-muted-foreground">No news posts yet.</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
            >
              <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                {item.coverImage ? (
                  <Image src={item.coverImage} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  {item.industry ? <Badge variant="secondary">{item.industry}</Badge> : null}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  {item.date} · {item.author}
                </p>
              </div>
              <div className="flex gap-2">
                {canEditResource(role, item.createdById, userId) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(newsPostToForm(item));
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : null}
                {showDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete this news post?")) return;
                      const res = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
                      if (!res.ok) {
                        toast.error("Delete failed");
                        return;
                      }
                      toast.success("Deleted");
                      void qc.invalidateQueries({ queryKey: ["news-admin"] });
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[min(92vh,920px)] w-[min(96vw,56rem)] overflow-hidden p-0">
          <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            <DialogHeader className="mb-6 pr-8">
              <DialogTitle>{isEdit ? "Edit news post" : "Add news post"}</DialogTitle>
              <DialogDescription>
                Datum, Auteur and URL are editable for admin users. Public visitors see them as
                text plus a visit button.
              </DialogDescription>
            </DialogHeader>
            <NewsAdminForm
              key={editing?.id || "create"}
              initial={isEdit ? initialEdit || undefined : undefined}
              onCancel={() => {
                setOpen(false);
                setEditing(null);
              }}
              onSaved={() => {
                setOpen(false);
                setEditing(null);
                void qc.invalidateQueries({ queryKey: ["news-admin"] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
