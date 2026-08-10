"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || `/${locale}/dashboard`;
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : `/${locale}/dashboard`;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
    });
    if (res?.error) {
      toast.error("Invalid credentials");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("loginTitle")}</CardTitle>
        <CardDescription>{t("loginSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" {...form.register("password")} />
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {t("login")}
          </Button>
        </form>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <Link href={`/${locale}/forgot-password`} className="text-primary hover:underline">
              {t("forgot")}
            </Link>
          </p>
          <p>
            {t("noAccount")}{" "}
            <Link href={`/${locale}/register`} className="text-primary hover:underline">
              {t("register")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
