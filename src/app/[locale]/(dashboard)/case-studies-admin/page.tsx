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
  CaseStudyAdminForm,
  caseStudyToForm,
  type CaseFormValues,
} from "@/components/content/CaseStudyAdminForm";
import type { CaseStudy } from "@/lib/case-studies";
import { canDelete, canEditResource } from "@/lib/roles";

export default function CaseStudiesAdminPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const role = session?.user?.role;
  const userId = session?.user?.id || "";
  const showDelete = canDelete(role);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseFormValues | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["case-studies-admin"],
    queryFn: async () => {
      const res = await fetch("/api/case-studies?all=1");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as CaseStudy[];
    },
  });

  const initialEdit = useMemo(() => editing, [editing]);
  const isEdit = !!editing?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("caseStudies")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage public case studies shown on /case-studies
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/case-studies`} target="_blank">
              View public page
            </Link>
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Add case study
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All case studies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && !items.length && (
            <p className="text-muted-foreground">No case studies yet.</p>
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
                    unoptimized={item.coverImage.startsWith("http")}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="secondary">{item.industry}</Badge>
                </div>
                <p className="text-sm text-accent">{item.metric}</p>
                <p className="text-xs text-muted-foreground">
                  {item.clientName} · {item.year}
                </p>
              </div>
              <div className="flex gap-2">
                {canEditResource(role, item.createdById, userId) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(caseStudyToForm(item));
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
                      if (!confirm("Delete this case study?")) return;
                      const res = await fetch(`/api/case-studies/${item.id}`, {
                        method: "DELETE",
                      });
                      if (!res.ok) {
                        toast.error("Delete failed");
                        return;
                      }
                      toast.success("Deleted");
                      void qc.invalidateQueries({ queryKey: ["case-studies-admin"] });
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
              <DialogTitle>{isEdit ? "Edit case study" : "Add case study"}</DialogTitle>
              <DialogDescription>
                Klant and URL are editable for admin users. Public visitors see Klant as text and a
                view-project button for the URL.
              </DialogDescription>
            </DialogHeader>
            <CaseStudyAdminForm
              key={editing?.id || "create"}
              initial={isEdit ? initialEdit || undefined : undefined}
              onCancel={() => {
                setOpen(false);
                setEditing(null);
              }}
              onSaved={() => {
                setOpen(false);
                setEditing(null);
                void qc.invalidateQueries({ queryKey: ["case-studies-admin"] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
