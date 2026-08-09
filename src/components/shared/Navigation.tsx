"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "", key: "home" },
  { href: "/diensten", key: "services" },
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

  const otherLocale = locale === "nl" ? "en" : "nl";
  const switchedPath = pathname.replace(/^\/(nl|en)/, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight">
          <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            TripleZero iT
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const href = `/${locale}${link.href}`;
            const active = pathname === href || (link.href !== "" && pathname.startsWith(href));
            return (
              <Link
                key={link.key}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={switchedPath}
            className="rounded-md border border-border px-2 py-1 text-xs uppercase text-muted-foreground hover:text-foreground"
          >
            {otherLocale}
          </Link>
          {session?.user ? (
            <>
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link href={`/${locale}/dashboard`}>{t("dashboard")}</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: `/${locale}` })}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href={`/${locale}/login`}>{t("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/${locale}/register`}>{t("register")}</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
