"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canDelete, isStaffRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type TicketRow = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  ticketType?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  client?: { id: string; name: string; company: string | null } | null;
  project?: { id: string; name: string } | null;
  messages: {
    id?: string;
    body: string;
    createdAt: string;
    senderKind: string;
    sender?: { name: string | null } | null;
  }[];
  _count: { messages: number };
};

type TicketDetail = Omit<TicketRow, "messages"> & {
  messages: {
    id: string;
    body: string;
    senderKind: string;
    createdAt: string;
    sender?: { name: string | null } | null;
  }[];
};

const statuses = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const;

export default function CrmTicketsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const staff = isStaffRole(session?.user?.role);
  const showDelete = canDelete(session?.user?.role);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [clientId, setClientId] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["crm-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketRow[];
    },
    refetchInterval: 6000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["crm-clients-options"],
    enabled: staff,
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) return [];
      return (await res.json()) as { id: string; name: string; company: string | null }[];
    },
  });

  const { data: detail } = useQuery({
    queryKey: ["crm-ticket", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${selectedId}`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketDetail;
    },
    refetchInterval: selectedId ? 4000 : false,
  });

  useEffect(() => {
    if (!selectedId && tickets[0]) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  const statusLabel = useMemo(() => (s: string) => s.replaceAll("_", " "), []);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        source: "DASHBOARD",
        clientId: clientId || undefined,
      }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    const ticket = await res.json();
    toast.success(t("ticketOpened"));
    setCreating(false);
    setSubject("");
    setMessage("");
    setClientId("");
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    setSelectedId(ticket.id);
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    const res = await fetch(`/api/tickets/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply.trim() }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setReply("");
    void qc.invalidateQueries({ queryKey: ["crm-ticket", selectedId] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
  }

  async function updateTicket(patch: Record<string, unknown>) {
    if (!selectedId || !staff) return;
    const res = await fetch(`/api/tickets/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-ticket", selectedId] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
  }

  return (
    <CrmShell
      title={t("tickets")}
      subtitle={t("ticketsSubtitle")}
      actions={
        <Button onClick={() => setCreating((v) => !v)}>{t("openTicket")}</Button>
      }
    >
      {creating ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={createTicket} className="grid gap-3">
              <div className="space-y-1">
                <Label>{t("ticketSubject")}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              {staff ? (
                <div className="space-y-1">
                  <Label>{t("linkClient")}</Label>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">{t("noClient")}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` (${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="space-y-1">
                <Label>{t("ticketMessage")}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit">{t("save")}</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Inbox ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] space-y-1 overflow-y-auto p-2">
            {isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading…</p> : null}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition",
                  selectedId === ticket.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{ticket.subject}</p>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {statusLabel(ticket.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ticket.client?.name || ticket.source}
                  {ticket.project ? ` · ${ticket.project.name}` : ""}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="min-h-100">
          {!detail ? (
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {t("selectTicket")}
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-3 border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{detail.subject}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {detail.client ? (
                        <SoftLink
                          href={`/${locale}/crm/clients/${detail.client.id}`}
                          className="text-primary hover:underline"
                        >
                          {detail.client.name}
                        </SoftLink>
                      ) : (
                        "—"
                      )}{" "}
                      · {detail.source} · {detail.ticketType || "General"}
                    </p>
                  </div>
                  {showDelete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await fetch(`/api/tickets/${detail.id}`, { method: "DELETE" });
                        setSelectedId(null);
                        void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
                      }}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
                {staff ? (
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="h-9 rounded-lg border border-input bg-muted/40 px-2 text-sm"
                      value={detail.status}
                      onChange={(e) => void updateTicket({ status: e.target.value })}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-9 rounded-lg border border-input bg-muted/40 px-2 text-sm"
                      value={detail.clientId || ""}
                      onChange={(e) =>
                        void updateTicket({ clientId: e.target.value || null })
                      }
                    >
                      <option value="">{t("noClient")}</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void updateTicket({ assignedToId: session?.user?.id ?? null })
                      }
                    >
                      {t("assignMe")}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">{statusLabel(detail.status)}</Badge>
                )}
              </CardHeader>
              <CardContent className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto py-4">
                {detail.messages.map((msg) => {
                  const mine = staff
                    ? msg.senderKind === "STAFF"
                    : msg.senderKind === "CLIENT" || msg.senderKind === "GUEST";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                          mine ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        <p className="mb-0.5 text-[10px] uppercase opacity-70">
                          {msg.sender?.name ||
                            (msg.senderKind === "SYSTEM" ? "Agent 000" : msg.senderKind)}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <form onSubmit={sendReply} className="flex gap-2 border-t border-border/60 p-4">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t("reply")}
                  rows={2}
                  className="min-h-14 resize-none"
                />
                <Button type="submit" className="shrink-0 self-end">
                  {t("send")}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </CrmShell>
  );
}
