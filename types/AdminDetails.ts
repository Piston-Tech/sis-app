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
  createdAt?: Date;
  updatedAt?: Date;
}
