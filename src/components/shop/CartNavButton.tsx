"use client";

import { ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { useCartStore } from "@/lib/shop/cart-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function CartNavButton({ className }: { className?: string }) {
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <SoftLink
      href={`/${locale}/shop/cart`}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/70 transition hover:border-primary/40",
        className,
      )}
      aria-label={locale === "nl" ? "Winkelwagen" : "Shopping cart"}
    >
      <ShoppingCart className="h-4 w-4" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </SoftLink>
  );
}
