import { useAdminGlobal } from "@/app/AdminProvider";
import { toApiError } from "@/hooks/admin/api";
import apiClient from "@/services/apiClient";
import AdminLoginCredentials from "@/types/AdminLoginCredentials";
import AdminSignupAuthResponse from "@/types/AdminSignupAuthResponse";
import AdminSignupCredentials from "@/types/AdminSignupCredentials";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type LoginErrors = { email: string; password: string };

export function useAdminAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUser, login: finalizeLogin, clear } = useAdminGlobal();

  /** Signs in; field errors go to setErrors, anything else to setError. */
  const login = async (
    credentials: AdminLoginCredentials,
    setErrors: (value: LoginErrors) => void,
    setError: (message: string) => void,
  ): Promise<void> => {
    setError("");
    setErrors({ email: "", password: "" });
    try {
      const { data } = await apiClient.post("/admin/auth/login", credentials);

      if (data.success) {
        finalizeLogin(data.user);
        router.push("/");
      } else if (data.errors) {
        setErrors({ email: "", password: "", ...data.errors });
      } else {
        setError(data.error || "Sign in failed.");
      }
    } catch (e) {
      const err = toApiError(e);
      if (err.fieldErrors) {
        setErrors({ email: "", password: "", ...err.fieldErrors });
      }
      setError(err.status === 401 ? "Invalid email or password." : err.message);
    }
  };

  const signup = async (
    credentials: AdminSignupCredentials,
  ): Promise<AdminSignupAuthResponse> => {
    const response = await apiClient.post("/admin/auth/signup", credentials);
    return response.data;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post("/admin/auth/logout", {});
    } finally {
      clear();
      queryClient.removeQueries({ queryKey: ["admin"] });
      router.push("/auth");
    }
  };

  const isAuthenticated = (): boolean => currentUser !== null;

  return {
    user: currentUser,
    login,
    signup,
    logout,
    isAuthenticated,
  };
}
