"use client";

import apiClient from "@/services/apiClient";
import { GlobalState, UserDetails } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const GlobalContext = createContext<GlobalState>({
  currentUser: null,
  getCurrentUser: async () => {},
  removeUser: () => {},
  loading: true,
});

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/user");
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const value = useMemo<GlobalState>(
    () => ({
      currentUser: user,
      getCurrentUser,
      removeUser,
      loading,
    }),
    [user, getCurrentUser, removeUser, loading],
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  return useContext(GlobalContext);
};
