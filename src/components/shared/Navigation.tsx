"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { ServicesMegaMenu } from "@/components/shared/ServicesMegaMenu";
import { InfoDropdown } from "@/components/shared/InfoDropdown";
import {
  HostingDropdown,
  HOSTING_MENU_COLUMNS,
  isHostingNavPath,
} from "@/components/shared/HostingDropdown";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { AccountMenu } from "@/components/shared/AccountMenu";
import { serviceCatalog, serviceGroupHref, serviceHref, sortedServiceGroups, sortOptimizationMenuItems } from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogUiLabel,
} from "@/content/fixweb/catalog-title";
import {
  localizedHref,
  publicPathMatches,
} from "@/i18n/pathnames";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { GlobalSearchButton } from "@/components/shared/GlobalSearch";
import { cn } from "@/lib/utils";
import { useBrand } from "@/lib/brand/BrandProvider";
import { useShopCatalog } from "@/components/shop/ShopCatalogProvider";
import {
  localizeShopProduct,
  shopHostingProductsForCategory,
} from "@/lib/shop/catalog";

const primaryLinksFull = [
  { href: "/", key: "home" },
  { href: "/over-ons", key: "info", info: true },
  { href: "/diensten", key: "services", mega: true },
  { href: "/domeinen", key: "domains", domains: true },
  { href: "/diensten/categorie/hosting", key: "hosting", hosting: true },
  { href: "/kennisbank", key: "kennisbank" },
  { href: "/nieuws", key: "blog" },
  // Hidden until the portfolio page is filled — uncomment to restore in the header:
  // { href: "/portfolio", key: "portfolio" },
  { href: "/shop", key: "pricing" },
  { href: "/contact", key: "contact" },
] as const;

const primaryLinksHosting = [
  { href: "/", key: "home" },
  { href: "/over-ons", key: "info", info: true },
  { href: "/domeinen", key: "domains", domains: true },
  { href: "/diensten/categorie/hosting", key: "hosting", hosting: true },
  { href: "/shop", key: "pricing" },
  { href: "/kennisbank", key: "kennisbank" },
  { href: "/nieuws", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

function isLocaleHome(pathname: string, locale: string) {
  return (
    pathname === "/" ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/`
  );
}

export function Navigation() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const brand = useBrand();
  const { titleFor, products } = useShopCatalog();
  const isExtraHosting = brand.id === "extrahosting";
  const primaryLinks =
    brand.catalogMode === "domains_hosting" ? primaryLinksHosting : primaryLinksFull;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [mobileHostingOpen, setMobileHostingOpen] = useState(false);

  const onHome = isLocaleHome(pathname, locale);
  const shopHref = localizedHref(locale, "/shop");
  const pricingActive =
    publicPathMatches(pathname, shopHref, locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
    setMobileInfoOpen(false);
    setMobileHostingOpen(false);
  }, [pathname]);

  function linkActive(linkHref: string, pathOnly: string) {
    if (linkHref === "/shop") return pricingActive;
    if (linkHref === "/") {
      return onHome;
    }
    if (linkHref === "/domeinen") {
      const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
      if (!domainsItem) return false;
      return publicPathMatches(pathname, serviceHref(locale, domainsItem), locale);
    }
    if (linkHref === "/diensten/categorie/hosting") {
      return isHostingNavPath(pathname, locale, products);
    }
    return publicPathMatches(pathname, pathOnly, locale);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:px-3 sm:pt-[max(0.75rem,env(safe-area-inset-top,0px))] md:px-4 md:pt-[max(1rem,env(safe-area-inset-top,0px))]">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-7xl rounded-[1.75rem] transition-all duration-300",
          "glass border border-white/40 dark:border-white/10",
          scrolled && "glass-strong shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-1.5 px-2.5 sm:gap-2 sm:px-3 md:gap-3 md:px-4",
            brand.id === "extrahosting" ? "py-1" : "py-2 sm:py-2.5 md:py-3",
          )}
        >
          <SoftLink
            href={localizedHref(locale, "/")}
                aria-label={brand.displayName}
            className="min-w-0 shrink"
          >
            <BrandLogo
              priority
              className={
                brand.id === "extrahosting"
                  ? "h-13 max-w-[min(70vw,20rem)] sm:h-15 sm:max-w-none md:h-20"
                  : "h-9 max-w-[min(48vw,12rem)] sm:h-10 sm:max-w-none md:h-12"
              }
            />
          </SoftLink>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryLinks.map((link) => {
              const href = localizedHref(locale, link.href);
              const pathOnly = href.split("#")[0];
              const active = linkActive(link.href, pathOnly);

              if ("mega" in link && link.mega) {
                const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                const domainsHref = domainsItem
                  ? serviceHref(locale, domainsItem)
                  : "";
                const onDomains =
                  Boolean(domainsHref) &&
                  publicPathMatches(pathname, domainsHref, locale);
                const onHosting = isHostingNavPath(pathname, locale, products);
                return (
                  <ServicesMegaMenu
                    key={link.key}
                    locale={locale}
                    label={t(link.key)}
                    active={active && !onHosting && !onDomains}
                  />
                );
              }

              if ("info" in link && link.info) {
                const faqHref = localizedHref(locale, "/faq");
                const aboutHref = localizedHref(locale, "/over-ons");
                const statusHref = localizedHref(locale, "/statuspage");
                const infoActive =
                  publicPathMatches(pathname, aboutHref, locale) ||
                  publicPathMatches(pathname, faqHref, locale) ||
                  publicPathMatches(pathname, statusHref, locale);
                return (
                  <InfoDropdown
                    key={link.key}
                    locale={locale}
                    label={t("info")}
                    aboutLabel={t("about")}
                    faqLabel={t("faq")}
                    termsLabel={t("terms")}
                    cookiesLabel={t("cookies")}
                    privacyLabel={t("privacy")}
                    statuspageLabel={t("statuspage")}
                    active={infoActive}
                  />
                );
              }

              if ("domains" in link && link.domains) {
                const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                if (!domainsItem) return null;
                const domainsHref = serviceHref(locale, domainsItem);
                const domainsActive = publicPathMatches(
                  pathname,
                  domainsHref,
                  locale,
                );
                return (
                  <SoftLink
                    key={link.key}
                    href={domainsHref}
                    className={cn(
                      "rounded-xl px-2 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                      domainsActive && "bg-primary text-primary-foreground",
                    )}
                  >
                    {titleFor(domainsItem.slug, locale, domainsItem.title)}
                  </SoftLink>
                );
              }

              if ("hosting" in link && link.hosting) {
                return (
                  <HostingDropdown key={link.key} locale={locale} active={active} />
                );
              }

              return (
                <SoftLink
                  key={link.key}
                  href={href}
                  className={cn(
                    "rounded-xl px-2 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                    active && "bg-primary text-primary-foreground",
                  )}
                >
                  {t(link.key)}
                </SoftLink>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">
            <div className={cn(isExtraHosting && "order-1")}>
              <GlobalSearchButton />
            </div>
            {!isExtraHosting ? (
              <SoftLink
                href={localizedHref(locale, "/afspraak")}
                aria-label={t("book")}
                title={t("book")}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:h-9 sm:w-9"
              >
                <Plus className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
              </SoftLink>
            ) : null}
            <button
              type="button"
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/70 sm:h-9 sm:w-9 lg:hidden",
                isExtraHosting && "order-5",
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label={tCommon("openMenu")}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <CartNavButton
              className={cn(isExtraHosting && "order-2 lg:order-4")}
            />
            <AccountMenu
              className={cn(isExtraHosting && "order-3 lg:order-2")}
            />
            <div
              className={cn(
                "hidden lg:block",
                isExtraHosting && "order-4 lg:order-3",
              )}
            >
              <ThemeToggle />
            </div>
            <LanguageSwitcher
              className={cn(isExtraHosting && "order-6")}
            />
          </div>
        </div>

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-border/60 px-3 py-3 lg:hidden">
            <div className="mb-2 flex items-center justify-end border-b border-border/50 pb-2">
              <ThemeToggle className="text-muted-foreground hover:text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              {primaryLinks.map((link) => {
                const href = localizedHref(locale, link.href);
                const pathOnly = href.split("#")[0];
                const active = linkActive(link.href, pathOnly);

                if ("mega" in link && link.mega) {
                  const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                  const domainsHref = domainsItem
                    ? serviceHref(locale, domainsItem)
                    : "";
                  const onDomains =
                    Boolean(domainsHref) &&
                    publicPathMatches(pathname, domainsHref, locale);
                  const onHosting = isHostingNavPath(pathname, locale, products);
                  const servicesActive = active && !onHosting && !onDomains;
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          servicesActive && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                      >
                        {t(link.key)}
                        <span className="text-xs">{mobileServicesOpen ? "−" : "+"}</span>
                      </button>
                      {mobileServicesOpen ? (
                        <div className="mb-2 ms-2 space-y-3 border-s border-border/60 ps-3">
                          {(() => {
                            const allServicesHref = localizedHref(locale, "/diensten");
                            const allServicesActive =
                              pathname === allServicesHref ||
                              pathname.startsWith(`${allServicesHref}/`);
                            return (
                              <SoftLink
                                href={allServicesHref}
                                className={cn(
                                  "block rounded-lg px-2 py-1 text-sm font-medium transition",
                                  allServicesActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                )}
                                aria-current={allServicesActive ? "page" : undefined}
                              >
                                {t("services")}
                              </SoftLink>
                            );
                          })()}
                          {sortedServiceGroups(locale)
                            .filter((group) => group.id !== "hosting")
                            .map((group) => {
                            const groupItems = serviceCatalog.filter((s) => s.group === group.id);
                            const sorted =
                              group.id === "ai"
                                ? groupItems
                                : group.id === "optimization"
                                  ? sortOptimizationMenuItems(groupItems, locale)
                                  : [...groupItems].sort((a, b) =>
                                      titleFor(a.slug, locale, a.title).localeCompare(
                                        titleFor(b.slug, locale, b.title),
                                        locale,
                                        { sensitivity: "base" },
                                      ),
                                    );
                            const groupHref = serviceGroupHref(locale, group.id);
                            const groupActive =
                              pathname === groupHref || pathname.startsWith(`${groupHref}/`);
                            return (
                              <div key={group.id}>
                                <SoftLink
                                  href={groupHref}
                                  className={cn(
                                    "mb-1 block rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide transition",
                                    groupActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-foreground hover:text-primary",
                                  )}
                                  aria-current={groupActive ? "page" : undefined}
                                >
                                  {catalogGroupTitle(group.id, locale, group.title)}
                                </SoftLink>
                                {sorted
                                  .slice(
                                    0,
                                    group.id === "ai"
                                      ? 10
                                      : group.id === "optimization"
                                        ? 9
                                      : group.id === "webdesign"
                                        ? 11
                                        : group.id === "wordpress"
                                          ? 9
                                          : 8,
                                  )
                                  .map((item) => {
                                    const href = serviceHref(locale, item);
                                    const itemActive =
                                      pathname === href || pathname.startsWith(`${href}/`);
                                    return (
                                    <SoftLink
                                      key={item.slug}
                                      href={href}
                                      className={cn(
                                        "block rounded-lg px-2 py-1 text-sm transition",
                                        itemActive
                                          ? "bg-primary text-primary-foreground"
                                          : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                      )}
                                      aria-current={itemActive ? "page" : undefined}
                                    >
                                      {titleFor(item.slug, locale, item.title)}
                                    </SoftLink>
                                    );
                                  })}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if ("info" in link && link.info) {
                  const faqHref = localizedHref(locale, "/faq");
                  const aboutHref = localizedHref(locale, "/over-ons");
                  const statusHref = localizedHref(locale, "/statuspage");
                  const infoActive =
                    publicPathMatches(pathname, aboutHref, locale) ||
                    publicPathMatches(pathname, faqHref, locale) ||
                    publicPathMatches(pathname, statusHref, locale);
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          infoActive && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileInfoOpen((v) => !v)}
                      >
                        {t("info")}
                        <span className="text-xs">{mobileInfoOpen ? "−" : "+"}</span>
                      </button>
                      {mobileInfoOpen ? (
                        <div className="mb-2 ms-2 border-s border-border/60 ps-3">
                          {(
                            [
                              [aboutHref, "about"],
                              [localizedHref(locale, "/voorwaarden"), "terms"],
                              [localizedHref(locale, "/cookies"), "cookies"],
                              [localizedHref(locale, "/privacy"), "privacy"],
                              [statusHref, "statuspage"],
                              [faqHref, "faq"],
                            ] as const
                          ).map(([href, key]) => {
                            const itemActive =
                              pathname === href || pathname.startsWith(`${href}/`);
                            const external =
                              key === "terms" || key === "cookies" || key === "privacy";
                            return (
                              <SoftLink
                                key={key}
                                href={href}
                                {...(external
                                  ? { target: "_blank", rel: "noopener noreferrer" }
                                  : {})}
                                className={cn(
                                  "block rounded-lg px-2 py-1.5 text-sm transition",
                                  itemActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                )}
                                aria-current={itemActive ? "page" : undefined}
                              >
                                {t(key)}
                              </SoftLink>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if ("domains" in link && link.domains) {
                  const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                  if (!domainsItem) return null;
                  const domainsHref = serviceHref(locale, domainsItem);
                  const domainsActive = publicPathMatches(
                    pathname,
                    domainsHref,
                    locale,
                  );
                  return (
                    <SoftLink
                      key={link.key}
                      href={domainsHref}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                        domainsActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      {titleFor(domainsItem.slug, locale, domainsItem.title)}
                    </SoftLink>
                  );
                }

                if ("hosting" in link && link.hosting) {
                  const hostingLabel = catalogGroupTitle(
                    "hosting",
                    locale,
                    "Hosting",
                  );
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          active && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileHostingOpen((v) => !v)}
                      >
                        {hostingLabel}
                        <span className="text-xs">{mobileHostingOpen ? "−" : "+"}</span>
                      </button>
                      {mobileHostingOpen ? (
                        <div className="mb-2 ms-2 space-y-3 border-s border-border/60 ps-3">
                          {(() => {
                            const href = serviceGroupHref(locale, "hosting");
                            const itemActive = publicPathMatches(
                              pathname,
                              href,
                              locale,
                            );
                            return (
                              <SoftLink
                                href={href}
                                className={cn(
                                  "block rounded-lg px-2 py-1.5 text-sm font-medium transition",
                                  itemActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                )}
                                aria-current={itemActive ? "page" : undefined}
                              >
                                {catalogUiLabel("hostingCategory", locale, "Hosting")}
                              </SoftLink>
                            );
                          })()}
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
                            return (
                              <div key={column.categorySlug}>
                                <SoftLink
                                  href={categoryHref}
                                  className={cn(
                                    "mb-1 block rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide transition",
                                    categoryActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-foreground hover:text-primary",
                                  )}
                                  aria-current={categoryActive ? "page" : undefined}
                                >
                                  {titleFor(
                                    categoryItem.slug,
                                    locale,
                                    categoryItem.title,
                                  )}
                                </SoftLink>
                                {shopHostingProductsForCategory(
                                  products,
                                  column.categorySlug,
                                ).map((product) => {
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
                                        "block rounded-lg px-2 py-1.5 text-sm transition",
                                        itemActive
                                          ? "bg-primary text-primary-foreground"
                                          : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                      )}
                                      aria-current={itemActive ? "page" : undefined}
                                    >
                                      {name ||
                                        titleFor(
                                          product.slug,
                                          locale,
                                          product.slug,
                                        )}
                                    </SoftLink>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <SoftLink
                    key={link.key}
                    href={href}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                      active && "bg-primary text-primary-foreground",
                    )}
                  >
                    {t(link.key)}
                  </SoftLink>
                );
              })}
              {!isExtraHosting ? (
                <SoftLink
                  href={localizedHref(locale, "/afspraak")}
                  className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {t("book")}
                </SoftLink>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
