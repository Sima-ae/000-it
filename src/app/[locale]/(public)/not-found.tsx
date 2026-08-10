"use client";

import { useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";

export default function NotFound() {
  const locale = useLocale();
  const isNl = locale === "nl";

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {isNl ? "Pagina niet gevonden" : "Page not found"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {isNl
          ? "De pagina die u zoekt bestaat niet of is verplaatst."
          : "The page you are looking for does not exist or was moved."}
      </p>
      <SoftLink
        href={`/${locale}`}
        className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {isNl ? "Terug naar home" : "Back home"}
      </SoftLink>
    </div>
  );
}
