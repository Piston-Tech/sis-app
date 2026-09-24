export type AdminRole = "viewer" | "admin" | "superadmin";

export default interface AdminDetails {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: AdminRole;
  createdAt?: Date;
  updatedAt?: Date;
}
