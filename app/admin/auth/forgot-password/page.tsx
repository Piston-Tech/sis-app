"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { ErrorMsg } from "@/components/Form";
import AuthCard, {
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/admin/AuthCard";
import apiClient from "@/services/apiClient";
import { toApiError } from "@/hooks/admin/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/admin/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.fieldErrors?.email ?? apiError.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={
          <>
            If <strong className="text-zinc-700">{email}</strong> belongs to an
            active admin account, we&apos;ve sent it a link to reset the
            password. The link expires in 1 hour.
          </>
        }
      >
        <div className="flex flex-col items-center gap-6">
          <MailCheck size={40} className="text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-zinc-500 text-center">
            No email after a few minutes? Check your spam folder, or ask a super
            admin to send you a reset link.
          </p>
          <Link href="/auth" className="text-sm font-semibold text-black hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your admin email and we'll send you a link to choose a new one."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="forgot-email" className={authLabelClass}>
            Email Address
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "forgot-email-error" : undefined}
            className={authInputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@pistonandfusion.org"
          />
          <ErrorMsg id="forgot-email-error" message={error} />
        </div>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading || undefined}
          className={authButtonClass}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="text-center">
          <Link href="/auth" className="text-sm font-semibold text-zinc-600 hover:text-black">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
