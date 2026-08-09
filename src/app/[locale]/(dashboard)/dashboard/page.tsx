"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  const stats = [
    { label: t("statsProjects"), value: data.stats.projects },
    { label: t("statsAgents"), value: data.stats.agents },
    { label: t("statsTasks"), value: data.stats.tasks },
    { label: t("statsScans"), value: data.stats.scans },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("welcome")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/projects`}>{t("newProject")}</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/ai-scan`}>{t("runScan")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("agents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.agentList.map(
              (agent: { id: string; name: string; status: string; type: string }) => (
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
              ),
            )}
            {!data.agentList.length && (
              <p className="text-sm text-muted-foreground">No agents yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activities.map(
              (activity: { id: string; description: string; createdAt: string }) => (
                <div key={activity.id} className="border-b border-border/60 pb-2 text-sm">
                  <p>{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ),
            )}
            {!data.activities.length && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projects")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.recentProjects.map(
            (project: {
              id: string;
              name: string;
              status: string;
              progress: number;
              type: string;
            }) => (
              <Link
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
              </Link>
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
