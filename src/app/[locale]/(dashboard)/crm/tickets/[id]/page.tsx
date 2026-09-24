"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import {
  TicketDetailView,
  type TicketDetailData,
} from "@/components/crm/tickets/TicketDetailView";
import { localizedHref } from "@/i18n/pathnames";
import { canDelete, isStaffRole } from "@/lib/roles";

export default function CrmTicketDetailPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();
  const qc = useQueryClient();
  const staff = isStaffRole(session?.user?.role);
  const showDelete = canDelete(session?.user?.role);

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["crm-ticket", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.status === 403 || res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as TicketDetailData;
    },
    refetchInterval: 4000,
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

  async function updateTicket(patch: Record<string, unknown>) {
    if (!staff) return;
    const body = { ...patch };
    if (body.assignedToId === "me") {
      body.assignedToId = session?.user?.id ?? null;
    }
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error(t("ticketUpdateFailed"));
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-ticket", id] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  async function sendReply(body: string) {
    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, skipAgent: true }),
    });
    if (!res.ok) {
      toast.error(t("ticketReplyFailed"));
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-ticket", id] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
  }

  async function addNote(body: string) {
    const res = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, ticketId: id }),
    });
    if (!res.ok) {
      toast.error(t("ticketNoteFailed"));
      return;
    }
    toast.success(t("ticketNoteAdded"));
    void qc.invalidateQueries({ queryKey: ["crm-ticket", id] });
  }

  async function deleteTicket() {
    const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("ticketDeleteFailed"));
      return;
    }
    toast.success(t("ticketDeleted"));
    void qc.invalidateQueries({ queryKey: ["crm-tickets"] });
    void qc.invalidateQueries({ queryKey: ["crm-tickets-stats"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-nav-badges"] });
    router.push(localizedHref(locale, "/crm/tickets"));
  }

  return (
    <CrmShell title={t("tickets")}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("working")}</p>
      ) : isError || !ticket ? (
        <p className="text-sm text-muted-foreground">{t("ticketNotFound")}</p>
      ) : (
        <TicketDetailView
          ticket={ticket}
          locale={locale}
          staff={staff}
          showDelete={showDelete}
          clients={clients}
          onUpdate={updateTicket}
          onReply={sendReply}
          onAddNote={addNote}
          onDelete={showDelete ? deleteTicket : undefined}
          onFavorite={(favorite) => updateTicket({ favorite })}
          labels={{
            description: t("ticketDescription"),
            activityLog: t("ticketActivityLog"),
            addComment: t("ticketAddComment"),
            postComment: t("ticketPostComment"),
            conversations: t("ticketConversations"),
            noConversations: t("ticketNoConversations"),
            details: t("ticketDetails"),
            customer: t("ticketCustomer"),
            assignedTo: t("ticketAssignTo"),
            department: t("ticketDepartment"),
            category: t("ticketCategory"),
            type: t("ticketType"),
            source: t("ticketSource"),
            customFields: t("ticketCustomFields"),
            tags: t("ticketTags"),
            timeline: t("ticketTimeline"),
            created: t("ticketCreated"),
            dueDate: t("ticketDueDate"),
            overdue: t("ticketOverdue"),
            internalNote: t("ticketInternalNote"),
            addNote: t("ticketAddNote"),
            reply: t("reply"),
            send: t("send"),
            unassigned: t("ticketChipUnassigned"),
            noClient: t("noClient"),
            assignMe: t("assignMe"),
            delete: t("ticketDelete"),
            back: t("back"),
            editTags: t("ticketEditTags"),
            saveTags: t("ticketSaveTags"),
            favorite: t("ticketFavorite"),
            updated: t("ticketUpdated"),
            system: t("ticketSystem"),
            firstResponse: t("ticketFirstResponse"),
            resolvedLabel: t("ticketResolvedLabel"),
            statusLabel: t("ticketStatus"),
            priorityLabel: t("ticketPriority"),
            backToTickets: t("tickets"),
            channelChat: t("ticketChannelChat"),
            channelTicket: t("ticketChannelTicket"),
          }}
        />
      )}
    </CrmShell>
  );
}
