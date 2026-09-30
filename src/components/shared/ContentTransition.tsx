"use client";

/** Pass-through — remounting on pathname made every navigation feel slower. */
export function ContentTransition({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>;
}
