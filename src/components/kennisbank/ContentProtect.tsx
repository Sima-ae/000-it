"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { isSuperAdmin } from "@/lib/roles";
import { cn } from "@/lib/utils";

/**
 * Soft deterrents against casual copy / print / save of kennisbank HTML.
 * Logged-in SUPER_ADMIN may copy and use the native context menu.
 * Does not stop determined scrapers (that is middleware + robots); raises the
 * bar for drive-by competitor copy-paste.
 */
export function ContentProtect({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const allowCopy =
    status === "authenticated" && isSuperAdmin(session?.user?.role);

  useEffect(() => {
    if (allowCopy) return;

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
  }, [allowCopy]);

  return (
    <div
      className={cn(!allowCopy && "kb-content-protect select-none")}
      onCopy={allowCopy ? undefined : (e) => e.preventDefault()}
      onCut={allowCopy ? undefined : (e) => e.preventDefault()}
      onContextMenu={allowCopy ? undefined : (e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
