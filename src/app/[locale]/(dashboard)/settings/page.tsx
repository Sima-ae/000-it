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
      toast.error(err.error || "Update failed");
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">{t("settings")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={data?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input {...form.register("industry")} />
            </div>
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" {...form.register("currentPassword")} />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...form.register("newPassword")} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
