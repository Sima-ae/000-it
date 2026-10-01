"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SoftLink } from "@/components/shared/SoftLink";
import { useLocale } from "next-intl";
import { localizedHref } from "@/i18n/pathnames";

export default function DashboardsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-dashboards"],
    queryFn: async () => {
      const res = await fetch("/api/crm/dashboards");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  async function create() {
    const res = await fetch("/api/crm/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Work dashboard" }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      setName("");
      toast.success(t("opsDashboardCreated"));
      qc.invalidateQueries({ queryKey: ["crm-dashboards"] });
    }
  }

  return (
    <CrmShell
      title={t("dashboards")}
      subtitle={t("dashboardsSubtitle")}
      actions={
        <div className="flex gap-2">
          <Input
            className="w-48"
            placeholder={t("opsDashboardName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={() => void create()}>
            <Plus className="mr-1 h-4 w-4" />
            {t("opsNewDashboard")}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(data?.boardStats || []).map(
              (b: {
                id: string;
                name: string;
                itemCount: number;
                statusCounts: Record<string, number>;
              }) => {
                const done = b.statusCounts.done || b.statusCounts.won || b.statusCounts.published || 0;
                const total = b.itemCount || 1;
                const pct = Math.round((done / total) * 100);
                return (
                  <Card key={b.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        <SoftLink
                          href={localizedHref(locale, `/crm/boards/${b.id}`)}
                          className="hover:underline"
                        >
                          {b.name}
                        </SoftLink>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-3xl font-semibold">{b.itemCount}</p>
                      <p className="text-xs text-muted-foreground">{t("opsItems")}</p>
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{t("opsProgress")}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(b.statusCounts).map(([k, v]) => (
                          <span key={k}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(data?.dashboards || []).map(
              (d: { id: string; name: string; widgets: { id: string; title: string; type: string }[] }) => (
                <Card key={d.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{d.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {d.widgets.map((w) => (
                      <div key={w.id} className="rounded-lg border px-3 py-2">
                        {w.title} · {w.type}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      )}
    </CrmShell>
  );
}
