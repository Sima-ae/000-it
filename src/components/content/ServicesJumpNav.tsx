"use client";

import { useEffect, useRef, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";
import { localizedHref } from "@/i18n/pathnames";

type JumpLink = {
  key: string;
  id: string;
  label: string;
};

/**
 * Jump strip for the main services index.
 * Category pages embed chips inside CategoryHero instead.
 */
export function ServicesJumpNav({
  locale,
  links,
  basePath = "/diensten",
}: {
  locale: string;
  links: JumpLink[];
  basePath?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const desktopMq = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (!desktopMq.matches) {
        setStuck(false);
        return null;
      }

      const styles = getComputedStyle(document.documentElement);
      const navOffsetRaw = styles.getPropertyValue("--nav-offset").trim() || "5.75rem";
      const navOffsetPx = navOffsetRaw.endsWith("rem")
        ? parseFloat(navOffsetRaw) * 16
        : parseFloat(navOffsetRaw);
      const stickyTop = Math.max(navOffsetPx - 8, 0);

      const observer = new IntersectionObserver(
        ([entry]) => setStuck(!entry.isIntersecting),
        {
          root: null,
          threshold: 0,
          rootMargin: `-${stickyTop}px 0px 0px 0px`,
        },
      );
      observer.observe(sentinel);
      return observer;
    };

    let observer = update();
    const onChange = () => {
      observer?.disconnect();
      observer = update();
    };
    desktopMq.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      observer?.disconnect();
      desktopMq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        className={cn(
          "bg-transparent py-0.5",
          "md:sticky md:top-[calc(var(--nav-offset)-0.5rem)] md:z-30",
          "transition-[padding] duration-300 ease-out",
          stuck && "md:pointer-events-none md:py-0",
        )}
      >
        <div
          className={cn(
            "flex max-w-full flex-wrap justify-start gap-1.5",
            "transition-[max-height,opacity,margin] duration-300 ease-out",
            stuck
              ? "md:max-h-0 md:m-0 md:overflow-hidden md:opacity-0"
              : "opacity-100",
          )}
          aria-hidden={stuck || undefined}
        >
          {links.map((link) => (
            <SoftLink
              key={link.key}
              href={`${localizedHref(locale, basePath)}#${link.id}`}
              tabIndex={stuck ? -1 : undefined}
              className={cn(
                "inline-flex h-7 items-center rounded-md border border-border/40",
                "bg-background/50 px-2.5 text-[11px] font-medium text-muted-foreground",
                "transition hover:border-border hover:bg-background hover:text-foreground",
              )}
            >
              {link.label}
            </SoftLink>
          ))}
        </div>
      </div>
    </>
  );
}
