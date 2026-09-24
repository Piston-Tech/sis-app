"use client";

import adminAuthService from "@/services/adminAuthService";
import AdminDetails from "@/types/AdminDetails";
import AdminGlobalState from "@/types/AdminGlobalState";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AdminRole = "viewer" | "admin" | "superadmin";

/** The admin user as returned by the API (role/firstName/lastName may be present). */
export type AdminUser = AdminDetails & {
  role?: AdminRole | string;
  firstName?: string;
  lastName?: string;
};

export interface AdminContextValue extends AdminGlobalState {
  currentUser: AdminUser | null;
  /** Normalised role; unknown or missing roles are treated as "viewer". */
  role: AdminRole;
  /** admin + superadmin may create / edit / delete / approve. */
  canWrite: boolean;
  /** Only superadmins may manage other admin accounts. */
  canManageAdmins: boolean;
  /** Clears the in-memory admin (call after the logout request). */
  clear: () => void;
}

const normaliseRole = (role: unknown): AdminRole =>
  role === "admin" || role === "superadmin" ? role : "viewer";

export const AdminContext = createContext<AdminContextValue>({
  currentUser: null,
  login: () => {},
  loading: true,
  role: "viewer",
  canWrite: false,
  canManageAdmins: false,
  clear: () => {},
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminAuthService
      .getCurrentUser()
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user as AdminUser);
      })
      .catch(() => {
        // Not signed in (or session expired) - the portal layout redirects.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((data: AdminDetails) => {
    setUser(data as AdminUser);
    setLoading(false);
  }, []);

  const clear = useCallback(() => setUser(null), []);

  const value = useMemo<AdminContextValue>(() => {
    const role = normaliseRole(user?.role);
    return {
      currentUser: user,
      login,
      loading,
      role,
      canWrite: !!user && (role === "admin" || role === "superadmin"),
      canManageAdmins: !!user && role === "superadmin",
      clear,
    };
  }, [user, loading, login, clear]);

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminGlobal = () => {
  return useContext(AdminContext);
};

/** Display name for an admin user (name, first/last name, or email). */
export const adminDisplayName = (user: AdminUser | null) => {
  if (!user) return "";
  if (user.name) return user.name;
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.email;
};
