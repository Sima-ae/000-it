"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Inbox,
  Shield,
  LogOut,
  Ticket,
  CheckSquare,
  Building2,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navForRole } from "@/lib/roles";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/crm": Building2,
  "/portfolio-admin": Images,
  "/nieuws-admin": Newspaper,
  "/case-studies-admin": BriefcaseBusiness,
  "/crm/leads": Inbox,
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

export function Sidebar() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const items = navForRole(role);

  return (
    <aside className="w-full p-3 md:sticky md:top-3 md:h-[calc(100svh-1.5rem)] md:w-72 md:self-start md:p-3">
      <div className="glass flex h-full flex-col rounded-[1.75rem] p-4">
        <div className="mb-6 flex items-center justify-between gap-2">
          <SoftLink href={`/${locale}`} className="font-display text-lg font-semibold tracking-tight">
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              TripleZero iT
            </span>
          </SoftLink>
          <ThemeToggle />
        </div>

        {session?.user ? (
          <div className="mb-4 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{session.user.name || session.user.email}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {String(role || "CLIENT").replace("_", " ")}
            </p>
          </div>
        ) : null}

        <nav className="flex gap-1 overflow-x-auto md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pr-1">
          {items.map((item) => {
            const href = `/${locale}${item.href}`;
            // Prefer exact/longest match so /crm does not stay active on /crm/tickets
            const longerMatch = items.some(
              (other) =>
                other.href !== item.href &&
                other.href.startsWith(`${item.href}/`) &&
                (pathname === `/${locale}${other.href}` ||
                  pathname.startsWith(`/${locale}${other.href}/`)),
            );
            const active =
              !longerMatch &&
              (pathname === href || pathname.startsWith(`${href}/`));
            const Icon = icons[item.href] || LayoutDashboard;
            return (
              <SoftLink
                key={item.href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                  active && "bg-primary/10 text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </SoftLink>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="mt-3 justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </aside>
  );
}
