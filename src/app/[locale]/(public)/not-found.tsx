import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/nl"
        className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back home
      </Link>
    </div>
  );
}
