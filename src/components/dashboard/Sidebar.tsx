"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bot,
  Search,
  Wand2,
  Settings,
  Images,
  Newspaper,
  BriefcaseBusiness,
  BookOpen,
  Inbox,
  Shield,
  LogOut,
  Ticket,
  CheckSquare,
  Building2,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";
import { navForRole } from "@/lib/roles";
import { readSeoSeenAt } from "@/lib/dashboard/nav-badges";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/crm": Building2,
  "/portfolio-admin": Images,
  "/nieuws-admin": Newspaper,
  "/case-studies-admin": BriefcaseBusiness,
  "/kennisbank-admin": BookOpen,
  "/crm/leads": Inbox,
  "/shop-admin": ShoppingBag,
  "/orders": ClipboardList,
  "/crm/tickets": Ticket,
  "/todos": CheckSquare,
  "/users": Shield,
  "/projects": FolderKanban,
  "/crm/clients": Users,
  "/ai-agents": Bot,
  "/seo-analysis": Search,
  "/content-generator": Wand2,
  "/settings": Settings,
};

const BADGE_HREFS = ["/crm/leads", "/crm/tickets", "/seo-analysis", "/orders"] as const;

type NavBadges = {
  leads: number;
  tickets: number;
  seoAnalysis: number;
  orders: number;
};

function badgeForHref(href: string, badges: NavBadges | undefined) {
  if (!badges) return 0;
  if (href === "/crm/leads") return badges.leads;
  if (href === "/crm/tickets") return badges.tickets;
  if (href === "/seo-analysis") return badges.seoAnalysis;
  if (href === "/orders") return badges.orders;
  return 0;
}

function formatBadgeCount(count: number) {
  if (count <= 0) return null;
  if (count > 99) return "99+";
  return String(count);
}

export type SidebarUser = {
  name: string | null;
  email: string | null;
  role: Role;
};

export function Sidebar({ user }: { user: SidebarUser }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const pathname = usePathname();
  const role = user.role;
  const items = navForRole(role);
  const displayName = user.name?.trim() || user.email || "";
  const displayRole = (() => {
    const key = `role${role}` as
      | "roleSUPER_ADMIN"
      | "roleADMIN"
      | "roleMANAGER"
      | "roleCLIENT";
    try {
      return t(key);
    } catch {
      return String(role).replaceAll("_", " ");
    }
  })();

  const showBadges = items.some((item) =>
    BADGE_HREFS.includes(item.href as (typeof BADGE_HREFS)[number]),
  );

  const { data: badges } = useQuery({
    queryKey: ["dashboard-nav-badges"],
    enabled: showBadges,
    queryFn: async () => {
      const params = new URLSearchParams();
      const seoSeenAt = readSeoSeenAt();
      if (seoSeenAt) params.set("seoSeenAt", seoSeenAt);
      const qs = params.toString();
      const res = await fetch(
        `/api/dashboard/nav-badges${qs ? `?${qs}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as NavBadges;
    },
    refetchInterval: 30_000,
  });

  return (
    <aside className="w-full p-3 md:sticky md:top-3 md:h-[calc(100svh-1.5rem)] md:w-72 md:self-start md:p-3">
      <div className="glass flex h-full flex-col rounded-[1.75rem] p-4">
        <div className="mb-6 flex items-center justify-between gap-2">
          <SoftLink href={`/${locale}`} aria-label="TripleZero iT" className="min-w-0">
            <BrandLogo />
          </SoftLink>
          <ThemeToggle />
        </div>

        <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2.5">
          <p className="truncate text-sm font-medium" title={displayName}>
            {displayName}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {displayRole}
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pr-1">
          {items.map((item) => {
            const href = localizedHref(locale, item.href);
            // Prefer exact/longest match so /crm does not stay active on /crm/tickets
            const longerMatch = items.some(
              (other) =>
                other.href !== item.href &&
                other.href.startsWith(`${item.href}/`) &&
                (pathname === localizedHref(locale, other.href) ||
                  pathname.startsWith(`/${locale}${other.href}/`)),
            );
            const active =
              !longerMatch &&
              (pathname === href || pathname.startsWith(`${href}/`));
            const Icon = icons[item.href] || LayoutDashboard;
            const badge = formatBadgeCount(badgeForHref(item.href, badges));
            return (
              <SoftLink
                key={item.href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                  active && "bg-primary/10 text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{t(item.key)}</span>
                {badge ? (
                  <span
                    className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-none text-accent-foreground"
                    aria-label={`${badge} new`}
                  >
                    {badge}
                  </span>
                ) : null}
              </SoftLink>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="mt-3 justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: localizedHref(locale, "/login") })}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </aside>
  );
}
