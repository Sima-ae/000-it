"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AIAgentsPage() {
  const t = useTranslations("dashboard");
  const qc = useQueryClient();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Agent updated");
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("agents")}</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map(
            (agent: {
              id: string;
              name: string;
              type: string;
              status: string;
              tasksCompleted: number;
            }) => (
              <Card key={agent.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <Badge
                    variant={
                      agent.status === "RUNNING"
                        ? "accent"
                        : agent.status === "PAUSED"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{agent.type}</p>
                  <p className="text-xs text-muted-foreground">
                    Tasks completed: {agent.tasksCompleted}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ id: agent.id, status: "RUNNING" })
                      }
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: agent.id, status: "PAUSED" })
                      }
                    >
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateStatus.mutate({ id: agent.id, status: "IDLE" })
                      }
                    >
                      Idle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
