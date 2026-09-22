"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/shop/cart-store";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  label,
  size = "default",
  className,
}: {
  productId: string;
  label: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      size={size}
      className={cn("rounded-2xl", className)}
      onClick={() => {
        addItem(productId, 1);
        router.push(localizedHref(locale, "/shop/cart"));
      }}
    >
      {label}
    </Button>
  );
}
