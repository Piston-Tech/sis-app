import { AuthResponse, LoginCredentials, SignupCredentials } from "@/types";
import apiClient from "./apiClient";
import SignupAuthResponse from "@/types/SignupAuthResponse";
import LoginAuthResponse from "@/types/LoginAuthResponse";

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginAuthResponse> {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<SignupAuthResponse> {
    const response = await apiClient.post("/auth/signup", credentials);
    // if (response.data.token) {
    //     localStorage.setItem('token', response.data.token);
    // }
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    await apiClient.post("/auth/logout", {});
  }

  async getCurrentUser(): Promise<AuthResponse["user"] | null> {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data.user;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
