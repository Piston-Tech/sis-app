import { useId } from "react";

/** Shared id / aria wiring for labelled form fields with an error message. */
export const useFieldIds = (id: string | undefined, error?: string | null) => {
  const generated = useId();
  const inputId = id ?? `field-${generated}`;
  const errorId = `${inputId}-error`;
  return {
    inputId,
    errorId,
    aria: {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
    } as const,
  };
};

export const labelClass =
  "text-[10px] font-bold text-zinc-400 uppercase tracking-widest";

export const fieldClass =
  "w-full px-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm disabled:bg-zinc-50 disabled:text-zinc-500 aria-invalid:border-rose-300";
