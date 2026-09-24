import type { AccessLevel } from "@/types/AdminDetails";

/**
 * Admin permissions come from `accessLevel` only. `role` is the admin's
 * department ("CBA", "Super Admin", ...) and is never used for access.
 * The backend enforces the same rules; these only decide what the UI shows.
 */

/** Unknown or missing access levels fail closed to read-only. */
export const normaliseAccessLevel = (value: unknown): AccessLevel =>
  value === "admin" || value === "superadmin" ? value : "viewer";

/** admin + superadmin may create / edit / delete / approve. */
export const accessCanWrite = (level: AccessLevel) =>
  level === "admin" || level === "superadmin";

/** Only superadmins may manage other admin accounts. */
export const accessCanManageAdmins = (level: AccessLevel) =>
  level === "superadmin";

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  viewer: "Read-only",
  admin: "Admin access",
  superadmin: "Super admin access",
};
