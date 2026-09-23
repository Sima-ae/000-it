"use client";

import { useEffect, useRef, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { localizedHref } from "@/i18n/pathnames";

type JumpLink = {
  key: string;
  id: string;
  label: string;
};

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
      // Collapse/hide only on desktop; on mobile tabs scroll away with the page.
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
          "-mx-4 bg-transparent px-4 py-1 md:-mx-6 md:px-6",
          "md:sticky md:top-[calc(var(--nav-offset)-0.5rem)] md:z-30",
          "transition-[padding] duration-300 ease-out",
          stuck && "md:pointer-events-none md:py-0",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap justify-center gap-1.5 overflow-hidden",
            "transition-[max-height,opacity,margin] duration-300 ease-out",
            stuck
              ? "md:max-h-0 md:opacity-0 md:m-0"
              : "max-h-112 opacity-100",
          )}
          aria-hidden={stuck || undefined}
        >
          {links.map((link) => (
            <Button
              key={link.key}
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-xl px-3 text-xs"
              tabIndex={stuck ? -1 : undefined}
            >
              <SoftLink href={`${localizedHref(locale, basePath)}#${link.id}`}>
                {link.label}
              </SoftLink>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
