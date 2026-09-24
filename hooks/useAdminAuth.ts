import { useAdminGlobal } from "@/app/AdminProvider";
import apiClient from "@/services/apiClient";
import AdminLoginAuthResponse from "@/types/AdminLoginAuthResponse";
import AdminLoginCredentials from "@/types/AdminLoginCredentials";
import AdminSignupAuthResponse from "@/types/AdminSignupAuthResponse";
import AdminSignupCredentials from "@/types/AdminSignupCredentials";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();

  const { currentUser, login: finalizeLogin } = useAdminGlobal();

  // const [user, setUser] = useState(() => {
  //   // Load saved user from localStorage if available
  //   const saved = localStorage.getItem("user");
  //   return saved ? JSON.parse(saved) : null;
  // });

  const login = async (
    credentials: AdminLoginCredentials,
    setErrors: (
      value: React.SetStateAction<{ email: string; password: string }>,
    ) => void,
  ): Promise<void> => {
    try {
      const { data } = await apiClient.post("/admin/auth/login", credentials);

      if (data.success) {
        finalizeLogin(data.user);
        router.push("/");
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      const { errors, error } = e?.response?.data ?? {};

      if (errors) {
        setErrors(errors);
      } else {
        alert(error || e?.message || "Network error");
      }
    }
    // if (response.data.token) {
    //   localStorage.setItem("token", response.data.token);
    // }
    // return response.data;
  };

  const signup = async (
    credentials: AdminSignupCredentials,
  ): Promise<AdminSignupAuthResponse> => {
    const response = await apiClient.post("/admin/auth/signup", credentials);
    // if (response.data.token) {
    //     localStorage.setItem('token', response.data.token);
    // }
    return response.data;
  };

  const logout = async (): Promise<void> => {
    // localStorage.removeItem("token");
    await apiClient.post("/admin/auth/logout", {});
    router.push("/auth/login");
  };

  const getCurrentUser = async (): Promise<AdminLoginAuthResponse> => {
    const response = await apiClient.get("/admin");
    return response.data;
    // try {
    // } catch {
    //   return null;
    // }
  };

  const isAuthenticated = (): boolean => {
    return currentUser !== null;
  };

  // const login = async ({ email, password }: LoginCredentials) => {
  //   const { user } = await authService.login({ email, password });
  //   setUser(user);
  //   // localStorage.setItem("user", JSON.stringify(userData));
  // };

  // const signup = async ({
  //   firstName,
  //   lastName,
  //   email,
  //   password,
  // }: SignupCredentials) => {
  //   const data = await authService.signup({
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //   });

  //   if (data.user) {
  //     setUser(user);
  //   }
  //   // localStorage.setItem("user", JSON.stringify(userData));
  // };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  // };

  return {
    user: currentUser,
    login,
    signup,
    logout,
    isAuthenticated,
  };
}
