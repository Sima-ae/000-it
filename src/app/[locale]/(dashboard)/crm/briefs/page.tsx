"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminRole } from "@/lib/roles";

type BriefBody = {
  triplezero?: string;
  extrahosting?: string;
  doNotTouch?: string;
  crmNotes?: string;
};

type Brief = {
  id: string;
  weekStart: string;
  body: BriefBody;
  publishedAt: string | null;
  createdBy: { name: string | null; email: string };
};

export default function BriefsPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const admin = isAdminRole(session?.user?.role);
  const qc = useQueryClient();
  const [body, setBody] = useState<BriefBody>({
    triplezero: "",
    extrahosting: "",
    doNotTouch: "On-page SEO, GSC, Analytics",
    crmNotes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["crm-briefs"],
    queryFn: async () => {
      const res = await fetch("/api/crm/briefs");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.current?.body) setBody(json.current.body as BriefBody);
      return json as { briefs: Brief[]; current: Brief | null; weekStart: string };
    },
  });

  async function save(publish: boolean) {
    const res = await fetch("/api/crm/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: data?.weekStart, body, publish }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(publish ? t("opsBriefPublished") : t("opsBriefSaved"));
      qc.invalidateQueries({ queryKey: ["crm-briefs"] });
    }
  }

  return (
    <CrmShell title={t("briefs")} subtitle={t("briefsSubtitle")}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("opsWeekOf")} {data?.weekStart}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">000-it.com</label>
                <Textarea
                  disabled={!admin}
                  value={body.triplezero || ""}
                  onChange={(e) => setBody((b) => ({ ...b, triplezero: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">extrahosting.eu</label>
                <Textarea
                  disabled={!admin}
                  value={body.extrahosting || ""}
                  onChange={(e) => setBody((b) => ({ ...b, extrahosting: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t("opsDoNotTouch")}</label>
                <Textarea
                  disabled={!admin}
                  value={body.doNotTouch || ""}
                  onChange={(e) => setBody((b) => ({ ...b, doNotTouch: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">CRM</label>
                <Textarea
                  disabled={!admin}
                  value={body.crmNotes || ""}
                  onChange={(e) => setBody((b) => ({ ...b, crmNotes: e.target.value }))}
                />
              </div>
              {admin ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => void save(false)}>
                    {t("save")}
                  </Button>
                  <Button onClick={() => void save(true)}>{t("opsPublishBrief")}</Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("opsBriefReadOnly")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("opsPastBriefs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.briefs || []).map((b) => (
                <div key={b.id} className="rounded-xl border px-3 py-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{b.weekStart}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.publishedAt ? t("opsPublished") : t("opsDraft")}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {(b.body as BriefBody)?.triplezero || "—"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </CrmShell>
  );
}
