"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { ServicesMegaMenu } from "@/components/shared/ServicesMegaMenu";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "", key: "home" },
  { href: "/over-ons", key: "about" },
  { href: "/ai-scan", key: "aiScan" },
  { href: "/diensten", key: "services", mega: true },
  { href: "/portfolio", key: "portfolio" },
  { href: "/case-studies", key: "cases" },
  { href: "/nieuws", key: "blog" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function Navigation() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const isNl = locale === "nl";

  const otherLocale = locale === "nl" ? "en" : "nl";
  const switchedPath = pathname.replace(/^\/(nl|en)/, `/${otherLocale}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

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
            href={`/${locale}`}
            className="font-display shrink-0 text-base font-semibold tracking-tight md:text-lg"
          >
            <span className="bg-linear-to-r from-primary via-[#8b5a3c] to-accent bg-clip-text text-transparent">
              TripleZero iT
            </span>
          </SoftLink>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {primaryLinks.map((link) => {
              const href = `/${locale}${link.href}`;
              const active =
                link.href === ""
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);

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

              return (
                <SoftLink
                  key={link.key}
                  href={href}
                  className={cn(
                    "rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                    active && "bg-primary/10 text-foreground",
                  )}
                >
                  {t(link.key)}
                </SoftLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-2">
            <SoftLink
              href={`/${locale}/afspraak`}
              className="hidden rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground lg:inline-flex"
            >
              {t("book")}
            </SoftLink>
            <SoftLink
              href={switchedPath}
              className="rounded-xl border border-border/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              {otherLocale}
            </SoftLink>
            {session?.user ? (
              <>
                <Button asChild size="sm" variant="outline" className="hidden rounded-xl sm:inline-flex">
                  <SoftLink href={`/${locale}/dashboard`}>{t("dashboard")}</SoftLink>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="hidden rounded-xl sm:inline-flex">
                  <SoftLink href={`/${locale}/login`}>{t("login")}</SoftLink>
                </Button>
                <Button asChild size="sm" className="rounded-xl">
                  <SoftLink href={`/${locale}/register`}>{t("register")}</SoftLink>
                </Button>
              </>
            )}
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted/70 xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-border/60 px-3 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {primaryLinks.map((link) => {
                const href = `/${locale}${link.href}`;
                const active =
                  link.href === ""
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                if ("mega" in link && link.mega) {
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                          active && "bg-primary/10 text-foreground",
                        )}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                      >
                        {t(link.key)}
                        <span className="text-xs">{mobileServicesOpen ? "−" : "+"}</span>
                      </button>
                      {mobileServicesOpen ? (
                        <div className="mb-2 ml-2 space-y-3 border-l border-border/60 pl-3">
                          <SoftLink
                            href={`/${locale}/diensten`}
                            className="block py-1 text-sm font-medium text-foreground"
                            onClick={() => setOpen(false)}
                          >
                            {isNl ? "Alle diensten" : "All services"}
                          </SoftLink>
                          {serviceGroups.map((group) => (
                            <div key={group.id}>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {isNl ? group.titleNl : group.title}
                              </p>
                              {serviceCatalog
                                .filter((s) => s.group === group.id && s.kind === "page")
                                .map((item) => (
                                  <SoftLink
                                    key={item.slug}
                                    href={`/${locale}/diensten/${item.slug}`}
                                    className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                                    onClick={() => setOpen(false)}
                                  >
                                    {isNl ? item.titleNl : item.title}
                                  </SoftLink>
                                ))}
                            </div>
                          ))}
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
                      "rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                      active && "bg-primary/10 text-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {t(link.key)}
                  </SoftLink>
                );
              })}
              <SoftLink
                href={`/${locale}/afspraak`}
                className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                onClick={() => setOpen(false)}
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
