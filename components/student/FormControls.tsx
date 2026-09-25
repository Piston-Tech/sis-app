import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";

export const fieldLabelClass = "mb-2 block text-sm font-semibold text-slate-700";

export const fieldInputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500";

export const FieldHint = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} className="mt-1.5 text-sm text-slate-600">
    {children}
  </p>
);

export const FieldErrorText = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  ) : null;

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

type Common = {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
};

export const TextField = ({
  id,
  label,
  error,
  hint,
  required,
  className,
  ...props
}: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "required" | "className">) => (
  <div className={className}>
    <label htmlFor={id} className={fieldLabelClass}>
      {label}
      {required && <span aria-hidden> *</span>}
    </label>
    <input
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={fieldInputClass}
      {...props}
    />
    {hint && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
    <FieldErrorText id={`${id}-error`} message={error} />
  </div>
);

export const SelectField = ({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
  ...props
}: Common & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "required" | "className">) => (
  <div className={className}>
    <label htmlFor={id} className={fieldLabelClass}>
      {label}
      {required && <span aria-hidden> *</span>}
    </label>
    <select
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={`${fieldInputClass} cursor-pointer`}
      {...props}
    >
      {children}
    </select>
    {hint && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
    <FieldErrorText id={`${id}-error`} message={error} />
  </div>
);
