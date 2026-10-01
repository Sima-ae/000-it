"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  MessageCircle,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SoftLink } from "@/components/shared/SoftLink";
import { isStaffRole } from "@/lib/roles";
import { prioritySelectClass, TICKET_PRIORITIES } from "@/lib/crm/tickets";
import { Agent000Avatar } from "@/components/agent-000/Agent000Avatar";
import { AgentChatLinks } from "@/components/agent-000/AgentChatLinks";
import { OPEN_CHAT_EVENT } from "@/components/chat/open-live-chat";
import { useBrand } from "@/lib/brand/BrandProvider";
import type { AgentAction, AgentLink } from "@/lib/agent-000/ask";
import { splitAgentAnswer } from "@/lib/agent-000/message-links";

type ChatMessage = {
  id: string;
  body: string;
  senderKind: string;
  createdAt: string;
  sender?: { name: string | null } | null;
};

type AgentMeta = {
  links: AgentLink[];
  mode: "answer" | "clarify";
  actions: AgentAction[];
};

type AgentAskPayload = {
  answer: string;
  links?: AgentLink[];
  mode?: "answer" | "clarify";
  actions?: AgentAction[];
  faqId?: string | null;
};

type TicketDetail = {
  id: string;
  subject: string;
  status: string;
  messages: ChatMessage[];
  guestToken?: string;
};

const STORAGE_KEY = "tz-live-chat";
const TEASER_KEY = "tz-live-chat-teaser-dismissed";

type StoredChat = {
  ticketId: string;
  guestToken?: string;
  guestName?: string;
  guestEmail?: string;
};

function loadStored(): StoredChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChat) : null;
  } catch {
    return null;
  }
}

function saveStored(data: StoredChat | null) {
  if (typeof window === "undefined") return;
  if (!data) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function asGuestToken(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isLocalTicketId(id: string) {
  return id.startsWith("local-");
}

function localChatMessage(body: string, senderKind: string): ChatMessage {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    body,
    senderKind,
    createdAt: new Date().toISOString(),
  };
}

function isAppShellPath(pathname: string) {
  return /\/(login|register|forgot-password|dashboard|crm|tickets|todos|users|projects|leads|settings|content-generator|seo-analysis)(\/|$)/.test(
    pathname,
  );
}

export function LiveChatWidget() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations("liveChat");
  const pathname = usePathname();
  const brand = useBrand();
  const isExtraHosting = brand.id === "extrahosting";
  const isStaff = isStaffRole(session?.user?.role);
  const hideWidget = isAppShellPath(pathname);

  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [mode, setMode] = useState<"chat" | "ticket">("chat");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<(typeof TICKET_PRIORITIES)[number]>("LOW");
  const [draft, setDraft] = useState("");
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [guestToken, setGuestToken] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentMetaById, setAgentMetaById] = useState<Record<string, AgentMeta>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stickToBottomRef = useRef(true);
  const lastClarifyLinks = useRef<AgentLink[]>([]);
  const forceScrollRef = useRef(false);

  const loggedIn = status === "authenticated" && !!session?.user;
  const accountName = session?.user?.name?.trim() || "";
  const accountEmail = session?.user?.email?.trim() || "";

  const restore = useCallback(async () => {
    const stored = loadStored();
    if (!stored?.ticketId) return;
    setGuestToken(asGuestToken(stored.guestToken));
    if (stored.guestName) setGuestName(stored.guestName);
    if (stored.guestEmail) setGuestEmail(stored.guestEmail);
    const qs = stored.guestToken ? `?token=${encodeURIComponent(stored.guestToken)}` : "";
    const res = await fetch(`/api/tickets/${stored.ticketId}${qs}`);
    if (!res.ok) {
      saveStored(null);
      return;
    }
    const data = (await res.json()) as TicketDetail;
    setTicket(data);
  }, []);

  useEffect(() => {
    void restore();
  }, [restore, loggedIn]);

  // Logged-in users: pull identity from the account — never ask for name/email.
  useEffect(() => {
    if (!loggedIn) return;
    if (accountName) setGuestName(accountName);
    if (accountEmail) setGuestEmail(accountEmail);
  }, [loggedIn, accountName, accountEmail]);

  useEffect(() => {
    if (hideWidget || open) return;
    try {
      if (localStorage.getItem(TEASER_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setTeaser(true), 1800);
    return () => window.clearTimeout(t);
  }, [hideWidget, open]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (list && (stickToBottomRef.current || forceScrollRef.current)) {
      list.scrollTop = list.scrollHeight;
      forceScrollRef.current = false;
    }
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(focusTimer);
  }, [ticket?.messages, open, busy]);

  function onChatScroll() {
    const list = listRef.current;
    if (!list) return;
    const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
    stickToBottomRef.current = distance < 72;
  }

  function rememberAgentMeta(messageId: string, payload: AgentAskPayload) {
    const links = payload.links || [];
    const mode = payload.mode || "answer";
    const actions = payload.actions || [];
    if (mode === "clarify") lastClarifyLinks.current = links;
    else lastClarifyLinks.current = [];
    setAgentMetaById((prev) => ({
      ...prev,
      [messageId]: { links, mode, actions },
    }));
  }

  // Hydrate clickable links from persisted SYSTEM bodies (no API metadata on restore).
  useEffect(() => {
    if (!ticket?.messages?.length) return;
    const systemMsgs = ticket.messages.filter((m) => m.senderKind === "SYSTEM");
    if (!systemMsgs.length) return;
    setAgentMetaById((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const msg of systemMsgs) {
        if (next[msg.id]?.links?.length) continue;
        const split = splitAgentAnswer(msg.body);
        if (!split.links.length) continue;
        next[msg.id] = {
          links: split.links,
          mode: "answer",
          actions: prev[msg.id]?.actions || [],
        };
        changed = true;
      }
      return changed ? next : prev;
    });
    const last = systemMsgs[systemMsgs.length - 1];
    if (last) {
      const split = splitAgentAnswer(last.body);
      if (split.links.length >= 2) {
        lastClarifyLinks.current = split.links;
      }
    }
  }, [ticket?.id, ticket?.messages]);

  useEffect(() => {
    if (!ticket?.id || isLocalTicketId(ticket.id)) return;
    // Keep polling so staff live-chat replies appear for this browser session.
    const intervalMs = open ? 2000 : 8000;
    let lastFingerprint = ticket.messages?.map((m) => m.id).join(",") || "";
    const timer = setInterval(async () => {
      const qs = guestToken ? `?token=${encodeURIComponent(guestToken)}` : "";
      const res = await fetch(`/api/tickets/${ticket.id}${qs}`);
      if (!res.ok) return;
      const data = (await res.json()) as TicketDetail;
      const nextFingerprint = data.messages?.map((m) => m.id).join(",") || "";
      // Avoid re-render/scroll thrash when nothing changed.
      if (nextFingerprint === lastFingerprint) return;
      lastFingerprint = nextFingerprint;
      setTicket(data);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [open, ticket?.id, ticket?.messages, guestToken]);

  // Guests only. Hide while auth is resolving so logged-in users never see a flash of fields.
  const needsIdentity = status === "unauthenticated" && !ticket;

  const copy = useMemo(
    () => ({
      title: t("title"),
      subtitle: t("subtitle"),
      online: t("online"),
      teaserLine1: t("teaserLine1"),
      teaserLine2: t("teaserLine2"),
      emptyChat: t("emptyChat"),
      emptyTicket: t("emptyTicket"),
      placeholder: t("placeholder"),
      newTicket: t("newTicket"),
      name: t("name"),
      email: t("email"),
      subject: t("subject"),
      subjectPh: t("subjectPh"),
      priority: t("priority"),
      priorityLow: t("priorityLow"),
      priorityMedium: t("priorityMedium"),
      priorityHigh: t("priorityHigh"),
      priorityUrgent: t("priorityUrgent"),
      viewTickets: t("viewTickets"),
      sendFailed: t("sendFailed"),
      powered: t("powered"),
      tabChat: t("tabChat"),
      tabTicket: t("tabTicket"),
      openChat: t("openChat"),
      closeChat: t("closeChat"),
      visitor: t("visitor"),
      subjectPrefix: t("subjectPrefix"),
      agentLabel: t("agentLabel"),
      dismiss: t("dismiss"),
    }),
    [t],
  );

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ prefill?: string }>).detail;
      setOpen(true);
      setTeaser(false);
      setMode("chat");
      if (detail?.prefill) setDraft(detail.prefill);
      try {
        localStorage.setItem(TEASER_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  async function askAgentOffline(
    question: string,
    opts?: { faqId?: string },
  ): Promise<AgentAskPayload> {
    const res = await fetch("/api/agent-000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        question,
        persist: false,
        faqId: opts?.faqId,
      }),
    });
    if (!res.ok) throw new Error("ask failed");
    const data = (await res.json()) as AgentAskPayload;
    if (!data.answer) throw new Error("ask failed");
    return data;
  }

  function applyLocalAgentTurn(
    question: string,
    payload: AgentAskPayload,
    subjectLine: string,
  ) {
    const visitorKind = loggedIn && !isStaff ? "CLIENT" : isStaff ? "STAFF" : "GUEST";
    const agentMsg = localChatMessage(payload.answer, "SYSTEM");
    rememberAgentMeta(agentMsg.id, payload);
    forceScrollRef.current = true;
    stickToBottomRef.current = true;
    setTicket((prev) => {
      if (prev) {
        return {
          ...prev,
          messages: [
            ...prev.messages,
            localChatMessage(question, visitorKind),
            agentMsg,
          ],
        };
      }
      return {
        id: `local-${Date.now()}`,
        subject: subjectLine,
        status: "OPEN",
        messages: [localChatMessage(question, visitorKind), agentMsg],
      };
    });
    setDraft("");
    setSubject("");
    setPriority("LOW");
    setMode("chat");
  }

  async function startConversation(opts: {
    subject: string;
    message: string;
    source: "CHAT" | "DASHBOARD";
    priority?: (typeof TICKET_PRIORITIES)[number];
    faqId?: string;
  }) {
    setBusy(true);
    setError(null);
    forceScrollRef.current = true;
    stickToBottomRef.current = true;
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: opts.subject,
          message: opts.message,
          source: opts.source,
          priority: opts.priority ?? "LOW",
          guestName: loggedIn ? undefined : guestName,
          guestEmail: loggedIn ? undefined : guestEmail,
          locale,
          faqId: opts.faqId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      const data = await res.json();
      if (typeof data.id === "string" && data.id.startsWith("local-")) {
        throw new Error("local ticket rejected");
      }
      const token = asGuestToken(data.guestToken);
      setGuestToken(token);
      saveStored({
        ticketId: data.id,
        guestToken: token,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
      });
      setTicket(data);
      setDraft("");
      setSubject("");
      setPriority("LOW");
      setMode("chat");
      const lastSystem = [...(data.messages || [])]
        .reverse()
        .find((m: ChatMessage) => m.senderKind === "SYSTEM");
      if (lastSystem && data.agent) {
        rememberAgentMeta(lastSystem.id, {
          answer: lastSystem.body,
          links: data.agent.links,
          mode: data.agent.mode,
          actions: data.agent.actions,
          faqId: data.agent.faqId,
        });
      }
    } catch {
      try {
        const payload = await askAgentOffline(opts.message, {
          faqId: opts.faqId,
        });
        applyLocalAgentTurn(opts.message, payload, opts.subject);
      } catch {
        setError(copy.sendFailed);
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(opts?: {
    body?: string;
    faqId?: string;
  }) {
    const body = (opts?.body ?? draft).trim();
    if (!body || !ticket) return;
    setBusy(true);
    setError(null);
    forceScrollRef.current = true;
    stickToBottomRef.current = true;
    try {
      if (!isLocalTicketId(ticket.id)) {
        const payload: {
          body: string;
          locale: string;
          guestToken?: string;
          faqId?: string;
        } = {
          body,
          locale,
        };
        if (guestToken) payload.guestToken = guestToken;
        if (opts?.faqId) payload.faqId = opts.faqId;
        const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const visitorMsg = data.message || data;
          const agentMsg = data.agentMessage as ChatMessage | undefined;
          if (agentMsg && data.agent) {
            rememberAgentMeta(agentMsg.id, {
              answer: agentMsg.body,
              links: data.agent.links,
              mode: data.agent.mode,
              actions: data.agent.actions,
              faqId: data.agent.faqId,
            });
          }
          setTicket((prev) => {
            if (!prev) return prev;
            const next = [...prev.messages, visitorMsg];
            if (agentMsg) next.push(agentMsg);
            return { ...prev, messages: next };
          });
          setDraft("");
          return;
        }
      }

      const payload = await askAgentOffline(body, { faqId: opts?.faqId });
      applyLocalAgentTurn(body, payload, ticket.subject);
    } catch {
      setError(copy.sendFailed);
    } finally {
      setBusy(false);
    }
  }

  function resolveClarifyPick(raw: string): AgentLink | null {
    const links = lastClarifyLinks.current;
    if (!links.length) return null;
    const trimmed = raw.trim();
    const asNum = Number.parseInt(trimmed, 10);
    if (Number.isFinite(asNum) && asNum >= 1 && asNum <= links.length) {
      return links[asNum - 1] ?? null;
    }
    const lower = trimmed.toLowerCase();
    return (
      links.find(
        (l) =>
          l.title.toLowerCase() === lower ||
          l.askQuestion?.toLowerCase() === lower,
      ) ?? null
    );
  }

  function pickAgentLink(link: AgentLink) {
    if (busy) return;
    if (link.kind === "product") {
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }
    const question = link.askQuestion || link.title;
    if (ticket) {
      void sendMessage({
        body: question,
        faqId: link.kind === "faq" ? link.faqId : undefined,
      });
      return;
    }
    const who =
      (loggedIn ? accountName : guestName.trim()) ||
      accountName ||
      copy.visitor;
    void startConversation({
      subject: `${copy.subjectPrefix} — ${who}`,
      message: question,
      source: "CHAT",
      faqId: link.kind === "faq" ? link.faqId : undefined,
    });
  }

  async function handlePrimarySubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || status === "loading") return;
    if (mode === "ticket") {
      if (!subject.trim() || !draft.trim()) return;
      if (needsIdentity && (!guestName.trim() || !guestEmail.trim())) return;
      await startConversation({
        subject: subject.trim(),
        message: draft.trim(),
        source: "DASHBOARD",
        priority,
      });
      return;
    }

    if (!ticket) {
      if (!draft.trim()) return;
      if (needsIdentity && (!guestName.trim() || !guestEmail.trim())) return;
      const who =
        (loggedIn ? accountName : guestName.trim()) ||
        accountName ||
        copy.visitor;
      await startConversation({
        subject: `${copy.subjectPrefix} — ${who}`,
        message: draft.trim(),
        source: "CHAT",
      });
      return;
    }

    const pick = resolveClarifyPick(draft);
    if (pick) {
      pickAgentLink(pick);
      return;
    }
    await sendMessage();
  }

  function openChat() {
    setOpen(true);
    setTeaser(false);
    try {
      localStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function dismissTeaser() {
    setTeaser(false);
    try {
      localStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  // Hide on auth + dashboard shells (staff use inbox there). Always show on public pages.
  if (hideWidget) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-9998 flex flex-col items-end justify-end gap-3",
        // Pin to safe insets so the stack always has a real height and never clips.
        // On mobile, --tz-sticky-domain-offset lifts the FAB above the domain bar.
        "top-[max(1rem,env(safe-area-inset-top))]",
        // Logical end + matching physical safe-area (no env(safe-area-inset-inline-*))
        "inset-e-[max(1rem,env(safe-area-inset-right))] rtl:inset-e-auto rtl:inset-s-[max(1rem,env(safe-area-inset-left))]",
      )}
      style={{
        bottom:
          "max(1rem, calc(env(safe-area-inset-bottom) + var(--tz-sticky-domain-offset, 0px)))",
      }}
    >
      {open ? (
        <div
          className={cn(
            "pointer-events-auto flex min-h-0 w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
            // Leave room for the FAB + gap; parent height is definite via top/bottom.
            "max-h-[min(520px,calc(100%-4.25rem))]",
          )}
        >
          <div
            className={cn(
              "shrink-0 border-b border-border px-3 py-2.5 text-primary-foreground",
              isExtraHosting ? "bg-[#0a4f9c]" : "bg-primary",
            )}
          >            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2.5">
                <Agent000Avatar state="idle" size="sm" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="font-display truncate text-sm font-semibold leading-tight tracking-tight">
                    {copy.agentLabel}
                    <span className="font-normal opacity-90"> · {copy.subtitle}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] leading-none opacity-95">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                          isExtraHosting ? "bg-[#22c55e]" : "bg-accent",
                        )}
                      />
                      <span
                        className={cn(
                          "relative inline-flex h-2 w-2 rounded-full",
                          isExtraHosting ? "bg-[#22c55e]" : "bg-accent",
                        )}
                      />
                    </span>
                    {copy.online}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-1 transition hover:bg-white/15"
                aria-label={copy.closeChat}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex shrink-0 gap-1 border-b border-border px-2 py-2">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                mode === "chat"
                  ? isExtraHosting
                    ? "bg-[#0a4f9c]/15 text-[#0a4f9c]"
                    : "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {copy.tabChat}
            </button>
            <button
              type="button"
              onClick={() => setMode("ticket")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                mode === "ticket"
                  ? isExtraHosting
                    ? "bg-[#0a4f9c]/15 text-[#0a4f9c]"
                    : "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <Ticket className="h-3.5 w-3.5" />
              {copy.newTicket}
            </button>
          </div>

          <div
            ref={listRef}
            onScroll={onChatScroll}
            className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
          >
            {mode === "chat" && ticket?.messages?.length ? (
              ticket.messages.map((msg) => {
                const mine = msg.senderKind === "GUEST" || msg.senderKind === "CLIENT";
                const system = msg.senderKind === "SYSTEM";
                const meta = agentMetaById[msg.id];
                const split = system ? splitAgentAnswer(msg.body) : null;
                const links = meta?.links?.length ? meta.links : split?.links || [];
                const modeHint = meta?.mode || "answer";
                const actions = meta?.actions || [];
                const displayBody = system
                  ? (split?.text || msg.body).trim()
                  : msg.body;
                return (
                  <div
                    key={msg.id}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                        mine
                          ? isExtraHosting
                            ? "bg-[#0a4f9c] text-white"
                            : "bg-primary text-primary-foreground"
                          : system
                            ? "border border-border/70 bg-muted/40 text-foreground"
                            : "bg-muted text-foreground",
                      )}
                    >
                      {!mine ? (
                        <div className="mb-1 flex items-center gap-1.5">
                          {system ? <Agent000Avatar state="idle" size="sm" className="h-5! w-5!" /> : null}
                          <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                            {system
                              ? copy.agentLabel
                              : msg.sender?.name || "Support"}
                          </p>
                        </div>
                      ) : null}
                      {displayBody ? (
                        <p className="whitespace-pre-wrap">{displayBody}</p>
                      ) : null}
                      {system ? (
                        <AgentChatLinks
                          locale={locale}
                          links={links}
                          mode={modeHint}
                          actions={actions}
                          onPickLink={pickAgentLink}
                          onOpenTicket={() => setMode("ticket")}
                          tone="light"
                        />
                      ) : null}
                      <p className="mt-1 text-[10px] opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                {mode === "ticket" ? copy.emptyTicket : copy.emptyChat}
                {loggedIn && !isStaff ? (
                  <p className="mt-2">
                    <SoftLink
                      href={localizedHref(locale, "/crm/tickets")}
                      className={cn(
                        "underline-offset-2 hover:underline",
                        isExtraHosting ? "text-[#0a4f9c]" : "text-primary",
                      )}
                    >
                      {copy.viewTickets}
                    </SoftLink>
                  </p>
                ) : null}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => void handlePrimarySubmit(e)}
            className="shrink-0 space-y-2 border-t border-border bg-background p-3"
          >
            {needsIdentity ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">{copy.name}</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="h-9"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{copy.email}</Label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="h-9"
                    autoComplete="email"
                  />
                </div>
              </div>
            ) : null}

            {mode === "ticket" ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="live-chat-priority">
                    {copy.priority}
                  </Label>
                  <select
                    id="live-chat-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as (typeof TICKET_PRIORITIES)[number])
                    }
                    className={cn(
                      "h-9 w-full rounded-lg border px-2.5 text-xs font-medium",
                      prioritySelectClass(priority),
                    )}
                    aria-label={copy.priority}
                  >
                    <option value="LOW">{copy.priorityLow}</option>
                    <option value="MEDIUM">{copy.priorityMedium}</option>
                    <option value="HIGH">{copy.priorityHigh}</option>
                    <option value="URGENT">{copy.priorityUrgent}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{copy.subject}</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={copy.subjectPh}
                    required
                    className="h-9"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={copy.placeholder}
                required
                className={cn(
                  "h-10",
                  isExtraHosting && "focus-visible:ring-[#0a4f9c]/50",
                )}
                disabled={busy}
              />
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0",
                  isExtraHosting && "bg-[#0a4f9c] hover:bg-[#083d7a]",
                )}
                disabled={busy || status === "loading"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <p className="text-[10px] text-muted-foreground">{copy.powered}</p>
          </form>
        </div>
      ) : null}

      {!open && teaser ? (
        <div className="pointer-events-auto relative mb-1 max-w-60 rounded-2xl border border-border bg-background px-3 py-2.5 text-sm shadow-lg">
          <button
            type="button"
            onClick={dismissTeaser}
            className="absolute inset-e-1.5 top-1.5 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={copy.dismiss}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={openChat} className="pe-4 text-start leading-snug">
            <span className="block font-medium text-foreground">{copy.teaserLine1}</span>
            <span className="block font-medium text-foreground">{copy.teaserLine2}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{copy.online}</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        className={cn(
          "pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg transition hover:scale-105",
          isExtraHosting
            ? "bg-[#0a4f9c] hover:bg-[#083d7a]"
            : "bg-primary hover:bg-primary/90",
        )}
        aria-label={open ? copy.closeChat : copy.openChat}
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
        {!open && ticket ? (
          <span className="absolute -inset-e-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-background" />
        ) : null}
      </button>
    </div>
  );
}

/** Compact staff to-do panel used on dashboards only */
export function StaffTodoPanel({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("liveChat");
  const [todos, setTodos] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/todos");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    setTodos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (!res.ok) return;
    setTitle("");
    void load();
  }

  async function toggle(id: string, done: boolean) {
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    void load();
  }

  async function remove(id: string) {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card/60 p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold">
            {t("todoTitle")}
          </h3>
        </div>
        <SoftLink
          href={localizedHref(locale, "/todos")}
          className="text-xs text-primary hover:underline"
        >
          {t("todoViewAll")}
        </SoftLink>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {todos.slice(0, 6).map((todo) => (
            <li key={todo.id} className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => void toggle(todo.id, todo.done)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                  todo.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
                aria-label={t("toggleDone")}
              >
                {todo.done ? "✓" : null}
              </button>
              <span className={cn("min-w-0 flex-1", todo.done && "text-muted-foreground line-through")}>
                {todo.title}
              </span>
              <button
                type="button"
                onClick={() => void remove(todo.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </li>
          ))}
          {!todos.length ? (
            <li className="text-sm text-muted-foreground">
              {t("todoEmpty")}
            </li>
          ) : null}
        </ul>
      )}
      <form onSubmit={addTodo} className="mt-3 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("todoPlaceholder")}
          className="h-9"
        />
        <Button type="submit" size="sm" className="shrink-0">
          {t("todoAdd")}
        </Button>
      </form>
    </div>
  );
}
