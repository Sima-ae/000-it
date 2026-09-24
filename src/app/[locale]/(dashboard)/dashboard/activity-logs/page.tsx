"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { localizedHref } from "@/i18n/pathnames";
import { isAdminRole } from "@/lib/roles";

const ACTIVITY_TYPES = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "TASK_COMPLETED",
  "AGENT_STARTED",
  "AGENT_COMPLETED",
  "CLIENT_ADDED",
  "SCAN_COMPLETED",
  "PAYMENT_RECEIVED",
] as const;

type ActivityItem = {
  id: string;
  type: (typeof ACTIVITY_TYPES)[number] | string;
  description: string;
  metadata: unknown;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  project: { id: string; name: string } | null;
};

type ActivityLogsResponse = {
  items: ActivityItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function typeBadgeVariant(
  type: string,
): "accent" | "secondary" | "warning" | "outline" | "default" {
  if (type.startsWith("AGENT_")) return "accent";
  if (type.startsWith("SCAN_")) return "secondary";
  if (type.startsWith("PROJECT_")) return "default";
  if (type === "CLIENT_ADDED") return "warning";
  return "outline";
}

export default function ActivityLogsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const allowed = isAdminRole(session?.user?.role);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const queryKey = useMemo(
    () => ["activity-logs", page, search, type] as const,
    [page, search, type],
  );

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey,
    enabled: allowed,
    refetchInterval: 60 * 60 * 1000,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "25",
      });
      if (search) params.set("q", search);
      if (type) params.set("type", type);
      const res = await fetch(`/api/dashboard/activity-logs?${params}`);
      if (res.status === 403) throw new Error("FORBIDDEN");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as ActivityLogsResponse;
    },
  });

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  }

  function typeLabel(value: string) {
    const labels: Record<string, string> = {
      PROJECT_CREATED: t("activityType_PROJECT_CREATED"),
      PROJECT_UPDATED: t("activityType_PROJECT_UPDATED"),
      TASK_COMPLETED: t("activityType_TASK_COMPLETED"),
      AGENT_STARTED: t("activityType_AGENT_STARTED"),
      AGENT_COMPLETED: t("activityType_AGENT_COMPLETED"),
      CLIENT_ADDED: t("activityType_CLIENT_ADDED"),
      SCAN_COMPLETED: t("activityType_SCAN_COMPLETED"),
      PAYMENT_RECEIVED: t("activityType_PAYMENT_RECEIVED"),
    };
    return labels[value] || value.replaceAll("_", " ");
  }

  if (status === "loading") {
    return <p className="text-muted-foreground">{t("working")}</p>;
  }

  if (!allowed) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t("activityLogs")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("activityLogsForbidden")}</p>
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToDashboard")}
          </SoftLink>
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {t("adminConsole")}
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
            {t("activityLogs")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("activityLogsSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <SoftLink href={localizedHref(locale, "/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToDashboard")}
            </SoftLink>
          </Button>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("activityRefresh")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">{t("activityFilters")}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("activityShowing", { count: items.length, total })}
              </p>
            </div>
            <form
              onSubmit={applySearch}
              className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
            >
              <div className="relative min-w-55 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("activitySearchPlaceholder")}
                  className="pl-9"
                />
              </div>
              <select
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("activityFilterAll")}</option>
                {ACTIVITY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {typeLabel(value)}
                  </option>
                ))}
              </select>
              <Button type="submit">{t("activitySearch")}</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("working")}</p>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">{t("activityLoadFailed")}</p>
          ) : !items.length ? (
            <p className="text-sm text-muted-foreground">{t("activityNoResults")}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_minmax(0,1fr)_minmax(0,1fr)_170px] gap-3 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
                <span>{t("activityColEvent")}</span>
                <span>{t("activityColType")}</span>
                <span>{t("activityColUser")}</span>
                <span>{t("activityColProject")}</span>
                <span>{t("activityColTime")}</span>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_140px_minmax(0,1fr)_minmax(0,1fr)_170px] md:items-center md:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                        {new Date(item.createdAt).toLocaleString(locale)}
                      </p>
                    </div>
                    <div>
                      <Badge variant={typeBadgeVariant(item.type)}>
                        {typeLabel(item.type)}
                      </Badge>
                    </div>
                    <div className="min-w-0 text-sm text-muted-foreground">
                      <p className="truncate">
                        {item.user?.name || item.user?.email || t("activityUnknownUser")}
                      </p>
                      {item.user?.name && item.user.email ? (
                        <p className="truncate text-xs">{item.user.email}</p>
                      ) : null}
                    </div>
                    <div className="min-w-0 text-sm text-muted-foreground">
                      {item.project ? (
                        <SoftLink
                          href={localizedHref(locale, `/projects/${item.project.id}`)}
                          className="truncate text-foreground underline-offset-2 hover:underline"
                        >
                          {item.project.name}
                        </SoftLink>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:block">
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <p className="text-xs text-muted-foreground">
                {t("activityPage", { page, totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("activityPrev")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("activityNext")}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
