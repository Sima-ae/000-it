"use client";

import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  MessageSquare,
  Plus,
  Settings2,
  Ticket,
  Users,
} from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ticketKey, relativeTime } from "@/lib/crm/tickets";
import { cn } from "@/lib/utils";
import { useTicketI18n } from "@/components/crm/tickets/useTicketI18n";

export type TicketsStatsPayload = {
  stats: {
    total: number;
    open: number;
    highPriority: number;
    unassigned: number;
    assignedToMe: number;
    chatSource: number;
    resolved: number;
    closed: number;
    overdue: number;
    newToday: number;
    avgFirstResponseMins: number;
    clientsCount: number;
    contactsCount: number;
  };
  byStatus: { key: string; count: number }[];
  byPriority: { key: string; count: number }[];
  byDepartment: { key: string; count: number }[];
  byType: { key: string; count: number }[];
  history: { key: string; count: number }[];
  recent: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
    dueAt?: string | null;
  }[];
  ai: {
    active: boolean;
    classifications: number;
    suggestions: number;
    autoClassify: boolean;
    features: string[];
  };
};

function MetricCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={cn("rounded-xl p-2.5", tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionList({
  title,
  rows,
  empty,
  formatKey,
}: {
  title: string;
  rows: { key: string; count: number }[];
  empty: string;
  formatKey?: (key: string) => string;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          rows.map((row) => {
            const pct = Math.round((row.count / total) * 100);
            const label = formatKey ? formatKey(row.key) : row.key;
            return (
              <div key={row.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{label}</span>
                  <span className="text-muted-foreground">
                    {row.count} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function TicketsOverview({
  data,
  locale,
  labels,
  onViewTickets,
  onCreateTicket,
  staff,
}: {
  data: TicketsStatsPayload;
  locale: string;
  staff: boolean;
  onViewTickets: () => void;
  onCreateTicket: () => void;
  labels: {
    welcome: string;
    welcomeSub: string;
    systemOnline: string;
    newTickets: string;
    openTickets: string;
    closedTickets: string;
    unassignedTickets: string;
    slaTitle: string;
    compliance: string;
    breached: string;
    atRisk: string;
    avgResolution: string;
    recentActivity: string;
    conversations: string;
    totalConversations: string;
    active: string;
    today: string;
    avgFirstResponse: string;
    aiAssistant: string;
    aiReady: string;
    classifications: string;
    suggestions: string;
    aiSettings: string;
    viewAnalytics: string;
    autoClassify: string;
    systemStatus: string;
    overallStatus: string;
    apiConnected: string;
    features: string;
    quickActions: string;
    createTicket: string;
    viewTickets: string;
    startChat: string;
    viewReports: string;
    manageUsers: string;
    settings: string;
    analytics: string;
    analyticsSub: string;
    byDepartment: string;
    byType: string;
    ticketHistory: string;
    thisMonth: string;
    totalCustomers: string;
    totalContacts: string;
    empty: string;
    minutes: string;
    totalTicketsHero: string;
    activeSystem: string;
    poweredBy: string;
    estCost: string;
    on: string;
    off: string;
    connected: string;
  };
}) {
  const labelsI18n = useTicketI18n();
  const { stats, ai } = data;
  const maxHistory = Math.max(...data.history.map((h) => h.count), 1);
  const thisMonth = data.history[data.history.length - 1]?.count ?? 0;
  const compliance =
    stats.total === 0
      ? 100
      : Math.max(0, Math.round(((stats.total - stats.overdue) / stats.total) * 100));

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/20">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                {labels.systemOnline}
              </Badge>
              <Badge className="border-white/20 bg-white/10 text-white/90 hover:bg-white/15">
                {new Date().toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {labels.welcome}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">{labels.welcomeSub}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/70">
              {labels.totalTicketsHero}
            </p>
            <p className="font-display text-3xl font-semibold">{stats.total}</p>
            <p className="text-xs text-white/70">{labels.activeSystem}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={labels.newTickets}
          value={stats.newToday}
          tone="bg-primary/15 text-primary"
          icon={Ticket}
        />
        <MetricCard
          label={labels.openTickets}
          value={stats.open}
          tone="bg-amber-500/15 text-amber-600"
          icon={AlertTriangle}
        />
        <MetricCard
          label={labels.closedTickets}
          value={stats.closed + stats.resolved}
          tone="bg-accent/15 text-accent"
          icon={CheckCircle2}
        />
        <MetricCard
          label={labels.unassignedTickets}
          value={stats.unassigned}
          tone="bg-destructive/15 text-destructive"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{labels.slaTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">{labels.compliance}</p>
              <p className="font-display text-3xl font-semibold text-accent">{compliance}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">{labels.breached}</p>
                <p className="text-lg font-semibold text-destructive">{stats.overdue}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">{labels.atRisk}</p>
                <p className="text-lg font-semibold text-amber-600">{stats.highPriority}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {labels.avgResolution}: {stats.avgFirstResponseMins || 0} {labels.minutes}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{labels.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recent.length ? (
              data.recent.map((item) => (
                <SoftLink
                  key={item.id}
                  href={`/${locale}/crm/tickets/${item.id}`}
                  className="block rounded-xl border border-border/70 px-3 py-2 transition hover:border-primary/40"
                >
                  <p className="truncate text-sm font-medium">
                    {ticketKey(item.id)} · {item.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {labelsI18n.status(item.status)} ·{" "}
                    {relativeTime(item.updatedAt, locale)}
                  </p>
                </SoftLink>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{labels.empty}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{labels.conversations}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{labels.totalConversations}</p>
              <p className="text-xl font-semibold">{stats.chatSource}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{labels.active}</p>
              <p className="text-xl font-semibold">{stats.open}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{labels.today}</p>
              <p className="text-xl font-semibold">{stats.newToday}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{labels.avgFirstResponse}</p>
              <p className="text-xl font-semibold">
                {stats.avgFirstResponseMins || 0}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {labels.minutes}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {staff ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-primary" />
                  {labels.aiAssistant}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{labels.poweredBy}</p>
              </div>
              <Badge variant="accent">{labels.active}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-semibold">{ai.classifications}</p>
                  <p className="text-[11px] text-muted-foreground">{labels.classifications}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-semibold">$0.00</p>
                  <p className="text-[11px] text-muted-foreground">{labels.estCost}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-semibold">{ai.suggestions}</p>
                  <p className="text-[11px] text-muted-foreground">{labels.suggestions}</p>
                </div>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                {labels.aiReady}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onViewTickets}>
                  {labels.viewAnalytics}
                </Button>
                <Button type="button" variant="outline" onClick={onCreateTicket}>
                  {labels.aiSettings}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span>{labels.autoClassify}</span>
                <Badge variant="secondary">
                  {ai.autoClassify ? labels.on : labels.off}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.systemStatus}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-3 text-sm">
                  <p className="text-muted-foreground">{labels.overallStatus}</p>
                  <p className="mt-1 font-medium text-accent">{labels.active}</p>
                </div>
                <div className="rounded-xl border border-border p-3 text-sm">
                  <p className="text-muted-foreground">{labels.apiConnected}</p>
                  <p className="mt-1 font-medium text-accent">{labels.connected}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {labels.features}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ai.features.map((feature) => (
                    <Badge key={feature} variant="outline">
                      <CheckCircle2 className="mr-1 h-3 w-3 text-accent" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">{labels.quickActions}</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: labels.createTicket, icon: Plus, onClick: onCreateTicket },
            { label: labels.viewTickets, icon: Ticket, onClick: onViewTickets },
            {
              label: labels.startChat,
              icon: MessageSquare,
              href: `/${locale}/crm/messages`,
            },
            {
              label: labels.viewReports,
              icon: BarChart3,
              onClick: onViewTickets,
            },
            staff
              ? {
                  label: labels.manageUsers,
                  icon: Users,
                  href: `/${locale}/users`,
                }
              : null,
            {
              label: labels.settings,
              icon: Settings2,
              href: `/${locale}/crm/settings`,
            },
          ]
            .filter(Boolean)
            .map((action) => {
              const item = action!;
              const Icon = item.icon;
              const className =
                "flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 px-3 py-5 text-center text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5";
              if ("href" in item && item.href) {
                return (
                  <SoftLink key={item.label} href={item.href} className={className}>
                    <Icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </SoftLink>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={"onClick" in item ? item.onClick : undefined}
                  className={className}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  {item.label}
                </button>
              );
            })}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <h3 className="font-display text-lg font-semibold">{labels.analytics}</h3>
          <p className="text-sm text-muted-foreground">{labels.analyticsSub}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <DistributionList
            title={labels.byDepartment}
            rows={data.byDepartment}
            empty={labels.empty}
            formatKey={labelsI18n.department}
          />
          <DistributionList
            title={labels.byType}
            rows={data.byType}
            empty={labels.empty}
            formatKey={labelsI18n.type}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{labels.ticketHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {thisMonth} {labels.thisMonth}
              </p>
              <div className="flex h-36 items-end gap-2">
                {data.history.map((row) => (
                  <div key={row.key} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-primary/80"
                      style={{
                        height: `${Math.max(8, (row.count / maxHistory) * 100)}%`,
                      }}
                      title={`${row.key}: ${row.count}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {row.key.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {staff ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <SoftLink
            href={`/${locale}/crm/clients`}
            className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-4 transition hover:border-primary/40"
          >
            <div>
              <p className="text-sm text-muted-foreground">{labels.totalCustomers}</p>
              <p className="font-display text-2xl font-semibold">{stats.clientsCount}</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </SoftLink>
          <SoftLink
            href={`/${locale}/crm/clients`}
            className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-4 transition hover:border-primary/40"
          >
            <div>
              <p className="text-sm text-muted-foreground">{labels.totalContacts}</p>
              <p className="font-display text-2xl font-semibold">{stats.contactsCount}</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </SoftLink>
        </div>
      ) : null}
    </div>
  );
}
