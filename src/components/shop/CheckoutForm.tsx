"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { useCartStore } from "@/lib/shop/cart-store";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { formatShopEuro } from "@/lib/shop/vat";
import { isStripeConfiguredClient } from "@/lib/shop/stripe-public";

export function CheckoutForm() {
  const locale = useLocale();
  const t = useTranslations("shop");
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);

  const totals = useMemo(() => resolveCartItems(items), [items]);
  const euros = cartTotalsInEuros(totals);

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-10 text-center">
        <p className="text-muted-foreground">{t("emptyCart")}</p>
        <Button asChild className="mt-6 rounded-2xl">
          <SoftLink href={`/${locale}/shop`}>{t("continueShopping")}</SoftLink>
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
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
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
        {!isStripeConfiguredClient() ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            {t("stripeMissing")}
          </p>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-border/70 bg-muted/20 p-6">
        <h2 className="font-display text-xl font-semibold">{t("orderSummary")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {totals.lines.map((line) => (
            <li key={line.product.id} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {line.quantity}× {line.product.name[locale === "nl" ? "nl" : "en"]}
              </span>
              <span>{formatShopEuro(line.lineInclCents / 100, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
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
        <Button type="submit" className="mt-6 w-full rounded-2xl" disabled={loading}>
          {loading ? t("redirecting") : t("payWithStripe")}
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <SoftLink href={`/${locale}/shop/cart`}>{t("backToCart")}</SoftLink>
        </Button>
      </aside>
    </form>
  );
}
