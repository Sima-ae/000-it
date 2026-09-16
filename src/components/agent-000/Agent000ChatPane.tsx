"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Calendar,
  HelpCircle,
  Mail,
  Mic,
  MicOff,
  Send,
  Ticket,
} from "lucide-react";
import { Agent000Avatar, type Agent000State } from "@/components/agent-000/Agent000Avatar";
import { useAgentSpeech } from "@/components/agent-000/useAgentSpeech";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";
import type { AgentAction, AgentLink } from "@/lib/agent-000/ask";

export type AgentAskResponse = {
  answer: string;
  faqId: string | null;
  categoryId: string | null;
  matchedQuestion: string | null;
  confidence: number;
  actions: AgentAction[];
  mode?: "answer" | "clarify";
  links?: AgentLink[];
};

type ChatTurn = {
  id: string;
  role: "user" | "agent";
  text: string;
  faqId?: string | null;
  actions?: AgentAction[];
  mode?: "answer" | "clarify";
  links?: AgentLink[];
};

type Props = {
  className?: string;
  /** Called when Agent matches a FAQ item — parent can highlight accordion */
  onMatchFaq?: (faqId: string | null, categoryId: string | null) => void;
  /** Open live chat with optional prefills */
  onOpenLiveChat?: (prefill?: string) => void;
  initialQuestion?: string;
};

export function Agent000ChatPane({
  className,
  onMatchFaq,
  onOpenLiveChat,
  initialQuestion,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("agent000");
  const { muted, setMuted, speaking, speak, cancel } = useAgentSpeech(locale);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);
  const lastClarifyLinks = useRef<AgentLink[]>([]);

  const state: Agent000State = busy ? "thinking" : speaking ? "speaking" : "idle";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  const ask = useCallback(
    async (question: string, opts?: { faqId?: string }) => {
      const q = question.trim();
      if (!q || busy) return;
      setBusy(true);
      cancel();
      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: "user",
        text: q,
      };
      setTurns((prev) => [...prev, userTurn]);
      setDraft("");
      try {
        const res = await fetch("/api/agent-000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            question: q,
            persist: false,
            faqId: opts?.faqId,
          }),
        });
        if (!res.ok) throw new Error("ask failed");
        const data = (await res.json()) as AgentAskResponse;
        const links = data.links || [];
        if (data.mode === "clarify") lastClarifyLinks.current = links;
        else lastClarifyLinks.current = [];

        const agentTurn: ChatTurn = {
          id: `a-${Date.now()}`,
          role: "agent",
          text: data.answer,
          faqId: data.faqId,
          actions: data.actions,
          mode: data.mode || "answer",
          links,
        };
        setTurns((prev) => [...prev, agentTurn]);
        onMatchFaq?.(data.faqId, data.categoryId);
        speak(data.answer);
      } catch {
        const fail: ChatTurn = {
          id: `a-err-${Date.now()}`,
          role: "agent",
          text: t("error"),
          actions: ["open_ticket", "contact"],
        };
        setTurns((prev) => [...prev, fail]);
      } finally {
        setBusy(false);
      }
    },
    [busy, cancel, locale, onMatchFaq, speak, t],
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (initialQuestion?.trim()) {
      void ask(initialQuestion.trim());
    }
  }, [ask, initialQuestion]);

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

  function submitDraft() {
    const raw = draft.trim();
    if (!raw || busy) return;
    const pick = resolveClarifyPick(raw);
    if (pick?.kind === "faq" && pick.faqId) {
      void ask(pick.askQuestion || pick.title, { faqId: pick.faqId });
      return;
    }
    if (pick?.kind === "kennisbank") {
      // Surface the article choice as a focused re-ask on the title.
      void ask(pick.title);
      return;
    }
    void ask(raw);
  }

  function pickLink(link: AgentLink) {
    if (busy) return;
    if (link.kind === "faq" && link.faqId) {
      void ask(link.askQuestion || link.title, { faqId: link.faqId });
      return;
    }
    void ask(link.title);
  }

  function renderLinks(links?: AgentLink[], mode?: "answer" | "clarify") {
    if (!links?.length) return null;
    return (
      <div className="mt-2 space-y-1.5">
        {mode === "clarify" ? (
          <p className="text-[10px] font-medium uppercase tracking-wide text-cyan-300/80">
            {t("pickOption")}
          </p>
        ) : (
          <p className="text-[10px] font-medium uppercase tracking-wide text-cyan-300/80">
            {t("relatedLinks")}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {links.map((link, index) => (
            <div
              key={`${link.kind}-${link.href}-${index}`}
              className="flex flex-wrap items-center gap-1.5"
            >
              {mode === "clarify" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 max-w-full rounded-lg text-left text-xs"
                  onClick={() => pickLink(link)}
                >
                  {link.kind === "kennisbank" ? (
                    <BookOpen className="mr-1 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <HelpCircle className="mr-1 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {index + 1}. {link.title}
                  </span>
                </Button>
              ) : null}
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 max-w-full rounded-lg border-white/20 bg-white/5 text-left text-xs text-slate-100 hover:bg-white/10"
              >
                <SoftLink
                  href={link.href}
                  onClick={() => {
                    if (link.kind === "faq" && link.faqId) {
                      onMatchFaq?.(link.faqId, link.categoryId || null);
                    }
                  }}
                >
                  {link.kind === "kennisbank" ? (
                    <BookOpen className="mr-1 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <HelpCircle className="mr-1 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {link.kind === "kennisbank" ? t("linkKb") : t("linkFaq")}:{" "}
                    {link.title}
                  </span>
                </SoftLink>
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderActions(actions?: AgentAction[]) {
    if (!actions?.length) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {actions.includes("book_appointment") ? (
          <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs">
            <SoftLink href={localizedHref(locale, "/afspraak")}>
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {t("actionBook")}
            </SoftLink>
          </Button>
        ) : null}
        {actions.includes("open_ticket") ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 rounded-lg text-xs"
            onClick={() => onOpenLiveChat?.(draft || undefined)}
          >
            <Ticket className="mr-1 h-3.5 w-3.5" />
            {t("actionTicket")}
          </Button>
        ) : null}
        {actions.includes("contact") ? (
          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
            <SoftLink href={localizedHref(locale, "/contact")}>
              <Mail className="mr-1 h-3.5 w-3.5" />
              {t("actionContact")}
            </SoftLink>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-50 shadow-lg",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-stretch md:gap-6 md:p-6">
        <div className="flex flex-col items-center justify-center md:w-[42%]">
          <Agent000Avatar state={state} size="lg" />
          <p className="mt-2 font-display text-sm font-semibold tracking-tight text-cyan-100">
            {t("name")}
          </p>
          <p className="text-center text-[11px] text-slate-400">{t("role")}</p>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
            aria-pressed={muted}
          >
            {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {muted ? t("unmute") : t("mute")}
          </button>
        </div>

        <div className="flex min-h-56 flex-1 flex-col rounded-xl border border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="min-h-40 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {!turns.length && !busy ? (
              <p className="text-sm leading-relaxed text-slate-300">{t("intro")}</p>
            ) : null}
            {turns.map((turn) => (
              <div
                key={turn.id}
                className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    turn.role === "user"
                      ? "bg-cyan-500/90 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-100",
                  )}
                >
                  {turn.role === "agent" ? (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300/90">
                      {t("name")}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                  {turn.role === "agent" ? renderLinks(turn.links, turn.mode) : null}
                  {turn.role === "agent" ? renderActions(turn.actions) : null}
                </div>
              </div>
            ))}
            {busy ? (
              <p className="text-xs text-cyan-300/80">{t("thinking")}</p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/10 p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              submitDraft();
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("placeholder")}
              className="h-10 rounded-xl border-white/15 bg-white/5 text-slate-50 placeholder:text-slate-500"
              aria-label={t("placeholder")}
              disabled={busy}
            />
            <Button
              type="submit"
              size="icon"
              disabled={busy || !draft.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              aria-label={t("send")}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
