"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { toast } from "sonner";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

export default function ProjectsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof PROJECT_TYPES)[number]>("FULL_GROWTH");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createProject.mutateAsync({ name, type });
      setName("");
      toast.success(t("projectCreated"));
    } catch {
      toast.error(t("projectCreateFailed"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">{t("projects")}</h1>
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/crm")}>{t("crm")}</SoftLink>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("newProject")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label>{t("name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1 sm:w-56">
              <Label>{t("type")}</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as (typeof PROJECT_TYPES)[number])}
              >
                {PROJECT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="self-end" disabled={createProject.isPending}>
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !projects.length ? (
        <p className="text-sm text-muted-foreground">{t("emptyProjects")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(
            (project: {
              id: string;
              name: string;
              status: string;
              type: string;
              progress: number;
            }) => (
              <SoftLink key={project.id} href={`/${locale}/projects/${project.id}`}>
                <Card className="h-full transition hover:border-primary/40">
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge>{project.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {project.type.replaceAll("_", " ")}
                    </p>
                    <Progress value={project.progress} />
                  </CardContent>
                </Card>
              </SoftLink>
            ),
          )}
        </div>
      )}
    </div>
  );
}
