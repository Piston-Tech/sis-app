"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ErrorMsg } from "@/components/Form";
import AuthCard, {
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/admin/AuthCard";
import { z } from "zod";
import {
  PasswordChecklist,
  passwordFields,
  passwordsMatch,
  passwordsMatchError,
} from "@/components/admin/passwordPolicy";
import { zodFieldErrors } from "@/hooks/admin/useFormState";
import { toApiError, type FieldErrors } from "@/hooks/admin/api";
import apiClient from "@/services/apiClient";

const schema = z.object(passwordFields).refine(passwordsMatch, passwordsMatchError);

/**
 * Sets a new password from an emailed link: forgot password, a reset link
 * sent by a super admin, or a new admin's invitation.
 */
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  // Read once: the token is then removed from the address bar (below)
  const [token] = useState(() => searchParams.get("token") ?? "");
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Keep the token out of browser history and anything the URL is shared to
  useEffect(() => {
    if (window.location.search.includes("token=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  if (!token) {
    return (
      <AuthCard
        title="Link not valid"
        description="This page needs the link from your email. Request a new one below."
      >
        <Link href="/auth/forgot-password" className={`${authButtonClass} block text-center`}>
          Request a reset link
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password set"
        description="Your new password is ready. You've been signed out everywhere, so sign in again with it."
      >
        <div className="flex flex-col items-center gap-6">
          <CheckCircle2 size={40} className="text-emerald-600" aria-hidden="true" />
          <Link href="/auth" className={`${authButtonClass} block text-center`}>
            Sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error.issues));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiClient.post("/admin/auth/reset-password", { token, ...values });
      setDone(true);
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.fieldErrors) setErrors(apiError.fieldErrors);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (name: "password" | "confirmPassword", label: string, describedBy?: string) => (
    <div className="space-y-2">
      <label htmlFor={`reset-${name}`} className={authLabelClass}>
        {label}
      </label>
      <input
        id={`reset-${name}`}
        type="password"
        autoComplete="new-password"
        required
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={[errors[name] && `reset-${name}-error`, describedBy].filter(Boolean).join(" ") || undefined}
        className={authInputClass}
        value={values[name]}
        onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
      />
      <ErrorMsg id={`reset-${name}-error`} message={errors[name]} />
    </div>
  );

  return (
    <AuthCard title="Choose a password" description="Set the password for your admin account.">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && !errors.password && !errors.confirmPassword && (
          <div role="alert" className="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl font-medium border border-rose-100">
            {error}{" "}
            {/expired|invalid/i.test(error) && (
              <Link href="/auth/forgot-password" className="underline font-semibold">
                Request a new link
              </Link>
            )}
          </div>
        )}
        {field("password", "New password", "reset-password-rules")}
        <PasswordChecklist id="reset-password-rules" value={values.password} />
        {field("confirmPassword", "Confirm new password")}
        <button type="submit" disabled={loading} aria-busy={loading || undefined} className={authButtonClass}>
          {loading ? "Saving..." : "Set password"}
        </button>
      </form>
    </AuthCard>
  );
};

const ResetPassword = () => (
  <Suspense fallback={null}>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPassword;
