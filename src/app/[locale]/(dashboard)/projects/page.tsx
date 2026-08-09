"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProjectsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [type, setType] = useState("FULL_GROWTH");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createProject.mutateAsync({ name, type });
      setName("");
      toast.success("Project created");
    } catch {
      toast.error("Failed to create project");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("projects")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("newProject")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <Button type="submit" className="self-end" disabled={createProject.isPending}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
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
              <Link key={project.id} href={`/${locale}/projects/${project.id}`}>
                <Card className="h-full transition hover:border-primary/40">
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge>{project.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">{project.type}</p>
                    <Progress value={project.progress} />
                  </CardContent>
                </Card>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
