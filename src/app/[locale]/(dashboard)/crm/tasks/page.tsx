"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CrmTasksPage() {
  const t = useTranslations("crm");
  const { data: session } = useSession();
  const qc = useQueryClient();
  const showDelete = canDelete(session?.user?.role);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");

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

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), projectId }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setTitle("");
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  async function move(id: string, status: string) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["crm-tasks"] });
  }

  async function remove(id: string) {
    const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
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
            <Button type="submit">{t("save")}</Button>
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
              {(grouped[col] || []).map((task) => (
                <div key={task.id} className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.project.name}</p>
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
                    {showDelete ? (
                      <Button size="sm" variant="ghost" onClick={() => void remove(task.id)}>
                        ×
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </CrmShell>
  );
}
