"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = {
  question: string;
  answer: string;
};

export function ContentFaqAccordion({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
      <Accordion type="single" collapsible className="w-full px-4 md:px-5">
        {items.map((item, index) => (
          <AccordionItem
            key={`${index}-${item.question}`}
            value={`faq-${index}`}
            className="border-border/60"
          >
            <AccordionTrigger className="text-left font-display text-sm hover:no-underline md:text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
