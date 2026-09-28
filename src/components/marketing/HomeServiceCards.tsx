"use client";

import { useState } from "react";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";

const FEATURED_GROUP_ID = "marketing";

export type HomeServiceCardItem = {
  id: string;
  href: string;
  title: string;
  summary: string;
};

/**
 * Service group cards — Marketing is featured (purple glow) until another
 * card is hovered, matching the ready-to-go plans hover behaviour.
 */
export function HomeServiceCards({ items }: { items: HomeServiceCardItem[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className="grid gap-3 md:grid-cols-6"
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item, index) => {
        const span =
          index < 2 || index >= 5 ? "md:col-span-3" : "md:col-span-2";
        const from =
          index % 3 === 0 ? "left" : index % 3 === 1 ? "up" : "right";
        const glowOnHover = hoveredId === item.id;
        const featuredIdle =
          item.id === FEATURED_GROUP_ID && hoveredId === null;

        return (
          <Reveal
            key={item.id}
            from={from}
            delay={Math.min(index * 0.07, 0.35)}
            duration={0.55}
            className={cn("h-full", span)}
          >
            <div
              className="h-full"
              onMouseEnter={() => setHoveredId(item.id)}
            >
              <SoftLink href={item.href} className="block h-full">
                <GlassCard
                  glow={false}
                  className={cn(
                    "relative flex h-full min-h-36 flex-col overflow-hidden rounded-2xl p-5 transition-shadow duration-300 md:p-5",
                    featuredIdle &&
                      "pricing-featured-pulse ring-1 ring-primary/25",
                    glowOnHover && "pricing-card-glow ring-1 ring-primary/30",
                  )}
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight text-accent md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                </GlassCard>
              </SoftLink>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
