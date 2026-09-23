"use client";

import { useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
  SHOP_BILLING_INTERVALS,
  SHOP_CATEGORIES,
  SHOP_PRODUCT_TYPES,
  slugifyShop,
} from "@/lib/shop/admin";
import { cn } from "@/lib/utils";

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
  /** Optional sale price; empty string clears */
  discountPriceIncl: string;
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
  discountPriceIncl: "",
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

const selectClass =
  "flex h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-muted/15 p-4 md:p-5">
      <div className="mb-4 border-b border-border/50 pb-3">
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

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
      const discountRaw = form.discountPriceIncl.trim().replace(",", ".");
      const discountPriceIncl = discountRaw
        ? Number(discountRaw)
        : null;
      if (
        discountPriceIncl != null &&
        (!Number.isFinite(discountPriceIncl) || discountPriceIncl <= 0)
      ) {
        throw new Error("Enter a valid aanbieding price or leave it empty");
      }
      if (discountPriceIncl != null && discountPriceIncl >= priceIncl) {
        throw new Error("Aanbieding must be lower than the regular price");
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
        discountPriceIncl,
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
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2">
        <Section
          title="Identity"
          description="Public titles and catalog identifiers."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (NL)" htmlFor="nameNl">
              <Input
                id="nameNl"
                value={form.nameNl}
                onChange={(e) => setField("nameNl", e.target.value)}
                className="rounded-xl bg-background"
                required
              />
            </Field>
            <Field label="Title (EN)" htmlFor="nameEn">
              <Input
                id="nameEn"
                value={form.nameEn}
                onChange={(e) => {
                  setField("nameEn", e.target.value);
                  if (!form.id && !form.slug) {
                    setField("slug", slugifyShop(e.target.value));
                  }
                }}
                className="rounded-xl bg-background"
                required
              />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="SKU" htmlFor="sku">
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value.toUpperCase())}
                placeholder="SVC-EXAMPLE"
                className="rounded-xl bg-background font-mono text-xs"
                required
              />
            </Field>
            <Field label="Slug" htmlFor="slug" hint="Used in /shop/[slug] URLs">
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setField("slug", slugifyShop(e.target.value))}
                className="rounded-xl bg-background font-mono text-xs"
                required
              />
            </Field>
            <Field label="Type" htmlFor="type">
              <select
                id="type"
                value={form.type}
                onChange={(e) =>
                  setField("type", e.target.value as ShopAdminFormValues["type"])
                }
                className={selectClass}
              >
                {SHOP_PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section
          title="Copy"
          description="Short blurbs for cards; full text for detail pages."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Short description (NL)" htmlFor="shortNl">
              <Textarea
                id="shortNl"
                rows={4}
                value={form.shortDescriptionNl}
                onChange={(e) => setField("shortDescriptionNl", e.target.value)}
                className="min-h-26 rounded-xl bg-background"
              />
            </Field>
            <Field label="Short description (EN)" htmlFor="shortEn">
              <Textarea
                id="shortEn"
                rows={4}
                value={form.shortDescriptionEn}
                onChange={(e) => setField("shortDescriptionEn", e.target.value)}
                className="min-h-26 rounded-xl bg-background"
              />
            </Field>
            <Field label="Full description (NL)" htmlFor="descNl">
              <Textarea
                id="descNl"
                rows={8}
                value={form.descriptionNl}
                onChange={(e) => setField("descriptionNl", e.target.value)}
                className="min-h-44 rounded-xl bg-background"
              />
            </Field>
            <Field label="Full description (EN)" htmlFor="descEn">
              <Textarea
                id="descEn"
                rows={8}
                value={form.descriptionEn}
                onChange={(e) => setField("descriptionEn", e.target.value)}
                className="min-h-44 rounded-xl bg-background"
              />
            </Field>
          </div>
        </Section>

        <Section title="Pricing & catalog" description="Billing, category and sort position.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Price incl. VAT (€)" htmlFor="price">
              <Input
                id="price"
                inputMode="decimal"
                value={form.priceIncl}
                onChange={(e) => setField("priceIncl", e.target.value)}
                placeholder="64.95"
                className="rounded-xl bg-background"
                required
              />
            </Field>
            <Field
              label="Aanbieding (€)"
              htmlFor="discountPrice"
              hint="Optional sale price. Leave empty for no discount."
            >
              <Input
                id="discountPrice"
                inputMode="decimal"
                value={form.discountPriceIncl}
                onChange={(e) => setField("discountPriceIncl", e.target.value)}
                placeholder="4.99"
                className="rounded-xl bg-background"
              />
            </Field>
            <Field label="Billing" htmlFor="billing">
              <select
                id="billing"
                value={form.billingInterval}
                onChange={(e) =>
                  setField(
                    "billingInterval",
                    e.target.value as ShopAdminFormValues["billingInterval"],
                  )
                }
                className={selectClass}
              >
                <option value="one_time">One-time</option>
                <option value="weekly">Per week</option>
                <option value="monthly">Per month</option>
                <option value="yearly">Per year</option>
              </select>
            </Field>
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className={selectClass}
              >
                {SHOP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order" htmlFor="sortOrder">
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                className="rounded-xl bg-background"
              />
            </Field>
          </div>

          <div className="mt-4 rounded-xl border border-border/50 bg-background/70 p-3.5">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.billAsYearlyPackage}
                onChange={(e) => {
                  setField("billAsYearlyPackage", e.target.checked);
                  if (e.target.checked && !form.checkoutMonths) {
                    setField("checkoutMonths", "12");
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span>
                <span className="font-medium text-foreground">
                  Bill as yearly package
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Charge listed monthly price × months at checkout (typical hosting).
                </span>
              </span>
            </label>
            {form.billAsYearlyPackage ? (
              <div className="mt-3 max-w-xs pl-7">
                <Field label="Checkout months" htmlFor="checkoutMonths">
                  <Input
                    id="checkoutMonths"
                    type="number"
                    min={1}
                    max={36}
                    value={form.checkoutMonths}
                    onChange={(e) => setField("checkoutMonths", e.target.value)}
                    className="rounded-xl bg-background"
                  />
                </Field>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Plan key (optional)" htmlFor="planKey">
              <select
                id="planKey"
                value={form.planKey}
                onChange={(e) =>
                  setField("planKey", e.target.value as ShopAdminFormValues["planKey"])
                }
                className={selectClass}
              >
                <option value="">—</option>
                <option value="starter">starter (Business)</option>
                <option value="growth">growth (Extra Growth)</option>
              </select>
            </Field>
            <Field label="Tags (comma-separated)" htmlFor="tags">
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                placeholder="wordpress-support, monthly"
                className="rounded-xl bg-background"
              />
            </Field>
          </div>
        </Section>

        <Section title="Media & visibility" description="Thumbnail and catalog flags.">
          <div className="grid gap-5 lg:grid-cols-[11rem_1fr]">
            <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-2xl border border-border/70 bg-muted/40 shadow-sm lg:mx-0">
              {form.image ? (
                <ShopProductImage
                  src={form.image}
                  alt={form.nameEn || form.nameNl || "Product image"}
                  sizes="176px"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
                  <ImagePlus className="h-8 w-8 opacity-50" />
                  <span className="text-xs">No image yet</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Field label="Image URL" htmlFor="image" hint="Public path under /uploads/…">
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  placeholder="/uploads/fixweb/…"
                  className="rounded-xl bg-background font-mono text-xs"
                />
              </Field>
              <div>
                <Label className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground">
                  Upload image
                </Label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                    uploading && "pointer-events-none opacity-60",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Choose image file"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadFile(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    form.published
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/70 bg-background text-muted-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.published}
                    onChange={(e) => setField("published", e.target.checked)}
                  />
                  Published
                </label>
                <label
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    form.featured
                      ? "border-accent/40 bg-accent/15 text-foreground"
                      : "border-border/70 bg-background text-muted-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.featured}
                    onChange={(e) => setField("featured", e.target.checked)}
                  />
                  Featured
                </label>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 mt-2 flex items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-4 pb-1 backdrop-blur">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-xl px-5" disabled={saving || uploading}>
          {saving ? "Saving…" : form.id ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
