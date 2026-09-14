"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import type { NewsPost } from "@/lib/news";
import { localizedHref } from "@/i18n/pathnames";

function NewsCardCover({ post }: { post: NewsPost }) {
  const [failed, setFailed] = useState(false);
  const src = post.coverImage;

  if (!src || failed) {
    return (
      <div
        className="relative flex h-40 w-full items-end bg-linear-to-br from-primary/25 via-muted/60 to-accent/20 p-4"
        aria-hidden
      >
        <span className="line-clamp-2 font-display text-sm font-semibold text-foreground/80">
          {post.title}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-40 w-full bg-muted/40">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        unoptimized={src.includes("image.pollinations.ai")}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

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
            href={localizedHref(locale, `/nieuws/${post.id}`)}
            className="block h-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={labels.readMore ? `${labels.readMore}: ${post.title}` : post.title}
          >
            <GlassCard className="h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md">
              <NewsCardCover post={post} />
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
                <h2 className="font-display mt-2 line-clamp-2 text-lg font-semibold tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </GlassCard>
          </SoftLink>
        </Reveal>
      ))}
    </div>
  );
}
