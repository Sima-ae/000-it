"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  CheckSquare,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Ticket,
  Users,
  Workflow,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";
import { isStaffRole } from "@/lib/roles";

const staffLinks = [
  { href: "/crm", key: "overview", icon: LayoutDashboard },
  { href: "/crm/clients", key: "clients", icon: Building2 },
  { href: "/crm/leads", key: "leads", icon: Workflow },
  { href: "/crm/tasks", key: "tasks", icon: CheckSquare },
  { href: "/crm/tickets", key: "tickets", icon: Ticket },
  { href: "/crm/invoices", key: "invoices", icon: FileText },
  { href: "/crm/messages", key: "messages", icon: MessageSquare },
  { href: "/crm/settings", key: "crmSettings", icon: Settings2 },
] as const;

const clientLinks = [
  { href: "/crm", key: "overview", icon: LayoutDashboard },
  { href: "/crm/tickets", key: "tickets", icon: Ticket },
  { href: "/crm/invoices", key: "invoices", icon: FileText },
  { href: "/crm/messages", key: "messages", icon: MessageSquare },
  { href: "/projects", key: "projects", icon: Users },
] as const;

export function CrmNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const links = staff ? staffLinks : clientLinks;

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-muted/20 p-1.5">
      {links.map((item) => {
        const href = localizedHref(locale, item.href);
        const active =
          item.href === "/crm"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        const Icon = item.icon;
        return (
          <SoftLink
            key={item.href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-background hover:text-foreground md:text-sm",
              active && "bg-background text-foreground shadow-sm",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(item.key)}
          </SoftLink>
        );
      })}
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
  return (
    <div className="space-y-4">
      <CrmNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">CRM</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
