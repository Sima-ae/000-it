"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{data.name}</h1>
          <p className="text-muted-foreground">{data.description || data.type}</p>
        </div>
        <Badge variant="secondary">{data.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.progress} />
          <p className="mt-2 text-sm text-muted-foreground">{data.progress}%</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.tasks?.map(
              (task: { id: string; title: string; status: string; priority: string }) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{task.title}</span>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ),
            )}
            {!data.tasks?.length && (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.activities?.map(
              (activity: { id: string; description: string; createdAt: string }) => (
                <div key={activity.id} className="text-sm">
                  <p>{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
