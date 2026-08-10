"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canEditClientUrlFields } from "@/lib/roles";
import type { NewsPost } from "@/lib/news";

export type NewsFormValues = {
  id?: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  description: string;
  author: string;
  projectUrl: string;
  industry: string;
  tags: string;
};

const empty: NewsFormValues = {
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  coverImage: "",
  description: "",
  author: "TripleZero iT",
  projectUrl: "",
  industry: "",
  tags: "",
};

export function NewsAdminForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<NewsFormValues>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { data: session } = useSession();
  const canEditMeta = canEditClientUrlFields(session?.user?.role);
  const [form, setForm] = useState<NewsFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof NewsFormValues>(key: K, value: NewsFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        date: form.date,
        coverImage: form.coverImage || null,
        description: form.description,
        author: form.author,
        projectUrl: form.projectUrl || null,
        industry: form.industry,
        tags: form.tags,
      };

      const res = await fetch(form.id ? `/api/news/${form.id}` : "/api/news", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("News post saved");
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
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Input value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} required />
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
          placeholder="/uploads/nieuws/..."
        />
      </div>

      {canEditMeta ? (
        <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="news-date">Datum</Label>
              <Input
                id="news-date"
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-author">Auteur</Label>
              <Input
                id="news-author"
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-url">URL</Label>
            <Input
              id="news-url"
              value={form.projectUrl}
              onChange={(e) => setField("projectUrl", e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Input value={form.industry} onChange={(e) => setField("industry", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input value={form.tags} onChange={(e) => setField("tags", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save post"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function newsPostToForm(item: NewsPost): NewsFormValues {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    date: item.date,
    coverImage: item.coverImage || "",
    description: item.description,
    author: item.author,
    projectUrl: item.projectUrl || "",
    industry: item.industry || "",
    tags: item.tags.join(", "),
  };
}
