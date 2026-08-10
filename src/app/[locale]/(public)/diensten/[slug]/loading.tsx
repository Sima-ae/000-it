export default function ServiceLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-14 md:px-6 md:py-20" aria-busy="true">
      <div className="h-3 w-48 rounded-full bg-muted/70" />
      <div className="mt-6 h-14 w-3/4 max-w-2xl rounded-2xl bg-muted/70" />
      <div className="mt-4 h-24 max-w-xl rounded-2xl bg-muted/50" />
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="h-64 rounded-3xl bg-muted/60" />
        <div className="h-64 rounded-3xl bg-muted/40" />
      </div>
    </div>
  );
}
