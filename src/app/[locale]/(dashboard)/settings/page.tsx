"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileForm = {
  name: string;
  companyName: string;
  phone: string;
  industry: string;
  currentPassword: string;
  newPassword: string;
};

export default function SettingsPage() {
  const t = useTranslations("dashboard");
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/settings/profile");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const form = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      companyName: "",
      phone: "",
      industry: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || "",
        companyName: data.companyName || "",
        phone: data.phone || "",
        industry: data.industry || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [data, form]);

  async function onSubmit(values: ProfileForm) {
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || t("profileUpdateFailed"));
      return;
    }
    toast.success(t("profileUpdated"));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t("settings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settingsSubtitle")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("profileSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input value={data?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>{t("company")}</Label>
              <Input {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>{t("industry")}</Label>
              <Input {...form.register("industry")} />
            </div>
            <div className="space-y-2">
              <Label>{t("currentPassword")}</Label>
              <Input type="password" {...form.register("currentPassword")} />
            </div>
            <div className="space-y-2">
              <Label>{t("newPassword")}</Label>
              <Input type="password" {...form.register("newPassword")} />
            </div>
            <Button type="submit">{t("saveProfile")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
