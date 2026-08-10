"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export default function TodosPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Todo[];
    },
  });

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setTitle("");
    void qc.invalidateQueries({ queryKey: ["todos"] });
  }

  async function toggle(todo: Todo) {
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id, done: !todo.done }),
    });
    void qc.invalidateQueries({ queryKey: ["todos"] });
  }

  async function remove(id: string) {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    void qc.invalidateQueries({ queryKey: ["todos"] });
  }

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("todos")}</h1>
        <p className="text-sm text-muted-foreground">
          {locale === "nl"
            ? "Interne to-do lijst — alleen zichtbaar voor admin en manager, nooit publiek of voor clients."
            : "Internal to-do list — visible only to admin and manager dashboards, never public or for clients."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "nl" ? "Nieuwe taak" : "New task"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTodo} className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={locale === "nl" ? "Wat moet er gebeuren?" : "What needs doing?"}
            />
            <Button type="submit">{locale === "nl" ? "Toevoegen" : "Add"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {locale === "nl" ? "Open" : "Open"} ({open.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {open.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
            >
              <button
                type="button"
                onClick={() => void toggle(todo)}
                className="flex h-5 w-5 items-center justify-center rounded border border-border"
              />
              <span className="min-w-0 flex-1 text-sm">{todo.title}</span>
              <Button size="sm" variant="ghost" onClick={() => void remove(todo.id)}>
                ×
              </Button>
            </div>
          ))}
          {!isLoading && !open.length ? (
            <p className="text-sm text-muted-foreground">
              {locale === "nl" ? "Alles afgerond." : "All clear."}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {done.length ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === "nl" ? "Afgerond" : "Done"} ({done.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {done.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2 opacity-70"
              >
                <button
                  type="button"
                  onClick={() => void toggle(todo)}
                  className="flex h-5 w-5 items-center justify-center rounded border border-primary bg-primary text-[10px] text-primary-foreground"
                >
                  ✓
                </button>
                <span className={cn("min-w-0 flex-1 text-sm line-through")}>{todo.title}</span>
                <Button size="sm" variant="ghost" onClick={() => void remove(todo.id)}>
                  ×
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
