"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { serviceCatalog, serviceHref } from "@/content/fixweb/catalog";
import { useShopCatalog } from "@/components/shop/ShopCatalogProvider";
import { catalogGroupTitle } from "@/content/fixweb/catalog-title";
import {
  HOSTING_CATEGORY_SLUGS,
  localizeShopProduct,
  shopHostingProductsForCategory,
} from "@/lib/shop/catalog";
import { localizedHref } from "@/i18n/pathnames";
import { publicPathMatches } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 220;

/** Hosting mega-menu columns: category pages only — plans come from the live shop DB. */
export const HOSTING_MENU_COLUMNS = HOSTING_CATEGORY_SLUGS.map((categorySlug) => ({
  categorySlug,
}));

/** Flat list of live plan slugs from the shop catalog. */
function hostingPlanSlugsFromProducts(
  products: ReturnType<typeof useShopCatalog>["products"],
) {
  return HOSTING_CATEGORY_SLUGS.flatMap((category) =>
    shopHostingProductsForCategory(products, category).map((p) => p.slug),
  );
}

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
  const { titleFor, products } = useShopCatalog();

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
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
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
  const columns = useMemo(
    () =>
      HOSTING_CATEGORY_SLUGS.map((categorySlug) => ({
        categorySlug,
        plans: shopHostingProductsForCategory(products, categorySlug),
      })),
    [products],
  );

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
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 top-17 z-50 flex justify-center px-3 pt-2 md:top-19 md:px-4"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="w-full max-w-[min(100%,84rem)] rounded-3xl border border-border/60 bg-white p-4 shadow-xl dark:bg-zinc-950 md:p-5">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-5">
              {columns.map((column) => {
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

                return (
                  <div
                    key={column.categorySlug}
                    className="min-w-0 bg-transparent"
                  >
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
                      {column.plans.map((product) => {
                        const href = localizedHref(
                          locale,
                          `/diensten/${product.slug}`,
                        );
                        const itemActive = publicPathMatches(
                          pathname,
                          href,
                          locale,
                        );
                        const name = localizeShopProduct(
                          product,
                          locale,
                        ).localizedName;
                        return (
                          <SoftLink
                            key={product.slug}
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
                            {name || titleFor(product.slug, locale, product.slug)}
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

export function isHostingNavPath(
  pathname: string,
  locale: string,
  products: ReturnType<typeof useShopCatalog>["products"],
) {
  const hostingGroup = localizedHref(locale, "/diensten/categorie/hosting");
  if (publicPathMatches(pathname, hostingGroup, locale)) return true;
  if (publicPathMatches(pathname, localizedHref(locale, "/diensten/web-hosting"), locale)) {
    return true;
  }
  for (const category of HOSTING_CATEGORY_SLUGS) {
    const categoryHref = localizedHref(locale, `/diensten/${category}`);
    if (publicPathMatches(pathname, categoryHref, locale)) return true;
  }
  for (const slug of hostingPlanSlugsFromProducts(products)) {
    if (publicPathMatches(pathname, localizedHref(locale, `/diensten/${slug}`), locale)) {
      return true;
    }
    if (publicPathMatches(pathname, localizedHref(locale, `/shop/${slug}`), locale)) {
      return true;
    }
  }
  return false;
}

/** @deprecated Prefer isHostingNavPath with live catalog products. */
export const HOSTING_SLUGS = [
  "web-hosting",
  ...HOSTING_CATEGORY_SLUGS,
] as const;

export const HOSTING_MENU_SLUGS = HOSTING_SLUGS;
