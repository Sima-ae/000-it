"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffTodoPanel } from "@/components/chat/LiveChatWidget";

type Overview = {
  view: "staff" | "client";
  stats: {
    clients: number;
    leadsPipeline: number;
    projects: number;
    openTickets: number;
    tasks: number;
    invoices: number;
    unreadMessages: number;
  };
  recentTickets: {
    id: string;
    subject: string;
    status: string;
    source: string;
    client?: { name: string; company: string | null } | null;
  }[];
  recentClients: {
    id: string;
    name: string;
    company: string | null;
    status: string;
    isLead: boolean;
  }[];
};

export default function CrmHomePage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["crm-overview"],
    queryFn: async () => {
      const res = await fetch("/api/crm/overview");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Overview;
    },
    refetchInterval: 10000,
  });

  if (isLoading || !data) {
    return (
      <CrmShell title={t("overview")}>
        <p className="text-muted-foreground">Loading…</p>
      </CrmShell>
    );
  }

  const stats =
    data.view === "staff"
      ? [
          { label: t("clients"), value: data.stats.clients, href: "/crm/clients" },
          { label: t("leads"), value: data.stats.leadsPipeline, href: "/crm/leads" },
          { label: t("tickets"), value: data.stats.openTickets, href: "/crm/tickets" },
          { label: t("tasks"), value: data.stats.tasks, href: "/crm/tasks" },
          { label: t("invoices"), value: data.stats.invoices, href: "/crm/invoices" },
          { label: t("messages"), value: data.stats.unreadMessages, href: "/crm/messages" },
        ]
      : [
          { label: t("tickets"), value: data.stats.openTickets, href: "/crm/tickets" },
          { label: t("invoices"), value: data.stats.invoices, href: "/crm/invoices" },
          { label: t("messages"), value: data.stats.unreadMessages, href: "/crm/messages" },
          { label: t("projects"), value: data.stats.projects, href: "/projects" },
        ];

  return (
    <CrmShell
      title={t("overview")}
      subtitle={
        data.view === "staff"
          ? t("overviewStaffSubtitle")
          : t("overviewClientSubtitle")
      }
      actions={
        <Button asChild>
          <SoftLink href={`/${locale}/crm/tickets`}>{t("openTicket")}</SoftLink>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <SoftLink key={stat.href + stat.label} href={`/${locale}${stat.href}`}>
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          </SoftLink>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentTickets")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentTickets.map((ticket) => (
              <SoftLink
                key={ticket.id}
                href={`/${locale}/crm/tickets`}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2 transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.client?.company || ticket.client?.name || ticket.source}
                  </p>
                </div>
                <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
              </SoftLink>
            ))}
            {!data.recentTickets.length ? (
              <p className="text-sm text-muted-foreground">{t("emptyTickets")}</p>
            ) : null}
          </CardContent>
        </Card>

        {data.view === "staff" ? (
          <StaffTodoPanel />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("messages")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("clientMessagesHint")}</p>
              <Button asChild className="mt-4" variant="outline">
                <SoftLink href={`/${locale}/crm/messages`}>{t("messages")}</SoftLink>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {data.view === "staff" && data.recentClients.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("recentClients")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {data.recentClients.map((client) => (
              <SoftLink
                key={client.id}
                href={`/${locale}/crm/clients/${client.id}`}
                className="rounded-xl border border-border px-3 py-2 transition hover:border-primary/40"
              >
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">
                  {client.company || "—"} · {client.isLead ? "Lead" : client.status}
                </p>
              </SoftLink>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </CrmShell>
  );
}
