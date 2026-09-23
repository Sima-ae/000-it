"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { useCartStore } from "@/lib/shop/cart-store";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { localizeShopProduct } from "@/lib/shop/catalog";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import { localizedHref } from "@/i18n/pathnames";

export function CheckoutForm() {
  const locale = useLocale();
  const t = useTranslations("shop");
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const totals = useMemo(() => resolveCartItems(items), [items]);
  const euros = cartTotalsInEuros(totals);

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/status")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStripeReady(Boolean(data?.configured));
      })
      .catch(() => {
        if (!cancelled) setStripeReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-10 text-center">
        <p className="text-muted-foreground">{t("emptyCart")}</p>
        <Button asChild className="mt-6 rounded-2xl">
          <SoftLink href={localizedHref(locale, "/shop")}>{t("continueShopping")}</SoftLink>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("checkoutError"));
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error(t("checkoutError"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkoutError"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-background/60 p-6">
          <h2 className="font-display text-xl font-semibold">{t("guestDetails")}</h2>
          <p className="text-sm text-muted-foreground">{t("guestHint")}</p>
          <label className="block space-y-1.5 text-sm">
            <span>{t("name")}</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3"
              autoComplete="name"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t("email")}</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3"
              autoComplete="email"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t("companyOptional")}</span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3"
              autoComplete="organization"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {stripeReady === false ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              {t("stripeMissing")}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-border/70 bg-background/60 p-6 lg:hidden">
          <h2 className="font-display text-lg font-semibold">{t("orderSummary")}</h2>
          {totals.lines.map((line) => {
            const localized = localizeShopProduct(line.product, locale);
            return (
              <div key={line.product.id} className="border-b border-border/50 py-3 last:border-0">
                <p className="font-medium">{localized.localizedName}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(next) => setQuantity(line.product.id, next)}
                  />
                  <p className="font-semibold">
                    {formatShopEuro(centsToEuros(line.lineInclCents), locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-6">
        <h2 className="font-display text-xl font-semibold">{t("orderSummary")}</h2>
        <ul className="hidden space-y-4 lg:block">
          {totals.lines.map((line) => {
            const localized = localizeShopProduct(line.product, locale);
            return (
              <li key={line.product.id} className="space-y-2 border-b border-border/50 pb-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug">{localized.localizedName}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(line.product.id)}
                    aria-label={t("remove")}
                    title={t("remove")}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-600/10 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(next) => setQuantity(line.product.id, next)}
                  />
                  <span className="text-sm font-semibold">
                    {formatShopEuro(centsToEuros(line.lineInclCents), locale)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("subtotalExcl")}</dt>
            <dd>{formatShopEuro(euros.subtotalExcl, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("vat")}</dt>
            <dd>{formatShopEuro(euros.vat, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-base font-semibold">
            <dt>{t("totalIncl")}</dt>
            <dd>{formatShopEuro(euros.totalIncl, locale)}</dd>
          </div>
        </dl>
        <Button
          type="submit"
          className="mt-2 w-full rounded-2xl"
          disabled={loading || stripeReady === false}
        >
          {loading ? t("redirecting") : t("payWithStripe")}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <SoftLink href={localizedHref(locale, "/shop/cart")}>{t("backToCart")}</SoftLink>
        </Button>
      </aside>
    </form>
  );
}
