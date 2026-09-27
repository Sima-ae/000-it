import { cn } from "@/lib/utils";

/** Small purple Premium label — domain names / expensive TLD catalog rows. */
export function PremiumBadge({
  className,
  label = "Premium",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
