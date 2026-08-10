import type { ContentBlock } from "@/lib/fixweb-content";
import { cn } from "@/lib/utils";

export function ContentBlocks({
  blocks,
  className,
}: {
  blocks: ContentBlock[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-5 text-muted-foreground", className)}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="font-display pt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {block.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed md:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed md:text-base">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
