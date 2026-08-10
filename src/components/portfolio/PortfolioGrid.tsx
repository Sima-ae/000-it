"use client";

import { useMemo, useState } from "react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { DetailDialog, type DetailDialogItem } from "@/components/content/DetailDialog";

export type PortfolioListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  coverImage: string | null;
  gallery: unknown;
  projectUrl: string | null;
  repoUrl: string | null;
  clientName: string | null;
  industry: string | null;
  year: number | null;
  tags: unknown;
  technologies: unknown;
  featured: boolean;
};

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

export function PortfolioGrid({
  items,
  labels,
}: {
  items: PortfolioListItem[];
  labels: {
    client: string;
    industry: string;
    technologies: string;
    visit: string;
    repo: string;
  };
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeItem = useMemo(() => {
    const found = items.find((item) => item.id === activeId);
    if (!found) return null;
    const detail: DetailDialogItem = {
      title: found.title,
      summary: found.summary,
      description: found.description,
      coverImage: found.coverImage,
      gallery: asList(found.gallery),
      clientName: found.clientName,
      projectUrl: found.projectUrl,
      repoUrl: found.repoUrl,
      industry: found.industry,
      year: found.year,
      tags: asList(found.tags),
      technologies: asList(found.technologies),
      featured: found.featured,
    };
    return detail;
  }, [activeId, items]);

  return (
    <>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <PortfolioCard
            key={item.id}
            item={item}
            onOpen={() => setActiveId(item.id)}
          />
        ))}
      </div>

      <DetailDialog
        open={!!activeItem}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        item={activeItem}
        labels={labels}
      />
    </>
  );
}
