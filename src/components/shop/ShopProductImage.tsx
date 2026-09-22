"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  resolveShopImageSrc,
  SHOP_IMAGE_FALLBACK,
  shouldUnoptimizeShopImage,
} from "@/lib/shop/product-image";
import { cn } from "@/lib/utils";

export function ShopProductImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  /** Extra class when showing the brand fallback (often object-contain). */
  fallbackClassName?: string;
}) {
  const resolved = resolveShopImageSrc(src);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(resolveShopImageSrc(src));
  }, [src]);

  const isFallback = current === SHOP_IMAGE_FALLBACK;

  return (
    <Image
      src={current}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn(
        isFallback
          ? cn("object-contain p-2 opacity-80", fallbackClassName)
          : "object-cover",
        className,
      )}
      unoptimized={shouldUnoptimizeShopImage(current)}
      onError={() => {
        if (current !== SHOP_IMAGE_FALLBACK) setCurrent(SHOP_IMAGE_FALLBACK);
      }}
    />
  );
}
