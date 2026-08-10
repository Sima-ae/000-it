import Image from "next/image";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { formatEuro } from "@/lib/fixweb-content";

export function ServiceCard({
  href,
  title,
  summary,
  price,
  image,
}: {
  href: string;
  title: string;
  summary?: string;
  price?: number | null;
  image?: string | null;
}) {
  return (
    <SoftLink href={href} className="block h-full">
      <GlassCard className="flex h-full flex-col overflow-hidden p-0">
        {image ? (
          <div className="relative h-36 w-full bg-muted/40">
            <Image src={image} alt={title} fill className="object-cover" unoptimized />
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
            <p className="mt-auto pt-4 font-display text-base font-semibold text-foreground">
              {formatEuro(price)}
            </p>
          ) : null}
        </div>
      </GlassCard>
    </SoftLink>
  );
}
