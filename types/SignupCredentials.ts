import LoginCredentials from "./LoginCredentials";

export default interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}
