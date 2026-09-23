"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({
  defaultMessage = "",
  source = "CONTACT_FORM",
  onSuccess,
  submitLabel,
  className,
  centered = false,
  fillHeight = false,
}: {
  defaultMessage?: string;
  source?: string;
  onSuccess?: () => void;
  submitLabel?: string;
  className?: string;
  centered?: boolean;
  fillHeight?: boolean;
}) {
  const t = useTranslations("contact");
  const common = useTranslations("common");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", company: "", message: defaultMessage },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, source }),
    });
    if (!res.ok) {
      toast.error(common("failedSend"));
      return;
    }
    toast.success(t("success"));
    form.reset({ name: "", email: "", company: "", message: defaultMessage });
    onSuccess?.();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={
        className ??
        (centered ? "space-y-4 text-center" : "space-y-4")
      }
    >
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" {...form.register("name")} className={centered ? "text-center" : undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          className={centered ? "text-center" : undefined}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">{t("company")}</Label>
        <Input
          id="company"
          {...form.register("company")}
          className={centered ? "text-center" : undefined}
        />
      </div>
      <div className={fillHeight ? "flex min-h-0 flex-1 flex-col space-y-2" : "space-y-2"}>
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          rows={fillHeight ? 8 : 5}
          {...form.register("message")}
          className={
            centered
              ? "text-center"
              : fillHeight
                ? "h-full min-h-44 flex-1 resize-none"
                : undefined
          }
        />
      </div>
      <div className={centered ? "flex justify-center" : "mt-auto"}>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
          {submitLabel || t("send")}
        </Button>
      </div>
    </form>
  );
}
