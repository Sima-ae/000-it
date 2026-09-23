"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { serviceCatalog, serviceGroupHref, serviceHref, sortedServiceGroups } from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const featuredByGroup: Record<string, string[]> = {
  ai: [
    "ai-scan",
    "ai-in-ecommerce",
    "ai-in-website",
    "ai-chatbots",
    "ai-content-strategy",
    "ai-automation",
    "ai-workflows",
    "ai-marketing-agents",
    "ai-integration",
    "ai-consultancy",
  ],
  optimization: ["aeo-optimization", "geo-optimization", "seo-optimization", "text-optimization"],
  wordpress: [
    "ai-in-wordpress",
    "wordpress-maintenance-updates",
    "wordpress-error-fix",
    "wordpress-malware-removal",
    "wordpress-speed-optimization",
    "wordpress-security",
    "wordpress-backup-hosting-migration",
    "wordpress-support",
  ],
  webdesign: [
    "webdesign-support",
    "custom-webdesign",
    "website-malware-removal",
    "website-security",
    "website-speed-optimization",
    "website-backup-migration",
    "nextjs-development",
    "php-web-development",
    "website-maintenance",
  ],
  design: [
    "grafisch-design",
    "logo-brand-identity",
    "business-cards",
    "briefpapier",
    "flyers-posters",
    "stickers-packaging",
    "magazines-brochures",
  ],
  marketing: [
    "digital-marketing",
    "content-writing",
    "social-media-management",
    "media-creation",
    "e-commerce",
    "product-listing",
    "community-management",
    "data-entry",
  ],
  // Keep hosting plan order (Basic → Plus → Business, Shared → WP → VPS)
  hosting: [
    "web-hosting",
    "domains",
    "shared-hosting-basic",
    "shared-hosting-plus",
    "shared-hosting-business",
    "wordpress-hosting-basic",
    "wordpress-hosting-plus",
    "wordpress-hosting-business",
    "vps-hosting-basic",
    "vps-hosting-plus",
    "vps-hosting-business",
  ],
};

function sortFeaturedItems(
  items: NonNullable<(typeof serviceCatalog)[number]>[],
  locale: string,
  groupId: string,
) {
  if (groupId === "hosting" || groupId === "ai" || groupId === "optimization") return items;
  return [...items].sort((a, b) =>
    catalogServiceTitle(a.slug, locale, a.title).localeCompare(
      catalogServiceTitle(b.slug, locale, b.title),
      locale,
      { sensitivity: "base" },
    ),
  );
}

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
  const navigatingRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const startProgress = useNavigationProgress((s) => s.start);
  const t = useTranslations("appointment");

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

  // Close after navigation — never unmount SoftLink mid-click via mouseLeave
  useEffect(() => {
    navigatingRef.current = false;
    setOpen(false);
  }, [pathname]);

  // Prefetch hosting + featured services when the menu opens
  useEffect(() => {
    if (!open) return;
    const slugs = Object.values(featuredByGroup).flat();
    for (const slug of slugs) {
      const item = serviceCatalog.find((s) => s.slug === slug);
      if (!item) continue;
      try {
        router.prefetch(serviceHref(locale, item));
      } catch {
        /* ignore */
      }
    }
  }, [open, locale, router]);

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
          className="fixed inset-x-0 top-17 z-50 flex justify-center px-3 pt-2 md:top-19 md:px-4"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="w-full max-w-[min(100%,98rem)] rounded-3xl border border-border/60 bg-white p-4 shadow-xl dark:bg-zinc-950 md:p-5">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
              {sortedServiceGroups(locale)
                .filter((group) => group.id !== "hosting")
                .map((group) => {
                const slugs = featuredByGroup[group.id] || [];
                const items = sortFeaturedItems(
                  slugs
                    .map((slug) => serviceCatalog.find((s) => s.slug === slug))
                    .filter((item): item is NonNullable<typeof item> => Boolean(item)),
                  locale,
                  group.id,
                );
                return (
                  <div key={group.id} className="min-w-0 bg-transparent">
                    <SoftLink
                      href={serviceGroupHref(locale, group.id)}
                      className="mb-2 block whitespace-nowrap px-1.5 text-[11px] font-semibold text-foreground transition hover:text-primary md:px-2 md:text-xs"
                      onClick={(event) =>
                        navigateFromMenu(serviceGroupHref(locale, group.id), event)
                      }
                    >
                      {catalogGroupTitle(group.id, locale, group.title)}
                    </SoftLink>
                    <div className="flex max-h-[min(70vh,28rem)] flex-col overflow-y-auto bg-transparent">
                      {items.map((item) => {
                        const href = serviceHref(locale, item);
                        return (
                          <SoftLink
                            key={item.slug}
                            href={href}
                            className="rounded-lg px-1.5 py-1.5 text-[12px] leading-snug text-muted-foreground transition hover:bg-primary hover:text-primary-foreground md:px-2 md:text-[13px]"
                            onClick={(event) => navigateFromMenu(href, event)}
                          >
                            {catalogServiceTitle(item.slug, locale, item.title)}
                          </SoftLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-center border-t border-border/40 bg-transparent px-1 pt-4">
              <SoftLink
                href={localizedHref(locale, "/diensten")}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5",
                  "text-sm font-semibold text-primary-foreground",
                  "shadow-[0_10px_28px_rgba(94,59,136,0.35)] transition",
                  "hover:bg-primary/90 hover:shadow-[0_14px_34px_rgba(94,59,136,0.42)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                )}
                onClick={(event) => navigateFromMenu(localizedHref(locale, "/diensten"), event)}
              >
                <span>{t("allServicesCta")}</span>
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </SoftLink>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
