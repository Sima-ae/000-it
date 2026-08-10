"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";

const links = [
  { href: "", key: "home" },
  { href: "/diensten", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/over-ons", key: "about" },
  { href: "/case-studies", key: "cases" },
  { href: "/blog", key: "blog" },
  { href: "/ai-scan", key: "aiScan" },
  { href: "/contact", key: "contact" },
] as const;

export function Navigation() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            {links.map((link) => {
              const href = `/${locale}${link.href}`;
              const active =
                link.href === ""
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
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
          <div className="border-t border-border/60 px-3 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const href = `/${locale}${link.href}`;
                const active =
                  link.href === ""
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
