"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  subject: string | null;
  body: string;
  createdAt: string;
  readAt: string | null;
  fromUserId: string;
  toUserId: string;
  fromUser: { id: string; name: string | null; email: string };
  toUser: { id: string; name: string | null; email: string };
};

type UserOption = { id: string; name: string | null; email: string; role: string };

export default function CrmMessagesPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [toUserId, setToUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["crm-messages"],
    queryFn: async () => {
      const res = await fetch("/api/crm/messages");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Msg[];
    },
    refetchInterval: 8000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["crm-recipients"],
    queryFn: async () => {
      const res = await fetch("/api/crm/recipients");
      if (!res.ok) return [];
      return (await res.json()) as UserOption[];
    },
  });

  const recipients = users.filter((u) => u.id !== session?.user?.id);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!toUserId || !body.trim()) return;
    const res = await fetch("/api/crm/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, subject, body: body.trim() }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setBody("");
    setSubject("");
    void qc.invalidateQueries({ queryKey: ["crm-messages"] });
  }

  async function markRead(id: string) {
    await fetch("/api/crm/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void qc.invalidateQueries({ queryKey: ["crm-messages"] });
  }

  return (
    <CrmShell title={t("messages")} subtitle={t("messagesSubtitle")}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("compose")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={send} className="space-y-3">
              <select
                className="h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                required
              >
                <option value="">{t("selectRecipient")}</option>
                {recipients.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
              {!recipients.length ? (
                <p className="text-xs text-muted-foreground">{t("clientMessageHint")}</p>
              ) : null}
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subject")}
              />
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder={t("messageBody")}
              />
              <Button type="submit">{t("send")}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("inbox")}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] space-y-2 overflow-y-auto">
            {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
            {messages.map((msg) => {
              const incoming = msg.toUserId === session?.user?.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => {
                    if (incoming && !msg.readAt) void markRead(msg.id);
                  }}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2 text-left text-sm",
                    incoming && !msg.readAt
                      ? "border-primary/40 bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {incoming
                        ? msg.fromUser.name || msg.fromUser.email
                        : `→ ${msg.toUser.name || msg.toUser.email}`}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {msg.subject ? (
                    <p className="text-xs font-medium text-muted-foreground">{msg.subject}</p>
                  ) : null}
                  <p className="mt-1 line-clamp-2">{msg.body}</p>
                </button>
              );
            })}
            {!isLoading && !messages.length ? (
              <p className="text-sm text-muted-foreground">{t("emptyMessages")}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </CrmShell>
  );
}
