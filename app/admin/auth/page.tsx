"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLoginCredentials from "@/types/AdminLoginCredentials";
import { ErrorMsg } from "@/components/Form";

const AdminLogin = () => {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@pistonandfusion.org");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    login({ email, password } as AdminLoginCredentials, setErrors).finally(() =>
      setLoading(false),
    );
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
            <div className="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl font-medium border border-rose-100">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 placeholder:text-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pistonandfusion.org"
            />
            <ErrorMsg message={errors.email} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 placeholder:text-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <ErrorMsg message={errors.password} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* <div className="mt-8 pt-8 border-t border-zinc-50 text-center">
          <p className="text-xs text-zinc-400">
            For demo purposes, use{" "}
            <span className="font-bold text-zinc-600">admin@pf.com</span> /{" "}
            <span className="font-bold text-zinc-600">admin123</span>
          </p>
        </div> */}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
