"use client";

import { useEffect, useRef, useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JumpLink = {
  key: string;
  id: string;
  label: string;
};

export function ServicesJumpNav({
  locale,
  links,
}: {
  locale: string;
  links: JumpLink[];
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const update = () => {
      const styles = getComputedStyle(document.documentElement);
      const navOffsetRaw = styles.getPropertyValue("--nav-offset").trim() || "5.75rem";
      const navOffsetPx = navOffsetRaw.endsWith("rem")
        ? parseFloat(navOffsetRaw) * 16
        : parseFloat(navOffsetRaw);
      const stickyTop = Math.max(navOffsetPx - 8, 0); // matches top-[calc(var(--nav-offset)-0.5rem)]

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
    const onResize = () => {
      observer.disconnect();
      observer = update();
    };
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div className="sticky top-[calc(var(--nav-offset)-0.5rem)] z-30 -mx-4 bg-transparent px-4 py-1 md:-mx-6 md:px-6">
        <div className="flex flex-wrap justify-center gap-1.5">
          {links.map((link) => (
            <Button
              key={link.key}
              asChild
              size="sm"
              variant="outline"
              className={cn(
                "h-8 rounded-xl px-3 text-xs transition-[background-color,box-shadow]",
                stuck && "bg-white shadow-sm hover:bg-white dark:bg-background dark:hover:bg-background",
              )}
            >
              <SoftLink href={`/${locale}/diensten#${link.id}`}>{link.label}</SoftLink>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
