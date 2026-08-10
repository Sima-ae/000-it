"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bot,
  Search,
  Wand2,
  Settings,
  Images,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", key: "title", icon: LayoutDashboard },
  { href: "/portfolio-admin", key: "portfolio", icon: Images },
  { href: "/projects", key: "projects", icon: FolderKanban },
  { href: "/clients", key: "clients", icon: Users },
  { href: "/ai-agents", key: "agents", icon: Bot },
  { href: "/seo-analysis", key: "seo", icon: Search },
  { href: "/content-generator", key: "content", icon: Wand2 },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function Sidebar() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const pathname = usePathname();

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
        <nav className="flex gap-1 overflow-x-auto md:flex-1 md:flex-col md:overflow-visible">
          {items.map((item) => {
            const href = `/${locale}${item.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;
            return (
              <SoftLink
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                  active && "bg-primary/10 text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </SoftLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
