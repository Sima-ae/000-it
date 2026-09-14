"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("inquiry");
  const hint = messageHint || t("websiteHint");

  const defaultMessage =
    defaultMessageOverride ??
    t("defaultMessage", { service: serviceTitle, hint });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={cn("rounded-2xl", className)}>
          {triggerLabel || t("requestAi")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(92vh,720px)] w-[min(96vw,32rem)] overflow-y-auto p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>
            {dialogTitle || t("dialogTitle", { service: serviceTitle })}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription || t("dialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          className="mt-4 space-y-4"
          defaultMessage={defaultMessage}
          source={source}
          onSuccess={() => setOpen(false)}
          submitLabel={t("sendRequest")}
        />
      </DialogContent>
    </Dialog>
  );
}
