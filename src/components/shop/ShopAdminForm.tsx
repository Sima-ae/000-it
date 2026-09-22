"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SHOP_BILLING_INTERVALS,
  SHOP_CATEGORIES,
  SHOP_PRODUCT_TYPES,
  slugifyShop,
} from "@/lib/shop/admin";

export type ShopAdminFormValues = {
  id?: string;
  sku: string;
  slug: string;
  type: (typeof SHOP_PRODUCT_TYPES)[number];
  nameNl: string;
  nameEn: string;
  shortDescriptionNl: string;
  shortDescriptionEn: string;
  descriptionNl: string;
  descriptionEn: string;
  priceIncl: string;
  billingInterval: (typeof SHOP_BILLING_INTERVALS)[number];
  billAsYearlyPackage: boolean;
  checkoutMonths: string;
  category: string;
  image: string;
  featured: boolean;
  published: boolean;
  sortOrder: string;
  planKey: "" | "starter" | "growth";
  tags: string;
};

const empty: ShopAdminFormValues = {
  sku: "",
  slug: "",
  type: "service",
  nameNl: "",
  nameEn: "",
  shortDescriptionNl: "",
  shortDescriptionEn: "",
  descriptionNl: "",
  descriptionEn: "",
  priceIncl: "",
  billingInterval: "one_time",
  billAsYearlyPackage: false,
  checkoutMonths: "",
  category: "other",
  image: "",
  featured: false,
  published: true,
  sortOrder: "100",
  planKey: "",
  tags: "",
};

export function ShopAdminForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<ShopAdminFormValues>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ShopAdminFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof ShopAdminFormValues>(
    key: K,
    value: ShopAdminFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/shop/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setField("image", data.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const priceIncl = Number(form.priceIncl.replace(",", "."));
      if (!Number.isFinite(priceIncl) || priceIncl <= 0) {
        throw new Error("Enter a valid price");
      }

      const payload = {
        sku: form.sku.trim().toUpperCase() || `SKU-${Date.now().toString(36).toUpperCase()}`,
        slug: form.slug.trim() || slugifyShop(form.nameEn || form.nameNl),
        type: form.type,
        nameNl: form.nameNl.trim(),
        nameEn: form.nameEn.trim(),
        shortDescriptionNl: form.shortDescriptionNl,
        shortDescriptionEn: form.shortDescriptionEn,
        descriptionNl: form.descriptionNl,
        descriptionEn: form.descriptionEn,
        priceIncl,
        billingInterval: form.billingInterval,
        billAsYearlyPackage: form.billAsYearlyPackage,
        checkoutMonths: form.billAsYearlyPackage
          ? Number(form.checkoutMonths || "12")
          : form.checkoutMonths
            ? Number(form.checkoutMonths)
            : null,
        category: form.category || null,
        image: form.image || null,
        featured: form.featured,
        published: form.published,
        sortOrder: Number(form.sortOrder || "0"),
        planKey: form.planKey || null,
        tags: form.tags,
      };

      const res = await fetch(
        form.id ? `/api/shop/products/${form.id}` : "/api/shop/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success(form.id ? "Product updated" : "Product created");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nameNl">Title (NL)</Label>
          <Input
            id="nameNl"
            value={form.nameNl}
            onChange={(e) => setField("nameNl", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">Title (EN)</Label>
          <Input
            id="nameEn"
            value={form.nameEn}
            onChange={(e) => {
              setField("nameEn", e.target.value);
              if (!form.id && !form.slug) {
                setField("slug", slugifyShop(e.target.value));
              }
            }}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) => setField("sku", e.target.value.toUpperCase())}
            placeholder="SVC-EXAMPLE"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setField("slug", slugifyShop(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={form.type}
            onChange={(e) =>
              setField("type", e.target.value as ShopAdminFormValues["type"])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {SHOP_PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shortNl">Short description (NL)</Label>
          <Textarea
            id="shortNl"
            rows={3}
            value={form.shortDescriptionNl}
            onChange={(e) => setField("shortDescriptionNl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shortEn">Short description (EN)</Label>
          <Textarea
            id="shortEn"
            rows={3}
            value={form.shortDescriptionEn}
            onChange={(e) => setField("shortDescriptionEn", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="descNl">Full description (NL)</Label>
          <Textarea
            id="descNl"
            rows={6}
            value={form.descriptionNl}
            onChange={(e) => setField("descriptionNl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descEn">Full description (EN)</Label>
          <Textarea
            id="descEn"
            rows={6}
            value={form.descriptionEn}
            onChange={(e) => setField("descriptionEn", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price incl. VAT (€)</Label>
          <Input
            id="price"
            inputMode="decimal"
            value={form.priceIncl}
            onChange={(e) => setField("priceIncl", e.target.value)}
            placeholder="64.95"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing">Billing</Label>
          <select
            id="billing"
            value={form.billingInterval}
            onChange={(e) =>
              setField(
                "billingInterval",
                e.target.value as ShopAdminFormValues["billingInterval"],
              )
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="one_time">One-time</option>
            <option value="weekly">Per week</option>
            <option value="monthly">Per month</option>
            <option value="yearly">Per year</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {SHOP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setField("sortOrder", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.billAsYearlyPackage}
            onChange={(e) => {
              setField("billAsYearlyPackage", e.target.checked);
              if (e.target.checked && !form.checkoutMonths) {
                setField("checkoutMonths", "12");
              }
            }}
          />
          Bill as yearly package (charge listed monthly price × months)
        </label>
        {form.billAsYearlyPackage ? (
          <div className="max-w-xs space-y-2">
            <Label htmlFor="checkoutMonths">Checkout months</Label>
            <Input
              id="checkoutMonths"
              type="number"
              min={1}
              max={36}
              value={form.checkoutMonths}
              onChange={(e) => setField("checkoutMonths", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Typical hosting: list monthly price, charge × 12 at checkout.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="planKey">Plan key (optional)</Label>
          <select
            id="planKey"
            value={form.planKey}
            onChange={(e) =>
              setField("planKey", e.target.value as ShopAdminFormValues["planKey"])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">—</option>
            <option value="starter">starter (Business)</option>
            <option value="growth">growth (Extra Growth)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setField("tags", e.target.value)}
            placeholder="AI, hosting, SEO"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={form.image}
          onChange={(e) => setField("image", e.target.value)}
          placeholder="/uploads/shop/…"
        />
        <Input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
        {form.image ? (
          <div className="relative mt-2 h-28 w-44 overflow-hidden rounded-lg border bg-muted">
            <Image src={form.image} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setField("published", e.target.checked)}
          />
          Published
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setField("featured", e.target.checked)}
          />
          Featured
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : form.id ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
