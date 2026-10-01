"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  resolveShopImageSrc,
  SHOP_IMAGE_FALLBACK,
  shouldUnoptimizeShopImage,
} from "@/lib/shop/product-image";
import { useBrand } from "@/lib/brand/BrandProvider";
import { extrahostingFixwebArtSrc } from "@/lib/brand/eh-fixweb-art";
import { cn } from "@/lib/utils";

function isFixwebProductArt(src: string) {
  return (
    src.includes("/uploads/fixweb/") ||
    src.includes("/uploads/infoweb/") ||
    src.includes("/uploads/fixweb-eh/") ||
    src.includes("%2Fuploads%2Ffixweb%2F") ||
    src.includes("%2Fuploads%2Finfoweb%2F") ||
    src.includes("%2Fuploads%2Ffixweb-eh%2F")
  );
}

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
  const brand = useBrand();
  const resolved = resolveShopImageSrc(src);
  const ehArt = brand.id === "extrahosting" && isFixwebProductArt(resolved);
  const branded = ehArt ? extrahostingFixwebArtSrc(resolved) : resolved;
  const [current, setCurrent] = useState(branded);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    const next = resolveShopImageSrc(src);
    setRetried(false);
    setCurrent(
      brand.id === "extrahosting" && isFixwebProductArt(next)
        ? extrahostingFixwebArtSrc(next)
        : next,
    );
  }, [src, brand.id]);

  const isFallback = current.split("?")[0] === SHOP_IMAGE_FALLBACK;

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
          : "object-contain",
        className,
      )}
      unoptimized={shouldUnoptimizeShopImage(current)}
      onError={() => {
        // Prefer original fixweb art if an EH remapped file is missing.
        if (
          brand.id === "extrahosting" &&
          current.includes("/uploads/fixweb-eh/") &&
          resolved !== current
        ) {
          setCurrent(resolved);
          return;
        }
        // Bust a stale cached 404 before giving up on product art.
        if (!retried && isFixwebProductArt(current)) {
          setRetried(true);
          const bare = current.split("?")[0] ?? current;
          setCurrent(`${bare}?v=${Date.now()}`);
          return;
        }
        if ((current.split("?")[0] ?? current) !== SHOP_IMAGE_FALLBACK) {
          setCurrent(SHOP_IMAGE_FALLBACK);
        }
      }}
    />
  );
}
