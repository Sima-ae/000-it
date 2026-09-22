"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/shop/cart-store";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { localizeShopProduct } from "@/lib/shop/catalog";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import { cn } from "@/lib/utils";
import { localizedHref } from "@/i18n/pathnames";

const CLOSE_DELAY_MS = 180;

export function CartNavButton({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("shop");
  const tCommon = useTranslations("common");
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;
  const totals = useMemo(() => resolveCartItems(items), [items]);
  const euros = cartTotalsInEuros(totals);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
          open && "bg-muted/70 text-foreground",
        )}
        aria-label={tCommon("cart")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
            setOpen((v) => !v);
            return;
          }
          router.push(localizedHref(locale, "/shop/cart"));
        }}
      >
        <ShoppingCart className="h-5.5 w-5.5" />
        {count > 0 ? (
          <span className="absolute right-0 top-0 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 hidden pt-2 lg:block"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="w-[min(92vw,20rem)] rounded-2xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-xl">
            <div className="mb-2 px-1">
              <p className="text-sm font-semibold tracking-tight">{t("cartTitle")}</p>
            </div>

            {!mounted || items.length === 0 ? (
              <p className="px-1 py-4 text-center text-sm text-muted-foreground">{t("emptyCart")}</p>
            ) : (
              <>
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {totals.lines.map((line) => {
                    const localized = localizeShopProduct(line.product, locale);
                    return (
                      <li
                        key={line.product.id}
                        className="flex gap-2.5 rounded-xl bg-muted/30 p-2"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {line.product.image ? (
                            <Image
                              src={line.product.image}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="44px"
                              unoptimized={line.product.image.startsWith("http")}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-snug">
                            {localized.localizedName}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {line.quantity}×{" "}
                            {formatShopEuro(centsToEuros(line.unitInclCents), locale)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatShopEuro(centsToEuros(line.lineInclCents), locale)}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 px-1 pt-3 text-sm">
                  <span className="text-muted-foreground">{t("totalIncl")}</span>
                  <span className="font-semibold tabular-nums">
                    {formatShopEuro(euros.totalIncl, locale)}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <Button asChild size="sm" variant="outline" className="w-full rounded-xl">
                    <SoftLink
                      href={localizedHref(locale, "/shop/cart")}
                      onClick={() => setOpen(false)}
                    >
                      {t("goToCart")}
                    </SoftLink>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <SoftLink
                      href={localizedHref(locale, "/shop/checkout")}
                      onClick={() => setOpen(false)}
                    >
                      {t("toCheckout")}
                    </SoftLink>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
