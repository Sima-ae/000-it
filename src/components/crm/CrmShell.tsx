"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  CheckSquare,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  ShoppingBag,
  Ticket,
  Workflow,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";
import { isStaffRole } from "@/lib/roles";

const staffLinks = [
  { href: "/crm", key: "overview", icon: LayoutDashboard, ns: "crm" as const },
  { href: "/crm/clients", key: "clients", icon: Building2, ns: "crm" as const },
  { href: "/crm/leads", key: "leads", icon: Workflow, ns: "crm" as const },
  { href: "/crm/tasks", key: "tasks", icon: CheckSquare, ns: "crm" as const },
  { href: "/crm/tickets", key: "tickets", icon: Ticket, ns: "crm" as const },
  { href: "/crm/invoices", key: "invoices", icon: FileText, ns: "crm" as const },
  { href: "/crm/messages", key: "messages", icon: MessageSquare, ns: "crm" as const },
  { href: "/crm/settings", key: "crmSettings", icon: Settings2, ns: "crm" as const },
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
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-muted/20 p-1.5">
      {links.map((item) => {
        const href = localizedHref(locale, item.href);
        const active =
          item.href === "/crm"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        const Icon = item.icon;
        const label = item.ns === "dashboard" ? tDash(item.key) : tCrm(item.key);
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
            {label}
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
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const shellLabel = staff ? t("shellLabel") : t("portalLabel");

  return (
    <div className="space-y-4">
      <CrmNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            {shellLabel}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
