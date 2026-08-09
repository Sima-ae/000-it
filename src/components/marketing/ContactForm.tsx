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

export function ContactForm() {
  const t = useTranslations("contact");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      toast.error("Failed to send");
      return;
    }
    toast.success(t("success"));
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">{t("company")}</Label>
        <Input id="company" {...form.register("company")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" {...form.register("message")} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t("send")}
      </Button>
    </form>
  );
}
