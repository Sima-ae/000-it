"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  companyName: string | null;
  createdAt: string;
};

/** Assignable roles — SUPER_ADMIN is fixed to info@000-it.com only */
const roles = ["ADMIN", "MANAGER", "CLIENT"] as const;

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const isSuper = session?.user?.role === "SUPER_ADMIN";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT" as (typeof roles)[number],
    companyName: "",
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-admin"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as UserRow[];
    },
  });

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Create failed");
      return;
    }
    toast.success("User created");
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "CLIENT", companyName: "" });
    void qc.invalidateQueries({ queryKey: ["users-admin"] });
  }

  async function updateRole(id: string, role: string) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    toast.success("Role updated");
    void qc.invalidateQueries({ queryKey: ["users-admin"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            One SUPER_ADMIN (info@000-it.com). Create multiple Admin, Manager, and Client users.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add user</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name || "—"}</p>
                  <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.companyName ? (
                  <p className="text-xs text-muted-foreground">{user.companyName}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {user.role === "SUPER_ADMIN" ? (
                  <Badge>SUPER ADMIN (locked)</Badge>
                ) : (
                  <select
                    className="h-9 rounded-lg border border-input bg-muted/40 px-2 text-sm"
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                )}
                {isSuper ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={user.id === session?.user?.id || user.role === "SUPER_ADMIN"}
                  onClick={async () => {
                    if (!confirm("Delete this user?")) return;
                    const res = await fetch(`/api/users?id=${user.id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      toast.error("Delete failed");
                      return;
                    }
                    toast.success("Deleted");
                    void qc.invalidateQueries({ queryKey: ["users-admin"] });
                  }}
                >
                  Delete
                </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Create a dashboard account with a role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createUser} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as (typeof roles)[number],
                  }))
                }
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
