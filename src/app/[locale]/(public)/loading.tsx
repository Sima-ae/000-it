export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-8 md:px-6" aria-busy="true">
      <div className="h-3 w-28 rounded-full bg-muted/70" />
      <div className="mt-4 h-9 w-1/2 max-w-md rounded-2xl bg-muted/70" />
      <div className="mt-3 h-16 max-w-xl rounded-2xl bg-muted/40" />
    </div>
  );
}
