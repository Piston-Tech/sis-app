import { useGlobal } from "@/app/GlobalProvider";
// import { AuthDataProps } from "@/components/Auth";
import apiClient from "@/services/apiClient";
import { SignupCredentials, User } from "@/types";
import LoginAuthResponse from "@/types/LoginAuthResponse";
import SignupAuthResponse from "@/types/SignupAuthResponse";
import StudentCreationErrors from "@/types/StudentCreationError";
import handleRequestError from "@/utils/handleRequestError";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLinkedIn } from "react-linkedin-login-oauth2";

export function useAuth() {
  const router = useRouter();

  const { currentUser, getCurrentUser, removeUser } = useGlobal();

  const [loginStep, setLoginStep] = useState<
    "options" | "otp" | "create-password" | "create-account" | "password"
  >("options");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  const [forgotPassword, setForgotPassword] = useState(false);

  const initErrors = {
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationToken: "",
  };

  const [errors, setErrors] = useState<StudentCreationErrors>(initErrors);

  const googleLogin = useGoogleLogin({
    onSuccess: ({ access_token }) => {
      apiClient
        .post("/auth/google", { access_token })
        .then(() => {
          getCurrentUser();
          router.push("/");
        })
        .catch((e) =>
          handleRequestError(e, setError, (errors) => setErrors(errors)),
        );
    },
    onError: (error) => {
      console.log(error);
    },
    // redirect_uri: "http://app.pistonandfusion.org/auth/google", // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/auth/google/callback`
  });

  const { linkedInLogin } = useLinkedIn({
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ?? "",
    redirectUri:
      process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI ??
      `${typeof window === "object" && window.location.origin}/auth/linkedin`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/auth/linkedin`
    onSuccess: (code) => {
      apiClient
        .post("/auth/linkedin", { code })
        .then(() => {
          getCurrentUser();
          router.push("/");
        })
        .catch((e) =>
          handleRequestError(e, setError, (errors) => setErrors(errors)),
        );
    },
    onError: (error) => {
      console.log(error);
    },
    scope: "openid profile email", // Requesting basic profile and email access
  });

  const sendOTP = async () => {
    try {
      const { data } = await apiClient.post("/auth/send-otp", { email });

      if (!data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      console.log(data);

      setLoginStep("otp");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred"),
      );
    }
  };

  const verifyOTP = async () => {
    try {
      const { data } = await apiClient.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      const { exists, hasPassword, verificationToken } = data;

      setVerificationToken(verificationToken);

      if (!exists) return setLoginStep("create-account");

      if (!hasPassword || forgotPassword)
        return setLoginStep("create-password");

      return setLoginStep("password");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred"),
      );
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await apiClient.post("/auth/check-email", { email });

      const { success, exists, hasPassword } = data;

      console.log(success, exists, hasPassword);

      if (success) {
        if (!exists || !hasPassword) return await sendOTP();
        setLoginStep("password");
        return;
      }

      setError(data.error || "An error occurred");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await verifyOTP();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    setForgotPassword(false);

    try {
      const { data } = await apiClient.post("/auth/create-password", {
        email,
        verificationToken,
        password,
        confirmPassword,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to create password");
      }

      alert("Password created successfully! Please log in.");
      setPassword("");
      setConfirmPassword("");
      setLoginStep("password");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setErrors(initErrors);

    try {
      const { data } = await apiClient.post("/auth/register", {
        prefix,
        firstName,
        middleName,
        lastName,
        email,
        password,
        confirmPassword,
        phone,
        verificationToken,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to create account");
      }

      alert("Account created successfully! Please log in.");
      setLoginStep("password");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) => setErrors(errors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await apiClient.post("/auth/login", {
        email,
        password,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to login");
      }

      getCurrentUser();
      router.push("/");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) => setErrors(errors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    // Implementation for forgot password functionality
    setIsSubmitting(true);
    setForgotPassword(true);
    await sendOTP();
    setIsSubmitting(false);
  };

  // const handleLogin = (role: UserRole = UserRole.PROFESSIONAL) => {
  //   setUser({
  //     id: Math.random().toString(36).substr(2, 9),
  //     name: "Adewale Thompson",
  //     email: "a.thompson@gmail.com",
  //     role: role,
  //     tier: MembershipTier.BASIC,
  //     skills: ["Project Management", "Agile"],
  //     goals: ["Executive Leadership"],
  //     onboarded: false,
  //     status: "Active",
  //     progress: 0,
  //   });
  // };

  const handleLogout = async () => {
    await apiClient.post("/auth/logout", {});
    // setUser(null);
    removeUser();
    setLoginStep("options");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setForgotPassword(false);

    router.push("/auth");
  };

  const handleOnboardingComplete = (data: Partial<User>) => {
    // setUser((prev) => (prev ? { ...prev, ...data, onboarded: true } : null));
  };

  // const [user, setUser] = useState(() => {
  //   // Load saved user from localStorage if available
  //   const saved = localStorage.getItem("user");
  //   return saved ? JSON.parse(saved) : null;
  // });

  const handleSocialLogin = (provider: "google" | "linkedin") => {
    if (provider === "google") return googleLogin();
    if (provider === "linkedin") return linkedInLogin();
  };

  // const login = async (
  //   credentials: LoginCredentials,
  //   setErrors: (value: React.SetStateAction<AuthDataProps>) => void,
  // ): Promise<void> => {
  //   try {
  //     const { data } = await apiClient.post("/auth/login", credentials);

  //     console.log("Client: ", data);

  //     if (data.success) {
  //       finalizeLogin(data.user);
  //       router.push("/profile");
  //     } else {
  //       if (data.errors) {
  //         setErrors(data.errors);
  //       } else if (data.error) {
  //         alert(data.error);
  //       }
  //     }
  //   } catch (e: any) {
  //     const {
  //       response: {
  //         data: { errors, error },
  //       },
  //     } = e;

  //     console.log(error, errors);

  //     if (errors) {
  //       setErrors(errors);
  //     } else if (error) {
  //       alert(error);
  //     }
  //   }
  //   // if (response.data.token) {
  //   //   localStorage.setItem("token", response.data.token);
  //   // }
  //   // return response.data;
  // };

  // const signup = async (
  //   credentials: SignupCredentials,
  // ): Promise<SignupAuthResponse> => {
  //   const response = await apiClient.post("/auth/signup", credentials);
  //   // if (response.data.token) {
  //   //     localStorage.setItem('token', response.data.token);
  //   // }
  //   return response.data;
  // };

  const logout = async (): Promise<void> => {
    // localStorage.removeItem("token");
    await apiClient.post("/auth/logout", {});
  };

  // const getCurrentUser = async (): Promise<LoginAuthResponse> => {
  //   const response = await apiClient.get("/auth/me");
  //   return response.data;
  //   // try {
  //   // } catch {
  //   //   return null;
  //   // }
  // };

  const isAuthenticated = (): boolean => {
    return currentUser !== null;
  };

  const useDifferentEmail = () => {
    setEmail("");
    setOtp("");
    setPassword("");
    setLoginStep("options");

    setForgotPassword(false);
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
    currentUser,
    handleLogout,
    loginStep,
    email,
    setEmail,
    otp,
    setOtp,
    prefix,
    setPrefix,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    errors,
    isSubmitting,

    handleEmailSubmit,
    handleOtpSubmit,
    handleCreateAccount,
    handleCreatePassword,
    handlePasswordLogin,
    handleSocialLogin,

    useDifferentEmail,
    handleForgotPassword,
  };
}
