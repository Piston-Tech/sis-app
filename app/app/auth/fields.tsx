import { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full py-4 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900";

export const labelClass =
  "text-xs font-bold uppercase text-slate-600 tracking-wider mb-2 block";

export const primaryButtonClass =
  "w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";

export const linkButtonClass =
  "w-full py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline";

/** A labelled auth input with an optional inline error. */
export const AuthField = ({
  id,
  label,
  optional,
  error,
  className,
  ...inputProps
}: {
  id: string;
  label: ReactNode;
  optional?: boolean;
  error?: string | null;
} & InputHTMLAttributes<HTMLInputElement>) => (
  <div className={`text-left ${className ?? ""}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
      {optional && <span className="font-medium normal-case text-slate-500"> (optional)</span>}
    </label>
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={inputClass}
      {...inputProps}
    />
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

export const FieldError = ({ id, message }: { id?: string; message?: string | null }) =>
  message ? (
    <p id={id} className="mt-1 text-sm text-red-600">
      {message}
    </p>
  ) : null;

export const FormAlert = ({ message }: { message?: string | null }) =>
  message ? (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {message}
    </p>
  ) : null;

export const FormNotice = ({ message }: { message?: string | null }) =>
  message ? (
    <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
      {message}
    </p>
  ) : null;
