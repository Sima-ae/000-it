"use client";

import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { formatEuro } from "@/lib/format-euro";

export function ServiceCard({
  href,
  title,
  summary,
  price,
  listPrice,
  image,
}: {
  href: string;
  title: string;
  summary?: string;
  price?: number | null;
  listPrice?: number | null;
  image?: string | null;
}) {
  const hasDiscount =
    typeof price === "number" &&
    typeof listPrice === "number" &&
    listPrice > price;

  return (
    <SoftLink href={href} className="block h-full">
      <GlassCard className="flex h-full flex-col overflow-hidden p-0">
        {image ? (
          <div className="relative h-36 w-full bg-muted/40">
            <ShopProductImage
              src={image}
              alt={title}
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {summary ? (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{summary}</p>
          ) : null}
          {typeof price === "number" ? (
            hasDiscount ? (
              <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-4">
                <p className="font-display text-sm font-medium text-muted-foreground line-through decoration-2">
                  {formatEuro(listPrice)}
                </p>
                <p className="font-display text-base font-semibold text-primary">
                  {formatEuro(price)}
                </p>
              </div>
            ) : (
              <p className="mt-auto pt-4 font-display text-base font-semibold text-foreground">
                {formatEuro(price)}
              </p>
            )
          ) : null}
        </div>
      </GlassCard>
    </SoftLink>
  );
}
