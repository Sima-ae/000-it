"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/shop/cart-store";
import { localizedHref } from "@/i18n/pathnames";

export function AddToCartButton({
  productId,
  label,
}: {
  productId: string;
  label: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      className="mt-6 rounded-2xl"
      onClick={() => {
        addItem(productId, 1);
        router.push(localizedHref(locale, "/shop/cart"));
      }}
    >
      {label}
    </Button>
  );
}
