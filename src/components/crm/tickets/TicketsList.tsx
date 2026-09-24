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
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm"
        >
          <span className={cn("mr-1.5 font-semibold", chip.className)}>{chip.value}</span>
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
      <CardContent className="space-y-2 p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => patch({ q: e.target.value })}
              placeholder={labels.search}
              className="h-8 pl-8 text-sm"
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

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
          {staff ? (
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
            className="h-8 px-2 text-xs"
          />
          <Input
            type="date"
            value={filters.createdTo}
            onChange={(e) => patch({ createdTo: e.target.value })}
            aria-label={labels.createdTo}
            className="h-8 px-2 text-xs"
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
          "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
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
                    <Reply className="mr-1 h-3.5 w-3.5" />
                    {labels.reply}
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(ticket)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    {labels.edit}
                  </Button>
                ) : null}
                {canDelete && onDelete ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(ticket)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
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
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">{labels.key}</th>
              <th className="min-w-55 px-4 py-2.5 font-medium">{labels.subject}</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">{labels.priority}</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">{labels.status}</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">{labels.date}</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">{labels.updated}</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">
                {labels.actions}
              </th>
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
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <SoftLink
                        href={`/${locale}/crm/tickets/${ticket.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {ticketKey(ticket.id)}
                      </SoftLink>
                      <ChannelBadge source={ticket.source} />
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <SoftLink
                      href={`/${locale}/crm/tickets/${ticket.id}`}
                      className="block font-medium text-foreground hover:underline"
                    >
                      {subjectText}
                    </SoftLink>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {requester}
                      {staff ? ` · ${assignee}` : ""}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={priorityBadgeVariant(ticket.priority)}>
                      {labelsI18n.priority(ticket.priority)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {staff && onStatusChange ? (
                      <select
                        className={cn(
                          "h-9 w-full min-w-30 rounded-full border px-2.5 text-xs font-medium",
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
                      <Badge variant={statusBadgeVariant(ticket.status)}>
                        {labelsI18n.status(ticket.status)}
                      </Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {relativeTime(ticket.createdAt, locale)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {relativeTime(ticket.updatedAt, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {staff && onReply ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onReply(ticket)}
                          title={labels.reply}
                        >
                          <Reply className="h-3.5 w-3.5" />
                          <span className="ml-1 hidden sm:inline">{labels.reply}</span>
                        </Button>
                      ) : null}
                      {staff && onEdit ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
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
                          onClick={() => onDelete(ticket)}
                          title={labels.delete}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      ) : null}
                      {staff && onToggleFavorite ? (
                        <button
                          type="button"
                          className="rounded-md p-2 text-muted-foreground hover:text-amber-500"
                          onClick={() =>
                            onToggleFavorite(ticket.id, !(ticket.favorite ?? false))
                          }
                          aria-label={labels.favorite}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
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
    <div className="flex rounded-xl border border-border p-1">
      <Button
        type="button"
        size="sm"
        variant={layout === "list" ? "default" : "ghost"}
        onClick={() => onChange("list")}
      >
        <List className="mr-1.5 h-3.5 w-3.5" />
        {labels.list}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={layout === "grid" ? "default" : "ghost"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
        {labels.grid}
      </Button>
    </div>
  );
}
