"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedHref } from "@/i18n/pathnames";

export default function CrmClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const t = useTranslations("crm");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ["crm-client", id],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const res = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note.trim(), clientId: id }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setNote("");
    void qc.invalidateQueries({ queryKey: ["crm-client", id] });
  }

  async function openTicket(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: ticketSubject,
        message: ticketMessage,
        clientId: id,
        source: "DASHBOARD",
      }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success(t("ticketOpened"));
    setTicketSubject("");
    setTicketMessage("");
    void qc.invalidateQueries({ queryKey: ["crm-client", id] });
  }

  async function convertToClient() {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLead: false, status: "ACTIVE", leadStatus: "WON" }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success(t("converted"));
    void qc.invalidateQueries({ queryKey: ["crm-client", id] });
  }

  if (isLoading) {
    return (
      <CrmShell title={t("clients")}>
        <p className="text-muted-foreground">Loading…</p>
      </CrmShell>
    );
  }

  if (isError || !client) {
    return (
      <CrmShell
        title={t("clients")}
        actions={
          <Button asChild variant="outline">
            <SoftLink href={localizedHref(locale, "/crm/clients")}>{t("back")}</SoftLink>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">{td("clientDetailHint")}</p>
      </CrmShell>
    );
  }

  return (
    <CrmShell
      title={client.name}
      subtitle={`${client.company || client.email} · ${client.isLead ? "Lead" : client.status}`}
      actions={
        <div className="flex gap-2">
          {client.isLead ? (
            <Button variant="outline" onClick={() => void convertToClient()}>
              {t("convertLead")}
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <SoftLink href={localizedHref(locale, "/crm/clients")}>{t("back")}</SoftLink>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {client.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {client.phone || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Company:</span> {client.company || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Industry:</span> {client.industry || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Website:</span> {client.website || "—"}
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">{client.notes || ""}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge>{client.status}</Badge>
              {client.isLead ? <Badge variant="warning">Lead</Badge> : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("tickets")} ({client.tickets?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(client.tickets || []).map(
                (ticket: {
                  id: string;
                  subject: string;
                  status: string;
                  _count: { messages: number };
                }) => (
                  <SoftLink
                    key={ticket.id}
                    href={localizedHref(locale, `/crm/tickets/${ticket.id}`)}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                  >
                    <span className="font-medium">{ticket.subject}</span>
                    <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
                  </SoftLink>
                ),
              )}
              <form onSubmit={openTicket} className="mt-4 space-y-2 border-t border-border pt-4">
                <Input
                  placeholder={t("ticketSubject")}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
                <Textarea
                  placeholder={t("ticketMessage")}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  rows={3}
                />
                <Button type="submit">{t("openTicket")}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("invoices")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(client.invoices || []).map(
                  (inv: { id: string; number: string; status: string; amount: number }) => {
                    const statusLabels: Record<string, string> = {
                      DRAFT: t("invoiceStatusDraft"),
                      SENT: t("invoiceStatusSent"),
                      PAID: t("invoiceStatusPaid"),
                      OVERDUE: t("invoiceStatusOverdue"),
                      CANCELLED: t("invoiceStatusCancelled"),
                    };
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span>{inv.number}</span>
                        <span>
                          €{Number(inv.amount).toFixed(2)} · {statusLabels[inv.status] || inv.status}
                        </span>
                      </div>
                    );
                  },
                )}
                {!client.invoices?.length ? (
                  <p className="text-sm text-muted-foreground">{t("emptyInvoices")}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("notes")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(client.crmNotes || []).map(
                  (n: {
                    id: string;
                    body: string;
                    createdAt: string;
                    user?: { name: string | null };
                  }) => (
                    <div key={n.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                      <p>{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.user?.name || "Staff"} · {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ),
                )}
                <form onSubmit={addNote} className="space-y-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("addNote")}
                    rows={2}
                  />
                  <Button type="submit" size="sm">
                    {t("save")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
