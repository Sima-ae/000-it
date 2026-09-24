"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  FolderKanban,
  Images,
  Inbox,
  Newspaper,
  Search,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { SoftLink } from "@/components/shared/SoftLink";
import { StaffTodoPanel } from "@/components/chat/LiveChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type DashboardData = {
  role: string;
  view: "admin" | "manager" | "client";
  user: { name: string | null; email: string | null; companyName: string | null };
  stats: {
    projects: number;
    agents: number;
    tasks: number;
    scans: number;
    clients: number;
    leads: number;
    news: number;
    caseStudies: number;
    openTickets: number;
    todosOpen: number;
  };
  activities: { id: string; description: string; createdAt: string }[];
  recentProjects: {
    id: string;
    name: string;
    status: string;
    progress: number;
    type: string;
  }[];
  recentClients: { id: string; name: string; company: string | null; status: string }[];
  recentLeads: { id: string; name: string; email: string; company: string | null; createdAt: string }[];
  recentTickets: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
    source: string;
  }[];
  agentList: { id: string; name: string; status: string; type: string }[];
};

function workloadTone(value: number): string {
  if (value <= 0) return "text-accent";
  if (value <= 10) return "text-orange-500";
  return "text-red-600";
}

function StatCard({
  label,
  value,
  hint,
  valueClassName,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  valueClassName?: string;
  href?: string;
}) {
  const card = (
    <Card
      className={
        href
          ? "h-full overflow-hidden border-border/80 bg-card/60 transition hover:border-primary/40"
          : "overflow-hidden border-border/80 bg-card/60"
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={
            valueClassName
              ? `font-display text-3xl font-semibold tracking-tight ${valueClassName}`
              : "font-display text-3xl font-semibold tracking-tight"
          }
        >
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return <SoftLink href={href}>{card}</SoftLink>;
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <SoftLink
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-border/80 bg-background/50 p-4 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-medium">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </SoftLink>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load dashboard");
      }
      return (await res.json()) as DashboardData;
    },
    retry: 1,
    refetchInterval: 60 * 60 * 1000,
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (isError || !data) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {unauthorized ? t("sessionExpired") : t("loadFailed")}
        </p>
        <div className="flex flex-wrap gap-2">
          {unauthorized ? (
            <Button asChild>
              <SoftLink href={localizedHref(locale, "/login")}>{t("goToLogin")}</SoftLink>
            </Button>
          ) : (
            <Button onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "…" : t("retry")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const name = data.user.name || data.user.email || "there";

  if (data.view === "client") {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-4xl border border-border bg-linear-to-br from-primary/15 via-background to-accent/10 p-8 md:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
            {t("clientPortal")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("clientWelcome", { name })}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {data.user.companyName
              ? t("clientSubtitleCompany", { company: data.user.companyName })
              : t("clientSubtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <SoftLink href={localizedHref(locale, "/ai-scan")}>{t("runScan")}</SoftLink>
            </Button>
            <Button asChild variant="outline">
              <SoftLink href={localizedHref(locale, "/projects")}>{t("viewProjects")}</SoftLink>
            </Button>
            <Button asChild variant="outline">
              <SoftLink href={localizedHref(locale, "/crm/tickets")}>{t("tickets")}</SoftLink>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t("statsProjects")} value={data.stats.projects} />
          <StatCard label={t("statsAgents")} value={data.stats.agents} />
          <StatCard label={t("statsScans")} value={data.stats.scans} />
          <StatCard label={t("tickets")} value={data.stats.openTickets} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <QuickLink
            href={localizedHref(locale, "/projects")}
            title={t("projects")}
            description={t("clientQuickProjects")}
            icon={FolderKanban}
          />
          <QuickLink
            href={localizedHref(locale, "/crm/tickets")}
            title={t("tickets")}
            description={t("clientHomeHint")}
            icon={Ticket}
          />
          <QuickLink
            href={localizedHref(locale, "/crm")}
            title={t("crm")}
            description={t("invoicesOverview")}
            icon={BriefcaseBusiness}
          />
          <QuickLink
            href={localizedHref(locale, "/seo-analysis")}
            title={t("seo")}
            description={t("clientQuickSeo")}
            icon={Search}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("tickets")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentTickets.map((ticket) => (
                <SoftLink
                  key={ticket.id}
                  href={localizedHref(locale, "/crm/tickets")}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.source}</p>
                  </div>
                  <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
                </SoftLink>
              ))}
              {!data.recentTickets.length && (
                <p className="text-sm text-muted-foreground">{t("noTicketsYet")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("projects")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentProjects.map((project) => (
                <SoftLink
                  key={project.id}
                  href={`/${locale}/projects/${project.id}`}
                  className="block rounded-xl border border-border p-4 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge variant="secondary">{project.status}</Badge>
                  </div>
                  <Progress className="mt-3" value={project.progress} />
                </SoftLink>
              ))}
              {!data.recentProjects.length && (
                <p className="text-sm text-muted-foreground">{t("emptyProjects")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (data.view === "manager") {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              {t("managerWorkspace")}
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
              {t("managerWelcome", { name })}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("managerSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <SoftLink href={localizedHref(locale, "/crm/clients")}>{t("addClient")}</SoftLink>
            </Button>
            <Button asChild>
              <SoftLink href={localizedHref(locale, "/nieuws-admin")}>{t("addNews")}</SoftLink>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t("myClients")} value={data.stats.clients} hint={t("ownItemsOnly")} />
          <StatCard label={t("myProjects")} value={data.stats.projects} hint={t("ownItemsOnly")} />
          <StatCard label={t("tickets")} value={data.stats.openTickets} />
          <StatCard label={t("todos")} value={data.stats.todosOpen} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <StaffTodoPanel />
          <Card>
            <CardHeader>
              <CardTitle>{t("tickets")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentTickets.map((ticket) => (
                <SoftLink
                  key={ticket.id}
                  href={localizedHref(locale, "/crm/tickets")}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.source}</p>
                  </div>
                  <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
                </SoftLink>
              ))}
              {!data.recentTickets.length && (
                <p className="text-sm text-muted-foreground">{t("noTicketsYet")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            href={localizedHref(locale, "/crm/tickets")}
            title={t("tickets")}
            description={t("liveChatInbox")}
            icon={Ticket}
          />
          <QuickLink
            href={localizedHref(locale, "/crm/clients")}
            title={t("clients")}
            description={t("managerQuickClients")}
            icon={Users}
          />
          <QuickLink
            href={localizedHref(locale, "/crm/leads")}
            title={t("leads")}
            description={t("managerQuickLeads")}
            icon={Inbox}
          />
          <QuickLink
            href={localizedHref(locale, "/nieuws-admin")}
            title={t("news")}
            description={t("managerQuickNews")}
            icon={Newspaper}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("myClients")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentClients.map((client) => (
                <SoftLink
                  key={client.id}
                  href={`/${locale}/crm/clients/${client.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition hover:border-primary/40"
                >
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.company || "—"}</p>
                  </div>
                  <Badge variant="outline">{client.status}</Badge>
                </SoftLink>
              ))}
              {!data.recentClients.length && (
                <p className="text-sm text-muted-foreground">{t("emptyClients")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("leads")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentLeads.map((lead) => (
                <SoftLink
                  key={lead.id}
                  href={localizedHref(locale, "/crm/leads")}
                  className="block rounded-lg border border-border px-3 py-2 transition hover:border-primary/40"
                >
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.email}
                    {lead.company ? ` · ${lead.company}` : ""}
                  </p>
                </SoftLink>
              ))}
              {!data.recentLeads.length && (
                <p className="text-sm text-muted-foreground">{t("emptyLeads")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("myProjects")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.recentProjects.map((project) => (
              <SoftLink
                key={project.id}
                href={`/${locale}/projects/${project.id}`}
                className="rounded-xl border border-border p-4 transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{project.name}</h3>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{project.type}</p>
                <Progress className="mt-3" value={project.progress} />
              </SoftLink>
            ))}
            {!data.recentProjects.length && (
              <p className="text-sm text-muted-foreground">{t("emptyProjects")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin / Super admin
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
            {data.role === "SUPER_ADMIN" ? t("superAdmin") : t("adminConsole")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("welcome")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <SoftLink href={localizedHref(locale, "/projects")}>{t("newProject")}</SoftLink>
          </Button>
          <Button asChild>
            <SoftLink href={localizedHref(locale, "/ai-scan")}>{t("runScan")}</SoftLink>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickLink
          href={localizedHref(locale, "/kennisbank-admin")}
          title={t("kennisbank")}
          description={t("adminQuickKennisbank")}
          icon={BookOpen}
        />
        <QuickLink
          href={localizedHref(locale, "/nieuws-admin")}
          title={t("news")}
          description={t("adminQuickNews")}
          icon={Newspaper}
        />
        <QuickLink
          href={localizedHref(locale, "/portfolio-admin")}
          title={t("portfolio")}
          description={t("adminQuickPortfolio")}
          icon={Images}
        />
        <QuickLink
          href={localizedHref(locale, "/shop-admin")}
          title={t("shop")}
          description={t("adminQuickShop")}
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t("leads")}
          value={data.stats.leads}
          valueClassName={data.stats.leads > 0 ? "text-red-600" : undefined}
          href={localizedHref(locale, "/crm/leads")}
        />
        <StatCard
          label={t("tickets")}
          value={data.stats.openTickets}
          valueClassName={workloadTone(data.stats.openTickets)}
          href={localizedHref(locale, "/crm/tickets")}
        />
        <StatCard
          label={t("statsTasks")}
          value={data.stats.tasks}
          valueClassName={workloadTone(data.stats.tasks)}
          href={localizedHref(locale, "/crm/tasks")}
        />
        <StatCard
          label={t("statsProjects")}
          value={data.stats.projects}
          valueClassName="text-primary"
          href={localizedHref(locale, "/projects")}
        />
        <StatCard
          label={t("clients")}
          value={data.stats.clients}
          valueClassName="text-primary"
          href={localizedHref(locale, "/crm/clients")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projects")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.recentProjects.map((project) => (
            <SoftLink
              key={project.id}
              href={`/${locale}/projects/${project.id}`}
              className="rounded-xl border border-border p-4 transition hover:border-primary/50"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{project.name}</h3>
                <Badge variant="secondary">{project.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{project.type}</p>
              <Progress className="mt-3" value={project.progress} />
            </SoftLink>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("tickets")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTickets.map((ticket) => (
              <SoftLink
                key={ticket.id}
                href={localizedHref(locale, `/crm/tickets/${ticket.id}`)}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.source}</p>
                </div>
                <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
              </SoftLink>
            ))}
            {!data.recentTickets.length && (
              <p className="text-sm text-accent">{t("noTicketsYet")}</p>
            )}
          </CardContent>
        </Card>
        <StaffTodoPanel />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("agents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.agentList.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.type}</p>
                </div>
                <Badge
                  variant={
                    agent.status === "RUNNING"
                      ? "accent"
                      : agent.status === "PAUSED"
                        ? "warning"
                        : "outline"
                  }
                >
                  {agent.status}
                </Badge>
              </div>
            ))}
            {!data.agentList.length && (
              <p className="text-sm text-muted-foreground">{t("emptyAgents")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>{t("recentActivity")}</CardTitle>
            <Button asChild variant="outline" size="sm">
              <SoftLink href={localizedHref(locale, "/dashboard/activity-logs")}>
                {t("viewAllActivity")}
              </SoftLink>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activities.map((activity) => (
              <div key={activity.id} className="border-b border-border/60 pb-2 text-sm">
                <p>{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {!data.activities.length && (
              <p className="text-sm text-muted-foreground">{t("emptyActivity")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
