"use client";

import Image from "next/image";
import { useState } from "react";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/Reveal";
import { DetailDialog } from "@/components/content/DetailDialog";
import type { CaseStudy } from "@/lib/case-studies";

export function CaseStudiesGrid({
  items,
  labels,
}: {
  items: CaseStudy[];
  labels: {
    client: string;
    industry: string;
    technologies: string;
    visit: string;
  };
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) ?? null;

  if (!items.length) {
    return (
      <p className="mt-10 text-muted-foreground">
        No case studies published yet.
      </p>
    );
  }

  return (
    <>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.07}>
            <button
              type="button"
              onClick={() => setActiveId(item.id)}
              className="block h-full w-full cursor-pointer text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <GlassCard
                interactive={false}
                className="h-full overflow-hidden p-0! transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative aspect-video w-full bg-muted/40">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {item.title}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <Badge variant="secondary">{item.industry}</Badge>
                  <h2 className="font-display mt-3 text-xl font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="mt-2 font-medium text-accent">{item.metric}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                </div>
              </GlassCard>
            </button>
          </Reveal>
        ))}
      </div>

      <DetailDialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        item={
          active
            ? {
                title: active.title,
                summary: active.summary,
                description: active.description,
                coverImage: active.coverImage,
                gallery: active.gallery,
                clientName: active.clientName,
                projectUrl: active.projectUrl,
                industry: active.industry,
                year: active.year,
                metric: active.metric,
                tags: active.tags,
                technologies: active.technologies,
              }
            : null
        }
        labels={labels}
      />
    </>
  );
}
