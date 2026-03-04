import AdminDetails from "./AdminDetails";

export default interface AdminLoginAuthResponse {
  // token: string;
  message: string;
  success: boolean;
  user: AdminDetails;
  error?: string;
  errors?: {
    name: string;
    email: string;
    password: string;
  };
}
