"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminRole } from "@/lib/roles";

export default function ReportsPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const admin = isAdminRole(session?.user?.role);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [userId, setUserId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-reports", period, userId],
    queryFn: async () => {
      const p = new URLSearchParams({ period });
      if (userId) p.set("userId", userId);
      const res = await fetch(`/api/crm/reports?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const kpis = data?.kpis;

  return (
    <CrmShell title={t("reports")} subtitle={t("reportsSubtitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly"] as const).map((p) => (
          <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
            {t(`opsPeriod.${p}` as never)}
          </Button>
        ))}
        {admin ? (
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">{t("opsMe")}</option>
            {(data?.staff || []).map((s: { id: string; name: string | null; email: string }) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {data?.from} → {data?.to}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["hoursWorked", kpis?.hoursWorked],
              ["logCount", kpis?.logCount],
              ["outreachEmails", kpis?.outreachEmails],
              ["guestPitches", kpis?.guestPitches],
              ["directories", kpis?.directories],
              ["socialPosts", kpis?.socialPosts],
              ["socialEngagements", kpis?.socialEngagements],
              ["devTasks", kpis?.devTasks],
              ["wonLinks", kpis?.wonLinks],
            ].map(([key, value]) => (
              <Card key={String(key)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {t(`opsKpi.${key}` as never)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{value ?? 0}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("opsByActivity")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {Object.entries(data?.byActivity || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{t(`opsActivity.${k}` as never)}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("opsByStatus")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {Object.entries(data?.byStatus || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{t(`opsStatusLabel.${k}` as never)}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("opsByWebsite")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {Object.entries(data?.byWebsite || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{k === "TRIPLEZERO" ? "000-it.com" : "extrahosting.eu"}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">{t("opsTargets")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>{t("opsTargetOutreach")}: 50–75 / week</p>
              <p>{t("opsTargetPitches")}: 5 / week</p>
              <p>{t("opsTargetDirectories")}: 10 / month</p>
              <p>{t("opsTargetBacklinks")}: 4–6 / month</p>
              <p>{t("opsTargetSocial")}: 5 / platform / week</p>
              <p>{t("opsTargetDev")}: 5–10 / week</p>
            </CardContent>
          </Card>
        </>
      )}
    </CrmShell>
  );
}
