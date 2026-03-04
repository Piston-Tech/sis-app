import AdminLoginCredentials from "./AdminLoginCredentials";

export default interface AdminSignupCredentials extends AdminLoginCredentials {
  name: string;
  confirmPassword: string;
}
