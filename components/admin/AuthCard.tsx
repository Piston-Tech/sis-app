"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

/** The centred card used by the admin sign-in, forgot and reset password pages */
const AuthCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) => (
  <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/5 border border-zinc-100 p-10"
    >
      <div className="flex flex-col items-center mb-10">
        <div
          aria-hidden="true"
          className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4"
        >
          P
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="text-zinc-500 text-sm mt-2 text-center">{description}</p>
      </div>
      {children}
    </motion.div>
  </div>
);

export const authLabelClass =
  "text-xs font-bold text-zinc-500 uppercase tracking-widest";
export const authInputClass =
  "w-full px-5 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 placeholder:text-zinc-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all";
export const authButtonClass =
  "w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50";

export default AuthCard;
