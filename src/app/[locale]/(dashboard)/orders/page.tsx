"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canDelete, canEditAny } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { formatShopEuro } from "@/lib/shop/vat";
import { centsToEurosNumber } from "@/lib/shop/admin";

type OrderItem = {
  id?: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceIncl: number;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  company: string | null;
  locale: string;
  currency: string;
  subtotalExcl: number;
  vatAmount: number;
  totalIncl: number;
  vatRate: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  stripeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: { id: string; name: string | null; email: string } | null;
};

type CatalogProduct = {
  id: string;
  nameNl: string;
  nameEn: string;
  priceInclCents: number;
  discountPriceInclCents?: number | null;
  published: boolean;
};

type FormItem = {
  productId: string;
  name: string;
  quantity: string;
  unitPriceIncl: string;
};

type FormState = {
  name: string;
  email: string;
  company: string;
  locale: string;
  status: Order["status"];
  items: FormItem[];
};

const emptyForm = (locale: string): FormState => ({
  name: "",
  email: "",
  company: "",
  locale,
  status: "PENDING",
  items: [{ productId: "", name: "", quantity: "1", unitPriceIncl: "" }],
});

function statusClass(status: Order["status"]) {
  switch (status) {
    case "PAID":
      return "border-transparent bg-accent/15 text-accent";
    case "PENDING":
      return "border-transparent bg-orange-500/15 text-orange-600";
    case "FAILED":
      return "border-transparent bg-red-500/15 text-red-600";
    case "CANCELLED":
      return "border-transparent bg-muted text-muted-foreground";
    default:
      return "";
  }
}

export default function OrdersAdminPage() {
  const t = useTranslations("ordersAdmin");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const role = session?.user?.role;
  const canEdit = canEditAny(role) || role === "MANAGER";
  const showDelete = canDelete(role);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialog, setDialog] = useState<"create" | "edit" | "view" | null>(null);
  const [active, setActive] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(locale));
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["shop-orders"],
    queryFn: async () => {
      const res = await fetch("/api/shop/orders");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Order[];
    },
    refetchInterval: 30_000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["shop-admin-products-for-orders"],
    enabled: canEdit,
    queryFn: async () => {
      const res = await fetch("/api/shop/products?all=1");
      if (!res.ok) return [] as CatalogProduct[];
      return (await res.json()) as CatalogProduct[];
    },
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        order.orderNumber.toLowerCase().includes(needle) ||
        order.name.toLowerCase().includes(needle) ||
        order.email.toLowerCase().includes(needle) ||
        (order.company || "").toLowerCase().includes(needle) ||
        order.items.some((item) => item.name.toLowerCase().includes(needle))
      );
    });
  }, [orders, q, statusFilter]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "PAID");
    const pending = orders.filter((o) => o.status === "PENDING");
    const revenue = paid.reduce((sum, o) => sum + o.totalIncl, 0);
    const outstanding = pending.reduce((sum, o) => sum + o.totalIncl, 0);
    return {
      total: orders.length,
      pending: pending.length,
      outstanding,
      paid: paid.length,
      revenue,
    };
  }, [orders]);

  function openCreate() {
    setActive(null);
    setForm(emptyForm(locale));
    setDialog("create");
  }

  function openView(order: Order) {
    setActive(order);
    setDialog("view");
  }

  function openEdit(order: Order) {
    setActive(order);
    setForm({
      name: order.name,
      email: order.email,
      company: order.company || "",
      locale: order.locale || locale,
      status: order.status,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: String(item.quantity),
        unitPriceIncl: String(item.unitPriceIncl),
      })),
    });
    setDialog("edit");
  }

  function patchForm(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function patchItem(index: number, partial: Partial<FormItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, ...partial } : item,
      ),
    }));
  }

  function addItemRow() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", name: "", quantity: "1", unitPriceIncl: "" },
      ],
    }));
  }

  function removeItemRow(index: number) {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length <= 1
          ? prev.items
          : prev.items.filter((_, i) => i !== index),
    }));
  }

  function applyProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      patchItem(index, { productId: "" });
      return;
    }
    const cents =
      product.discountPriceInclCents != null && product.discountPriceInclCents > 0
        ? product.discountPriceInclCents
        : product.priceInclCents;
    const name = locale === "nl" ? product.nameNl : product.nameEn;
    patchItem(index, {
      productId,
      name,
      unitPriceIncl: String(centsToEurosNumber(cents)),
    });
  }

  function buildPayload() {
    const items = form.items
      .map((item) => ({
        productId: item.productId || undefined,
        name: item.name.trim(),
        quantity: Number(item.quantity),
        unitPriceIncl: Number(String(item.unitPriceIncl).replace(",", ".")),
      }))
      .filter(
        (item) =>
          item.name &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unitPriceIncl) &&
          item.unitPriceIncl >= 0,
      );

    return {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      locale: form.locale,
      status: form.status,
      items,
    };
  }

  async function saveOrder() {
    const payload = buildPayload();
    if (!payload.name || !payload.email || !payload.items.length) {
      toast.error(t("invalidForm"));
      return;
    }
    setBusy(true);
    try {
      const isEdit = dialog === "edit" && active;
      const res = await fetch(
        isEdit ? `/api/shop/orders/${active.id}` : "/api/shop/orders",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast.success(isEdit ? t("updated") : t("created"));
      setDialog(null);
      setActive(null);
      void qc.invalidateQueries({ queryKey: ["shop-orders"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function removeOrder() {
    if (!deleteId || !showDelete) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/shop/orders/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("deleted"));
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["shop-orders"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  const previewTotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(String(item.unitPriceIncl).replace(",", ".")) || 0;
      return sum + qty * price;
    }, 0);
  }, [form.items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        {canEdit ? (
          <Button type="button" className="rounded-xl" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("addOrder")}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {[
          { label: t("statTotal"), value: String(stats.total) },
          { label: t("statPending"), value: String(stats.pending) },
          {
            label: t("statOutstanding"),
            value: formatShopEuro(stats.outstanding, locale),
          },
          { label: t("statPaid"), value: String(stats.paid) },
          {
            label: t("statRevenue"),
            value: formatShopEuro(stats.revenue, locale),
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/70">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search")}
                className="h-9 pl-8"
              />
            </div>
            <select
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t("allStatuses")}</option>
              <option value="PENDING">{t("statusPENDING")}</option>
              <option value="PAID">{t("statusPAID")}</option>
              <option value="FAILED">{t("statusFAILED")}</option>
              <option value="CANCELLED">{t("statusCANCELLED")}</option>
            </select>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("loading")}
            </p>
          ) : !filtered.length ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Package className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5">{t("colOrder")}</th>
                    <th className="px-3 py-2.5">{t("colCustomer")}</th>
                    <th className="px-3 py-2.5">{t("colItems")}</th>
                    <th className="px-3 py-2.5">{t("colTotal")}</th>
                    <th className="px-3 py-2.5">{t("colStatus")}</th>
                    <th className="px-3 py-2.5">{t("colDate")}</th>
                    <th className="px-3 py-2.5 text-right">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-3 py-3">
                        <p className="font-medium text-primary">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {order.currency}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{order.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.email}
                        </p>
                        {order.company ? (
                          <p className="text-xs text-muted-foreground">
                            {order.company}
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-xs px-3 py-3 text-sm text-muted-foreground">
                        {order.items
                          .map((item) => `${item.quantity}× ${item.name}`)
                          .join(", ")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium">
                        {formatShopEuro(order.totalIncl, locale)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            statusClass(order.status),
                          )}
                        >
                          {t(`status${order.status}`)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString(locale)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openView(order)}
                            title={t("view")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {canEdit ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(order)}
                              title={t("edit")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                          {showDelete ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(order.id)}
                              title={t("delete")}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialog === "view"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="w-[min(96vw,40rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4 pr-14">
            <DialogTitle className="text-xl">{t("viewTitle")}</DialogTitle>
            <DialogDescription>
              {active?.orderNumber}
              {active ? (
                <Badge className={cn("ml-2", statusClass(active.status))} variant="outline">
                  {t(`status${active.status}`)}
                </Badge>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {active ? (
            <div className="space-y-4 px-5 py-4">
              <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                <h3 className="mb-3 text-sm font-semibold">{t("customerSection")}</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("name")}</dt>
                    <dd className="font-medium">{active.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("email")}</dt>
                    <dd className="font-medium">{active.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("company")}</dt>
                    <dd className="font-medium">{active.company || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("date")}</dt>
                    <dd className="font-medium">
                      {new Date(active.createdAt).toLocaleString(locale)}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                <h3 className="mb-3 text-sm font-semibold">{t("itemsSection")}</h3>
                <ul className="space-y-2">
                  {active.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.name}`}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span className="whitespace-nowrap font-medium">
                        {formatShopEuro(item.unitPriceIncl * item.quantity, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("subtotal")}</span>
                    <span>{formatShopEuro(active.subtotalExcl, locale)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("vat")}</span>
                    <span>{formatShopEuro(active.vatAmount, locale)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{t("total")}</span>
                    <span>{formatShopEuro(active.totalIncl, locale)}</span>
                  </div>
                </div>
              </section>
              {canEdit ? (
                <div className="flex justify-end">
                  <Button type="button" className="rounded-xl" onClick={() => openEdit(active)}>
                    {t("edit")}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="max-h-[min(92vh,920px)] w-[min(96vw,48rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14">
            <DialogTitle className="text-xl md:text-2xl">
              {dialog === "edit" ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>
              {dialog === "edit" && active
                ? active.orderNumber
                : t("formHint")}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <h3 className="mb-3 text-sm font-semibold">{t("customerSection")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("name")}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => patchForm({ name: e.target.value })}
                    className="rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("email")}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => patchForm({ email: e.target.value })}
                    className="rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("company")}</Label>
                  <Input
                    value={form.company}
                    onChange={(e) => patchForm({ company: e.target.value })}
                    className="rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("status")}</Label>
                  <select
                    className={cn(
                      "h-10 w-full rounded-xl border px-3 text-sm font-medium",
                      statusClass(form.status),
                    )}
                    value={form.status}
                    onChange={(e) =>
                      patchForm({ status: e.target.value as Order["status"] })
                    }
                  >
                    <option value="PENDING">{t("statusPENDING")}</option>
                    <option value="PAID">{t("statusPAID")}</option>
                    <option value="FAILED">{t("statusFAILED")}</option>
                    <option value="CANCELLED">{t("statusCANCELLED")}</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("itemsSection")}</h3>
                <Button type="button" size="sm" variant="outline" onClick={addItemRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {t("addItem")}
                </Button>
              </div>
              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-xl border border-border/50 bg-background/80 p-3 sm:grid-cols-[1.2fr_1fr_5rem_6.5rem_auto]"
                  >
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        {t("product")}
                      </Label>
                      <select
                        className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
                        value={item.productId}
                        onChange={(e) => applyProduct(index, e.target.value)}
                      >
                        <option value="">{t("customItem")}</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {locale === "nl" ? p.nameNl : p.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        {t("itemName")}
                      </Label>
                      <Input
                        value={item.name}
                        onChange={(e) => patchItem(index, { name: e.target.value })}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        {t("qty")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          patchItem(index, { quantity: e.target.value })
                        }
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        {t("unitPrice")}
                      </Label>
                      <Input
                        value={item.unitPriceIncl}
                        onChange={(e) =>
                          patchItem(index, { unitPriceIncl: e.target.value })
                        }
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={form.items.length <= 1}
                        onClick={() => removeItemRow(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-right text-sm font-semibold">
                {t("total")}: {formatShopEuro(previewTotal, locale)}
              </p>
            </section>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialog(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-xl px-5"
              disabled={busy}
              onClick={() => void saveOrder()}
            >
              {busy ? t("saving") : t("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>{t("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void removeOrder()}
            >
              {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
