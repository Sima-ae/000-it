"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  MessageCircle,
  Minus,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SoftLink } from "@/components/shared/SoftLink";
import { isStaffRole } from "@/lib/roles";

type ChatMessage = {
  id: string;
  body: string;
  senderKind: string;
  createdAt: string;
  sender?: { name: string | null } | null;
};

type TicketDetail = {
  id: string;
  subject: string;
  status: string;
  messages: ChatMessage[];
  guestToken?: string;
};

const STORAGE_KEY = "tz-live-chat";

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

export function LiveChatWidget() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const isStaff = isStaffRole(session?.user?.role);
  const isAuthPage = /\/(login|register|forgot-password)/.test(pathname);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "ticket">("chat");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [guestToken, setGuestToken] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loggedIn = status === "authenticated" && !!session?.user;

  const restore = useCallback(async () => {
    const stored = loadStored();
    if (!stored?.ticketId) return;
    setGuestToken(stored.guestToken);
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

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages, open]);

  // Poll for new messages while open
  useEffect(() => {
    if (!open || !ticket?.id) return;
    const timer = setInterval(async () => {
      const qs = guestToken ? `?token=${encodeURIComponent(guestToken)}` : "";
      const res = await fetch(`/api/tickets/${ticket.id}${qs}`);
      if (!res.ok) return;
      const data = (await res.json()) as TicketDetail;
      setTicket(data);
    }, 3500);
    return () => clearInterval(timer);
  }, [open, ticket?.id, guestToken]);

  const needsIdentity = !loggedIn && !ticket;

  const headerTitle = useMemo(() => {
    if (mode === "ticket") return locale === "nl" ? "Nieuw ticket" : "New ticket";
    return locale === "nl" ? "Live chat" : "Live chat";
  }, [mode, locale]);

  async function startConversation(opts: {
    subject: string;
    message: string;
    source: "CHAT" | "DASHBOARD";
  }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: opts.subject,
          message: opts.message,
          source: opts.source,
          guestName: loggedIn ? undefined : guestName,
          guestEmail: loggedIn ? undefined : guestEmail,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      const data = await res.json();
      const token = data.guestToken as string | undefined;
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
      setMode("chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || !ticket) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, guestToken }),
      });
      if (!res.ok) throw new Error("Send failed");
      const msg = await res.json();
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : prev,
      );
      setDraft("");
    } catch {
      setError(locale === "nl" ? "Versturen mislukt" : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  async function handlePrimarySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "ticket") {
      if (!subject.trim() || !draft.trim()) return;
      if (needsIdentity && (!guestName.trim() || !guestEmail.trim())) return;
      await startConversation({
        subject: subject.trim(),
        message: draft.trim(),
        source: "CHAT",
      });
      return;
    }

    if (!ticket) {
      if (!draft.trim()) return;
      if (needsIdentity && (!guestName.trim() || !guestEmail.trim())) return;
      await startConversation({
        subject:
          locale === "nl"
            ? `Live chat — ${guestName || session?.user?.name || "bezoeker"}`
            : `Live chat — ${guestName || session?.user?.name || "visitor"}`,
        message: draft.trim(),
        source: "CHAT",
      });
      return;
    }

    await sendMessage();
  }

  // Staff use the tickets inbox instead of the visitor widget
  if (isStaff || isAuthPage) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-100 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(34rem,calc(100svh-6rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-linear-to-r from-primary/15 to-accent/10 px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">{headerTitle}</p>
              <p className="text-[11px] text-muted-foreground">
                {locale === "nl" ? "TripleZero iT support" : "TripleZero iT support"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border/60 px-2 py-2">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                mode === "chat" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("ticket")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                mode === "ticket" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <Ticket className="h-3.5 w-3.5" />
              {locale === "nl" ? "Nieuw ticket" : "New ticket"}
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {mode === "chat" && ticket?.messages?.length ? (
              ticket.messages.map((msg) => {
                const mine =
                  msg.senderKind === "GUEST" ||
                  msg.senderKind === "CLIENT";
                return (
                  <div
                    key={msg.id}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {!mine ? (
                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                          {msg.sender?.name || "Support"}
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap">{msg.body}</p>
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
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                {mode === "ticket"
                  ? locale === "nl"
                    ? "Beschrijf je vraag — we openen een ticket dat zichtbaar is in je dashboard."
                    : "Describe your request — we’ll open a ticket synced to your dashboard."
                  : locale === "nl"
                    ? "Stel je vraag. Ons team antwoordt zo snel mogelijk."
                    : "Ask a question. Our team will reply as soon as possible."}
                {loggedIn ? (
                  <p className="mt-2">
                    <SoftLink
                      href={`/${locale}/tickets`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {locale === "nl" ? "Bekijk tickets" : "View tickets"}
                    </SoftLink>
                  </p>
                ) : null}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handlePrimarySubmit} className="space-y-2 border-t border-border/70 p-3">
            {needsIdentity ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">{locale === "nl" ? "Naam" : "Name"}</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
              </div>
            ) : null}

            {mode === "ticket" ? (
              <div className="space-y-1">
                <Label className="text-xs">{locale === "nl" ? "Onderwerp" : "Subject"}</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={locale === "nl" ? "Waar gaat het over?" : "What is this about?"}
                  required
                  className="h-9"
                />
              </div>
            ) : null}

            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  locale === "nl" ? "Typ je bericht…" : "Type your message…"
                }
                rows={2}
                className="min-h-16 resize-none"
                required
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={busy}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-105 hover:shadow-xl"
        aria-label="Open live chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && ticket ? (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-background" />
        ) : null}
      </button>
    </div>
  );
}

/** Compact staff to-do panel used on dashboards only */
export function StaffTodoPanel({ className }: { className?: string }) {
  const locale = useLocale();
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
            {locale === "nl" ? "To-do lijst" : "To-do list"}
          </h3>
        </div>
        <SoftLink
          href={`/${locale}/todos`}
          className="text-xs text-primary hover:underline"
        >
          {locale === "nl" ? "Alles" : "View all"}
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
                aria-label="Toggle"
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
              {locale === "nl" ? "Nog geen to-dos." : "No to-dos yet."}
            </li>
          ) : null}
        </ul>
      )}
      <form onSubmit={addTodo} className="mt-3 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={locale === "nl" ? "Nieuwe taak…" : "New task…"}
          className="h-9"
        />
            <Button type="submit" size="sm" className="shrink-0">
          {locale === "nl" ? "Toevoegen" : "Add"}
        </Button>
      </form>
    </div>
  );
}
