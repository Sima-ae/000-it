"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canDelete } from "@/lib/roles";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: string;
};

export default function LeadsPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const showDelete = canDelete(session?.user?.role);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads-admin"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as Lead[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Contact and booking requests from the public website.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && !leads.length && (
            <p className="text-muted-foreground">No leads yet.</p>
          )}
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <a className="underline-offset-2 hover:underline" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                    {lead.company ? ` · ${lead.company}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>
                {showDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete this lead?")) return;
                      const res = await fetch(`/api/leads?id=${lead.id}`, {
                        method: "DELETE",
                      });
                      if (!res.ok) {
                        toast.error("Delete failed");
                        return;
                      }
                      toast.success("Deleted");
                      void qc.invalidateQueries({ queryKey: ["leads-admin"] });
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {lead.message}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
