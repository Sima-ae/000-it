"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Soft deterrents against casual copy / print / save of kennisbank HTML.
 * Does not stop determined scrapers (that is middleware + robots); raises the
 * bar for drive-by competitor copy-paste.
 */
export function ContentProtect({ children }: { children: ReactNode }) {
  useEffect(() => {
    const block = (event: Event) => {
      event.preventDefault();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      if (key === "c" || key === "x" || key === "s" || key === "p" || key === "u") {
        event.preventDefault();
      }
      if (event.shiftKey && key === "i") {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className="kb-content-protect select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
