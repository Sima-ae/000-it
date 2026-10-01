"use client";

import { LayoutGrid, List, Search, Star, Pencil, Trash2, Reply } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  channelBadgeClass,
  isLiveChatSource,
  priorityBadgeVariant,
  relativeTime,
  statusBadgeVariant,
  statusSelectClass,
  ticketKey,
  type TicketListItem,
} from "@/lib/crm/tickets";
import { cn } from "@/lib/utils";
import { useTicketI18n } from "@/components/crm/tickets/useTicketI18n";

export type TicketFiltersState = {
  q: string;
  quick: string;
  status: string;
  priority: string;
  department: string;
  type: string;
  clientId: string;
  assignedToId: string;
  createdFrom: string;
  createdTo: string;
};

export function TicketsStatsChips({
  stats,
  labels,
}: {
  stats: {
    total: number;
    open: number;
    highPriority: number;
    unassigned: number;
  };
  labels: {
    total: string;
    open: string;
    high: string;
    unassigned: string;
  };
}) {
  const chips = [
    { label: labels.total, value: stats.total, className: "text-primary" },
    { label: labels.open, value: stats.open, className: "text-accent" },
    { label: labels.high, value: stats.highPriority, className: "text-amber-600" },
    { label: labels.unassigned, value: stats.unassigned, className: "text-primary" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs"
        >
          <span className={cn("me-1 font-semibold", chip.className)}>{chip.value}</span>
          <span className="text-muted-foreground">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}

export function TicketsFiltersBar({
  filters,
  setFilters,
  clients,
  staff,
  labels,
  activeCount,
}: {
  filters: TicketFiltersState;
  setFilters: (next: TicketFiltersState) => void;
  clients: { id: string; name: string; company: string | null }[];
  staff: boolean;
  activeCount: number;
  labels: {
    search: string;
    open: string;
    high: string;
    unassigned: string;
    mine: string;
    recent: string;
    favorites: string;
    chats: string;
    ticketsOnly: string;
    client: string;
    allClients: string;
    type: string;
    allTypes: string;
    department: string;
    allDepartments: string;
    priority: string;
    allPriorities: string;
    status: string;
    allStatuses: string;
    assignTo: string;
    allAssignees: string;
    unassignedOption: string;
    assignMe: string;
    createdFrom: string;
    createdTo: string;
    filtersActive: string;
    clear: string;
  };
}) {
  const labelsI18n = useTicketI18n();
  const quicks = [
    { key: "chat", label: labels.chats },
    { key: "ticket", label: labels.ticketsOnly },
    { key: "open", label: labels.open },
    { key: "high", label: labels.high },
    { key: "unassigned", label: labels.unassigned },
    { key: "mine", label: labels.mine },
    { key: "recent", label: labels.recent },
    { key: "favorites", label: labels.favorites },
  ];

  function patch(partial: Partial<TicketFiltersState>) {
    setFilters({ ...filters, ...partial });
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1">
            <Search className="pointer-events-none absolute inset-s-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => patch({ q: e.target.value })}
              placeholder={labels.search}
              className="h-8 ps-8 text-sm"
            />
          </div>
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
            {activeCount} {labels.filtersActive}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={() =>
              setFilters({
                q: "",
                quick: "",
                status: "",
                priority: "",
                department: "",
                type: "",
                clientId: "",
                assignedToId: "",
                createdFrom: "",
                createdTo: "",
              })
            }
          >
            {labels.clear}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {quicks.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() =>
                patch({ quick: filters.quick === chip.key ? "" : chip.key })
              }
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium transition",
                filters.quick === chip.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {staff ? (
            <select
              className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
              value={filters.clientId}
              onChange={(e) => patch({ clientId: e.target.value })}
            >
              <option value="">{labels.allClients}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          ) : null}
          <select
            className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
            value={filters.type}
            onChange={(e) => patch({ type: e.target.value })}
          >
            <option value="">{labels.allTypes}</option>
            {labelsI18n.types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
            value={filters.department}
            onChange={(e) => patch({ department: e.target.value })}
          >
            <option value="">{labels.allDepartments}</option>
            {labelsI18n.departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
          <select
            className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
            value={filters.priority}
            onChange={(e) => patch({ priority: e.target.value })}
          >
            <option value="">{labels.allPriorities}</option>
            {labelsI18n.priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <select
            className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
            value={filters.status}
            onChange={(e) => patch({ status: e.target.value })}
          >
            <option value="">{labels.allStatuses}</option>
            {labelsI18n.statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {staff ? (
            <select
              className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs"
              value={filters.assignedToId}
              onChange={(e) => patch({ assignedToId: e.target.value })}
            >
              <option value="">{labels.allAssignees}</option>
              <option value="me">{labels.assignMe}</option>
              <option value="unassigned">{labels.unassignedOption}</option>
            </select>
          ) : null}
          <Input
            type="date"
            value={filters.createdFrom}
            onChange={(e) => patch({ createdFrom: e.target.value })}
            aria-label={labels.createdFrom}
            className="h-8 min-w-0 px-2 text-xs"
          />
          <Input
            type="date"
            value={filters.createdTo}
            onChange={(e) => patch({ createdTo: e.target.value })}
            aria-label={labels.createdTo}
            className="h-8 min-w-0 px-2 text-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsTable({
  tickets,
  locale,
  layout,
  labels,
  onToggleFavorite,
  onStatusChange,
  onEdit,
  onDelete,
  onReply,
  staff,
  canDelete,
}: {
  tickets: TicketListItem[];
  locale: string;
  layout: "list" | "grid";
  staff: boolean;
  canDelete?: boolean;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
  onEdit?: (ticket: TicketListItem) => void;
  onDelete?: (ticket: TicketListItem) => void;
  onReply?: (ticket: TicketListItem) => void;
  labels: {
    key: string;
    subject: string;
    priority: string;
    status: string;
    date: string;
    updated: string;
    empty: string;
    unassigned: string;
    favorite: string;
    actions: string;
    edit: string;
    delete: string;
    reply: string;
    channelChat: string;
    channelTicket: string;
  };
}) {
  const labelsI18n = useTicketI18n();
  function ChannelBadge({ source }: { source: string }) {
    const chat = isLiveChatSource(source);
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide",
          channelBadgeClass(source),
        )}
      >
        {chat ? labels.channelChat || "Chat" : labels.channelTicket || "Ticket"}
      </span>
    );
  }
  if (!tickets.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {labels.empty}
        </CardContent>
      </Card>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/40"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <SoftLink
                  href={`/${locale}/crm/tickets/${ticket.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {ticketKey(ticket.id)}
                </SoftLink>
                <ChannelBadge source={ticket.source} />
              </div>
              {staff && onStatusChange ? (
                <select
                  className={cn(
                    "h-8 max-w-36 rounded-full border px-2 text-xs font-medium",
                    statusSelectClass(ticket.status),
                  )}
                  value={ticket.status}
                  onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                >
                  {labelsI18n.statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant={statusBadgeVariant(ticket.status)}>
                  {labelsI18n.status(ticket.status)}
                </Badge>
              )}
            </div>
            <SoftLink
              href={`/${locale}/crm/tickets/${ticket.id}`}
              className="font-medium hover:underline"
            >
              {ticket.subject}
            </SoftLink>
            <p className="mt-1 text-xs text-muted-foreground">
              {ticket.client?.name || ticket.guestName || labelsI18n.source(ticket.source)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge variant={priorityBadgeVariant(ticket.priority)}>
                {labelsI18n.priority(ticket.priority)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {relativeTime(ticket.updatedAt, locale)}
              </span>
            </div>
            {staff ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {onReply ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => onReply(ticket)}>
                    <Reply className="me-1 h-3.5 w-3.5" />
                    {labels.reply}
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(ticket)}>
                    <Pencil className="me-1 h-3.5 w-3.5" />
                    {labels.edit}
                  </Button>
                ) : null}
                {canDelete && onDelete ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(ticket)}>
                    <Trash2 className="me-1 h-3.5 w-3.5" />
                    {labels.delete}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-start">
          <colgroup>
            <col className="w-30" />
            <col />
            <col className="w-23" />
            <col className="w-30" />
            <col className="w-22" />
            <col className="w-27" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-2.5 py-2 font-medium">{labels.key}</th>
              <th className="px-2.5 py-2 font-medium">{labels.subject}</th>
              <th className="px-2.5 py-2 font-medium">{labels.priority}</th>
              <th className="px-2.5 py-2 font-medium">{labels.status}</th>
              <th className="px-2.5 py-2 font-medium">{labels.updated}</th>
              <th className="px-2.5 py-2 text-end font-medium">{labels.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => {
              const requester =
                ticket.client?.name ||
                ticket.guestName ||
                ticket.user?.name ||
                ticket.guestEmail ||
                "—";
              const assignee = ticket.assignedTo?.name || labels.unassigned;
              const subjectText = ticket.subject?.trim() || "—";
              return (
                <tr key={ticket.id} className="align-middle hover:bg-muted/20">
                  <td className="px-2.5 py-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <SoftLink
                        href={`/${locale}/crm/tickets/${ticket.id}`}
                        className="truncate text-xs font-medium text-primary hover:underline"
                      >
                        {ticketKey(ticket.id)}
                      </SoftLink>
                      <ChannelBadge source={ticket.source} />
                    </div>
                  </td>
                  <td className="min-w-0 px-2.5 py-2">
                    <SoftLink
                      href={`/${locale}/crm/tickets/${ticket.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:underline"
                      title={subjectText}
                    >
                      {subjectText}
                    </SoftLink>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {requester}
                      {staff ? ` · ${assignee}` : ""}
                    </p>
                  </td>
                  <td className="px-2.5 py-2">
                    <Badge
                      variant={priorityBadgeVariant(ticket.priority)}
                      className="max-w-full truncate px-1.5 py-0 text-[10px]"
                    >
                      {labelsI18n.priority(ticket.priority)}
                    </Badge>
                  </td>
                  <td className="px-2.5 py-2">
                    {staff && onStatusChange ? (
                      <select
                        className={cn(
                          "h-7 w-full max-w-full rounded-full border px-1.5 text-[10px] font-medium",
                          statusSelectClass(ticket.status),
                        )}
                        value={ticket.status}
                        onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                        aria-label={labels.status}
                      >
                        {labelsI18n.statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        variant={statusBadgeVariant(ticket.status)}
                        className="max-w-full truncate px-1.5 py-0 text-[10px]"
                      >
                        {labelsI18n.status(ticket.status)}
                      </Badge>
                    )}
                  </td>
                  <td
                    className="px-2.5 py-2 text-[11px] text-muted-foreground"
                    title={relativeTime(ticket.createdAt, locale)}
                  >
                    {relativeTime(ticket.updatedAt, locale)}
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      {staff && onReply ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 px-0"
                          onClick={() => onReply(ticket)}
                          title={labels.reply}
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                      {staff && onEdit ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 px-0"
                          onClick={() => onEdit(ticket)}
                          title={labels.edit}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                      {staff && canDelete && onDelete ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 px-0"
                          onClick={() => onDelete(ticket)}
                          title={labels.delete}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      ) : null}
                      {staff && onToggleFavorite ? (
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:text-amber-500"
                          onClick={() =>
                            onToggleFavorite(ticket.id, !(ticket.favorite ?? false))
                          }
                          aria-label={labels.favorite}
                        >
                          <Star
                            className={cn(
                              "h-3.5 w-3.5",
                              ticket.favorite && "fill-amber-500 text-amber-500",
                            )}
                          />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function TicketsLayoutToggle({
  layout,
  onChange,
  labels,
}: {
  layout: "list" | "grid";
  onChange: (layout: "list" | "grid") => void;
  labels: { grid: string; list: string };
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5">
      <Button
        type="button"
        size="sm"
        variant={layout === "list" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => onChange("list")}
      >
        <List className="me-1 h-3.5 w-3.5" />
        {labels.list}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={layout === "grid" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="me-1 h-3.5 w-3.5" />
        {labels.grid}
      </Button>
    </div>
  );
}
