import AdminDetails from "./AdminDetails";

interface AdminSignupAuthResponse {
  message: string;
  success: boolean;
  user?: AdminDetails;
  error?: string;
  errors?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export default AdminSignupAuthResponse;
