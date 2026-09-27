"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useStatusI18n } from "@/hooks/useStatusI18n";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  "WEBSITE",
  "SEO",
  "ADS",
  "AI_INTEGRATION",
  "CONTENT",
  "SOCIAL_MEDIA",
  "BRANDING",
  "FULL_GROWTH",
] as const;

const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;

type Gallery = string[];

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  coverImage: string | null;
  gallery: Gallery | null;
  status: string;
  type: string;
  budget: number | null;
  progress: number;
  startDate: string;
  endDate: string | null;
  updatedAt: string;
  canEdit?: boolean;
  canDelete?: boolean;
  user?: { id: string; name: string | null; email: string | null };
  tasks?: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  activities?: { id: string; description: string; createdAt: string }[];
  crmNotes?: {
    id: string;
    body: string;
    createdAt: string;
    user?: { name: string | null };
  }[];
  clients?: {
    id: string;
    name: string;
    company: string | null;
    email: string;
  }[];
  aiAgents?: { id: string; name: string; type: string; status: string }[];
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function asGallery(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

export default function ProjectDetailPage() {
  const t = useTranslations("dashboard");
  const statusI18n = useStatusI18n();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as ProjectDetail;
    },
  });

  const canEdit = Boolean(data?.canEdit);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<string>("FULL_GROWTH");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [progress, setProgress] = useState(0);
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setName(data.name || "");
    setDescription(data.description || "");
    setNotes(data.notes || "");
    setType(data.type || "FULL_GROWTH");
    setStatus(data.status || "ACTIVE");
    setProgress(data.progress ?? 0);
    setBudget(data.budget != null ? String(data.budget) : "");
    setStartDate(toDateInput(data.startDate));
    setEndDate(toDateInput(data.endDate));
    setCoverImage(data.coverImage || null);
    setGallery(asGallery(data.gallery));
  }, [data]);

  const typeLabel = (value: string) => {
    const key = `projectType_${value}` as Parameters<typeof t>[0];
    try {
      return t(key);
    } catch {
      return value.replaceAll("_", " ");
    }
  };

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/projects/upload", { method: "POST", body });
      if (!res.ok) throw new Error("upload");
      const json = (await res.json()) as { url: string };
      setGallery((prev) => [...prev, json.url]);
      if (!coverImage) setCoverImage(json.url);
      toast.success(t("projectImageUploaded"));
      return json.url;
    } catch {
      toast.error(t("projectImageFailed"));
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function saveProject() {
    if (!canEdit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          notes: notes.trim() || null,
          type,
          status,
          progress: Number(progress) || 0,
          budget: budget.trim() === "" ? null : Number(budget),
          startDate: startDate || null,
          endDate: endDate || null,
          coverImage,
          gallery,
        }),
      });
      if (!res.ok) throw new Error("save");
      toast.success(t("projectSaved"));
      void qc.invalidateQueries({ queryKey: ["project", params.id] });
      void qc.invalidateQueries({ queryKey: ["projects"] });
    } catch {
      toast.error(t("projectSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete");
    },
    onSuccess: () => {
      toast.success(t("projectDeleted"));
      router.push(localizedHref(locale, "/projects"));
    },
    onError: () => toast.error(t("projectDeleteFailed")),
  });

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !taskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle.trim(),
        projectId: params.id,
      }),
    });
    if (!res.ok) {
      toast.error(t("projectTaskFailed"));
      return;
    }
    setTaskTitle("");
    toast.success(t("projectTaskAdded"));
    void qc.invalidateQueries({ queryKey: ["project", params.id] });
  }

  async function updateTaskStatus(id: string, next: string) {
    if (!canEdit) return;
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (!res.ok) {
      toast.error(t("projectSaveFailed"));
      return;
    }
    toast.success(t("projectTaskUpdated"));
    void qc.invalidateQueries({ queryKey: ["project", params.id] });
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !noteBody.trim()) return;
    const res = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: noteBody.trim(), projectId: params.id }),
    });
    if (!res.ok) {
      toast.error(t("projectNoteFailed"));
      return;
    }
    setNoteBody("");
    toast.success(t("projectNoteAdded"));
    void qc.invalidateQueries({ queryKey: ["project", params.id] });
  }

  const openTasks = useMemo(
    () =>
      (data?.tasks || []).filter((task) => task.status !== "COMPLETED").length,
    [data?.tasks],
  );

  if (isLoading) {
    return <p className="text-muted-foreground">{t("working")}</p>;
  }
  if (error || !data) {
    return <p className="text-muted-foreground">{t("loadFailed")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
            <SoftLink href={localizedHref(locale, "/projects")}>
              <ArrowLeft className="h-4 w-4" />
              {t("projectBack")}
            </SoftLink>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {data.name}
            </h1>
            <Badge variant="secondary">{statusI18n.projectStatus(data.status)}</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("projectWorkspaceSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {t("projectOwner")}: {data.user?.name || data.user?.email || "—"}
            </span>
            <span>
              {t("projectUpdatedAt")}:{" "}
              {new Date(data.updatedAt).toLocaleString(locale)}
            </span>
            <span>
              {t("projectTasks")}: {openTasks}/{(data.tasks || []).length}
            </span>
          </div>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void saveProject()} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {t("projectSave")}
            </Button>
            {data.canDelete ? (
              <Button
                variant="outline"
                className="text-destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm(t("projectDeleteConfirm"))) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {t("projectDelete")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {coverImage ? (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt=""
            className="h-48 w-full object-cover md:h-64"
          />
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("projectDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>{t("name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("type")}</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm disabled:opacity-60"
                  value={type}
                  disabled={!canEdit}
                  onChange={(e) => setType(e.target.value)}
                >
                  {PROJECT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {typeLabel(item)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t("projectStatus")}</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm disabled:opacity-60"
                  value={status}
                  disabled={!canEdit}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {PROJECT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {statusI18n.projectStatus(item)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t("projectBudget")}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={budget}
                  disabled={!canEdit}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>
                  {t("projectProgress")} ({progress}%)
                </Label>
                <Input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  disabled={!canEdit}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
                <Progress value={progress} className="mt-2" />
              </div>
              <div className="space-y-1">
                <Label>{t("projectStartDate")}</Label>
                <Input
                  type="date"
                  value={startDate}
                  disabled={!canEdit}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("projectEndDate")}</Label>
                <Input
                  type="date"
                  value={endDate}
                  disabled={!canEdit}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>{t("projectDescription")}</Label>
                <Textarea
                  rows={4}
                  value={description}
                  disabled={!canEdit}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("projectNotes")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("projectNotesHint")}</p>
              <Textarea
                rows={8}
                value={notes}
                disabled={!canEdit}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("projectNotePlaceholder")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{t("projectGallery")}</CardTitle>
              {canEdit ? (
                <label
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-primary/40",
                    uploading && "pointer-events-none opacity-60",
                  )}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploading ? t("projectUploading") : t("projectUploadImage")}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              ) : null}
            </CardHeader>
            <CardContent>
              {!gallery.length && !coverImage ? (
                <p className="text-sm text-muted-foreground">{t("projectNoImages")}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {gallery.map((url) => (
                    <div
                      key={url}
                      className="group relative overflow-hidden rounded-xl border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="aspect-square w-full object-cover" />
                      {canEdit ? (
                        <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/55 p-1.5 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            className="flex-1 rounded bg-white/90 px-1 py-0.5 text-[10px] font-medium text-foreground"
                            onClick={() => setCoverImage(url)}
                          >
                            {t("projectSetCover")}
                          </button>
                          <button
                            type="button"
                            className="rounded bg-white/90 px-1 py-0.5 text-[10px] font-medium text-destructive"
                            onClick={() => {
                              setGallery((prev) => {
                                const next = prev.filter((item) => item !== url);
                                setCoverImage((current) =>
                                  current === url ? next[0] || null : current,
                                );
                                return next;
                              });
                            }}
                          >
                            {t("projectRemoveImage")}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("projectTasks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit ? (
              <form onSubmit={addTask} className="flex gap-2">
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={t("projectTaskTitle")}
                />
                <Button type="submit" disabled={!taskTitle.trim()}>
                  {t("projectAddTask")}
                </Button>
              </form>
            ) : null}
            <div className="space-y-2">
              {(data.tasks || []).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 font-medium">{task.title}</span>
                  {canEdit ? (
                    <select
                      className="h-8 rounded-md border border-input bg-muted/40 px-2 text-xs"
                      value={task.status}
                      onChange={(e) => void updateTaskStatus(task.id, e.target.value)}
                    >
                      {TASK_STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {statusI18n.taskStatus(item)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="outline">{statusI18n.taskStatus(task.status)}</Badge>
                  )}
                </div>
              ))}
              {!data.tasks?.length ? (
                <p className="text-sm text-muted-foreground">{t("noTasksYet")}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("projectTimelineNotes")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit ? (
              <form onSubmit={addNote} className="space-y-2">
                <Textarea
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder={t("projectNotePlaceholder")}
                />
                <Button type="submit" disabled={!noteBody.trim()}>
                  {t("projectAddNote")}
                </Button>
              </form>
            ) : null}
            <div className="space-y-2">
              {(data.crmNotes || []).map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm"
                >
                  <p className="whitespace-pre-wrap">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.user?.name || "—"} ·{" "}
                    {new Date(note.createdAt).toLocaleString(locale)}
                  </p>
                </div>
              ))}
              {!data.crmNotes?.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("projectNoTimelineNotes")}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("projectClients")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data.clients || []).map((client) => (
              <SoftLink
                key={client.id}
                href={`/${locale}/crm/clients/${client.id}`}
                className="block rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/40"
              >
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">
                  {client.company || client.email}
                </p>
              </SoftLink>
            ))}
            {!data.clients?.length ? (
              <p className="text-sm text-muted-foreground">{t("projectNoClients")}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("projectAgents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data.aiAgents || []).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{agent.name}</span>
                <Badge variant="outline">{statusI18n.agentStatus(agent.status)}</Badge>
              </div>
            ))}
            {!data.aiAgents?.length ? (
              <p className="text-sm text-muted-foreground">{t("projectNoAgents")}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("projectActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data.activities || []).map((activity) => (
              <div key={activity.id} className="text-sm">
                <p>{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleString(locale)}
                </p>
              </div>
            ))}
            {!data.activities?.length ? (
              <p className="text-sm text-muted-foreground">{t("emptyActivity")}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
