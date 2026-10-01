"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isAdminRole } from "@/lib/roles";

type Meta = {
  websites: string[];
  activityTypes: string[];
  statuses: string[];
  today: string;
};

type Log = {
  id: string;
  date: string;
  website: string;
  activityType: string;
  contact: string | null;
  status: string;
  notes: string | null;
  nextFollowUp: string | null;
  minutesSpent: number | null;
  user: { id: string; name: string | null; email: string };
};

export default function WorkLogPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const admin = isAdminRole(session?.user?.role);
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [form, setForm] = useState({
    date: "",
    website: "TRIPLEZERO",
    activityType: "OUTREACH_EMAIL",
    contact: "",
    status: "SENT",
    notes: "",
    nextFollowUp: "",
    minutesSpent: "",
  });

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (userId) p.set("userId", userId);
    if (showFollowUps) p.set("followUpsDue", "1");
    return p.toString();
  }, [userId, showFollowUps]);

  const { data, isLoading } = useQuery({
    queryKey: ["crm-work-logs", qs],
    queryFn: async () => {
      const res = await fetch(`/api/crm/work-logs${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ logs: Log[]; staff: { id: string; name: string | null; email: string }[]; meta: Meta }>;
    },
  });

  async function createLog() {
    const res = await fetch("/api/crm/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date || undefined,
        website: form.website,
        activityType: form.activityType,
        contact: form.contact || null,
        status: form.status,
        notes: form.notes || null,
        nextFollowUp: form.nextFollowUp ? new Date(form.nextFollowUp).toISOString() : null,
        minutesSpent: form.minutesSpent ? Number(form.minutesSpent) : null,
      }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(t("opsLogCreated"));
      setForm((f) => ({ ...f, contact: "", notes: "", nextFollowUp: "", minutesSpent: "" }));
      qc.invalidateQueries({ queryKey: ["crm-work-logs"] });
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/crm/work-logs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(t("opsLogDeleted"));
      qc.invalidateQueries({ queryKey: ["crm-work-logs"] });
    }
  }

  const meta = data?.meta;

  return (
    <CrmShell title={t("workLog")} subtitle={t("workLogSubtitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        {admin ? (
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">{t("opsMe")}</option>
            {(data?.staff || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>
        ) : null}
        <Button
          size="sm"
          variant={showFollowUps ? "default" : "outline"}
          onClick={() => setShowFollowUps((v) => !v)}
        >
          {t("opsFollowUpsDue")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t("opsQuickLog")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Input
            type="date"
            value={form.date || meta?.today || ""}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          >
            <option value="TRIPLEZERO">000-it.com</option>
            <option value="EXTRAHOSTING">extrahosting.eu</option>
          </select>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={form.activityType}
            onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))}
          >
            {(meta?.activityTypes || []).map((a) => (
              <option key={a} value={a}>
                {t(`opsActivity.${a}` as never)}
              </option>
            ))}
          </select>
          <Input
            placeholder={t("opsContact")}
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          />
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {(meta?.statuses || []).map((s) => (
              <option key={s} value={s}>
                {t(`opsStatusLabel.${s}` as never)}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={form.nextFollowUp}
            onChange={(e) => setForm((f) => ({ ...f, nextFollowUp: e.target.value }))}
            placeholder={t("opsNextFollowUp")}
          />
          <Input
            type="number"
            placeholder={t("opsMinutes")}
            value={form.minutesSpent}
            onChange={(e) => setForm((f) => ({ ...f, minutesSpent: e.target.value }))}
          />
          <Textarea
            className="md:col-span-2 xl:col-span-3"
            placeholder={t("opsNotes")}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="md:col-span-2 xl:col-span-3">
            <Button onClick={() => void createLog()}>
              <Plus className="mr-1 h-4 w-4" />
              {t("opsLogWork")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-225 text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("opsDate")}</th>
              <th className="px-3 py-2">{t("opsWebsite")}</th>
              <th className="px-3 py-2">{t("opsActivityType")}</th>
              <th className="px-3 py-2">{t("opsContact")}</th>
              <th className="px-3 py-2">{t("opsStatus")}</th>
              <th className="px-3 py-2">{t("opsNotes")}</th>
              <th className="px-3 py-2">{t("opsNextFollowUp")}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-muted-foreground">
                  {t("loading")}
                </td>
              </tr>
            ) : (
              (data?.logs || []).map((log) => (
                <tr key={log.id} className="border-t align-top">
                  <td className="px-3 py-2">{log.date}</td>
                  <td className="px-3 py-2">
                    {log.website === "TRIPLEZERO" ? "000-it.com" : "extrahosting.eu"}
                  </td>
                  <td className="px-3 py-2">{t(`opsActivity.${log.activityType}` as never)}</td>
                  <td className="px-3 py-2">{log.contact || "—"}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{t(`opsStatusLabel.${log.status}` as never)}</Badge>
                  </td>
                  <td className="max-w-xs px-3 py-2 text-muted-foreground line-clamp-2">
                    {log.notes || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {log.nextFollowUp ? new Date(log.nextFollowUp).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={() => void remove(log.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CrmShell>
  );
}
