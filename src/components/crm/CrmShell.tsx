"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  CalendarRange,
  CheckSquare,
  ClipboardList,
  Clock3,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  MessageSquare,
  Settings2,
  ShoppingBag,
  Ticket,
  Workflow,
  BarChart3,
  NotebookPen,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";
import { isStaffRole } from "@/lib/roles";
import { OpsNotificationsBell } from "@/components/crm/OpsNotificationsBell";

const staffLinks = [
  { href: "/crm", key: "overview", icon: LayoutDashboard },
  { href: "/crm/boards", key: "boards", icon: LayoutGrid },
  { href: "/crm/my-work", key: "myWork", icon: ListTodo },
  { href: "/crm/dashboards", key: "dashboards", icon: BarChart3 },
  { href: "/crm/time", key: "time", icon: Clock3 },
  { href: "/crm/work-log", key: "workLog", icon: ClipboardList },
  { href: "/crm/reports", key: "reports", icon: CalendarRange },
  { href: "/crm/rhythm", key: "rhythm", icon: NotebookPen },
  { href: "/crm/briefs", key: "briefs", icon: FileText },
  { href: "/crm/clients", key: "clients", icon: Building2 },
  { href: "/crm/leads", key: "leads", icon: Workflow },
  { href: "/crm/tasks", key: "tasks", icon: CheckSquare },
  { href: "/crm/tickets", key: "tickets", icon: Ticket },
  { href: "/crm/invoices", key: "invoices", icon: FileText },
  { href: "/crm/messages", key: "messages", icon: MessageSquare },
  { href: "/crm/settings", key: "crmSettings", icon: Settings2 },
] as const;

const clientLinks = [
  { href: "/crm", key: "overview", icon: LayoutDashboard, ns: "crm" as const },
  { href: "/my-domains", key: "myDomains", icon: Globe, ns: "dashboard" as const },
  { href: "/my-orders", key: "myOrders", icon: ShoppingBag, ns: "dashboard" as const },
  { href: "/crm/tickets", key: "tickets", icon: Ticket, ns: "crm" as const },
  { href: "/crm/invoices", key: "invoices", icon: FileText, ns: "crm" as const },
  { href: "/crm/messages", key: "messages", icon: MessageSquare, ns: "crm" as const },
  { href: "/projects", key: "projects", icon: FolderKanban, ns: "crm" as const },
] as const;

export function CrmNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const tCrm = useTranslations("crm");
  const tDash = useTranslations("dashboard");
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const links = staff ? staffLinks : clientLinks;

  return (
    <div className="mb-4 flex items-start gap-2">
      <nav className="flex flex-1 flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/20 p-1">
        {links.map((item) => {
          const href = localizedHref(locale, item.href);
          const active =
            item.href === "/crm"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          const Icon = item.icon;
          const label =
            "ns" in item && item.ns === "dashboard"
              ? tDash(item.key)
              : tCrm(item.key);
          return (
            <SoftLink
              key={item.href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-background hover:text-foreground sm:text-xs",
                active && "bg-background text-foreground shadow-sm",
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </SoftLink>
          );
        })}
      </nav>
      {staff ? <OpsNotificationsBell /> : null}
    </div>
  );
}

export function CrmShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const shellLabel = staff ? t("shellLabel") : t("portalLabel");

  return (
    <div className="min-w-0 space-y-3">
      <CrmNav />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
            {shellLabel}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
