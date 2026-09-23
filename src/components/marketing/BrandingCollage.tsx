import Image from "next/image";
import { SoftLink } from "@/components/shared/SoftLink";
import { BRANDING_COLLAGE } from "@/lib/branding-images";
import { cn } from "@/lib/utils";

/**
 * One-row mixed branding collage — homepage strip above the footer.
 * Decorative; tiles link to services when `href` is provided.
 */
export function BrandingCollage({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const tiles = (
    <div className="flex h-40 w-full min-w-0 items-stretch justify-center gap-1.5 sm:h-48 sm:gap-2 md:h-56 md:gap-2.5 lg:h-64">
      {BRANDING_COLLAGE.map((src, i) => {
        const isMiddle = i === Math.floor(BRANDING_COLLAGE.length / 2);
        return (
          <div
            key={src}
            className={cn(
              "relative h-full min-w-0 bg-background",
              isMiddle ? "flex-[1.85]" : "flex-1",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              sizes={isMiddle ? "30vw" : "16vw"}
              className="object-contain object-bottom transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl px-4 pb-1 md:max-w-7xl md:px-6 md:pb-2",
        className,
      )}
    >
      {href ? (
        <SoftLink
          href={href}
          className="group block overflow-visible"
          aria-label="Services"
        >
          {tiles}
        </SoftLink>
      ) : (
        <div aria-hidden>{tiles}</div>
      )}
    </section>
  );
}
