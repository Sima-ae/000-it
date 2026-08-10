"use client";

import Image from "next/image";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import type { NewsPost } from "@/lib/news";

export function NewsGrid({
  items,
  locale,
  labels,
}: {
  items: NewsPost[];
  locale: string;
  labels: {
    client: string;
    date: string;
    industry: string;
    visit: string;
    readMore?: string;
  };
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {items.map((post, i) => (
        <Reveal key={post.id} delay={Math.min(i, 8) * 0.05}>
          <SoftLink
            href={`/${locale}/nieuws/${post.id}`}
            className="block h-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={labels.readMore ? `${labels.readMore}: ${post.title}` : post.title}
          >
            <GlassCard className="h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md">
              {post.coverImage ? (
                <div className="relative h-40 w-full bg-muted/40">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    title={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={post.coverImage.includes("image.pollinations.ai")}
                  />
                </div>
              ) : null}
              <div className="p-5">
                <p className="text-xs text-muted-foreground">
                  <time dateTime={post.date}>{post.date}</time>
                  {post.industry ? (
                    <>
                      <span aria-hidden> · </span>
                      <span>{post.industry}</span>
                    </>
                  ) : null}
                </p>
                <h2 className="font-display mt-2 text-lg font-semibold tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </GlassCard>
          </SoftLink>
        </Reveal>
      ))}
    </div>
  );
}
