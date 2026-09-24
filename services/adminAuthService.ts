import { LoginCredentials, SignupCredentials } from "@/types";
import apiClient from "./apiClient";
import SignupAuthResponse from "@/types/SignupAuthResponse";
import AdminLoginAuthResponse from "@/types/AdminLoginAuthResponse";

class AdminAuthService {
  async login(credentials: LoginCredentials): Promise<AdminLoginAuthResponse> {
    const response = await apiClient.post("/admin/auth/login", credentials);
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<SignupAuthResponse> {
    const response = await apiClient.post("/admin/auth/signup", credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post("/admin/auth/logout", {});
  }

  async getCurrentUser(): Promise<AdminLoginAuthResponse> {
    const response = await apiClient.get("/admin");
    return response.data;
  }
}

const adminAuthService = new AdminAuthService();

export default adminAuthService;
