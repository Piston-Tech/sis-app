import UserDetails from "./UserDetails";

interface SignupAuthResponse {
  message: string;
  success: boolean;
  user?: UserDetails;
  error?: string;
  errors?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export default SignupAuthResponse;
