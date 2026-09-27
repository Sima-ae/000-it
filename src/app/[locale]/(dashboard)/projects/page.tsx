"use client";

import { useLocale, useTranslations } from "next-intl";
import { useStatusI18n } from "@/hooks/useStatusI18n";
import { useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FolderKanban, Plus } from "lucide-react";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { isStaffRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { localizedHref } from "@/i18n/pathnames";

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

type ProjectTypeKey =
  | "projectType_WEBSITE"
  | "projectType_SEO"
  | "projectType_ADS"
  | "projectType_AI_INTEGRATION"
  | "projectType_CONTENT"
  | "projectType_SOCIAL_MEDIA"
  | "projectType_BRANDING"
  | "projectType_FULL_GROWTH";

function projectTypeLabel(
  t: (key: ProjectTypeKey) => string,
  type: string,
) {
  const key = `projectType_${type}` as ProjectTypeKey;
  if (
    type === "WEBSITE" ||
    type === "SEO" ||
    type === "ADS" ||
    type === "AI_INTEGRATION" ||
    type === "CONTENT" ||
    type === "SOCIAL_MEDIA" ||
    type === "BRANDING" ||
    type === "FULL_GROWTH"
  ) {
    return t(key);
  }
  return type.replaceAll("_", " ");
}

type ProjectListItem = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  type: string;
  progress: number;
  coverImage?: string | null;
  updatedAt?: string;
  _count?: { tasks: number; clients: number; crmNotes: number };
  clients?: { id: string; name: string; company: string | null }[];
};

export default function ProjectsPage() {
  const t = useTranslations("dashboard");
  const status = useStatusI18n();
  const locale = useLocale();
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof PROJECT_TYPES)[number]>("FULL_GROWTH");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createProject.mutateAsync({
        name,
        type,
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      toast.success(t("projectCreated"));
      if (created?.id) {
        window.location.href = `/${locale}/projects/${created.id}`;
      }
    } catch {
      toast.error(t("projectCreateFailed"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-primary">
            <FolderKanban className="h-3.5 w-3.5" />
            {t("projects")}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("projects")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("projectWorkspaceSubtitle")}
          </p>
        </div>
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/crm")}>{t("crm")}</SoftLink>
        </Button>
      </div>

      {staff ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              {t("newProject")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
              <div className="space-y-1 md:col-span-2">
                <Label>{t("name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t("name")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("type")}</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as (typeof PROJECT_TYPES)[number])
                  }
                >
                  {PROJECT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {projectTypeLabel(t, item)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>{t("projectCreateDescription")}</Label>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createProject.isPending}
                >
                  {t("create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground">{t("working")}</p>
      ) : !projects.length ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">{t("emptyProjects")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("projectsEmptyHint")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(projects as ProjectListItem[]).map((project) => (
            <SoftLink key={project.id} href={`/${locale}/projects/${project.id}`}>
              <Card className="h-full overflow-hidden transition hover:border-primary/40">
                {project.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.coverImage}
                    alt=""
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/10">
                    <FolderKanban className="h-8 w-8 text-primary/50" />
                  </div>
                )}
                <CardHeader className="flex-row items-start justify-between space-y-0 gap-2 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{project.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {projectTypeLabel(t, project.type)}
                    </p>
                  </div>
                  <Badge>{status.projectStatus(project.status)}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                  <Progress value={project.progress} />
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {t("projectProgress")}: {project.progress}%
                    </span>
                    <span>
                      {t("projectTasks")}: {project._count?.tasks ?? 0}
                    </span>
                    <span>
                      {t("clients")}: {project._count?.clients ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </SoftLink>
          ))}
        </div>
      )}
    </div>
  );
}
