"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stages = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

type FormLead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: string;
  source: string | null;
  convertedClientId: string | null;
};

type PipelineClient = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  leadStatus: string | null;
};

export default function CrmLeadsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const res = await fetch("/api/crm/leads");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as {
        formLeads: FormLead[];
        pipelineClients: PipelineClient[];
      };
    },
  });

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/crm/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-leads"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  async function convert(leadId: string) {
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    const client = await res.json();
    toast.success(t("converted"));
    void qc.invalidateQueries({ queryKey: ["crm-leads"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    window.location.href = `/${locale}/crm/clients/${client.id}`;
  }

  const formLeads = data?.formLeads || [];

  return (
    <CrmShell title={t("leads")} subtitle={t("leadsSubtitle")}>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => {
          const items = formLeads.filter((l) => l.status === stage);
          return (
            <Card key={stage} className="min-h-40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{stage}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-border bg-background/70 p-3 text-sm"
                  >
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.email}
                      {lead.company ? ` · ${lead.company}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {lead.message}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <select
                        className="h-8 rounded-lg border border-input bg-muted/40 px-2 text-xs"
                        value={lead.status}
                        onChange={(e) => void setStatus(lead.id, e.target.value)}
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {!lead.convertedClientId ? (
                        <Button size="sm" variant="outline" onClick={() => void convert(lead.id)}>
                          {t("convertLead")}
                        </Button>
                      ) : (
                        <SoftLink
                          href={`/${locale}/crm/clients/${lead.convertedClientId}`}
                          className="text-xs text-primary underline"
                        >
                          {t("viewClient")}
                        </SoftLink>
                      )}
                    </div>
                  </div>
                ))}
                {!items.length ? (
                  <p className="text-xs text-muted-foreground">{t("emptyStage")}</p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data?.pipelineClients?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("pipelineClients")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {data.pipelineClients.map((c) => (
              <SoftLink
                key={c.id}
                href={`/${locale}/crm/clients/${c.id}`}
                className="rounded-xl border border-border px-3 py-2"
              >
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.email} · {c.leadStatus || "NEW"}
                </p>
              </SoftLink>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </CrmShell>
  );
}
