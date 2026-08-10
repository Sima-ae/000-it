"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Forces a one-time session update after mount so the JWT cookie gets a fresh
 * `role` claim. Middleware uses getToken (cookie only) and would otherwise treat
 * older sessions without `role` as CLIENT — bouncing staff routes like
 * /portfolio-admin straight back to /dashboard.
 */
export function DashboardSessionSync() {
  const { status, update } = useSession();
  const ran = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || ran.current) return;
    ran.current = true;
    void update();
  }, [status, update]);

  return null;
}
