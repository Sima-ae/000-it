"use client";

import { useLocale } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isNl = locale === "nl";

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {isNl ? "Er ging iets mis" : "Something went wrong"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {error.message ||
          (isNl
            ? "Er is een onverwachte fout opgetreden bij het laden van deze pagina."
            : "An unexpected error occurred while loading this page.")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {isNl ? "Opnieuw proberen" : "Try again"}
      </button>
    </div>
  );
}
