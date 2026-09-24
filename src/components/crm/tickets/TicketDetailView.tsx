"use client";

import { useMemo, useState } from "react";
import { Star, Paperclip } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  channelBadgeClass,
  isLiveChatSource,
  parseTicketTags,
  priorityBadgeVariant,
  relativeTime,
  statusBadgeVariant,
  statusSelectClass,
  ticketKey,
} from "@/lib/crm/tickets";
import { cn } from "@/lib/utils";
import { useTicketI18n } from "@/components/crm/tickets/useTicketI18n";

export type TicketDetailData = {
  id: string;
  subject: string;
  description?: string | null;
  status: string;
  priority: string;
  source: string;
  ticketType?: string | null;
  department?: string | null;
  category?: string | null;
  tags?: string[] | unknown;
  dueAt?: string | null;
  favorite?: boolean;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  clientId?: string | null;
  projectId?: string | null;
  assignedToId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  user?: { id: string; name: string | null; email: string } | null;
  assignedTo?: { id: string; name: string | null; email: string } | null;
  client?: { id: string; name: string; company: string | null; email?: string | null } | null;
  project?: { id: string; name: string } | null;
  messages: {
    id: string;
    body: string;
    senderKind: string;
    createdAt: string;
    sender?: { name: string | null } | null;
  }[];
  notes?: {
    id: string;
    body: string;
    createdAt: string;
    user?: { name: string | null } | null;
  }[];
  events?: {
    id: string;
    kind: string;
    message: string;
    createdAt: string;
    actor?: { name: string | null; email?: string | null } | null;
  }[];
};

export function TicketDetailView({
  ticket,
  locale,
  staff,
  showDelete,
  clients,
  labels,
  onUpdate,
  onReply,
  onAddNote,
  onDelete,
  onFavorite,
}: {
  ticket: TicketDetailData;
  locale: string;
  staff: boolean;
  showDelete: boolean;
  clients: { id: string; name: string; company: string | null }[];
  onUpdate: (patch: Record<string, unknown>) => Promise<void>;
  onReply: (body: string) => Promise<void>;
  onAddNote: (body: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onFavorite: (favorite: boolean) => Promise<void>;
  labels: {
    description: string;
    activityLog: string;
    addComment: string;
    postComment: string;
    conversations: string;
    noConversations: string;
    details: string;
    customer: string;
    assignedTo: string;
    department: string;
    category: string;
    type: string;
    source: string;
    customFields: string;
    tags: string;
    timeline: string;
    created: string;
    dueDate: string;
    overdue: string;
    internalNote: string;
    addNote: string;
    reply: string;
    send: string;
    unassigned: string;
    noClient: string;
    assignMe: string;
    delete: string;
    back: string;
    editTags: string;
    saveTags: string;
    favorite: string;
    updated: string;
    system: string;
    firstResponse: string;
    resolvedLabel: string;
    statusLabel: string;
    priorityLabel: string;
    backToTickets: string;
    channelChat: string;
    channelTicket: string;
  };
}) {
  const labelsI18n = useTicketI18n();
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [tagDraft, setTagDraft] = useState(parseTicketTags(ticket.tags).join(", "));
  const tags = useMemo(() => parseTicketTags(ticket.tags), [ticket.tags]);
  const overdue =
    ticket.dueAt &&
    !["RESOLVED", "CLOSED"].includes(ticket.status) &&
    new Date(ticket.dueAt).getTime() < Date.now();

  const description =
    ticket.description ||
    ticket.messages.find((m) => m.senderKind !== "SYSTEM")?.body ||
    "";

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    await onReply(reply.trim());
    setReply("");
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await onAddNote(note.trim());
    setNote("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-xs text-muted-foreground">
            <SoftLink href={`/${locale}/crm/tickets`} className="hover:underline">
              {labels.backToTickets}
            </SoftLink>{" "}
            › {ticketKey(ticket.id)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              <span className="mr-2 text-primary">{ticketKey(ticket.id)}</span>
              {ticket.subject}
            </h1>
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {labels.created}{" "}
              {new Date(ticket.createdAt).toLocaleString(locale)}
            </span>
            {ticket.dueAt ? (
              <span className={overdue ? "font-medium text-destructive" : undefined}>
                {labels.dueDate} {new Date(ticket.dueAt).toLocaleString(locale)}
                {overdue ? ` (${labels.overdue})` : ""}
              </span>
            ) : null}
            <span>
              {labels.updated} {relativeTime(ticket.updatedAt, locale)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                channelBadgeClass(ticket.source),
              )}
            >
              {isLiveChatSource(ticket.source)
                ? labels.channelChat
                : labels.channelTicket}
            </span>
            <Badge variant={statusBadgeVariant(ticket.status)}>
              {labelsI18n.status(ticket.status)}
            </Badge>
            <Badge variant={priorityBadgeVariant(ticket.priority)}>
              {labelsI18n.priority(ticket.priority)}
            </Badge>
            {ticket.source && !isLiveChatSource(ticket.source) ? (
              <Badge variant="outline">{labelsI18n.source(ticket.source)}</Badge>
            ) : null}
            {ticket.department ? (
              <Badge variant="secondary">{labelsI18n.department(ticket.department)}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void onFavorite(!(ticket.favorite ?? false))}
          >
            <Star
              className={cn(
                "mr-1.5 h-3.5 w-3.5",
                ticket.favorite && "fill-amber-500 text-amber-500",
              )}
            />
            {labels.favorite}
          </Button>
          <Button asChild size="sm" variant="outline">
            <SoftLink href={`/${locale}/crm/tickets`}>{labels.back}</SoftLink>
          </Button>
          {showDelete && onDelete ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => void onDelete()}>
              {labels.delete}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {description || "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.activityLog}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(ticket.events || []).length ? (
                (ticket.events || []).map((event) => {
                  const initials = (event.actor?.name || "SY")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.actor?.name || labels.system} ·{" "}
                          {new Date(event.createdAt).toLocaleString(locale)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          {staff ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{labels.internalNote}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(ticket.notes || []).map((item) => (
                  <div key={item.id} className="rounded-xl border border-border px-3 py-2">
                    <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.user?.name || "Staff"} ·{" "}
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </p>
                  </div>
                ))}
                <form onSubmit={submitNote} className="space-y-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={labels.addNote}
                    rows={3}
                  />
                  <Button type="submit" size="sm">
                    {labels.addNote}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.conversations}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!ticket.messages.length ? (
                <p className="text-sm text-muted-foreground">{labels.noConversations}</p>
              ) : (
                <div className="max-h-[50vh] space-y-3 overflow-y-auto">
                  {ticket.messages.map((msg) => {
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
                          <p className="mt-1 text-[10px] opacity-60">
                            {new Date(msg.createdAt).toLocaleString(locale)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <form onSubmit={submitReply} className="flex gap-2 border-t border-border pt-3">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={labels.reply}
                  rows={2}
                  className="min-h-14 resize-none"
                />
                <Button type="submit" className="shrink-0 self-end">
                  {labels.send}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.details}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label={labels.customer}>
                {ticket.client ? (
                  <SoftLink
                    href={`/${locale}/crm/clients/${ticket.client.id}`}
                    className="text-primary hover:underline"
                  >
                    {ticket.client.name}
                  </SoftLink>
                ) : (
                  ticket.guestName || ticket.user?.name || ticket.guestEmail || "—"
                )}
              </DetailRow>
              <DetailRow label={labels.assignedTo}>
                {ticket.assignedTo?.name || labels.unassigned}
              </DetailRow>
              <DetailRow label={labels.department}>
                {ticket.department ? labelsI18n.department(ticket.department) : "—"}
              </DetailRow>
              <DetailRow label={labels.category}>
                {ticket.category
                  ? labelsI18n.type(ticket.category)
                  : ticket.ticketType
                    ? labelsI18n.type(ticket.ticketType)
                    : "—"}
              </DetailRow>
              <DetailRow label={labels.type}>
                {ticket.ticketType ? labelsI18n.type(ticket.ticketType) : "—"}
              </DetailRow>
              <DetailRow label={labels.source}>
                {labelsI18n.source(ticket.source)}
              </DetailRow>

              {staff ? (
                <div className="space-y-2 border-t border-border pt-3">
                  <Label>{labels.statusLabel}</Label>
                  <select
                    className={cn(
                      "h-9 w-full rounded-full border px-2.5 text-sm font-medium",
                      statusSelectClass(ticket.status),
                    )}
                    value={ticket.status}
                    onChange={(e) => void onUpdate({ status: e.target.value })}
                  >
                    {labelsI18n.statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <Label>{labels.priorityLabel}</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                    value={ticket.priority}
                    onChange={(e) => void onUpdate({ priority: e.target.value })}
                  >
                    {labelsI18n.priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                  <Label>{labels.type}</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                    value={ticket.ticketType || "General"}
                    onChange={(e) =>
                      void onUpdate({
                        ticketType: e.target.value,
                        category: e.target.value,
                      })
                    }
                  >
                    {labelsI18n.types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Label>{labels.department}</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                    value={ticket.department || ""}
                    onChange={(e) =>
                      void onUpdate({ department: e.target.value || null })
                    }
                  >
                    <option value="">—</option>
                    {labelsI18n.departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <Label>{labels.customer}</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                    value={ticket.clientId || ""}
                    onChange={(e) =>
                      void onUpdate({ clientId: e.target.value || null })
                    }
                  >
                    <option value="">{labels.noClient}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Label>{labels.dueDate}</Label>
                  <Input
                    type="datetime-local"
                    value={
                      ticket.dueAt
                        ? new Date(ticket.dueAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      void onUpdate({
                        dueAt: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => void onUpdate({ assignedToId: "me" })}
                  >
                    {labels.assignMe}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.tags}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {tags.length ? (
                  tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              {staff ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const next = tagDraft
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    void onUpdate({ tags: next });
                  }}
                >
                  <Input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    placeholder={labels.editTags}
                  />
                  <Button type="submit" size="sm" variant="outline">
                    {labels.saveTags}
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.timeline}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <DetailRow label={labels.created}>
                {new Date(ticket.createdAt).toLocaleString(locale)}
              </DetailRow>
              <DetailRow label={labels.dueDate}>
                {ticket.dueAt ? (
                  <span className={overdue ? "text-destructive" : undefined}>
                    {new Date(ticket.dueAt).toLocaleString(locale)}
                    {overdue ? ` (${labels.overdue})` : ""}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              {ticket.firstResponseAt ? (
                <DetailRow label={labels.firstResponse}>
                  {new Date(ticket.firstResponseAt).toLocaleString(locale)}
                </DetailRow>
              ) : null}
              {ticket.resolvedAt ? (
                <DetailRow label={labels.resolvedLabel}>
                  {new Date(ticket.resolvedAt).toLocaleString(locale)}
                </DetailRow>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
