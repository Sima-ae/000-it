"use client";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { isClientRole } from "@/lib/roles";

/** Top-of-content language switcher for the client portal. */
export function ClientDashboardHeader({ role }: { role?: string | null }) {
  if (!isClientRole(role)) return null;

  return (
    <div className="mb-5 flex items-center justify-end border-b border-border/50 pb-3">
      <LanguageSwitcher />
    </div>
  );
}
