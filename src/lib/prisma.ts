import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Cap pool size so builds/workers cannot exhaust shared MariaDB `max_connections`. */
function datasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  const limit = process.env.PRISMA_CONNECTION_LIMIT || "5";
  const timeout = process.env.PRISMA_POOL_TIMEOUT || "20";

  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", limit);
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", timeout);
    }
    return url.toString();
  } catch {
    // Passwords with reserved chars can break URL(); append params safely.
    const params: string[] = [];
    if (!/[?&]connection_limit=/.test(raw)) params.push(`connection_limit=${limit}`);
    if (!/[?&]pool_timeout=/.test(raw)) params.push(`pool_timeout=${timeout}`);
    if (!params.length) return raw;
    return `${raw}${raw.includes("?") ? "&" : "?"}${params.join("&")}`;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: datasourceUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Always reuse one client per process (incl. production / next build workers).
globalForPrisma.prisma = prisma;
