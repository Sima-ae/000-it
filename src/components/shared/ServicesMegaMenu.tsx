"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { cn } from "@/lib/utils";

const featuredByGroup: Record<string, string[]> = {
  wordpress: [
    "wordpress-support",
    "wordpress-error-fix",
    "wordpress-malware-removal",
    "wordpress-speed-optimization",
    "wordpress-security",
    "premium-support",
  ],
  marketing: [
    "seo-optimization",
    "digital-marketing",
    "content-writing",
    "social-media-management",
    "e-commerce",
    "media-creation",
  ],
  hosting: [
    "web-hosting",
    "shared-hosting",
    "wordpress-hosting",
    "vps-hosting",
    "domains",
  ],
};

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
  const isNl = locale === "nl";

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
          (active || open) && "bg-primary/10 text-foreground",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(92vw,720px)] -translate-x-1/2 rounded-3xl border border-border/70 bg-background/95 p-4 shadow-xl backdrop-blur-xl">
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
      ) : null}
    </div>
  );
}
