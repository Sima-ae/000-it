"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useBrand } from "@/lib/brand/BrandProvider";

export const BRAND_WEB_LOGO = "/branding/WEBLOGO-TripleZero-iT.png";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const brand = useBrand();
  return (
    <Image
      src={brand.logoSrc}
      alt={brand.logoAlt}
      width={600}
      height={200}
      priority={priority}
      className={cn("h-9 w-auto md:h-11", className)}
    />
  );
}
