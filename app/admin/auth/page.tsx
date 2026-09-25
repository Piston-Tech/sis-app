"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLoginCredentials from "@/types/AdminLoginCredentials";
import { ErrorMsg } from "@/components/Form";

const AdminLogin = () => {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    login(
      { email, password } as AdminLoginCredentials,
      setErrors,
      setError,
    ).finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/5 border border-zinc-100 p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4">
            P
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">P&F Admin Portal</h1>
          <p className="text-zinc-500 text-sm mt-2 text-center">
            Enter your credentials to access the management dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl font-medium border border-rose-100"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="admin-email"
              className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "admin-email-error" : undefined}
              required
              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 placeholder:text-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pistonandfusion.org"
            />
            <ErrorMsg id="admin-email-error" message={errors.email} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password ? "admin-password-error" : undefined
              }
              required
              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 placeholder:text-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <ErrorMsg id="admin-password-error" message={errors.password} />
            <p className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-zinc-500 hover:text-black"
              >
                Forgot password?
              </Link>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading || undefined}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
