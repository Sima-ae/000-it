"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { serviceCatalog, serviceGroupHref, serviceHref } from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 220;

/** Same hosting submenu order as the former Diensten mega column */
const HOSTING_SLUGS = [
  "web-hosting",
  "domains",
  "shared-hosting-basic",
  "shared-hosting-business",
  "shared-hosting-plus",
  "wordpress-hosting-basic",
  "wordpress-hosting-business",
  "wordpress-hosting-plus",
  "vps-hosting-basic",
  "vps-hosting-business",
  "vps-hosting-plus",
] as const;

export function HostingDropdown({
  locale,
  active,
}: {
  locale: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => clearCloseTimer(), []);

  const groupHref = serviceGroupHref(locale, "hosting");
  const label = catalogGroupTitle("hosting", locale, "Webhosting & Domains");
  const items = HOSTING_SLUGS.map((slug) => serviceCatalog.find((s) => s.slug === slug)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );

  const itemClass =
    "block rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground";

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
          (active || open) && "bg-primary text-primary-foreground",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 pt-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="max-h-[min(70vh,28rem)] min-w-64 overflow-y-auto rounded-2xl border border-border/60 bg-white p-1.5 shadow-xl dark:bg-zinc-950">
            <SoftLink
              href={groupHref}
              className={cn(
                itemClass,
                "font-semibold text-foreground",
                (pathname === groupHref || pathname.startsWith(`${groupHref}/`)) &&
                  "bg-primary text-primary-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              {label}
            </SoftLink>
            {items.map((item) => {
              const href = serviceHref(locale, item);
              const itemActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <SoftLink
                  key={item.slug}
                  href={href}
                  className={cn(itemClass, itemActive && "bg-primary text-primary-foreground")}
                  onClick={() => setOpen(false)}
                >
                  {catalogServiceTitle(item.slug, locale, item.title)}
                </SoftLink>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { HOSTING_SLUGS };
