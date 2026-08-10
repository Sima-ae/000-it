"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { cn } from "@/lib/utils";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pending = useNavigationProgress((s) => s.pending);
  const done = useNavigationProgress((s) => s.done);
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setVisible(true);
    setComplete(false);
    const failSafe = window.setTimeout(() => done(), 8000);
    return () => window.clearTimeout(failSafe);
  }, [pending, done]);

  useEffect(() => {
    done();
    setComplete(true);
    const hide = window.setTimeout(() => {
      setVisible(false);
      setComplete(false);
    }, 280);
    return () => window.clearTimeout(hide);
  }, [pathname, searchParams, done]);

  if (!visible && !pending) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-120 h-0.5 overflow-hidden"
      aria-hidden
    >
      <div
        className={cn(
          "h-full origin-left bg-primary transition-transform ease-out",
          complete || !pending ? "duration-300" : "duration-[8s]",
        )}
        style={{
          transform: complete || !pending ? "scaleX(1)" : "scaleX(0.72)",
        }}
      />
    </div>
  );
}
