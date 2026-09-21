"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { ServicesMegaMenu } from "@/components/shared/ServicesMegaMenu";
import { InfoDropdown } from "@/components/shared/InfoDropdown";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { AccountMenu } from "@/components/shared/AccountMenu";
import { serviceCatalog, serviceGroupHref, serviceHref, sortedServiceGroups } from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import {
  hashFor,
  localizedHref,
  resolveHashElementId,
} from "@/i18n/pathnames";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

const WEBMAIL_URL = "https://000-it.com/webmail";

const primaryLinks = [
  { href: "/", key: "home" },
  { href: "/over-ons", key: "info", info: true },
  { href: "/diensten", key: "services", mega: true },
  { href: "/kennisbank", key: "kennisbank" },
  { href: "/portfolio", key: "portfolio" },
  { href: "#prijzen", key: "pricing" },
  { href: "/nieuws", key: "blog" },
  { href: "/contact", key: "contact" },
  { href: WEBMAIL_URL, key: "webmail", external: true },
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
  const [hash, setHash] = useState("");
  const [pricingInView, setPricingInView] = useState(false);

  const onHome = isLocaleHome(pathname, locale);
  const pricingHash = hashFor(locale, "prijzen");
  const pricingHashActive =
    onHome &&
    (resolveHashElementId(hash) === "prijzen" || hash === pricingHash);
  const pricingActive = pricingHashActive || (onHome && pricingInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () =>
      setHash(window.location.hash.replace(/^#/, "").trim());
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
    setMobileInfoOpen(false);
    setPricingInView(false);
  }, [pathname]);

  // Highlight Prijzen only while the homepage pricing block is actually visible.
  useEffect(() => {
    if (!onHome) {
      setPricingInView(false);
      return;
    }
    const el =
      document.getElementById(pricingHash) ||
      document.getElementById("prijzen");
    if (!el) {
      setPricingInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPricingInView(Boolean(entry?.isIntersecting));
      },
      {
        // Require a meaningful portion of the section in view (not just a peek).
        root: null,
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0, 0.15, 0.35],
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHome, pricingHash, pathname]);

  function linkActive(linkHref: string, pathOnly: string) {
    if (linkHref === "#prijzen") return pricingActive;
    if (linkHref === "/") {
      // Home stays active on the homepage, except while the pricing section is focused.
      return onHome && !pricingActive;
    }
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-6xl rounded-[1.75rem] transition-all duration-300",
          "glass border border-white/40 dark:border-white/10",
          scrolled && "glass-strong shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 md:px-4 md:py-3">
          <SoftLink
            href={localizedHref(locale, "/")}
            aria-label="TripleZero iT"
            className="shrink-0"
          >
            <BrandLogo priority />
          </SoftLink>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {primaryLinks.map((link) => {
              if ("external" in link && link.external) {
                return (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {t(link.key)}
                  </a>
                );
              }

              const href = localizedHref(locale, link.href);
              const pathOnly = href.split("#")[0];
              const active = linkActive(link.href, pathOnly);

              if ("mega" in link && link.mega) {
                return (
                  <ServicesMegaMenu
                    key={link.key}
                    locale={locale}
                    label={t(link.key)}
                    active={active}
                  />
                );
              }

              if ("info" in link && link.info) {
                const faqHref = localizedHref(locale, "/faq");
                const infoActive =
                  active ||
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

              return (
                <SoftLink
                  key={link.key}
                  href={href}
                  className={cn(
                    "rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
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
              className="hidden rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground lg:inline-flex"
            >
              {t("book")}
            </SoftLink>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted/70 xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={tCommon("openMenu")}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <ThemeToggle />
            <AccountMenu />
            <CartNavButton />
            <LanguageSwitcher />
          </div>
        </div>

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-border/60 px-3 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {primaryLinks.map((link) => {
                if ("external" in link && link.external) {
                  return (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {t(link.key)}
                    </a>
                  );
                }

                const href = localizedHref(locale, link.href);
                const pathOnly = href.split("#")[0];
                const active = linkActive(link.href, pathOnly);

                if ("mega" in link && link.mega) {
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          active && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                      >
                        {t(link.key)}
                        <span className="text-xs">{mobileServicesOpen ? "−" : "+"}</span>
                      </button>
                      {mobileServicesOpen ? (
                        <div className="mb-2 ml-2 space-y-3 border-l border-border/60 pl-3">
                          <SoftLink
                            href={localizedHref(locale, "/diensten")}
                            className="block rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("services")}
                          </SoftLink>
                          {sortedServiceGroups(locale).map((group) => {
                            const groupItems = serviceCatalog.filter((s) => s.group === group.id);
                            const sorted =
                              group.id === "hosting" || group.id === "ai"
                                ? groupItems
                                : [...groupItems].sort((a, b) =>
                                    catalogServiceTitle(a.slug, locale, a.title).localeCompare(
                                      catalogServiceTitle(b.slug, locale, b.title),
                                      locale,
                                      { sensitivity: "base" },
                                    ),
                                  );
                            return (
                              <div key={group.id}>
                                <SoftLink
                                  href={serviceGroupHref(locale, group.id)}
                                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground transition hover:text-primary"
                                >
                                  {catalogGroupTitle(group.id, locale, group.title)}
                                </SoftLink>
                                {sorted
                                  .slice(
                                    0,
                                    group.id === "ai"
                                      ? 10
                                      : group.id === "webdesign"
                                        ? 11
                                        : group.id === "wordpress"
                                          ? 8
                                          : group.id === "hosting"
                                            ? 14
                                            : 8,
                                  )
                                  .map((item) => (
                                    <SoftLink
                                      key={item.slug}
                                      href={serviceHref(locale, item)}
                                      className="block rounded-lg px-2 py-1 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                                    >
                                      {catalogServiceTitle(item.slug, locale, item.title)}
                                    </SoftLink>
                                  ))}
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
                  const infoActive =
                    active ||
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
                          <SoftLink
                            href={localizedHref(locale, "/over-ons")}
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("about")}
                          </SoftLink>
                          <SoftLink
                            href={localizedHref(locale, "/voorwaarden")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("terms")}
                          </SoftLink>
                          <SoftLink
                            href={localizedHref(locale, "/cookies")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("cookies")}
                          </SoftLink>
                          <SoftLink
                            href={localizedHref(locale, "/privacy")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("privacy")}
                          </SoftLink>
                          <SoftLink
                            href={localizedHref(locale, "/faq")}
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("faq")}
                          </SoftLink>
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
