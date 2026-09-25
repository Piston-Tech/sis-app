/** What an admin may do (backend `admins.accessLevel`), lowest to highest. */
export type AccessLevel = "viewer" | "admin" | "superadmin";

export default interface AdminDetails {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  /** Department label ("CBA", "OPS", "Front Desk", ...). Display only; never a permission. */
  role?: string;
  /** Permission level; missing or unknown is treated as read-only ("viewer"). */
  accessLevel?: AccessLevel;
  /** Deactivated admins can't sign in (superadmins manage this) */
  isActive?: boolean;
  /** Set after a superadmin issues a temporary password */
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** One entry of an admin account's history (GET /admin/admins/:id) */
export interface AdminActivity {
  id: number;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: number; name: string } | null;
}

/** An admin account as a superadmin sees it */
export interface ManagedAdmin extends AdminDetails {
  activity?: AdminActivity[];
}
