"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/content/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-2xl border border-border/80 bg-background/70 shadow-sm transition has-data-[state=open]:border-primary/30 has-data-[state=open]:bg-card/80 has-data-[state=open]:shadow-md"
        >
          <AccordionItem value={item.id} className="border-none px-4 md:px-5">
            <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline data-[state=open]:text-primary">
              <span className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base font-semibold tracking-tight text-foreground md:text-lg">
                  {item.question}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pl-10 text-sm leading-relaxed text-muted-foreground md:pl-11 md:text-base">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        </div>
      ))}
    </Accordion>
  );
}
