"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedHref } from "@/i18n/pathnames";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  companySize: z.string().min(1),
  industry: z.string().min(1),
  interests: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      companySize: "1-10",
      industry: "",
      interests: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        interests: values.interests
          ? values.interests.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || common("registrationFailed"));
      return;
    }
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    router.push(localizedHref(locale, "/dashboard"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("registerTitle")}</CardTitle>
        <CardDescription>
          {step === 1 ? t("stepAccount") : step === 2 ? t("stepCompany") : t("stepInterests")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>{t("name")}</Label>
                <Input {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>{t("password")}</Label>
                <Input type="password" {...form.register("password")} />
              </div>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                {t("next")}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>{t("company")}</Label>
                <Input {...form.register("companyName")} />
              </div>
              <div className="space-y-2">
                <Label>{t("companySize")}</Label>
                <Input {...form.register("companySize")} />
              </div>
              <div className="space-y-2">
                <Label>{t("industry")}</Label>
                <Input {...form.register("industry")} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  {t("back")}
                </Button>
                <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                  {t("next")}
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>{t("interests")}</Label>
                <Input placeholder="SEO, AI, Ads" {...form.register("interests")} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  {t("back")}
                </Button>
                <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                  {t("create")}
                </Button>
              </div>
            </>
          )}
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href={localizedHref(locale, "/login")} className="text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
