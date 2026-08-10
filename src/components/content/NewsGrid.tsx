"use client";

import Image from "next/image";
import { useState } from "react";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { DetailDialog } from "@/components/content/DetailDialog";
import type { NewsPost } from "@/lib/news";

export function NewsGrid({
  items,
  labels,
}: {
  items: NewsPost[];
  labels: {
    client: string;
    date: string;
    industry: string;
    visit: string;
  };
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) ?? null;

  return (
    <>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.07}>
            <button
              type="button"
              onClick={() => setActiveId(post.id)}
              className="block h-full w-full cursor-pointer text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <GlassCard className="h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md">
                {post.coverImage ? (
                  <div className="relative h-40 w-full bg-muted/40">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={post.coverImage.includes("image.pollinations.ai")}
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                  <h2 className="font-display mt-2 text-lg font-semibold tracking-tight">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
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
                summary: active.excerpt,
                description: active.description,
                coverImage: active.coverImage,
                date: active.date,
                clientName: active.author,
                projectUrl: active.projectUrl,
                industry: active.industry,
                tags: active.tags,
              }
            : null
        }
        labels={labels}
      />
    </>
  );
}
