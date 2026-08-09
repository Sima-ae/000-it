"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useClients, useCreateClient, useDeleteClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const t = useTranslations("dashboard");
  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createClient.mutateAsync({ name, email, company, status: "LEAD" });
      setName("");
      setEmail("");
      setCompany("");
      toast.success("Client created");
    } catch {
      toast.error("Failed to create client");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("clients")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Button type="submit" className="self-end" disabled={createClient.isPending}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Company</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(
                    (client: {
                      id: string;
                      name: string;
                      email: string;
                      company?: string;
                      status: string;
                    }) => (
                      <tr key={client.id} className="border-t border-border/60">
                        <td className="py-3 pr-4">{client.name}</td>
                        <td className="py-3 pr-4">{client.email}</td>
                        <td className="py-3 pr-4">{client.company || "—"}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">{client.status}</Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteClient.mutate(client.id, {
                                onSuccess: () => toast.success("Deleted"),
                              })
                            }
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
