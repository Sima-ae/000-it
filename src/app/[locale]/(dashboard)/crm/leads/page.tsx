"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAdminRole } from "@/lib/roles";

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
  const { data: session } = useSession();
  const qc = useQueryClient();
  const canDeleteLeads = isAdminRole(session?.user?.role);
  const [deleteLead, setDeleteLead] = useState<FormLead | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      toast.error(t("leadUpdateFailed"));
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
      toast.error(t("leadConvertFailed"));
      return;
    }
    const client = await res.json();
    toast.success(t("converted"));
    void qc.invalidateQueries({ queryKey: ["crm-leads"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    window.location.href = `/${locale}/crm/clients/${client.id}`;
  }

  async function confirmDelete() {
    if (!deleteLead) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/crm/leads?id=${encodeURIComponent(deleteLead.id)}`,
        { method: "DELETE" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error || t("leadDeleteFailed"));
        return;
      }
      toast.success(t("leadDeleted"));
      setDeleteLead(null);
      void qc.invalidateQueries({ queryKey: ["crm-leads"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    } finally {
      setDeleting(false);
    }
  }

  const formLeads = data?.formLeads || [];

  return (
    <CrmShell title={t("leads")} subtitle={t("leadsSubtitle")}>
      {isLoading ? <p className="text-muted-foreground">{t("working")}</p> : null}

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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.email}
                          {lead.company ? ` · ${lead.company}` : ""}
                        </p>
                      </div>
                      {canDeleteLeads ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={t("leadDelete")}
                          onClick={() => setDeleteLead(lead)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void convert(lead.id)}
                        >
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

      <Dialog
        open={!!deleteLead}
        onOpenChange={(open) => !open && !deleting && setDeleteLead(null)}
      >
        <DialogContent className="w-[min(96vw,28rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4 pr-14">
            <DialogTitle>{t("leadDeleteTitle")}</DialogTitle>
            <DialogDescription>{t("leadDeleteHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-5 py-4 text-sm">
            <p className="font-medium">{deleteLead?.name}</p>
            <p className="text-muted-foreground">{deleteLead?.email}</p>
            <p className="text-muted-foreground">
              {t("leadDeleteConfirm", {
                name: deleteLead?.name || "",
                email: deleteLead?.email || "",
              })}
            </p>
          </div>
          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteLead(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? t("working") : t("leadDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
