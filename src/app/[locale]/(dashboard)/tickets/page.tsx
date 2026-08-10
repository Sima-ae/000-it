"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
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
  guestName: string | null;
  guestEmail: string | null;
  updatedAt: string;
  user?: { name: string | null; email: string } | null;
  assignedTo?: { name: string | null; email: string } | null;
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
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function TicketsPage() {
  const t = useTranslations("dashboard");
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

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketRow[];
    },
    refetchInterval: 8000,
  });

  const { data: detail } = useQuery({
    queryKey: ["ticket", selectedId],
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

  const statusLabel = useMemo(
    () => (s: string) => s.replace("_", " "),
    [],
  );

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        source: "DASHBOARD",
      }),
    });
    if (!res.ok) {
      toast.error(locale === "nl" ? "Aanmaken mislukt" : "Could not create");
      return;
    }
    const ticket = await res.json();
    toast.success(locale === "nl" ? "Ticket geopend" : "Ticket opened");
    setCreating(false);
    setSubject("");
    setMessage("");
    void qc.invalidateQueries({ queryKey: ["tickets"] });
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
      toast.error(locale === "nl" ? "Versturen mislukt" : "Send failed");
      return;
    }
    setReply("");
    void qc.invalidateQueries({ queryKey: ["ticket", selectedId] });
    void qc.invalidateQueries({ queryKey: ["tickets"] });
  }

  async function updateTicket(patch: Record<string, unknown>) {
    if (!selectedId || !staff) return;
    const res = await fetch(`/api/tickets/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["ticket", selectedId] });
    void qc.invalidateQueries({ queryKey: ["tickets"] });
  }

  async function removeTicket() {
    if (!selectedId || !showDelete) return;
    if (!confirm(locale === "nl" ? "Ticket verwijderen?" : "Delete ticket?")) return;
    const res = await fetch(`/api/tickets/${selectedId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    setSelectedId(null);
    void qc.invalidateQueries({ queryKey: ["tickets"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{t("tickets")}</h1>
          <p className="text-sm text-muted-foreground">
            {staff
              ? locale === "nl"
                ? "Alle supporttickets en live chats — gesynchroniseerd met chat en dashboards."
                : "All support tickets and live chats — synced with chat and dashboards."
              : locale === "nl"
                ? "Je tickets en chatgesprekken met TripleZero iT."
                : "Your tickets and chat conversations with TripleZero iT."}
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          {locale === "nl" ? "Nieuw ticket" : "New ticket"}
        </Button>
      </div>

      {creating ? (
        <Card>
          <CardHeader>
            <CardTitle>{locale === "nl" ? "Ticket openen" : "Open ticket"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTicket} className="grid gap-3">
              <div className="space-y-1">
                <Label>{locale === "nl" ? "Onderwerp" : "Subject"}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>{locale === "nl" ? "Bericht" : "Message"}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{locale === "nl" ? "Verstuur" : "Submit"}</Button>
                <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                  {locale === "nl" ? "Annuleer" : "Cancel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {locale === "nl" ? "Inbox" : "Inbox"} ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] space-y-1 overflow-y-auto p-2">
            {isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading…</p> : null}
            {!isLoading && !tickets.length ? (
              <p className="p-3 text-sm text-muted-foreground">
                {locale === "nl" ? "Nog geen tickets." : "No tickets yet."}
              </p>
            ) : null}
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
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {ticket.messages[0]?.body || "—"}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="min-h-100">
          {!detail ? (
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {locale === "nl" ? "Selecteer een ticket." : "Select a ticket."}
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-3 border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{detail.subject}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {detail.user?.email || detail.guestEmail || "—"} · {detail.source} ·{" "}
                      {detail._count?.messages ?? detail.messages.length} msgs
                    </p>
                  </div>
                  {showDelete ? (
                    <Button size="sm" variant="ghost" onClick={() => void removeTicket()}>
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
                      value={detail.priority}
                      onChange={(e) => void updateTicket({ priority: e.target.value })}
                    >
                      {priorities.map((p) => (
                        <option key={p} value={p}>
                          {p}
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
                      {locale === "nl" ? "Aan mij toewijzen" : "Assign to me"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{statusLabel(detail.status)}</Badge>
                    <Badge variant="outline">{detail.priority}</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto py-4">
                {detail.messages.map((msg) => {
                  const mine =
                    staff
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
                          {msg.sender?.name || msg.senderKind}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        <p className="mt-1 text-[10px] opacity-60">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <form
                onSubmit={sendReply}
                className="flex gap-2 border-t border-border/60 p-4"
              >
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={locale === "nl" ? "Antwoord…" : "Reply…"}
                  rows={2}
                  className="min-h-14 resize-none"
                />
                <Button type="submit" className="shrink-0 self-end">
                  {locale === "nl" ? "Stuur" : "Send"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
