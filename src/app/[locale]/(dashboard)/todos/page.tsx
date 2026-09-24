"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Todo[];
    },
  });

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("todoSaveFailed"));
      return;
    }
    setTitle("");
    toast.success(t("todoSaved"));
    void qc.invalidateQueries({ queryKey: ["todos"] });
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editTitle.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("todoSaveFailed"));
      return;
    }
    cancelEdit();
    toast.success(t("todoSaved"));
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
    const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("todoDeleteFailed"));
      return;
    }
    if (editingId === id) cancelEdit();
    toast.success(t("todoDeleted"));
    void qc.invalidateQueries({ queryKey: ["todos"] });
  }

  const open = todos.filter((todo) => !todo.done);
  const done = todos.filter((todo) => todo.done);

  function renderTodo(todo: Todo) {
    const isEditing = editingId === todo.id;
    return (
      <div
        key={todo.id}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-3 py-2",
          todo.done ? "border-border/60 opacity-70" : "border-border",
        )}
      >
        <button
          type="button"
          onClick={() => void toggle(todo)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px]",
            todo.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border",
          )}
        >
          {todo.done ? "✓" : null}
        </button>
        {isEditing ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-8 min-w-0 flex-1 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void saveEdit(todo.id);
                }
                if (e.key === "Escape") cancelEdit();
              }}
            />
            <Button
              size="sm"
              onClick={() => void saveEdit(todo.id)}
              disabled={saving || !editTitle.trim()}
            >
              {t("save")}
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              {t("cancel")}
            </Button>
          </div>
        ) : (
          <>
            <span
              className={cn(
                "min-w-0 flex-1 text-sm",
                todo.done && "text-muted-foreground line-through",
              )}
            >
              {todo.title}
            </span>
            <Button size="sm" variant="outline" onClick={() => startEdit(todo)}>
              {t("edit")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void remove(todo.id)}>
              ×
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("todos")}</h1>
        <p className="text-sm text-muted-foreground">{t("todosSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("newTask")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTodo} className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("taskPlaceholder")}
            />
            <Button type="submit" disabled={saving}>
              {t("add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("open")} ({open.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {open.map(renderTodo)}
          {!isLoading && !open.length ? (
            <p className="text-sm text-muted-foreground">{t("allClear")}</p>
          ) : null}
        </CardContent>
      </Card>

      {done.length ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("done")} ({done.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">{done.map(renderTodo)}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
