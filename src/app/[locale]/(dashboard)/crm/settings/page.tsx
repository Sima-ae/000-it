"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isStaffRole } from "@/lib/roles";

export default function CrmSettingsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !isStaffRole(session?.user?.role)) {
      router.replace(`/${locale}/crm`);
    }
  }, [status, session?.user?.role, router, locale]);

  if (!isStaffRole(session?.user?.role)) {
    return (
      <CrmShell title={t("crmSettings")}>
        <p className="text-muted-foreground">…</p>
      </CrmShell>
    );
  }

  const groups = [
    {
      title: t("settingsGeneral"),
      items: [
        { label: t("users"), href: "/users", desc: t("settingsUsersDesc") },
        { label: t("todos"), href: "/todos", desc: t("settingsTodosDesc") },
      ],
    },
    {
      title: t("settingsModules"),
      items: [
        { label: t("clients"), href: "/crm/clients", desc: t("settingsClientsDesc") },
        { label: t("leads"), href: "/crm/leads", desc: t("settingsLeadsDesc") },
        { label: t("tickets"), href: "/crm/tickets", desc: t("settingsTicketsDesc") },
        { label: t("tasks"), href: "/crm/tasks", desc: t("settingsTasksDesc") },
        { label: t("invoices"), href: "/crm/invoices", desc: t("settingsInvoicesDesc") },
        { label: t("messages"), href: "/crm/messages", desc: t("settingsMessagesDesc") },
      ],
    },
    {
      title: t("settingsIntegrations"),
      items: [
        {
          label: "Live chat",
          href: "/crm/tickets",
          desc: t("settingsChatDesc"),
        },
        {
          label: t("projects"),
          href: "/projects",
          desc: t("settingsProjectsDesc"),
        },
      ],
    },
  ];

  return (
    <CrmShell title={t("crmSettings")} subtitle={t("settingsSubtitle")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.href + item.label}
                  className="rounded-xl border border-border px-3 py-3"
                >
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <SoftLink href={`/${locale}${item.href}`}>{t("open")}</SoftLink>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </CrmShell>
  );
}
