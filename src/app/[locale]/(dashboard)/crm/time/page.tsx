"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Clock3, LogIn, LogOut } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminRole } from "@/lib/roles";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function CrmTimePage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const qc = useQueryClient();
  const admin = isAdminRole(session?.user?.role);
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["crm-time", userId],
    queryFn: async () => {
      const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/crm/time${qs}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  async function clock(action: "clockIn" | "clockOut") {
    setBusy(true);
    try {
      const res = await fetch("/api/crm/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "fail");
      }
      toast.success(action === "clockIn" ? t("opsClockedIn") : t("opsClockedOut"));
      await qc.invalidateQueries({ queryKey: ["crm-time"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function forceOut(targetUserId: string, sessionId: string) {
    const res = await fetch("/api/crm/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "forceClockOut", userId: targetUserId, sessionId }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(t("opsForceClockOut"));
      qc.invalidateQueries({ queryKey: ["crm-time"] });
    }
  }

  const open = data?.open;
  const todayMinutes = data?.todayMinutes || 0;

  return (
    <CrmShell
      title={t("time")}
      subtitle={t("timeSubtitle")}
      actions={
        <div className="flex gap-2">
          {!open ? (
            <Button disabled={busy || Boolean(userId && userId !== session?.user?.id)} onClick={() => void clock("clockIn")}>
              <LogIn className="mr-1 h-4 w-4" />
              {t("opsClockIn")}
            </Button>
          ) : (
            <Button disabled={busy || Boolean(userId && userId !== session?.user?.id)} variant="destructive" onClick={() => void clock("clockOut")}>
              <LogOut className="mr-1 h-4 w-4" />
              {t("opsClockOut")}
            </Button>
          )}
        </div>
      }
    >
      {admin ? (
        <div className="mb-4">
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
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4" />
              {t("opsStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {open ? t("opsClockedIn") : t("opsNotClockedIn")}
            </p>
            {open ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("opsSince")} {new Date(open.clockInAt).toLocaleTimeString()}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("opsTodayHours")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMinutes(todayMinutes)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data?.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("opsBreakMinutes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{open?.breakMinutes ?? 75}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("opsBreakHint")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("opsDate")}</th>
              <th className="px-3 py-2">{t("opsClockIn")}</th>
              <th className="px-3 py-2">{t("opsClockOut")}</th>
              <th className="px-3 py-2">{t("opsHours")}</th>
              {admin ? <th className="px-3 py-2">{t("opsActions")}</th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  {t("loading")}
                </td>
              </tr>
            ) : (
              (data?.sessions || []).map(
                (s: {
                  id: string;
                  date: string;
                  clockInAt: string;
                  clockOutAt: string | null;
                  breakMinutes: number;
                  userId: string;
                }) => {
                  const end = s.clockOutAt ? new Date(s.clockOutAt) : new Date();
                  const mins = Math.max(
                    0,
                    Math.round((+end - +new Date(s.clockInAt)) / 60000) - (s.breakMinutes || 0),
                  );
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.date}</td>
                      <td className="px-3 py-2">{new Date(s.clockInAt).toLocaleTimeString()}</td>
                      <td className="px-3 py-2">
                        {s.clockOutAt ? new Date(s.clockOutAt).toLocaleTimeString() : "—"}
                      </td>
                      <td className="px-3 py-2">{formatMinutes(mins)}</td>
                      {admin ? (
                        <td className="px-3 py-2">
                          {!s.clockOutAt ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void forceOut(s.userId, s.id)}
                            >
                              {t("opsForceClockOut")}
                            </Button>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </CrmShell>
  );
}
