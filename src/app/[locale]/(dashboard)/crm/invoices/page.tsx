"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Download, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { openInvoicePdf, type InvoiceDocument } from "@/components/crm/InvoicePdf";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { localizedHref } from "@/i18n/pathnames";
import {
  INVOICE_STATUSES,
  computeInvoiceTotals,
  formatInvoiceMoney,
  toDateInputValue,
  type InvoiceLineItem,
} from "@/lib/crm/invoices";
import { canDelete, isStaffRole } from "@/lib/roles";

type ClientOption = {
  id: string;
  name: string;
  company: string | null;
  email?: string | null;
};

type ProjectOption = { id: string; name: string };

type Invoice = InvoiceDocument & {
  id: string;
  clientId: string;
  projectId?: string | null;
  deletedAt?: string | null;
  client: ClientOption & {
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    vatNumber?: string | null;
  };
};

type FormState = {
  clientId: string;
  projectId: string;
  status: string;
  issueDate: string;
  dueDate: string;
  reference: string;
  paymentTerms: string;
  notes: string;
  taxRate: string;
  items: InvoiceLineItem[];
};

function emptyForm(): FormState {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 14);
  return {
    clientId: "",
    projectId: "",
    status: "DRAFT",
    issueDate: toDateInputValue(today),
    dueDate: toDateInputValue(due),
    reference: "",
    paymentTerms: "14 dagen netto",
    notes: "",
    taxRate: "21",
    items: [{ description: "", qty: 1, unitPrice: 0 }],
  };
}

function statusVariant(status: string): "outline" | "secondary" | "accent" | "warning" | "danger" {
  switch (status) {
    case "PAID":
      return "accent";
    case "SENT":
      return "secondary";
    case "OVERDUE":
      return "danger";
    case "CANCELLED":
      return "outline";
    default:
      return "warning";
  }
}

export default function CrmInvoicesPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const showDelete = canDelete(session?.user?.role);
  const qc = useQueryClient();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<Invoice | null>(null);

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
      return (await res.json()) as ClientOption[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    enabled: staff,
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      return (await res.json()) as ProjectOption[];
    },
  });

  const totals = useMemo(
    () => computeInvoiceTotals(form.items, Number(form.taxRate) || 0),
    [form.items, form.taxRate],
  );

  useEffect(() => {
    if (!editorOpen) return;
    if (!form.clientId && clients[0]?.id) {
      setForm((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients, editorOpen, form.clientId]);

  function statusLabel(status: string) {
    const labels: Record<string, string> = {
      DRAFT: t("invoiceStatusDraft"),
      SENT: t("invoiceStatusSent"),
      PAID: t("invoiceStatusPaid"),
      OVERDUE: t("invoiceStatusOverdue"),
      CANCELLED: t("invoiceStatusCancelled"),
    };
    return labels[status] || status;
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  }

  function openEdit(invoice: Invoice) {
    const items = Array.isArray(invoice.items) && invoice.items.length
      ? invoice.items
      : [{ description: t("invoiceLineFallback"), qty: 1, unitPrice: invoice.amount }];
    setEditingId(invoice.id);
    setForm({
      clientId: invoice.clientId,
      projectId: invoice.projectId || "",
      status: invoice.status,
      issueDate: toDateInputValue(invoice.issueDate),
      dueDate: toDateInputValue(invoice.dueDate),
      reference: invoice.reference || "",
      paymentTerms: invoice.paymentTerms || "14 dagen netto",
      notes: invoice.notes || "",
      taxRate: String(invoice.taxRate ?? 21),
      items,
    });
    setEditorOpen(true);
  }

  function updateItem(index: number, patch: Partial<InvoiceLineItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", qty: 1, unitPrice: 0 }],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index),
    }));
  }

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || !form.items.some((item) => item.description.trim())) {
      toast.error(t("invoiceSaveFailed"));
      return;
    }
    setSaving(true);
    const payload = {
      clientId: form.clientId,
      projectId: form.projectId || null,
      status: form.status,
      issueDate: form.issueDate || null,
      dueDate: form.dueDate || null,
      reference: form.reference || null,
      paymentTerms: form.paymentTerms || null,
      notes: form.notes || null,
      taxRate: Number(form.taxRate) || 0,
      items: form.items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description.trim(),
          qty: Number(item.qty) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
    };

    const res = await fetch("/api/crm/invoices", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("invoiceSaveFailed"));
      return;
    }
    const saved = (await res.json()) as Invoice;
    toast.success(editingId ? t("invoiceUpdated") : t("invoiceCreated"));
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
    setPreview(saved);
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/crm/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error(t("invoiceSaveFailed"));
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
  }

  async function confirmTrash() {
    if (!deleteTarget || !showDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/crm/invoices?id=${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error(t("invoiceDeleteFailed"));
      return;
    }
    toast.success(t("invoiceMovedToTrash"));
    setDeleteTarget(null);
    void qc.invalidateQueries({ queryKey: ["crm-invoices"] });
  }

  function downloadPdf(invoice: Invoice) {
    const ok = openInvoicePdf(
      {
        ...invoice,
        status: statusLabel(invoice.status),
      },
      locale,
    );
    if (!ok) toast.error(t("invoicePdfBlocked"));
  }

  return (
    <CrmShell
      title={t("invoices")}
      subtitle={t("invoicesSubtitle")}
      actions={
        <div className="flex flex-wrap gap-2">
          {showDelete ? (
            <Button asChild variant="outline">
              <SoftLink href={localizedHref(locale, "/crm/invoices/trash")}>
                {t("invoiceTrash")}
              </SoftLink>
            </Button>
          ) : null}
          {staff ? (
            <Button onClick={openCreate}>
              <FilePlus2 className="mr-1.5 h-4 w-4" />
              {t("addInvoice")}
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t("invoiceStatOpen"), value: invoices.filter((i) => ["DRAFT", "SENT", "OVERDUE"].includes(i.status)).length },
          { label: t("invoiceStatPaid"), value: invoices.filter((i) => i.status === "PAID").length },
          { label: t("invoiceStatOverdue"), value: invoices.filter((i) => i.status === "OVERDUE").length },
          {
            label: t("invoiceStatOutstanding"),
            value: formatInvoiceMoney(
              invoices
                .filter((i) => ["DRAFT", "SENT", "OVERDUE"].includes(i.status))
                .reduce((sum, i) => sum + Number(i.amount || 0), 0),
              "EUR",
              locale === "nl" ? "nl-NL" : "en-NL",
            ),
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("invoices")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl border border-border/80 bg-background/60 p-4 transition hover:border-primary/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setPreview(inv)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold">{inv.number}</p>
                    <Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {inv.client.company || inv.client.name}
                    {inv.client.company ? ` · ${inv.client.name}` : ""}
                    {inv.project?.name ? ` · ${inv.project.name}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("invoiceIssueDate")}: {toDateInputValue(inv.issueDate) || "—"}
                    {" · "}
                    {t("invoiceDueDate")}: {toDateInputValue(inv.dueDate) || "—"}
                  </p>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold text-primary">
                    {formatInvoiceMoney(inv.amount, inv.currency, locale === "nl" ? "nl-NL" : "en-NL")}
                  </p>
                  {staff ? (
                    <select
                      className="h-9 rounded-lg border border-input bg-muted/40 px-2 text-xs"
                      value={inv.status}
                      onChange={(e) => void setStatus(inv.id, e.target.value)}
                    >
                      {INVOICE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => downloadPdf(inv)}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    PDF
                  </Button>
                  {staff ? (
                    <Button size="sm" variant="outline" onClick={() => openEdit(inv)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      {t("edit")}
                    </Button>
                  ) : null}
                  {showDelete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-600/10 hover:text-red-700"
                      aria-label={t("deleteInvoice")}
                      onClick={() => setDeleteTarget(inv)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {!isLoading && !invoices.length ? (
            <p className="text-sm text-muted-foreground">{t("emptyInvoices")}</p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[min(92vh,920px)] w-[min(96vw,56rem)] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {editingId ? t("editInvoice") : t("addInvoice")}
            </DialogTitle>
            <DialogDescription>{t("invoiceEditorHint")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={saveInvoice} className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceClient")}</span>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                  value={form.clientId}
                  onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
                  required
                >
                  <option value="">{t("selectClient")}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company ? `${client.company} · ${client.name}` : client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceProject")}</span>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                  value={form.projectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
                >
                  <option value="">{t("invoiceNoProject")}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceStatus")}</span>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {INVOICE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceReference")}</span>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
                  placeholder={t("invoiceReferencePh")}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceIssueDate")}</span>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceDueDate")}</span>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoicePaymentTerms")}</span>
                <Input
                  value={form.paymentTerms}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{t("invoiceTaxRate")}</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, taxRate: e.target.value }))}
                />
              </label>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{t("invoiceLineItems")}</h3>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  {t("invoiceAddLine")}
                </Button>
              </div>
              {form.items.map((item, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_90px_120px_40px]">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder={t("invoiceLineDescription")}
                    required
                  />
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.qty}
                    onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                    placeholder={t("invoiceQty")}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                    placeholder={t("invoiceUnitPrice")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("invoiceSubtotal")}</span>
                  <span>{formatInvoiceMoney(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("invoiceTax")} ({form.taxRate || 0}%)
                  </span>
                  <span>{formatInvoiceMoney(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-primary">
                  <span>{t("invoiceTotal")}</span>
                  <span>{formatInvoiceMoney(totals.amount)}</span>
                </div>
              </div>
            </div>

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">{t("invoiceNotes")}</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder={t("invoiceNotesPh")}
              />
            </label>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "…" : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[min(92vh,900px)] w-[min(96vw,48rem)] overflow-y-auto p-6">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl">{preview.number}</DialogTitle>
                <DialogDescription>
                  {preview.client.company || preview.client.name} · {statusLabel(preview.status)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("invoiceBillTo")}
                    </p>
                    <p className="mt-1 font-medium">{preview.client.company || preview.client.name}</p>
                    <p className="text-muted-foreground">{preview.client.email}</p>
                    {preview.client.vatNumber ? (
                      <p className="text-muted-foreground">BTW: {preview.client.vatNumber}</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("invoiceDetails")}
                    </p>
                    <p className="mt-1">
                      {t("invoiceIssueDate")}: {toDateInputValue(preview.issueDate) || "—"}
                    </p>
                    <p>
                      {t("invoiceDueDate")}: {toDateInputValue(preview.dueDate) || "—"}
                    </p>
                    {preview.paymentTerms ? (
                      <p>
                        {t("invoicePaymentTerms")}: {preview.paymentTerms}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">{t("invoiceLineDescription")}</th>
                        <th className="px-3 py-2 text-right">{t("invoiceQty")}</th>
                        <th className="px-3 py-2 text-right">{t("invoiceUnitPrice")}</th>
                        <th className="px-3 py-2 text-right">{t("invoiceTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.items || []).map((item, index) => (
                        <tr key={index} className="border-t border-border/70">
                          <td className="px-3 py-2">{item.description}</td>
                          <td className="px-3 py-2 text-right">{item.qty}</td>
                          <td className="px-3 py-2 text-right">
                            {formatInvoiceMoney(item.unitPrice, preview.currency)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatInvoiceMoney(item.qty * item.unitPrice, preview.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="ml-auto w-full max-w-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("invoiceSubtotal")}</span>
                    <span>{formatInvoiceMoney(preview.subtotal, preview.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("invoiceTax")} ({preview.taxRate}%)
                    </span>
                    <span>{formatInvoiceMoney(preview.taxAmount, preview.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                    <span>{t("invoiceTotal")}</span>
                    <span>{formatInvoiceMoney(preview.amount, preview.currency)}</span>
                  </div>
                </div>
                {preview.notes ? (
                  <p className="rounded-xl bg-muted/40 p-3 text-muted-foreground">{preview.notes}</p>
                ) : null}
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                  {t("cancel")}
                </Button>
                {staff ? (
                  <Button type="button" variant="outline" onClick={() => openEdit(preview)}>
                    {t("edit")}
                  </Button>
                ) : null}
                <Button type="button" onClick={() => downloadPdf(preview)}>
                  <Download className="mr-1.5 h-4 w-4" />
                  {t("invoiceSavePdf")}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="w-[min(96vw,28rem)] gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">{t("deleteInvoiceTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteInvoiceConfirm", { number: deleteTarget?.number ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void confirmTrash()}>
              {t("moveToTrash")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
