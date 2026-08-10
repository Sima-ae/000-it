"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { cn } from "@/lib/utils";

const featuredByGroup: Record<string, string[]> = {
  wordpress: [
    "wordpress-error-fix",
    "wordpress-malware-removal",
    "wordpress-speed-optimization",
    "wordpress-security",
    "wordpress-backup-hosting-migration",
    "premium-support",
  ],
  marketing: ["seo-optimization"],
  hosting: [
    "shared-hosting-basic",
    "shared-hosting-plus",
    "shared-hosting-business",
    "wordpress-hosting-basic",
    "wordpress-hosting-plus",
    "vps-hosting-basic",
  ],
};

const CLOSE_DELAY_MS = 220;

export function ServicesMegaMenu({
  locale,
  label,
  active,
}: {
  locale: string;
  label: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNl = locale === "nl";

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
          (active || open) && "bg-primary/10 text-foreground",
        )}
        onClick={() => setOpen((v) => !v)}
        onFocus={openMenu}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="absolute left-1/2 top-full z-50 w-[min(92vw,720px)] -translate-x-1/2 pt-3"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {/* Invisible bridge fills the gap under the trigger so hover never drops */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-3" />
          <div className="rounded-3xl border border-border/70 bg-background/95 p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isNl ? "Alle diensten" : "All services"}
              </p>
              <SoftLink
                href={`/${locale}/diensten`}
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                {isNl ? "Overzicht" : "Overview"}
              </SoftLink>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {serviceGroups.map((group) => {
                const slugs = featuredByGroup[group.id] || [];
                const items = slugs
                  .map((slug) => serviceCatalog.find((s) => s.slug === slug))
                  .filter(Boolean);
                return (
                  <div key={group.id}>
                    <p className="mb-2 px-2 text-xs font-semibold text-foreground">
                      {isNl ? group.titleNl : group.title}
                    </p>
                    <div className="flex flex-col">
                      {items.map((item) =>
                        item ? (
                          <SoftLink
                            key={item.slug}
                            href={`/${locale}/diensten/${item.slug}`}
                            className="rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                            onClick={() => setOpen(false)}
                          >
                            {isNl ? item.titleNl : item.title}
                          </SoftLink>
                        ) : null,
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
