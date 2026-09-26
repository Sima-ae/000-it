"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { ServicesMegaMenu } from "@/components/shared/ServicesMegaMenu";
import { InfoDropdown } from "@/components/shared/InfoDropdown";
import { HostingDropdown, HOSTING_MENU_SLUGS, HOSTING_SLUGS } from "@/components/shared/HostingDropdown";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { AccountMenu } from "@/components/shared/AccountMenu";
import { serviceCatalog, serviceGroupHref, serviceHref, sortedServiceGroups, sortOptimizationMenuItems } from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceTitle,
  catalogUiLabel,
} from "@/content/fixweb/catalog-title";
import {
  localizedHref,
} from "@/i18n/pathnames";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", key: "home" },
  { href: "/over-ons", key: "info", info: true },
  { href: "/diensten", key: "services", mega: true },
  { href: "/diensten/domains", key: "domains", domains: true },
  { href: "/diensten/categorie/hosting", key: "hosting", hosting: true },
  { href: "/kennisbank", key: "kennisbank" },
  { href: "/nieuws", key: "blog" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/shop", key: "pricing" },
  { href: "/contact", key: "contact" },
] as const;

function isLocaleHome(pathname: string, locale: string) {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

export function Navigation() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [mobileHostingOpen, setMobileHostingOpen] = useState(false);

  const onHome = isLocaleHome(pathname, locale);
  const shopHref = localizedHref(locale, "/shop");
  const pricingActive =
    pathname === shopHref || pathname.startsWith(`${shopHref}/`);

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
    if (linkHref === "/diensten/domains") {
      const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
      if (!domainsItem) return false;
      const href = serviceHref(locale, domainsItem);
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    if (linkHref === "/diensten/categorie/hosting") {
      const hostingGroup = serviceGroupHref(locale, "hosting");
      if (pathname === hostingGroup || pathname.startsWith(`${hostingGroup}/`)) {
        return true;
      }
      return HOSTING_SLUGS.some((slug) => {
        const item = serviceCatalog.find((s) => s.slug === slug);
        if (!item) return false;
        const href = serviceHref(locale, item);
        return pathname === href || pathname.startsWith(`${href}/`);
      });
    }
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-7xl rounded-[1.75rem] transition-all duration-300",
          "glass border border-white/40 dark:border-white/10",
          scrolled && "glass-strong shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
          <SoftLink
            href={localizedHref(locale, "/")}
            aria-label="TripleZero iT"
            className="shrink-0"
          >
            <BrandLogo priority />
          </SoftLink>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryLinks.map((link) => {
              const href = localizedHref(locale, link.href);
              const pathOnly = href.split("#")[0];
              const active = linkActive(link.href, pathOnly);

              if ("mega" in link && link.mega) {
                const hostingGroup = serviceGroupHref(locale, "hosting");
                const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                const domainsHref = domainsItem
                  ? serviceHref(locale, domainsItem)
                  : "";
                const onDomains =
                  Boolean(domainsHref) &&
                  (pathname === domainsHref || pathname.startsWith(`${domainsHref}/`));
                const onHosting =
                  pathname === hostingGroup ||
                  pathname.startsWith(`${hostingGroup}/`) ||
                  HOSTING_SLUGS.some((slug) => {
                    const item = serviceCatalog.find((s) => s.slug === slug);
                    if (!item) return false;
                    const itemHref = serviceHref(locale, item);
                    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
                  });
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
                const infoActive =
                  pathname === aboutHref ||
                  pathname.startsWith(`${aboutHref}/`) ||
                  pathname === faqHref ||
                  pathname.startsWith(`${faqHref}/`);
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
                    active={infoActive}
                  />
                );
              }

              if ("domains" in link && link.domains) {
                const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                if (!domainsItem) return null;
                const domainsHref = serviceHref(locale, domainsItem);
                const domainsActive =
                  pathname === domainsHref || pathname.startsWith(`${domainsHref}/`);
                return (
                  <SoftLink
                    key={link.key}
                    href={domainsHref}
                    className={cn(
                      "rounded-xl px-2 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                      domainsActive && "bg-primary text-primary-foreground",
                    )}
                  >
                    {catalogServiceTitle(domainsItem.slug, locale, domainsItem.title)}
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

          <div className="flex items-center gap-1.5 md:gap-2">
            <SoftLink
              href={localizedHref(locale, "/afspraak")}
              aria-label={t("book")}
              title={t("book")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </SoftLink>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted/70 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={tCommon("openMenu")}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="hidden lg:inline-flex">
              <ThemeToggle />
            </span>
            <AccountMenu />
            <CartNavButton />
            <LanguageSwitcher />
          </div>
        </div>

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-border/60 px-3 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              <div className="flex items-center px-1 py-0.5">
                <ThemeToggle />
              </div>
              {primaryLinks.map((link) => {
                const href = localizedHref(locale, link.href);
                const pathOnly = href.split("#")[0];
                const active = linkActive(link.href, pathOnly);

                if ("mega" in link && link.mega) {
                  const hostingGroup = serviceGroupHref(locale, "hosting");
                  const domainsItem = serviceCatalog.find((s) => s.slug === "domains");
                  const domainsHref = domainsItem
                    ? serviceHref(locale, domainsItem)
                    : "";
                  const onDomains =
                    Boolean(domainsHref) &&
                    (pathname === domainsHref || pathname.startsWith(`${domainsHref}/`));
                  const onHosting =
                    pathname === hostingGroup ||
                    pathname.startsWith(`${hostingGroup}/`) ||
                    HOSTING_SLUGS.some((slug) => {
                      const item = serviceCatalog.find((s) => s.slug === slug);
                      if (!item) return false;
                      const itemHref = serviceHref(locale, item);
                      return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
                    });
                  const servicesActive = active && !onHosting && !onDomains;
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          servicesActive && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                      >
                        {t(link.key)}
                        <span className="text-xs">{mobileServicesOpen ? "−" : "+"}</span>
                      </button>
                      {mobileServicesOpen ? (
                        <div className="mb-2 ml-2 space-y-3 border-l border-border/60 pl-3">
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
                                      catalogServiceTitle(a.slug, locale, a.title).localeCompare(
                                        catalogServiceTitle(b.slug, locale, b.title),
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
                                      {catalogServiceTitle(item.slug, locale, item.title)}
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
                  const infoActive =
                    pathname === aboutHref ||
                    pathname.startsWith(`${aboutHref}/`) ||
                    pathname === faqHref ||
                    pathname.startsWith(`${faqHref}/`);
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          infoActive && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileInfoOpen((v) => !v)}
                      >
                        {t("info")}
                        <span className="text-xs">{mobileInfoOpen ? "−" : "+"}</span>
                      </button>
                      {mobileInfoOpen ? (
                        <div className="mb-2 ml-2 border-l border-border/60 pl-3">
                          {(
                            [
                              [aboutHref, "about"],
                              [localizedHref(locale, "/voorwaarden"), "terms"],
                              [localizedHref(locale, "/cookies"), "cookies"],
                              [localizedHref(locale, "/privacy"), "privacy"],
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
                  const domainsActive =
                    pathname === domainsHref || pathname.startsWith(`${domainsHref}/`);
                  return (
                    <SoftLink
                      key={link.key}
                      href={domainsHref}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
                        domainsActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      {catalogServiceTitle(domainsItem.slug, locale, domainsItem.title)}
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
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          active && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileHostingOpen((v) => !v)}
                      >
                        {hostingLabel}
                        <span className="text-xs">{mobileHostingOpen ? "−" : "+"}</span>
                      </button>
                      {mobileHostingOpen ? (
                        <div className="mb-2 ml-2 space-y-1 border-l border-border/60 pl-3">
                          {(() => {
                            const href = serviceGroupHref(locale, "hosting");
                            const itemActive =
                              pathname === href || pathname.startsWith(`${href}/`);
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
                          {HOSTING_MENU_SLUGS.map((slug) => {
                            const item = serviceCatalog.find((s) => s.slug === slug);
                            if (!item) return null;
                            const href = serviceHref(locale, item);
                            const itemActive =
                              pathname === href || pathname.startsWith(`${href}/`);
                            return (
                              <SoftLink
                                key={item.slug}
                                href={href}
                                className={cn(
                                  "block rounded-lg px-2 py-1.5 text-sm transition",
                                  itemActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                                )}
                                aria-current={itemActive ? "page" : undefined}
                              >
                                {catalogServiceTitle(item.slug, locale, item.title)}
                              </SoftLink>
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
              <SoftLink
                href={localizedHref(locale, "/afspraak")}
                className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {t("book")}
              </SoftLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
