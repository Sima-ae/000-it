import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_WEB_LOGO = "/branding/WEBLOGO-TripleZero-iT.png";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={BRAND_WEB_LOGO}
      alt="TripleZero iT"
      width={600}
      height={150}
      priority={priority}
      className={cn("h-8 w-auto md:h-9", className)}
    />
  );
}
