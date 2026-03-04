"use client";

import adminAuthService from "@/services/adminAuthService";
import authService from "@/services/authService";
import {
  UserDetails,
} from "@/types";
import AdminDetails from "@/types/AdminDetails";
import AdminGlobalState from "@/types/AdminGlobalState";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export const AdminContext = createContext<AdminGlobalState>({
  currentUser: null,
  login: (data: AdminDetails) => {},
  loading: true,
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("I got here");
    adminAuthService
      .getCurrentUser()
      .then((data) => {
        console.log("Admin User: ", data);
        const { user } = data;
        if (user) {
          setUser(user);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  const login = (data: AdminDetails) => {
    setUser(data);
  };

  return (
    <AdminContext.Provider value={{ currentUser: user, login, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminGlobal = () => {
  return useContext(AdminContext);
};
