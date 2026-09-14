"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SeoScanRow = {
  id: string;
  url: string;
  company: string | null;
  status: string;
  createdAt: string;
  aeo: number | null;
  geo: number | null;
  seo: number | null;
};

export function SeoScansPanel({
  canManage,
  initialScans,
}: {
  canManage: boolean;
  initialScans: SeoScanRow[];
}) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [scans, setScans] = useState(initialScans);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setScans(initialScans);
  }, [initialScans]);

  async function deleteOne(id: string) {
    if (!canManage || pendingId || deletingAll) return;
    const ok = window.confirm(t("deleteScanConfirm"));
    if (!ok) return;

    setError(null);
    setPendingId(id);
    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(t("deleteFailed"));
      }
      setScans((prev) => prev.filter((s) => s.id !== id));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPendingId(null);
    }
  }

  async function deleteAll() {
    if (!canManage || !scans.length || pendingId || deletingAll) return;
    const ok = window.confirm(t("deleteAllConfirm"));
    if (!ok) return;

    setError(null);
    setDeletingAll(true);
    try {
      const res = await fetch("/api/scans", { method: "DELETE" });
      if (!res.ok) {
        throw new Error(t("deleteAllFailed"));
      }
      setScans([]);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>{t("recentScans")}</CardTitle>
        {canManage && scans.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={deletingAll || Boolean(pendingId)}
            onClick={() => void deleteAll()}
          >
            {deletingAll ? t("working") : t("deleteAll")}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!scans.length && <p className="text-muted-foreground">{t("noScansYet")}</p>}
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="min-w-0">
              <p className="font-medium break-all">{scan.url}</p>
              <p className="text-xs text-muted-foreground">
                {scan.company ? `${scan.company} · ` : ""}
                {new Date(scan.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{scan.status}</Badge>
              {scan.aeo !== null ? <Badge variant="secondary">AEO {scan.aeo}</Badge> : null}
              {scan.geo !== null ? <Badge variant="outline">GEO {scan.geo}</Badge> : null}
              {scan.seo !== null ? <Badge variant="secondary">SEO {scan.seo}</Badge> : null}
              {canManage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  disabled={deletingAll || pendingId === scan.id}
                  aria-label={t("deleteScan")}
                  onClick={() => void deleteOne(scan.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
