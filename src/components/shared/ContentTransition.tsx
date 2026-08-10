"use client";

import { usePathname } from "next/navigation";

/** Lightweight wrapper — avoid Framer Motion remount/fade on every route change. */
export function ContentTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="min-h-0 w-full">
      {children}
    </div>
  );
}
