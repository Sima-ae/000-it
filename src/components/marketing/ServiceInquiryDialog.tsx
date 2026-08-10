"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/marketing/ContactForm";
import { cn } from "@/lib/utils";

export function ServiceInquiryDialog({
  serviceTitle,
  source,
  triggerLabel,
  dialogTitle,
  dialogDescription,
  messageHint,
  defaultMessage: defaultMessageOverride,
  variant = "default",
  size = "lg",
  className,
}: {
  serviceTitle: string;
  source: string;
  triggerLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  /** Short hint for the prefilled message context (e.g. website / webshop). */
  messageHint?: string;
  /** Full prefilled message — overrides the default template when set. */
  defaultMessage?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const isNl = locale === "nl";
  const hint = messageHint || (isNl ? "website / webshop" : "website / webshop");

  const defaultMessage =
    defaultMessageOverride ??
    (isNl
      ? `Hallo TripleZero iT,\n\nIk wil graag meer weten over ${serviceTitle} voor onze ${hint}.\n\nWebsite-URL:\nDoel (bijv. chatbot, productassistent, content-AI, maatwerk):\n\n`
      : `Hi TripleZero iT,\n\nI’d like to learn more about ${serviceTitle} for our ${hint}.\n\nWebsite URL:\nGoal (e.g. chatbot, product assistant, content AI, custom):\n\n`);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={cn("rounded-2xl", className)}>
          {triggerLabel || (isNl ? "Vraag AI-aanvraag in" : "Request AI integration")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(92vh,720px)] w-[min(96vw,32rem)] overflow-y-auto p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>
            {dialogTitle ||
              (isNl ? `Contact over ${serviceTitle}` : `Contact about ${serviceTitle}`)}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription ||
              (isNl
                ? "Laat uw gegevens achter — we reageren snel met een haalbaarheidsadvies en vervolgstappen."
                : "Leave your details — we’ll reply quickly with a feasibility note and next steps.")}
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          className="mt-4 space-y-4"
          defaultMessage={defaultMessage}
          source={source}
          onSuccess={() => setOpen(false)}
          submitLabel={isNl ? "Verstuur aanvraag" : "Send request"}
        />
      </DialogContent>
    </Dialog>
  );
}
