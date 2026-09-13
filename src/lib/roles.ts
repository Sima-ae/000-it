import type { Role } from "@prisma/client";

export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER";

/** Canonical (and only) SUPER_ADMIN account — never create a second one */
export const SUPER_ADMIN_EMAIL = "info@000-it.com";

export function isCanonicalSuperAdminEmail(email?: string | null): boolean {
  return (email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN";
}

export function isAdminRole(role?: string | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isStaffRole(role?: string | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER";
}

export function isManagerRole(role?: string | null): boolean {
  return role === "MANAGER";
}

export function isClientRole(role?: string | null): boolean {
  return role === "CLIENT";
}

/** Only SUPER_ADMIN may delete records */
export function canDelete(role?: string | null): boolean {
  return isSuperAdmin(role);
}

/** SUPER_ADMIN + ADMIN may add/edit/view all staff content */
export function canEditAny(role?: string | null): boolean {
  return isAdminRole(role);
}

/**
 * Managers may edit only resources they created/own.
 * Admins and super admins may edit anything.
 */
export function canEditResource(
  role: string | null | undefined,
  ownerId: string | null | undefined,
  userId: string,
): boolean {
  if (canEditAny(role)) return true;
  if (role === "MANAGER") return Boolean(ownerId) && ownerId === userId;
  return false;
}

export function canEditClientUrlFields(role?: string | null): boolean {
  return isAdminRole(role);
}

/** Prisma `where` scope: admins see everything; others see only own rows */
export function ownScope(
  role: string | null | undefined,
  userId: string,
): { userId?: string } {
  if (canEditAny(role)) return {};
  return { userId };
}

export type DashboardNavItem = {
  href: string;
  key: string;
  roles: Role[];
};

/** Sidebar + middleware allow-list per role */
export const dashboardNav: DashboardNavItem[] = [
  {
    href: "/dashboard",
    key: "title",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/crm",
    key: "crm",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/portfolio-admin",
    key: "portfolio",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/nieuws-admin",
    key: "news",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/case-studies-admin",
    key: "caseStudies",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/kennisbank-admin",
    key: "kennisbank",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/crm/leads",
    key: "leads",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/crm/tickets",
    key: "tickets",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/todos",
    key: "todos",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/users",
    key: "users",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/projects",
    key: "projects",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/crm/clients",
    key: "clients",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/ai-agents",
    key: "agents",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/seo-analysis",
    key: "seo",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
  {
    href: "/content-generator",
    key: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    href: "/settings",
    key: "settings",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"],
  },
];

/** CRM routes clients may open (staff may open all /crm/*) */
const CLIENT_CRM_ALLOW = [
  "/crm",
  "/crm/tickets",
  "/crm/invoices",
  "/crm/messages",
] as const;

function matchesPath(path: string, href: string): boolean {
  return path === href || path.startsWith(`${href}/`);
}

/** Exact match for /crm overview; nested match for deeper client CRM routes */
function clientCanAccessCrm(path: string): boolean {
  return CLIENT_CRM_ALLOW.some((href) =>
    href === "/crm" ? path === "/crm" : matchesPath(path, href),
  );
}

export function navForRole(role?: string | null) {
  const r = (role || "CLIENT") as Role;
  return dashboardNav.filter((item) => item.roles.includes(r));
}

export function canAccessPath(pathname: string, role?: string | null): boolean {
  const path = pathname.replace(/^\/(nl|en)/, "") || "/";
  const r = (role || "CLIENT") as Role;

  // Fine-grained CRM access (prefix /crm would otherwise allow all subroutes)
  if (path === "/crm" || path.startsWith("/crm/")) {
    if (isStaffRole(r)) return true;
    return clientCanAccessCrm(path);
  }

  // Legacy aliases still used by old bookmarks
  if (path === "/tickets" || path.startsWith("/tickets/")) {
    return ["SUPER_ADMIN", "ADMIN", "MANAGER", "CLIENT"].includes(r);
  }
  if (path === "/clients" || path.startsWith("/clients/")) {
    return isStaffRole(r);
  }
  if (path === "/leads" || path.startsWith("/leads/")) {
    return isStaffRole(r);
  }

  const match = [...dashboardNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => matchesPath(path, item.href));

  if (!match) {
    return isStaffRole(r);
  }
  return match.roles.includes(r);
}
