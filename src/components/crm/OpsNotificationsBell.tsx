"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function OpsNotificationsBell() {
  const locale = useLocale();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["crm-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/crm/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ notifications: Notification[]; unread: number }>;
    },
    refetchInterval: 60_000,
  });

  const unread = data?.unread || 0;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function markAll() {
    await fetch("/api/crm/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    qc.invalidateQueries({ queryKey: ["crm-notifications"] });
  }

  async function markOne(id: string) {
    await fetch("/api/crm/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    qc.invalidateQueries({ queryKey: ["crm-notifications"] });
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        variant="outline"
        size="icon"
        className="relative rounded-xl"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-background p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium">Notifications</span>
            {unread > 0 ? (
              <button type="button" className="text-xs text-primary" onClick={() => void markAll()}>
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {(data?.notifications || []).length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              (data?.notifications || []).slice(0, 12).map((n) => {
                const content = (
                  <div className={cn("rounded-xl px-3 py-2 text-left", !n.readAt && "bg-muted/50")}>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body ? <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p> : null}
                  </div>
                );
                return n.href ? (
                  <SoftLink
                    key={n.id}
                    href={localizedHref(locale, n.href.startsWith("/") ? n.href : `/${n.href}`)}
                    className="block"
                    onClick={() => void markOne(n.id)}
                  >
                    {content}
                  </SoftLink>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    className="w-full"
                    onClick={() => void markOne(n.id)}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
