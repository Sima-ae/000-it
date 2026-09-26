import { cn } from "@/lib/utils";

/** Shared hero tablet width — keep category + service pages consistent. */
export const TABLET_FRAME_SIZE = "w-full max-w-60";

/**
 * Device-style tablet bezel used for service/category heroes
 * (e.g. /diensten/domeinen, /diensten/categorie/*).
 */
export function TabletFrame({
  children,
  className,
  screenClassName,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div
      className={cn(
        TABLET_FRAME_SIZE,
        "rounded-2xl bg-neutral-950 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)] ring-1 ring-black/30",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-4/3 overflow-hidden rounded-[0.85rem] bg-white",
          screenClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
