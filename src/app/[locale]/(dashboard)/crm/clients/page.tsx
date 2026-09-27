"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SoftLink } from "@/components/shared/SoftLink";
import { CrmShell } from "@/components/crm/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStatusI18n } from "@/hooks/useStatusI18n";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  phone: string | null;
  _count?: { tickets: number; invoices: number; contacts: number };
};

export default function CrmClientsPage() {
  const t = useTranslations("crm");
  const status = useStatusI18n();
  const locale = useLocale();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["crm-clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as ClientRow[];
    },
  });

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "ACTIVE", isLead: false }),
    });
    if (!res.ok) {
      toast.error(t("actionFailed"));
      return;
    }
    toast.success(t("clientCreated"));
    setOpen(false);
    setForm({ name: "", email: "", company: "", phone: "" });
    void qc.invalidateQueries({ queryKey: ["crm-clients"] });
  }

  return (
    <CrmShell
      title={t("clients")}
      subtitle={t("clientsSubtitle")}
      actions={<Button onClick={() => setOpen((v) => !v)}>{t("addClient")}</Button>}
    >
      {open ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("addClient")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createClient} className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <Label>{t("fieldName")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t("fieldEmail")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t("fieldCompany")}</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                />
              </div>
              <Button type="submit" className="self-end">
                {t("save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <p className="text-muted-foreground">{t("loading")}</p> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4">{t("fieldName")}</th>
                  <th className="pb-3 pr-4">{t("fieldCompany")}</th>
                  <th className="pb-3 pr-4">{t("fieldEmail")}</th>
                  <th className="pb-3 pr-4">{t("tickets")}</th>
                  <th className="pb-3">{t("fieldStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-border/60">
                    <td className="py-3 pr-4">
                      <SoftLink
                        href={`/${locale}/crm/clients/${client.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {client.name}
                      </SoftLink>
                    </td>
                    <td className="py-3 pr-4">{client.company || "—"}</td>
                    <td className="py-3 pr-4">{client.email}</td>
                    <td className="py-3 pr-4">{client._count?.tickets ?? 0}</td>
                    <td className="py-3">
                      <Badge variant="outline">{status.clientStatus(client.status)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && !clients.length ? (
              <p className="py-4 text-sm text-muted-foreground">{t("emptyClients")}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </CrmShell>
  );
}
