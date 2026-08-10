"use client";

/** Pass-through — remounting on pathname made every navigation feel slower. */
export function ContentTransition({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0 w-full">{children}</div>;
}
