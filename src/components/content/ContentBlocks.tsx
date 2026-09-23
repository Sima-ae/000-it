import type { ReactNode } from "react";
import type { ContentBlock } from "@/lib/fixweb-content";
import { cn } from "@/lib/utils";
import {
  ContentFaqAccordion,
  type FaqItem,
} from "@/components/content/ContentFaqAccordion";

function isFaqHeading(text: string) {
  const normalized = text.trim().toLowerCase();
  return (
    normalized.includes("veelgestelde vragen") ||
    normalized.includes("frequently asked") ||
    normalized === "faq" ||
    normalized.startsWith("faq ") ||
    /\bfaq\b/.test(normalized)
  );
}

function parseFaqItem(raw: string): FaqItem | null {
  const text = raw.trim();
  if (!text) return null;

  const qMark = text.indexOf("?");
  if (qMark > 0) {
    const question = text.slice(0, qMark + 1).trim();
    const answer = text.slice(qMark + 1).trim();
    if (answer) return { question, answer };
  }

  const colon = text.indexOf(":");
  if (colon > 0 && colon < 120) {
    const question = text.slice(0, colon).trim();
    const answer = text.slice(colon + 1).trim();
    if (question && answer) {
      return {
        question: question.endsWith("?") ? question : `${question}?`,
        answer,
      };
    }
  }

  return null;
}

export function ContentBlocks({
  blocks,
  className,
  compact = false,
}: {
  blocks: ContentBlock[];
  className?: string;
  compact?: boolean;
}) {
  const nodes: ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "heading") {
      const next = blocks[i + 1];
      if (isFaqHeading(block.text) && next?.type === "list") {
        const items = next.items
          .map(parseFaqItem)
          .filter((item): item is FaqItem => Boolean(item));

        nodes.push(
          <div
            key={`faq-wrap-${i}`}
            className={cn(compact ? "space-y-2.5 pt-1" : "space-y-4 pt-2")}
          >
            <h2
              className={cn(
                "font-display font-semibold tracking-tight text-foreground",
                compact ? "text-base md:text-lg" : "text-xl md:text-2xl",
              )}
            >
              {block.text}
            </h2>
            {items.length ? (
              <ContentFaqAccordion items={items} />
            ) : (
              <ul className={cn("pl-1", compact ? "space-y-1" : "space-y-2")}>
                {next.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "flex gap-2 leading-relaxed",
                      compact ? "text-sm" : "text-sm md:text-base",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-full bg-accent",
                        compact ? "mt-1.5 h-1 w-1" : "mt-2 h-1.5 w-1.5",
                      )}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>,
        );
        i += 1; // skip the FAQ list block
        continue;
      }

      nodes.push(
        <h2
          key={i}
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            compact
              ? "pt-1 text-base md:text-lg"
              : "pt-2 text-xl md:text-2xl",
          )}
        >
          {block.text}
        </h2>,
      );
      continue;
    }

    if (block.type === "list") {
      nodes.push(
        <ul key={i} className={cn("pl-1", compact ? "space-y-1" : "space-y-2")}>
          {block.items.map((item) => (
            <li
              key={item}
              className={cn(
                "flex gap-2 leading-relaxed",
                compact ? "text-sm" : "text-sm md:text-base",
              )}
            >
              <span
                className={cn(
                  "shrink-0 rounded-full bg-accent",
                  compact ? "mt-1.5 h-1 w-1" : "mt-2 h-1.5 w-1.5",
                )}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    nodes.push(
      <p
        key={i}
        className={cn(
          "leading-relaxed",
          compact ? "text-sm" : "text-sm md:text-base",
        )}
      >
        {block.text}
      </p>,
    );
  }

  return (
    <div
      className={cn(
        "text-muted-foreground",
        compact ? "space-y-2.5" : "space-y-5",
        className,
      )}
    >
      {nodes}
    </div>
  );
}
