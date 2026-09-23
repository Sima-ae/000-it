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
  ShopAdminForm,
  type ShopAdminFormValues,
} from "@/components/shop/ShopAdminForm";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { localizedHref } from "@/i18n/pathnames";
import { canDelete, canEditResource } from "@/lib/roles";
import { centsToEurosNumber } from "@/lib/shop/admin";

type Item = {
  id: string;
  sku: string;
  slug: string;
  type: string;
  nameNl: string;
  nameEn: string;
  shortDescriptionNl: string;
  shortDescriptionEn: string;
  descriptionNl: string;
  descriptionEn: string;
  priceInclCents: number;
  discountPriceInclCents?: number | null;
  billingInterval: string;
  billAsYearlyPackage: boolean;
  checkoutMonths: number | null;
  category: string | null;
  image: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  planKey: string | null;
  tags: unknown;
  createdById?: string | null;
};

function listToCsv(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map(String).join(", ");
}

function billingLabel(item: Item) {
  const base =
    item.billingInterval === "one_time"
      ? "one-time"
      : item.billingInterval === "weekly"
        ? "per week"
        : item.billingInterval === "monthly"
          ? "per month"
          : item.billingInterval === "yearly"
            ? "per year"
            : item.billingInterval;
  if (item.billAsYearlyPackage) {
    return `${base} · ×${item.checkoutMonths || 12} package`;
  }
  return base;
}

export default function ShopAdminPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const role = session?.user?.role;
  const userId = session?.user?.id || "";
  const showDelete = canDelete(role);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShopAdminFormValues | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["shop-admin"],
    queryFn: async () => {
      const res = await fetch("/api/shop/products?all=1");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as Item[];
    },
  });

  const initialEdit = useMemo(() => editing, [editing]);
  const isEdit = !!editing?.id;

  function startCreate() {
    setEditing(null);
    setOpen(true);
  }

  function startEdit(item: Item) {
    setEditing({
      id: item.id,
      sku: item.sku,
      slug: item.slug,
      type: (["product", "service", "plan"].includes(item.type)
        ? item.type
        : "service") as ShopAdminFormValues["type"],
      nameNl: item.nameNl,
      nameEn: item.nameEn,
      shortDescriptionNl: item.shortDescriptionNl,
      shortDescriptionEn: item.shortDescriptionEn,
      descriptionNl: item.descriptionNl,
      descriptionEn: item.descriptionEn,
      priceIncl: String(centsToEurosNumber(item.priceInclCents)),
      discountPriceIncl: item.discountPriceInclCents
        ? String(centsToEurosNumber(item.discountPriceInclCents))
        : "",
      billingInterval: (["one_time", "weekly", "monthly", "yearly"].includes(
        item.billingInterval,
      )
        ? item.billingInterval
        : "one_time") as ShopAdminFormValues["billingInterval"],
      billAsYearlyPackage: item.billAsYearlyPackage,
      checkoutMonths: item.checkoutMonths ? String(item.checkoutMonths) : "",
      category: item.category || "other",
      image: item.image || "",
      featured: item.featured,
      published: item.published,
      sortOrder: String(item.sortOrder ?? 0),
      planKey:
        item.planKey === "starter" || item.planKey === "growth"
          ? item.planKey
          : "",
      tags: listToCsv(item.tags),
    });
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Delete this shop product? This cannot be undone.")) return;
    const res = await fetch(`/api/shop/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed (super admin only)");
      return;
    }
    toast.success("Deleted");
    void qc.invalidateQueries({ queryKey: ["shop-admin"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("shop")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage products and services shown in the public shop. Delete is
            reserved for the super admin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={localizedHref(locale, "/shop")} target="_blank">
              View public shop
            </Link>
          </Button>
          <Button onClick={startCreate}>Add product</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && !items.length && (
            <p className="text-muted-foreground">
              No catalog products in the database yet. Run{" "}
              <code className="rounded bg-muted px-1">npm run shop:seed</code>{" "}
              or add one manually.
            </p>
          )}
          {items.map((item) => {
            const canEdit = canEditResource(role, item.createdById, userId);
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                  <ShopProductImage
                    src={item.image}
                    alt={locale === "nl" ? item.nameNl : item.nameEn}
                    sizes="112px"
                    fallbackClassName="p-3"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {locale === "nl" ? item.nameNl : item.nameEn}
                    </p>
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? "published" : "draft"}
                    </Badge>
                    {item.featured ? <Badge>featured</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.sku} · {item.slug} · {item.category || "—"} ·{" "}
                    {billingLabel(item)}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    € {centsToEurosNumber(item.priceInclCents).toFixed(2)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {canEdit ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </Button>
                  ) : null}
                  {showDelete ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void remove(item.id)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(96vw,56rem)] gap-0 p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl md:text-2xl">
              {isEdit ? "Edit product / service" : "Add product / service"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Titles, copy, pricing, media and catalog settings — structured for a clear shop entry.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 md:px-6">
            <ShopAdminForm
              key={initialEdit?.id || "new"}
              initial={initialEdit || undefined}
              onCancel={() => setOpen(false)}
              onSaved={() => {
                setOpen(false);
                void qc.invalidateQueries({ queryKey: ["shop-admin"] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
