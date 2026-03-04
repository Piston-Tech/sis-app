import { AuthResponse, LoginCredentials, SignupCredentials } from "@/types";
import apiClient from "./apiClient";
import SignupAuthResponse from "@/types/SignupAuthResponse";
import LoginAuthResponse from "@/types/LoginAuthResponse";
import AdminLoginAuthResponse from "@/types/AdminLoginAuthResponse";

class AdminAuthService {
  async login(credentials: LoginCredentials): Promise<AdminLoginAuthResponse> {
    const response = await apiClient.post("/admin/auth/login", credentials);
    // if (response.data.token) {
    //   localStorage.setItem("token", response.data.token);
    // }
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<SignupAuthResponse> {
    const response = await apiClient.post("/admin/auth/signup", credentials);
    // if (response.data.token) {
    //     localStorage.setItem('token', response.data.token);
    // }
    return response.data;
  }

  async logout(): Promise<void> {
    // localStorage.removeItem("token");
    await apiClient.post("/admin/auth/logout", {});
  }

  async getCurrentUser(): Promise<AdminLoginAuthResponse> {
    const response = await apiClient.get("/admin");
    return response.data;
    // try {
    // } catch {
    //   return null;
    // }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

const adminAuthService = new AdminAuthService();

export default adminAuthService;
