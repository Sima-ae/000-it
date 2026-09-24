"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { localizedHref } from "@/i18n/pathnames";
import { formatInvoiceMoney } from "@/lib/crm/invoices";
import { canDelete } from "@/lib/roles";

type TrashedInvoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  deletedAt?: string | null;
  client: { name: string; company: string | null };
};

export default function CrmInvoiceTrashPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const { data: session } = useSession();
  const allowed = canDelete(session?.user?.role);
  const qc = useQueryClient();
  const [permanentTarget, setPermanentTarget] = useState<TrashedInvoice | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["crm-invoices-trash"],
    enabled: allowed,
    queryFn: async () => {
      const res = await fetch("/api/crm/invoices?trash=1");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TrashedInvoice[];
    },
  });

  if (!allowed) {
    return (
      <CrmShell title={t("invoiceTrash")} subtitle={t("invoiceTrashSubtitle")}>
        <p className="text-sm text-muted-foreground">{t("invoiceTrashForbidden")}</p>
      </CrmShell>
    );
  }

  async function restore(id: string) {
    setBusy(true);
    const res = await fetch("/api/crm/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", id }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(t("invoiceRestoreFailed"));
      return;
    }
    toast.success(t("invoiceRestored"));
    void qc.invalidateQueries({ queryKey: ["crm-invoices-trash"] });
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
  }

  async function permanentDelete() {
    if (!permanentTarget) return;
    setBusy(true);
    const res = await fetch(
      `/api/crm/invoices?id=${permanentTarget.id}&permanent=1`,
      { method: "DELETE" },
    );
    setBusy(false);
    if (!res.ok) {
      toast.error(t("invoiceDeleteFailed"));
      return;
    }
    toast.success(t("invoicePermanentlyDeleted"));
    setPermanentTarget(null);
    void qc.invalidateQueries({ queryKey: ["crm-invoices-trash"] });
  }

  return (
    <CrmShell
      title={t("invoiceTrash")}
      subtitle={t("invoiceTrashSubtitle")}
      actions={
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/crm/invoices")}>{t("invoices")}</SoftLink>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("invoiceTrash")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium">{inv.number}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.client.company || inv.client.name}
                  {inv.deletedAt
                    ? ` · ${new Date(inv.deletedAt).toLocaleString(locale === "nl" ? "nl-NL" : "en-NL")}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatInvoiceMoney(inv.amount, inv.currency, locale === "nl" ? "nl-NL" : "en-NL")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void restore(inv.id)}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  {t("restore")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-600/10 hover:text-red-700"
                  disabled={busy}
                  onClick={() => setPermanentTarget(inv)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && !invoices.length ? (
            <p className="text-sm text-muted-foreground">{t("invoiceTrashEmpty")}</p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(permanentTarget)}
        onOpenChange={(open) => {
          if (!open && !busy) setPermanentTarget(null);
        }}
      >
        <DialogContent className="w-[min(96vw,28rem)] gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {t("deleteInvoicePermanentTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("deleteInvoicePermanentConfirm", {
                number: permanentTarget?.number ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setPermanentTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => void permanentDelete()}>
              {t("deleteForever")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
