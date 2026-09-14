"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugifyKennisbank } from "@/lib/kennisbank-slug";

export type CategoryFormValues = {
  id?: string;
  slug: string;
  sortKey: string;
  name: string;
  description: string;
  published: boolean;
};

const emptyCategory: CategoryFormValues = {
  slug: "",
  sortKey: "",
  name: "",
  description: "",
  published: true,
};

export function KennisbankCategoryForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Partial<CategoryFormValues>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CategoryFormValues>({
    ...emptyCategory,
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || slugifyKennisbank(form.name);
      const payload = {
        slug,
        sortKey: form.sortKey || form.name,
        name: form.name,
        description: form.description || null,
        published: form.published,
        locale: "nl",
      };
      const res = await fetch(
        form.id ? `/api/kennisbank/categories/${form.id}` : "/api/kennisbank/categories",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Categorie opgeslagen. Vertalingen voor alle talen worden automatisch aangemaakt.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Naam (NL)</Label>
        <Input
          id="cat-name"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((p) => ({
              ...p,
              name,
              slug: p.id ? p.slug : slugifyKennisbank(name),
              sortKey: p.id ? p.sortKey : name,
            }));
          }}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-sort">Sort key</Label>
          <Input
            id="cat-sort"
            value={form.sortKey}
            onChange={(e) => setForm((p) => ({ ...p, sortKey: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc">Beschrijving</Label>
        <Textarea
          id="cat-desc"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
        />
        Gepubliceerd
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}

export type ArticleFormValues = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  categoryIds: string[];
};

const emptyArticle: ArticleFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  bodyHtml: "",
  seoTitle: "",
  seoDescription: "",
  published: true,
  categoryIds: [],
};

export function KennisbankArticleForm({
  initial,
  categories,
  onSaved,
  onCancel,
}: {
  initial?: Partial<ArticleFormValues>;
  categories: { id: string; name: string }[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ArticleFormValues>({
    ...emptyArticle,
    ...initial,
    categoryIds: initial?.categoryIds || [],
  });
  const [saving, setSaving] = useState(false);

  function toggleCategory(id: string) {
    setForm((p) => ({
      ...p,
      categoryIds: p.categoryIds.includes(id)
        ? p.categoryIds.filter((c) => c !== id)
        : [...p.categoryIds, id],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || slugifyKennisbank(form.title);
      const payload = {
        slug,
        title: form.title,
        excerpt: form.excerpt,
        bodyHtml: form.bodyHtml,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        published: form.published,
        categoryIds: form.categoryIds,
        locale: "nl",
      };
      const res = await fetch(
        form.id ? `/api/kennisbank/articles/${form.id}` : "/api/kennisbank/articles",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success(
        "Artikel opgeslagen. Vertalingen voor alle talen worden automatisch aangemaakt.",
      );
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="art-title">Titel (NL)</Label>
        <Input
          id="art-title"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((p) => ({
              ...p,
              title,
              slug: p.id ? p.slug : slugifyKennisbank(title),
            }));
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="art-slug">Slug</Label>
        <Input
          id="art-slug"
          value={form.slug}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="art-excerpt">Samenvatting</Label>
        <Textarea
          id="art-excerpt"
          rows={3}
          value={form.excerpt}
          onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="art-body">Inhoud (HTML)</Label>
        <Textarea
          id="art-body"
          rows={14}
          value={form.bodyHtml}
          onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value }))}
          required
          className="font-mono text-xs"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="art-seo-title">SEO titel</Label>
          <Input
            id="art-seo-title"
            value={form.seoTitle}
            onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="art-seo-desc">SEO beschrijving</Label>
          <Input
            id="art-seo-desc"
            value={form.seoDescription}
            onChange={(e) =>
              setForm((p) => ({ ...p, seoDescription: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Categorieën</Label>
        <div className="grid max-h-40 gap-2 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.categoryIds.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
        />
        Gepubliceerd
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}
