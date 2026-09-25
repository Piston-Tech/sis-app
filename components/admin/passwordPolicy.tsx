import { Check, Circle } from "lucide-react";
import { z } from "zod";
import cn from "@/utils/cn";

/**
 * The admin password policy. Mirrors the backend (sis-backend
 * validation/auth.ts zNewPassword), which has the final say.
 */
export const PASSWORD_RULES = [
  { label: "8 to 72 characters", test: (v: string) => v.length >= 8 && v.length <= 72 },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { label: "A symbol: ! @ # $ % ^ & *", test: (v: string) => /[!@#$%^&*]/.test(v) },
] as const;

export const newPassword = z
  .string({ error: "Password is required" })
  .min(1, "Password is required")
  .refine(
    (v) => PASSWORD_RULES.every((rule) => rule.test(v)),
    "Password doesn't meet the requirements below",
  );

/** Spread into a z.object, then `.refine(passwordsMatch, passwordsMatchError)` */
export const passwordFields = {
  password: newPassword,
  confirmPassword: z.string(),
};

export const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const passwordsMatchError = {
  error: "Passwords don't match",
  path: ["confirmPassword"],
};

/** Live checklist under a new-password field */
export const PasswordChecklist = ({ value, id }: { value: string; id?: string }) => (
  <ul id={id} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(value);
      return (
        <li
          key={rule.label}
          className={cn("flex items-center gap-1.5", met ? "text-emerald-700" : "text-zinc-500")}
        >
          {met ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Circle size={10} className="mx-0.5" aria-hidden="true" />
          )}
          <span>
            {rule.label}
            <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
          </span>
        </li>
      );
    })}
  </ul>
);
