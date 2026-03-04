"use client";

import apiClient from "@/services/apiClient";
import authService from "@/services/authService";
import {
  AuthResponse,
  GlobalState,
  LoginCredentials,
  SignupCredentials,
  Student,
  UserDetails,
} from "@/types";
import LoginAuthResponse from "@/types/LoginAuthResponse";
import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
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

  useEffect(() => {
    console.log("Fetching current user...");
    getCurrentUser();
  }, []);

  const getCurrentUser: () => Promise<void> = async () => {
    try {
      const { data } = await apiClient.get("/user");

      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = () => {
    setUser(null);
  };

  return (
    <GlobalContext.Provider
      value={{
        currentUser: user,
        getCurrentUser,
        removeUser,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  return useContext(GlobalContext);
};
