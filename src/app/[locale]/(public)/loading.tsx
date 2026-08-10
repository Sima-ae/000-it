export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 md:px-6" aria-busy="true">
      <div className="h-4 w-40 rounded-full bg-muted/70" />
      <div className="mt-6 h-12 w-2/3 max-w-xl rounded-2xl bg-muted/70" />
      <div className="mt-4 h-20 max-w-2xl rounded-2xl bg-muted/50" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-3xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
