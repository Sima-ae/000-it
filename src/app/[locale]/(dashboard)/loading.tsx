export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-48 rounded-2xl bg-muted/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-muted/70" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-muted/70" />
    </div>
  );
}
