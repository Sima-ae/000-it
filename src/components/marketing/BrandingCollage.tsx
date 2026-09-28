import Image from "next/image";
import { SoftLink } from "@/components/shared/SoftLink";
import { BRANDING_COLLAGE_IMAGE } from "@/lib/branding-images";
import { cn } from "@/lib/utils";

/**
 * Homepage photo strip. Decorative; links to services when `href` is set.
 */
export function BrandingCollage({
  href,
  src = BRANDING_COLLAGE_IMAGE,
  label = "Services",
  className,
}: {
  href?: string;
  src?: string;
  label?: string;
  className?: string;
}) {
  const photo = (
    <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-background shadow-sm">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
      />
    </div>
  );

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl px-4 pt-8 pb-3 md:max-w-7xl md:px-6 md:pt-10 md:pb-4",
        className,
      )}
    >
      {href ? (
        <SoftLink
          href={href}
          className="group block overflow-visible"
          aria-label={label}
        >
          {photo}
        </SoftLink>
      ) : (
        <div aria-hidden>{photo}</div>
      )}
    </section>
  );
}
