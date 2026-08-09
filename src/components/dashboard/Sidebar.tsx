"use client";

import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", key: "title", icon: LayoutDashboard },
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
    <aside className="w-full border-b border-border bg-card/40 p-4 backdrop-blur md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <Link href={`/${locale}`} className="mb-6 block text-lg font-semibold">
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TripleZero iT
        </span>
      </Link>
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item) => {
          const href = `/${locale}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
