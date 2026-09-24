"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function NewsSearch({
  initialQuery = "",
  placeholder,
}: {
  initialQuery?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = q.trim();
    const current = initialQuery.trim();
    if (trimmed === current) return;

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);

    return () => window.clearTimeout(handle);
  }, [q, initialQuery, pathname, router]);

  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm outline-none ring-primary/30 backdrop-blur focus:ring-2"
      />
    </label>
  );
}
