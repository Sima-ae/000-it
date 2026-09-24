"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import {
  TicketsOverview,
  type TicketsStatsPayload,
} from "@/components/crm/tickets/TicketsOverview";
import {
  TicketsFiltersBar,
  TicketsLayoutToggle,
  TicketsStatsChips,
  TicketsTable,
  type TicketFiltersState,
} from "@/components/crm/tickets/TicketsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { localizedHref } from "@/i18n/pathnames";
import { canDelete, isStaffRole } from "@/lib/roles";
import type { TicketListItem } from "@/lib/crm/tickets";
import {
  channelBadgeClass,
  isLiveChatSource,
  prioritySelectClass,
  statusSelectClass,
  ticketKey,
} from "@/lib/crm/tickets";
import { cn } from "@/lib/utils";
import { useTicketI18n } from "@/components/crm/tickets/useTicketI18n";

const emptyFilters: TicketFiltersState = {
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
};

type TicketsPageResponse = {
  items: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function CrmTicketsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const qc = useQueryClient();
  const staff = isStaffRole(session?.user?.role);
  const showDelete = canDelete(session?.user?.role);
  const labelsI18n = useTicketI18n();
  const [view, setView] = useState<"overview" | "list">("list");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<TicketFiltersState>(emptyFilters);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [department, setDepartment] = useState("");
  const [ticketType, setTicketType] = useState("General");
  const [editTicket, setEditTicket] = useState<TicketListItem | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editPriority, setEditPriority] = useState("LOW");
  const [editStatus, setEditStatus] = useState("OPEN");
  const [editDepartment, setEditDepartment] = useState("");
  const [editType, setEditType] = useState("General");
  const [replyTicket, setReplyTicket] = useState<TicketListItem | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [deleteTicket, setDeleteTicket] = useState<TicketListItem | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(filters.q.trim()), 300);
    return () => clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, filters.quick, filters.status, filters.priority, filters.department, filters.type, filters.clientId, filters.assignedToId, filters.createdFrom, filters.createdTo]);

  const { data: stats } = useQuery({
    queryKey: ["crm-tickets-stats"],
    queryFn: async () => {
      const res = await fetch("/api/tickets/stats");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketsStatsPayload;
    },
    refetchInterval: 60_000,
  });

  const listParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "25",
    });
    if (debouncedQ) params.set("q", debouncedQ);
    if (filters.quick) params.set("quick", filters.quick);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.department) params.set("department", filters.department);
    if (filters.type) params.set("type", filters.type);
    if (filters.clientId) params.set("clientId", filters.clientId);
    if (filters.assignedToId) params.set("assignedToId", filters.assignedToId);
    if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
    if (filters.createdTo) params.set("createdTo", filters.createdTo);
    return params;
  }, [page, debouncedQ, filters]);

  const { data: listData, isLoading } = useQuery({
    queryKey: ["crm-tickets", listParams.toString()],
    enabled: view === "list",
    queryFn: async () => {
      const res = await fetch(`/api/tickets?${listParams}`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketsPageResponse;
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

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "q") return Boolean(value.trim());
    return Boolean(value);
  }).length;

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
        priority,
        department: department || undefined,
        ticketType,
      }),
    });
    if (!res.ok) {
      toast.error(t("ticketCreateFailed"));
      return;
    }
    const ticket = await res.json();
    toast.success(t("ticketOpened"));
    setCreating(false);
    setSubject("");
    setMessage("");
    setClientId("");
    setPriority("LOW");
    setDepartment("");
    setTicketType("General");
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    router.push(localizedHref(locale, `/crm/tickets/${ticket.id}`));
  }

  async function toggleFavorite(id: string, favorite: boolean) {
    if (!staff) return;
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite }),
    });
    if (!res.ok) {
      toast.error(t("ticketUpdateFailed"));
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
  }

  async function changeStatus(id: string, status: string) {
    if (!staff) return;
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error(t("ticketUpdateFailed"));
      return;
    }
    toast.success(t("ticketStatusUpdated"));
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  function openEdit(ticket: TicketListItem) {
    setEditTicket(ticket);
    setEditSubject(ticket.subject);
    setEditPriority(ticket.priority);
    setEditStatus(ticket.status);
    setEditDepartment(ticket.department || "");
    setEditType(ticket.ticketType || "General");
  }

  async function saveEdit() {
    if (!editTicket) return;
    setActionBusy(true);
    const res = await fetch(`/api/tickets/${editTicket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: editSubject.trim(),
        priority: editPriority,
        status: editStatus,
        department: editDepartment || null,
        ticketType: editType,
        category: editType,
      }),
    });
    setActionBusy(false);
    if (!res.ok) {
      toast.error(t("ticketUpdateFailed"));
      return;
    }
    toast.success(t("ticketUpdated"));
    setEditTicket(null);
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  async function sendReply() {
    if (!replyTicket || !replyBody.trim()) return;
    setActionBusy(true);
    const res = await fetch(`/api/tickets/${replyTicket.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody.trim(), sendEmail: true }),
    });
    const data = await res.json().catch(() => ({}));
    setActionBusy(false);
    if (!res.ok) {
      if (data.error === "NO_EMAIL") toast.error(t("ticketReplyNoEmail"));
      else if (data.error === "EMAIL_FAILED") toast.error(t("ticketReplyEmailFailed"));
      else toast.error(t("ticketReplyFailed"));
      return;
    }
    if (data.channel === "CHAT" || isLiveChatSource(replyTicket.source)) {
      toast.success(t("ticketChatReplyPosted"));
    } else if (data.emailSent) {
      toast.success(t("ticketReplyEmailed"));
    } else if (data.emailSkippedReason === "SMTP_NOT_CONFIGURED") {
      toast.success(t("ticketReplySavedNoSmtp"));
    } else {
      toast.success(t("ticketReplySaved"));
    }
    setReplyTicket(null);
    setReplyBody("");
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  async function confirmDelete() {
    if (!deleteTicket) return;
    setActionBusy(true);
    const res = await fetch(`/api/tickets/${deleteTicket.id}`, { method: "DELETE" });
    setActionBusy(false);
    if (!res.ok) {
      toast.error(t("ticketDeleteFailed"));
      return;
    }
    toast.success(t("ticketDeleted"));
    setDeleteTicket(null);
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  const name = session?.user?.name || session?.user?.email || "there";

  return (
    <CrmShell
      title={t("tickets")}
      actions={
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-border p-1">
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "default" : "ghost"}
              onClick={() => setView("list")}
            >
              {t("ticketViewList")}
            </Button>
            {staff ? (
              <Button
                type="button"
                size="sm"
                variant={view === "overview" ? "default" : "ghost"}
                onClick={() => setView("overview")}
              >
                {t("ticketViewOverview")}
              </Button>
            ) : null}
          </div>
          {view === "list" ? (
            <TicketsLayoutToggle
              layout={layout}
              onChange={setLayout}
              labels={{ grid: t("ticketGrid"), list: t("ticketList") }}
            />
          ) : null}
          <Button onClick={() => setCreating((v) => !v)}>{t("openTicket")}</Button>
        </div>
      }
    >
      {creating ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={createTicket} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <Label>{t("ticketSubject")}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              {staff ? (
                <div className="space-y-1">
                  <Label>{t("linkClient")}</Label>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
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
                <Label>{t("ticketPriority")}</Label>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {labelsI18n.priorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t("ticketDepartment")}</Label>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">—</option>
                  {labelsI18n.departments.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t("ticketType")}</Label>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  {labelsI18n.types.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>{t("ticketMessage")}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">{t("save")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {view === "overview" && stats ? (
        <TicketsOverview
          data={stats}
          locale={locale}
          staff={staff}
          onViewTickets={() => setView("list")}
          onCreateTicket={() => setCreating(true)}
          labels={{
            welcome: t("ticketWelcome", { name }),
            welcomeSub: t("ticketWelcomeSub"),
            systemOnline: t("ticketSystemOnline"),
            newTickets: t("ticketStatNew"),
            openTickets: t("ticketStatOpen"),
            closedTickets: t("ticketStatClosed"),
            unassignedTickets: t("ticketStatUnassigned"),
            slaTitle: t("ticketSlaTitle"),
            compliance: t("ticketSlaCompliance"),
            breached: t("ticketSlaBreached"),
            atRisk: t("ticketSlaAtRisk"),
            avgResolution: t("ticketAvgResolution"),
            recentActivity: t("ticketRecentActivity"),
            conversations: t("ticketConversations"),
            totalConversations: t("ticketTotalConversations"),
            active: t("ticketActive"),
            today: t("ticketToday"),
            avgFirstResponse: t("ticketAvgFirstResponse"),
            aiAssistant: t("ticketAiAssistant"),
            aiReady: t("ticketAiReady"),
            classifications: t("ticketClassifications"),
            suggestions: t("ticketSuggestions"),
            aiSettings: t("ticketAiSettings"),
            viewAnalytics: t("ticketViewAnalytics"),
            autoClassify: t("ticketAutoClassify"),
            systemStatus: t("ticketSystemStatus"),
            overallStatus: t("ticketOverallStatus"),
            apiConnected: t("ticketApiConnected"),
            features: t("ticketAiFeatures"),
            quickActions: t("ticketQuickActions"),
            createTicket: t("openTicket"),
            viewTickets: t("ticketViewList"),
            startChat: t("ticketStartChat"),
            viewReports: t("ticketViewReports"),
            manageUsers: t("users"),
            settings: t("crmSettings"),
            analytics: t("ticketAnalytics"),
            analyticsSub: t("ticketAnalyticsSub"),
            byDepartment: t("ticketByDepartment"),
            byType: t("ticketByType"),
            ticketHistory: t("ticketHistory"),
            thisMonth: t("ticketThisMonth"),
            totalCustomers: t("ticketTotalCustomers"),
            totalContacts: t("ticketTotalContacts"),
            empty: t("emptyTickets"),
            minutes: t("ticketMinutes"),
            totalTicketsHero: t("ticketTotalTicketsHero"),
            activeSystem: t("ticketActiveSystem"),
            poweredBy: t("ticketPoweredBy"),
            estCost: t("ticketEstCost"),
            on: t("ticketOn"),
            off: t("ticketOff"),
            connected: t("ticketConnected"),
          }}
        />
      ) : null}

      {view === "list" ? (
        <div className="space-y-4">
          {stats ? (
            <TicketsStatsChips
              stats={stats.stats}
              labels={{
                total: t("ticketChipTotal"),
                open: t("ticketChipOpen"),
                high: t("ticketChipHigh"),
                unassigned: t("ticketChipUnassigned"),
              }}
            />
          ) : null}

          <TicketsFiltersBar
            filters={filters}
            setFilters={setFilters}
            clients={clients}
            staff={staff}
            activeCount={activeFilterCount}
            labels={{
              search: t("ticketSearch"),
              open: t("ticketChipOpen"),
              high: t("ticketChipHigh"),
              unassigned: t("ticketChipUnassigned"),
              mine: t("ticketQuickMine"),
              recent: t("ticketQuickRecent"),
              favorites: t("ticketQuickFavorites"),
              chats: t("ticketQuickChats"),
              ticketsOnly: t("ticketQuickTickets"),
              client: t("linkClient"),
              allClients: t("ticketAllClients"),
              type: t("ticketType"),
              allTypes: t("ticketAllTypes"),
              department: t("ticketDepartment"),
              allDepartments: t("ticketAllDepartments"),
              priority: t("ticketPriority"),
              allPriorities: t("ticketAllPriorities"),
              status: t("ticketStatus"),
              allStatuses: t("ticketAllStatuses"),
              assignTo: t("ticketAssignTo"),
              allAssignees: t("ticketAllAssignees"),
              unassignedOption: t("ticketChipUnassigned"),
              assignMe: t("assignMe"),
              createdFrom: t("ticketCreatedFrom"),
              createdTo: t("ticketCreatedTo"),
              filtersActive: t("ticketFiltersActive"),
              clear: t("ticketClearFilters"),
            }}
          />

          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("working")}</p>
          ) : (
            <TicketsTable
              tickets={listData?.items || []}
              locale={locale}
              layout={layout}
              staff={staff}
              canDelete={showDelete}
              onToggleFavorite={toggleFavorite}
              onStatusChange={changeStatus}
              onEdit={openEdit}
              onDelete={setDeleteTicket}
              onReply={setReplyTicket}
              labels={{
                key: t("ticketColKey"),
                subject: t("ticketColSubject"),
                priority: t("ticketPriority"),
                status: t("ticketStatus"),
                date: t("ticketColDate"),
                updated: t("ticketColUpdated"),
                empty: t("emptyTickets"),
                unassigned: t("ticketChipUnassigned"),
                favorite: t("ticketFavorite"),
                actions: t("ticketActions"),
                edit: t("edit"),
                delete: t("ticketDelete"),
                reply: t("ticketReplyAction"),
                channelChat: t("ticketChannelChat"),
                channelTicket: t("ticketChannelTicket"),
              }}
            />
          )}

          {(listData?.totalPages || 1) > 1 ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {t("ticketPage", {
                  page: listData?.page || 1,
                  totalPages: listData?.totalPages || 1,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("ticketPrev")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (listData?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("ticketNext")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {view === "overview" && !stats ? (
        <p className="text-sm text-muted-foreground">{t("working")}</p>
      ) : null}

      <Dialog open={!!editTicket} onOpenChange={(open) => !open && setEditTicket(null)}>
        <DialogContent className="w-[min(96vw,36rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl md:text-2xl">{t("ticketEditTitle")}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 text-sm">
              {editTicket ? (
                <>
                  <span className="font-medium text-foreground/80">
                    {ticketKey(editTicket.id)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      channelBadgeClass(editTicket.source),
                    )}
                  >
                    {isLiveChatSource(editTicket.source)
                      ? t("ticketChannelChat")
                      : t("ticketChannelTicket")}
                  </span>
                </>
              ) : null}
              <span className="text-muted-foreground">{t("ticketEditSubtitle")}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4 md:px-6">
            <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <div className="mb-3 border-b border-border/50 pb-2.5">
                <h3 className="text-sm font-semibold tracking-tight">{t("ticketEditSectionDetails")}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("ticketEditSectionDetailsHint")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t("ticketSubject")}
                </Label>
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <div className="mb-3 border-b border-border/50 pb-2.5">
                <h3 className="text-sm font-semibold tracking-tight">{t("ticketEditSectionRouting")}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("ticketEditSectionRoutingHint")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                    {t("ticketStatus")}
                  </Label>
                  <select
                    className={cn(
                      "h-10 w-full rounded-xl border px-3 text-sm font-medium",
                      statusSelectClass(editStatus),
                    )}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    {labelsI18n.statuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                    {t("ticketPriority")}
                  </Label>
                  <select
                    className={cn(
                      "h-10 w-full rounded-xl border px-3 text-sm font-medium",
                      prioritySelectClass(editPriority),
                    )}
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    {labelsI18n.priorities.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                    {t("ticketDepartment")}
                  </Label>
                  <select
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                  >
                    <option value="">—</option>
                    {labelsI18n.departments.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                    {t("ticketType")}
                  </Label>
                  <select
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    {labelsI18n.types.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-5 py-4 md:px-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditTicket(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-xl px-5"
              disabled={actionBusy || !editSubject.trim()}
              onClick={() => void saveEdit()}
            >
              {t("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!replyTicket}
        onOpenChange={(open) => {
          if (!open) {
            setReplyTicket(null);
            setReplyBody("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {replyTicket && isLiveChatSource(replyTicket.source)
                ? t("ticketChatReplyTitle")
                : t("ticketReplyTitle")}
            </DialogTitle>
            <DialogDescription>
              {replyTicket
                ? isLiveChatSource(replyTicket.source)
                  ? t("ticketChatReplyHint", { key: ticketKey(replyTicket.id) })
                  : t("ticketReplyHint", {
                      email:
                        replyTicket.guestEmail ||
                        replyTicket.client?.email ||
                        replyTicket.user?.email ||
                        t("ticketReplyNoEmailShort"),
                      key: ticketKey(replyTicket.id),
                    })
                : null}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={6}
            placeholder={t("ticketReplyPlaceholder")}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReplyTicket(null);
                setReplyBody("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={actionBusy || !replyBody.trim()}
              onClick={() => void sendReply()}
            >
              {replyTicket && isLiveChatSource(replyTicket.source)
                ? t("ticketChatReplySend")
                : t("ticketReplySend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTicket} onOpenChange={(open) => !open && setDeleteTicket(null)}>
        <DialogContent className="w-[min(96vw,28rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14">
            <DialogTitle className="text-xl md:text-2xl">{t("ticketDeleteTitle")}</DialogTitle>
            <DialogDescription className="text-sm">
              {t("ticketDeleteHint")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-5 py-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-foreground">
                {deleteTicket
                  ? t("ticketDeleteConfirm", {
                      subject: deleteTicket.subject,
                      key: ticketKey(deleteTicket.id),
                    })
                  : null}
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-border/60 bg-background/95 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTicket(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl px-5"
              disabled={actionBusy}
              onClick={() => void confirmDelete()}
            >
              {t("ticketDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
