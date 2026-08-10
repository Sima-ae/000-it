export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 md:px-6">
      <div className="h-[55vh] rounded-4xl bg-muted/70" />
      <div className="mt-6 h-20 rounded-[1.75rem] bg-muted/70" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-3xl bg-muted/70" />
        ))}
      </div>
    </div>
  );
}
