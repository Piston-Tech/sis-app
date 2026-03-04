import UserDetails from "./UserDetails";

export default interface LoginAuthResponse {
  // token: string;
  message: string;
  success: boolean;
  user: UserDetails;
  error?: string;
  errors?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}
