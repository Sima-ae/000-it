"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  domainName: z
    .string()
    .min(3)
    .max(253)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,30}$/i),
  authCode: z.string().min(4).max(128),
  years: z.coerce.number().int().min(1).max(10),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(190),
  phone: z.string().min(6).max(40),
  address1: z.string().min(2).max(120),
  city: z.string().min(1).max(80),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(2),
  organization: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

export function DomainTransferForm() {
  const t = useTranslations("domainsPage");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      years: 1,
      country: "NL",
      domainName: "",
      authCode: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      city: "",
      postalCode: "",
      organization: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: values.domainName.toLowerCase(),
          years: values.years,
          locale,
          orderType: "TRANSFER",
          authCode: values.authCode,
          registrant: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            address1: values.address1,
            city: values.city,
            postalCode: values.postalCode,
            country: values.country,
            stateProvince: "NA",
            organization: values.organization,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || t("checkoutFailed"));
      }
      return data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("checkoutFailed"));
    },
  });

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={() => setOpen(true)}
      >
        {t("transferCta")}
      </Button>
    );
  }

  return (
    <form
      className="mt-4 w-full max-w-2xl space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4 text-start"
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <p className="text-center text-sm text-muted-foreground sm:text-start">
        {t("transferHint")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <Label>{t("transferDomain")}</Label>
          <Input {...form.register("domainName")} placeholder="example.com" />
        </div>
        <div className="min-w-0">
          <Label>{t("transferAuthCode")}</Label>
          <Input {...form.register("authCode")} />
        </div>
        <div className="min-w-0">
          <Label>{t("firstName")}</Label>
          <Input {...form.register("firstName")} />
        </div>
        <div className="min-w-0">
          <Label>{t("lastName")}</Label>
          <Input {...form.register("lastName")} />
        </div>
        <div className="min-w-0">
          <Label>{t("email")}</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div className="min-w-0">
          <Label>{t("phone")}</Label>
          <Input {...form.register("phone")} />
        </div>
        <div className="min-w-0 sm:col-span-2">
          <Label>{t("address")}</Label>
          <Input {...form.register("address1")} />
        </div>
        <div className="min-w-0">
          <Label>{t("city")}</Label>
          <Input {...form.register("city")} />
        </div>
        <div className="min-w-0">
          <Label>{t("postalCode")}</Label>
          <Input {...form.register("postalCode")} />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-2xl sm:w-auto"
        >
          {mutation.isPending ? t("processing") : t("transferPay")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full rounded-2xl sm:w-auto"
          onClick={() => setOpen(false)}
        >
          {t("registrantCancel")}
        </Button>
      </div>
    </form>
  );
}
