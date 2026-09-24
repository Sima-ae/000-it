import type { TicketPriority, TicketStatus } from "@prisma/client";

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "RESOLVED",
  "CLOSED",
] as const satisfies readonly TicketStatus[];

export const TICKET_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const satisfies readonly TicketPriority[];

export const TICKET_DEPARTMENTS = [
  "Technical Support",
  "Sales",
  "Billing",
  "Hosting",
  "General",
] as const;

export const TICKET_TYPES = [
  "Service Request",
  "Bug Report",
  "Question",
  "Feature Request",
  "Incident",
  "General",
] as const;

export const TICKET_SOURCES = ["CHAT", "DASHBOARD", "EMAIL"] as const;

export function isLiveChatSource(source?: string | null) {
  return source === "CHAT";
}

export function channelBadgeClass(source?: string | null) {
  return isLiveChatSource(source)
    ? "border-transparent bg-primary text-primary-foreground"
    : "border-transparent bg-accent text-white";
}

/** Stable i18n key suffix for department / type stored English values */
export function ticketOptionKey(value: string) {
  return value.replaceAll(/[^a-zA-Z0-9]+/g, "");
}

export function ticketKey(id: string) {
  return `#TKT-${id.slice(-6).toUpperCase()}`;
}

export function parseTicketTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function relativeTime(iso: string | Date, locale = "en") {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < hour) return rtf.format(Math.round(diffMs / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diffMs / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diffMs / day), "day");
  return date.toLocaleDateString(locale);
}

export function statusBadgeVariant(
  status: string,
): "accent" | "secondary" | "warning" | "outline" | "default" | "danger" | "success" | "urgent" | "progress" {
  switch (status) {
    case "OPEN":
      return "accent";
    case "IN_PROGRESS":
      return "progress";
    case "WAITING":
      return "warning";
    case "RESOLVED":
      return "default";
    case "CLOSED":
      return "danger";
    default:
      return "outline";
  }
}

/** Colored pill styles for status &lt;select&gt; controls in ticket tables. */
export function statusSelectClass(status: string) {
  switch (status) {
    case "OPEN":
      return "border-accent/30 bg-accent/15 text-accent";
    case "IN_PROGRESS":
      return "border-emerald-800/30 bg-emerald-800/15 text-emerald-800 dark:text-emerald-300";
    case "WAITING":
      return "border-orange-500/30 bg-orange-500/15 text-orange-600 dark:text-orange-300";
    case "RESOLVED":
      return "border-primary/30 bg-primary/15 text-primary";
    case "CLOSED":
      return "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-300";
    default:
      return "border-input bg-background text-foreground";
  }
}

export function prioritySelectClass(priority: string) {
  switch (priority) {
    case "LOW":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "MEDIUM":
      return "border-orange-500/30 bg-orange-500/15 text-orange-600 dark:text-orange-300";
    case "HIGH":
      return "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-300";
    case "URGENT":
      return "border-red-900/30 bg-red-900/15 text-red-900 dark:text-red-200";
    default:
      return "border-input bg-background text-foreground";
  }
}

export function priorityBadgeVariant(
  priority: string,
): "accent" | "secondary" | "warning" | "outline" | "default" | "danger" | "success" | "urgent" | "progress" {
  switch (priority) {
    case "LOW":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HIGH":
      return "danger";
    case "URGENT":
      return "urgent";
    default:
      return "outline";
  }
}

export type TicketListItem = {
  id: string;
  subject: string;
  description?: string | null;
  status: string;
  priority: string;
  source: string;
  ticketType?: string | null;
  department?: string | null;
  category?: string | null;
  tags?: unknown;
  dueAt?: string | null;
  favorite?: boolean;
  clientId?: string | null;
  projectId?: string | null;
  assignedToId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string } | null;
  assignedTo?: { id: string; name: string | null; email: string } | null;
  client?: { id: string; name: string; company: string | null; email?: string | null } | null;
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
