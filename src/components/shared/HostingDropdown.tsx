"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { serviceCatalog, serviceHref } from "@/content/fixweb/catalog";
import { useShopCatalog } from "@/components/shop/ShopCatalogProvider";
import {
  catalogGroupTitle,
} from "@/content/fixweb/catalog-title";
import {
  CLOUD_HOSTING_SLUG_ORDER,
  RESELLER_HOSTING_SLUG_ORDER,
  SHARED_HOSTING_SLUG_ORDER,
  VPS_HOSTING_SLUG_ORDER,
  WORDPRESS_HOSTING_SLUG_ORDER,
} from "@/lib/shop/catalog";
import { publicPathMatches } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 220;

/** Hosting mega-menu columns: category page + plans each. */
export const HOSTING_MENU_COLUMNS = [
  {
    categorySlug: "shared-hosting",
    planSlugs: SHARED_HOSTING_SLUG_ORDER,
  },
  {
    categorySlug: "cloud-hosting",
    planSlugs: CLOUD_HOSTING_SLUG_ORDER,
  },
  {
    categorySlug: "reseller-hosting",
    planSlugs: RESELLER_HOSTING_SLUG_ORDER,
  },
  {
    categorySlug: "wordpress-hosting",
    planSlugs: WORDPRESS_HOSTING_SLUG_ORDER,
  },
  {
    categorySlug: "vps-hosting",
    planSlugs: VPS_HOSTING_SLUG_ORDER,
  },
] as const;

/** Flat list of plan slugs (for mobile / active-state helpers). */
const HOSTING_MENU_SLUGS = HOSTING_MENU_COLUMNS.flatMap(
  (column) => column.planSlugs,
);

/** Hosting-related slugs for active-state (excludes domains — separate main nav). */
const HOSTING_SLUGS = [
  "web-hosting",
  ...HOSTING_MENU_COLUMNS.map((column) => column.categorySlug),
  ...HOSTING_MENU_SLUGS,
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
  const navigatingRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const startProgress = useNavigationProgress((s) => s.start);
  const { titleFor } = useShopCatalog();

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
    if (navigatingRef.current) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      if (!navigatingRef.current) setOpen(false);
    }, CLOSE_DELAY_MS);
  }

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    navigatingRef.current = false;
    setOpen(false);
  }, [pathname]);

  function navigateFromMenu(href: string, event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigatingRef.current = true;
    clearCloseTimer();
    startProgress();
    setOpen(false);
    router.push(href);
  }

  const label = catalogGroupTitle("hosting", locale, "Hosting");

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
          (active || open) && "bg-primary text-primary-foreground",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onFocus={openMenu}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 top-17 z-50 flex justify-center px-3 pt-2 md:top-19 md:px-4"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="w-full max-w-[min(100%,72rem)] rounded-3xl border border-border/60 bg-white p-4 shadow-xl dark:bg-zinc-950 md:p-5">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-5">
              {HOSTING_MENU_COLUMNS.map((column) => {
                const categoryItem = serviceCatalog.find(
                  (s) => s.slug === column.categorySlug,
                );
                if (!categoryItem) return null;
                const categoryHref = serviceHref(locale, categoryItem);
                const categoryActive = publicPathMatches(
                  pathname,
                  categoryHref,
                  locale,
                );
                const plans = column.planSlugs
                  .map((slug) => serviceCatalog.find((s) => s.slug === slug))
                  .filter((item): item is NonNullable<typeof item> => Boolean(item));

                return (
                  <div key={column.categorySlug} className="min-w-0 bg-transparent">
                    <SoftLink
                      href={categoryHref}
                      className={cn(
                        "mb-2 block whitespace-nowrap rounded-lg px-1.5 py-1 text-[11px] font-semibold transition md:px-2 md:text-xs",
                        categoryActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:text-primary",
                      )}
                      onClick={(event) => navigateFromMenu(categoryHref, event)}
                      aria-current={categoryActive ? "page" : undefined}
                    >
                      {titleFor(
                        categoryItem.slug,
                        locale,
                        categoryItem.title,
                      )}
                    </SoftLink>
                    <div className="flex flex-col bg-transparent">
                      {plans.map((item) => {
                        const href = serviceHref(locale, item);
                        const itemActive = publicPathMatches(
                          pathname,
                          href,
                          locale,
                        );
                        return (
                          <SoftLink
                            key={item.slug}
                            href={href}
                            className={cn(
                              "rounded-lg px-1.5 py-1.5 text-[12px] leading-snug transition md:px-2 md:text-[13px]",
                              itemActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                            )}
                            onClick={(event) => navigateFromMenu(href, event)}
                            aria-current={itemActive ? "page" : undefined}
                          >
                            {titleFor(item.slug, locale, item.title)}
                          </SoftLink>
                        );
                      })}
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

export { HOSTING_SLUGS, HOSTING_MENU_SLUGS };
