"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canDelete, isStaffRole } from "@/lib/roles";

type Invoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  client: { id: string; name: string; company: string | null };
};

export default function CrmInvoicesPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const showDelete = canDelete(session?.user?.role);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["crm-invoices"],
    queryFn: async () => {
      const res = await fetch("/api/crm/invoices");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Invoice[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["crm-clients"],
    enabled: staff,
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) return [];
      return (await res.json()) as { id: string; name: string }[];
    },
  });

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/crm/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        amount: Number(amount),
        status: "SENT",
      }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success(t("invoiceCreated"));
    setOpen(false);
    setAmount("");
    setClientId("");
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/crm/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
  }

  return (
    <CrmShell
      title={t("invoices")}
      subtitle={t("invoicesSubtitle")}
      actions={
        staff ? (
          <Button onClick={() => setOpen((v) => !v)}>{t("addInvoice")}</Button>
        ) : null
      }
    >
      {open && staff ? (
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            <form onSubmit={createInvoice} className="flex w-full flex-wrap gap-2">
              <select
                className="h-10 min-w-50 rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">{t("selectClient")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-40"
                required
              />
              <Button type="submit">{t("save")}</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("invoices")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
            >
              <div>
                <p className="font-medium">{inv.number}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.client.name}
                  {inv.client.company ? ` · ${inv.client.company}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {inv.currency} {inv.amount.toFixed(2)}
                </span>
                {staff ? (
                  <select
                    className="h-8 rounded-lg border border-input bg-muted/40 px-2 text-xs"
                    value={inv.status}
                    onChange={(e) => void setStatus(inv.id, e.target.value)}
                  >
                    {["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline">{inv.status}</Badge>
                )}
                {showDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await fetch(`/api/crm/invoices?id=${inv.id}`, { method: "DELETE" });
                      void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
                    }}
                  >
                    ×
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {!isLoading && !invoices.length ? (
            <p className="text-sm text-muted-foreground">{t("emptyInvoices")}</p>
          ) : null}
        </CardContent>
      </Card>
    </CrmShell>
  );
}
