"use client";

import type { ReactNode } from "react";
import {
  applyEntitySlugSnapshot,
  type EntitySlugSnapshot,
} from "@/lib/entity-slug-cache";

export function EntitySlugProvider({
  snapshot,
  children,
}: {
  snapshot: EntitySlugSnapshot;
  children: ReactNode;
}) {
  applyEntitySlugSnapshot(snapshot);
  return children;
}
