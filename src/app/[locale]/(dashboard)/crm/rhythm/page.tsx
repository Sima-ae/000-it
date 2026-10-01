"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Item = {
  id: string;
  period: string;
  dayKey: string;
  title: string;
  completed: boolean;
};

const TABS = ["DAILY", "WEEKLY", "MONTHLY", "ONBOARDING", "SOP"] as const;

export default function RhythmPage() {
  const t = useTranslations("crm");
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("DAILY");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-ops-checklist", tab === "SOP" ? undefined : tab],
    queryFn: async () => {
      const period = tab === "SOP" ? "" : `?period=${tab}`;
      const res = await fetch(`/api/crm/ops-checklist${period}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ items: Item[]; weekStart: string }>;
    },
    enabled: tab !== "SOP",
  });

  async function toggle(item: Item) {
    const res = await fetch("/api/crm/ops-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item.id,
        completed: !item.completed,
        weekStart: data?.weekStart,
      }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else qc.invalidateQueries({ queryKey: ["crm-ops-checklist"] });
  }

  const grouped = (data?.items || []).reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.dayKey] ||= []).push(item);
    return acc;
  }, {});

  return (
    <CrmShell title={t("rhythm")} subtitle={t("rhythmSubtitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "default" : "outline"}
            onClick={() => setTab(key)}
          >
            {t(`opsRhythmTab.${key}` as never)}
          </Button>
        ))}
      </div>

      {tab === "SOP" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(["A", "B", "C", "D", "E", "F", "G", "H"] as const).map((letter) => (
            <Card key={letter}>
              <CardHeader>
                <CardTitle className="text-base">{t(`opsSop.${letter}.title` as never)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                  {(t.raw(`opsSop.${letter}.steps`) as string[]).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : !data?.items?.length ? (
        <p className="text-sm text-muted-foreground">{t("opsNoChecklist")}</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dayKey, items]) => (
            <Card key={dayKey}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{dayKey}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={item.completed}
                      onChange={() => void toggle(item)}
                    />
                    <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                      {item.title}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CrmShell>
  );
}
