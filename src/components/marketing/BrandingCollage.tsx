import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
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
    <div className="flex h-40 flex-nowrap items-stretch justify-center gap-1.5 sm:h-48 sm:gap-2 md:h-56 md:gap-2.5 lg:h-64">
      {BRANDING_COLLAGE.map((src, i) => {
        const isMiddle = i === Math.floor(BRANDING_COLLAGE.length / 2);
        return (
          <div
            key={src}
            className={cn(
              "relative h-full shrink-0 overflow-hidden rounded-2xl bg-muted/20",
              isMiddle
                ? "w-44 sm:w-52 md:w-64 lg:w-72"
                : "w-28 sm:w-32 md:w-36 lg:w-40",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              sizes={isMiddle ? "288px" : "160px"}
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
        "mx-auto w-full max-w-[72rem] overflow-x-auto px-3 pb-1 sm:px-4 md:max-w-[80rem] md:px-6 md:pb-2",
        className,
      )}
    >
      <Reveal from="up" duration={0.55}>
        {href ? (
          <SoftLink
            href={href}
            className="group block"
            aria-label="Services"
          >
            {tiles}
          </SoftLink>
        ) : (
          <div aria-hidden>{tiles}</div>
        )}
      </Reveal>
    </section>
  );
}
