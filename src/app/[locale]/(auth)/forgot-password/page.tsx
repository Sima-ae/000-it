"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedHref } from "@/i18n/pathnames";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("forgotTitle")}</CardTitle>
        <CardDescription>{t("forgotSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("email")}</Label>
          <Input type="email" placeholder="you@company.com" />
        </div>
        <Button
          className="w-full"
          type="button"
          onClick={() => toast.message(t("forgotSubtitle"))}
        >
          {t("sendReset")}
        </Button>
        <Link href={localizedHref(locale, "/login")} className="block text-sm text-primary hover:underline">
          {t("login")}
        </Link>
      </CardContent>
    </Card>
  );
}
