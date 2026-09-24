"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canDelete } from "@/lib/roles";
import { useSession } from "next-auth/react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: { id: string; name: string };
};

type Project = { id: string; name: string };

const columns = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function CrmTasksPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const qc = useQueryClient();
  const showDelete = canDelete(session?.user?.role);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["crm-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Task[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Project[];
    },
  });

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of columns) map[col] = [];
    for (const task of tasks) {
      (map[task.status] || (map[task.status] = [])).push(task);
    }
    return map;
  }, [tasks]);

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority || "MEDIUM");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditPriority("MEDIUM");
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        projectId,
        priority,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("taskSaveFailed"));
      return;
    }
    setTitle("");
    setPriority("MEDIUM");
    toast.success(t("taskSaved"));
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: editTitle.trim(),
        priority: editPriority,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("taskSaveFailed"));
      return;
    }
    cancelEdit();
    toast.success(t("taskSaved"));
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  async function move(id: string, status: string) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error(t("taskSaveFailed"));
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  async function confirmDelete() {
    if (!showDelete || !deleteTarget) return;
    setDeleting(true);
    const id = deleteTarget.id;
    const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error(t("taskDeleteFailed"));
      return;
    }
    if (editingId === id) cancelEdit();
    setDeleteTarget(null);
    toast.success(t("taskDeleted"));
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  return (
    <CrmShell title={t("tasks")} subtitle={t("tasksSubtitle")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("addTask")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="flex flex-wrap gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("taskTitle")}
              className="min-w-50 flex-1"
              required
            />
            <select
              className="h-10 rounded-lg border border-input bg-muted/40 px-3 text-sm"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">{t("selectProject")}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-input bg-muted/40 px-3 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={saving}>
              {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <Card key={col}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{col.replace("_", " ")}</span>
                <Badge variant="secondary">{grouped[col]?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(grouped[col] || []).map((task) => {
                const isEditing = editingId === task.id;
                return (
                  <div key={task.id} className="rounded-xl border border-border p-3 text-sm">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <select
                          className="h-8 w-full rounded-lg border border-input bg-muted/40 px-2 text-xs"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                        >
                          {priorities.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            onClick={() => void saveEdit(task.id)}
                            disabled={saving || !editTitle.trim()}
                          >
                            {t("save")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            {t("cancel")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.project.name}
                          {task.priority ? ` · ${task.priority}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <select
                            className="h-8 rounded-lg border border-input bg-muted/40 px-2 text-xs"
                            value={task.status}
                            onChange={(e) => void move(task.id, e.target.value)}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" variant="outline" onClick={() => startEdit(task)}>
                            {t("edit")}
                          </Button>
                          {showDelete ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-600/10 hover:text-red-700"
                              aria-label={t("deleteTask")}
                              onClick={() => setDeleteTarget(task)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="w-[min(96vw,28rem)] gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">{t("deleteTaskTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteTaskConfirm", { title: deleteTarget?.title ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {t("deleteTask")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
