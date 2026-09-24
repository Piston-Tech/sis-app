"use client";

import { useGlobal } from "@/app/GlobalProvider";
import apiClient from "@/services/apiClient";
import StudentCreationErrors from "@/types/StudentCreationError";
import {
  getErrorMessage,
  getErrorStatus,
  getFieldErrors,
  RATE_LIMIT_MESSAGE,
} from "@/components/student/errors";
import { useGoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useLinkedIn } from "react-linkedin-login-oauth2";

type LoginStep =
  | "options"
  | "otp"
  | "create-password"
  | "create-account"
  | "password";

const initErrors: StudentCreationErrors = {
  prefix: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  verificationToken: "",
  metaData: "",
};

/** Signs the student out and clears every cached query. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { removeUser } = useGlobal();

  return useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Even if the request fails, drop local state and go to sign-in.
    }
    removeUser();
    queryClient.clear();
    router.push("/auth");
  }, [queryClient, removeUser, router]);
}

export function useAuth() {
  const router = useRouter();
  const { currentUser, getCurrentUser } = useGlobal();
  const logout = useLogout();

  const [loginStep, setLoginStep] = useState<LoginStep>("options");
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
  /** Non-error feedback, e.g. "Password created, please sign in." */
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [errors, setErrors] = useState<StudentCreationErrors>(initErrors);

  /**
   * Shows a failed request to the user. 429s always get the rate-limit
   * message; field errors go to `errors` when `withFieldErrors` is set.
   */
  const reportError = (e: unknown, withFieldErrors = false) => {
    if (getErrorStatus(e) === 429) {
      setError(RATE_LIMIT_MESSAGE);
      return;
    }
    const fieldErrors = getFieldErrors(e);
    if (withFieldErrors && Object.keys(fieldErrors).length > 0) {
      setErrors({ ...initErrors, ...fieldErrors });
      return;
    }
    setError(getErrorMessage(e));
  };

  const finishSignIn = async () => {
    await getCurrentUser();
    router.push("/");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      setError(null);
      try {
        await apiClient.post("/auth/google", { access_token });
        await finishSignIn();
      } catch (e) {
        reportError(e);
      }
    },
    onError: () => setError("Google sign-in didn't complete. Please try again."),
  });

  const { linkedInLogin } = useLinkedIn({
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ?? "",
    redirectUri:
      process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI ??
      `${typeof window === "object" ? window.location.origin : ""}/auth/linkedin`,
    onSuccess: async (code) => {
      setError(null);
      try {
        await apiClient.post("/auth/linkedin", { code });
        await finishSignIn();
      } catch (e) {
        reportError(e);
      }
    },
    onError: (e) => {
      // The popup being closed by the user is not worth an error message.
      if (e?.error === "user_closed_popup") return;
      setError("LinkedIn sign-in didn't complete. Please try again.");
    },
    scope: "openid profile email",
  });

  /** Returns true when the OTP was sent. */
  const sendOTP = async () => {
    try {
      const { data } = await apiClient.post("/auth/send-otp", { email });
      if (!data.success) throw new Error(data.error || "Failed to send the code");
      setOtp("");
      setLoginStep("otp");
      return true;
    } catch (e) {
      reportError(e);
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const { data } = await apiClient.post("/auth/check-email", { email });
      if (!data.success) {
        setError(data.error || "We couldn't check that email address.");
        return;
      }
      if (!data.exists || !data.hasPassword) {
        await sendOTP();
        return;
      }
      setLoginStep("password");
    } catch (err) {
      reportError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const { data } = await apiClient.post("/auth/verify-otp", { email, otp });
      if (!data.success) throw new Error(data.error || "That code didn't work");

      setVerificationToken(data.verificationToken);

      if (!data.exists) setLoginStep("create-account");
      else if (!data.hasPassword || forgotPassword) setLoginStep("create-password");
      else setLoginStep("password");
    } catch (err) {
      reportError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const { data } = await apiClient.post("/auth/create-password", {
        email,
        verificationToken,
        password,
        confirmPassword,
      });
      if (!data.success) throw new Error(data.error || "Failed to create password");

      setForgotPassword(false);
      setPassword("");
      setConfirmPassword("");
      setNotice("Your password has been saved. Please sign in.");
      setLoginStep("password");
    } catch (err) {
      reportError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
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
      if (!data.success) throw new Error(data.error || "Failed to create account");

      setPassword("");
      setConfirmPassword("");
      setNotice("Your account has been created. Please sign in.");
      setLoginStep("password");
    } catch (err) {
      reportError(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      if (!data.success) throw new Error(data.error || "Failed to sign in");
      setNotice(null);
      await finishSignIn();
    } catch (err) {
      reportError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    setForgotPassword(true);
    const sent = await sendOTP();
    if (!sent) setForgotPassword(false);
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    setLoginStep("options");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setForgotPassword(false);
    await logout();
  };

  const handleSocialLogin = (provider: "google" | "linkedin") => {
    setError(null);
    if (provider === "google") return googleLogin();
    return linkedInLogin();
  };

  const useDifferentEmail = () => {
    setEmail("");
    setOtp("");
    setPassword("");
    setError(null);
    setNotice(null);
    setLoginStep("options");
    setForgotPassword(false);
  };

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
    notice,
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
