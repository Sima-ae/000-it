"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PortfolioFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: string[];
  projectUrl: string;
  repoUrl: string;
  clientName: string;
  industry: string;
  year: string;
  tags: string;
  technologies: string;
  featured: boolean;
  published: boolean;
  sortOrder: string;
};

const empty: PortfolioFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  coverImage: "",
  gallery: [],
  projectUrl: "",
  repoUrl: "",
  clientName: "",
  industry: "",
  year: String(new Date().getFullYear()),
  tags: "",
  technologies: "",
  featured: false,
  published: true,
  sortOrder: "0",
};

export function PortfolioAdminForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<PortfolioFormValues>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PortfolioFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof PortfolioFormValues>(
    key: K,
    value: PortfolioFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File, asGallery = false) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/portfolio/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (asGallery) {
        setField("gallery", [...form.gallery, data.url]);
      } else {
        setField("coverImage", data.url);
      }
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        summary: form.summary,
        description: form.description,
        coverImage: form.coverImage || null,
        gallery: form.gallery,
        projectUrl: form.projectUrl,
        repoUrl: form.repoUrl,
        clientName: form.clientName,
        industry: form.industry,
        year: form.year ? Number(form.year) : null,
        tags: form.tags,
        technologies: form.technologies,
        featured: form.featured,
        published: form.published,
        sortOrder: Number(form.sortOrder || 0),
      };

      const res = await fetch(
        form.id ? `/api/portfolio/${form.id}` : "/api/portfolio",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      toast.success("Portfolio project saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
            placeholder="auto-from-title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Summary *</Label>
        <Textarea
          value={form.summary}
          onChange={(e) => setField("summary", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          className="min-h-[140px]"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cover image</Label>
          <Input
            value={form.coverImage}
            onChange={(e) => setField("coverImage", e.target.value)}
            placeholder="/uploads/portfolio/... or https://"
          />
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file, false);
            }}
          />
          {form.coverImage && (
            <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-border">
              <Image src={form.coverImage} alt="" fill className="object-cover" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Gallery images</Label>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file, true);
            }}
          />
          <div className="flex flex-wrap gap-2">
            {form.gallery.map((src) => (
              <button
                key={src}
                type="button"
                className="relative h-16 w-16 overflow-hidden rounded border border-border"
                onClick={() =>
                  setField(
                    "gallery",
                    form.gallery.filter((g) => g !== src),
                  )
                }
                title="Remove"
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click a thumbnail to remove it.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Project URL</Label>
          <Input
            value={form.projectUrl}
            onChange={(e) => setField("projectUrl", e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="space-y-2">
          <Label>Repo URL</Label>
          <Input
            value={form.repoUrl}
            onChange={(e) => setField("repoUrl", e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Client</Label>
          <Input
            value={form.clientName}
            onChange={(e) => setField("clientName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            value={form.industry}
            onChange={(e) => setField("industry", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            value={form.year}
            onChange={(e) => setField("year", e.target.value)}
          />
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Sort order</Label>
          <Input
            value={form.sortOrder}
            onChange={(e) => setField("sortOrder", e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setField("featured", e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setField("published", e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save project"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
