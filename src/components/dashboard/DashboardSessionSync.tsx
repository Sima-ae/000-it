"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Forces a one-time session update after mount so the JWT cookie gets fresh
 * `name` + `role` from the database. Keeps the sidebar identity correct and
 * prevents middleware from treating older sessions without `role` as CLIENT.
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
