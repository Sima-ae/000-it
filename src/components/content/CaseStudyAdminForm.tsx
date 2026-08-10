"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canEditClientUrlFields } from "@/lib/roles";
import type { CaseStudy } from "@/lib/case-studies";

export type CaseFormValues = {
  id?: string;
  title: string;
  industry: string;
  metric: string;
  summary: string;
  description: string;
  clientName: string;
  projectUrl: string;
  coverImage: string;
  gallery: string;
  year: string;
  tags: string;
  technologies: string;
};

const empty: CaseFormValues = {
  title: "",
  industry: "",
  metric: "",
  summary: "",
  description: "",
  clientName: "",
  projectUrl: "",
  coverImage: "",
  gallery: "",
  year: String(new Date().getFullYear()),
  tags: "",
  technologies: "",
};

export function CaseStudyAdminForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<CaseFormValues>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { data: session } = useSession();
  const canEditClientUrl = canEditClientUrlFields(session?.user?.role);
  const [form, setForm] = useState<CaseFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        industry: form.industry,
        metric: form.metric,
        summary: form.summary,
        description: form.description,
        clientName: form.clientName,
        projectUrl: form.projectUrl || null,
        coverImage: form.coverImage || null,
        gallery: form.gallery,
        year: form.year,
        tags: form.tags,
        technologies: form.technologies,
      };

      const res = await fetch(
        form.id ? `/api/case-studies/${form.id}` : "/api/case-studies",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Case study saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setField("title", e.target.value)} required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            value={form.industry}
            onChange={(e) => setField("industry", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Metric</Label>
          <Input value={form.metric} onChange={(e) => setField("metric", e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Summary</Label>
        <Input value={form.summary} onChange={(e) => setField("summary", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Full text</Label>
        <Textarea
          className="min-h-35"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Cover image URL</Label>
        <Input
          value={form.coverImage}
          onChange={(e) => setField("coverImage", e.target.value)}
        />
      </div>

      {canEditClientUrl ? (
        <div className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="case-client">Klant / Client</Label>
            <Input
              id="case-client"
              value={form.clientName}
              onChange={(e) => setField("clientName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="case-url">URL</Label>
            <Input
              id="case-url"
              value={form.projectUrl}
              onChange={(e) => setField("projectUrl", e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Year</Label>
          <Input value={form.year} onChange={(e) => setField("year", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Gallery URLs (comma separated)</Label>
          <Input value={form.gallery} onChange={(e) => setField("gallery", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input value={form.tags} onChange={(e) => setField("tags", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Technologies (comma separated)</Label>
          <Input
            value={form.technologies}
            onChange={(e) => setField("technologies", e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save case study"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function caseStudyToForm(item: CaseStudy): CaseFormValues {
  return {
    id: item.id,
    title: item.title,
    industry: item.industry,
    metric: item.metric,
    summary: item.summary,
    description: item.description,
    clientName: item.clientName,
    projectUrl: item.projectUrl || "",
    coverImage: item.coverImage || "",
    gallery: item.gallery.join(", "),
    year: String(item.year || ""),
    tags: item.tags.join(", "),
    technologies: item.technologies.join(", "),
  };
}
